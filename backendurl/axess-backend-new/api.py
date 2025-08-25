import os
from typing import Any, Dict, List, Optional
from prompt import SYSTEM_PROMPT, CHAT_PROMPT
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from fastapi.responses import StreamingResponse

from llama_cloud_services import LlamaCloudIndex
from llama_index.core import Settings, PromptTemplate
from llama_index.llms.openai import OpenAI

from fastapi.middleware.cors import CORSMiddleware




# ---------- Models ----------
class ChatRequest(BaseModel):
    query: str = Field(..., description="User question")
    top_k: int = Field(5, ge=1, le=50, description="Similarity top_k")


class CodeRequest(BaseModel):
    query: str = Field(..., description="User question")
    # prompt: str = Field(..., description="Custom prompt template text")
    top_k: int = Field(5, ge=1, le=50, description="Similarity top_k")


class RagResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]]


# ---------- App ----------
app = FastAPI(title="AKASHA-AI RAG API", version="1.0.0")


def _init_llm_from_env() -> None:
    """Configure OpenAI as the default LLM for LlamaIndex."""
    openai_key = os.getenv("OPENAI_API_KEY")
    if not openai_key:
        raise RuntimeError("OPENAI_API_KEY is missing in environment.")
    model = os.getenv("OPENAI_MODEL", "gpt-4o")
    system_prompt = os.getenv("SYSTEM_PROMPT", None)

    Settings.llm = OpenAI(
        model=model,
        api_key=openai_key,
        timeout=60.0,
        max_retries=3,
        system_prompt=system_prompt,  # optional
        streaming=True
    )


def _init_llama_cloud_index() -> LlamaCloudIndex:
    """Create a LlamaCloudIndex handle using the new llama-cloud-services package."""
    lc_key = os.getenv("LLAMA_CLOUD_API_KEY","")
    if not lc_key:
        raise RuntimeError("LLAMA_CLOUD_API_KEY is missing in environment.")

    name = os.getenv("LLAMA_CLOUD_INDEX_NAME", "AKASHA-AI")
    project = os.getenv("LLAMA_CLOUD_PROJECT_NAME", "Default")
    org = os.getenv("LLAMA_CLOUD_ORG_ID")
    base_url = os.getenv("LLAMA_CLOUD_BASE_URL")  # optional (US/EU)

    kwargs = dict(
        project_name=project,
        organization_id=org,
        api_key=lc_key,
    )
    if base_url:
        kwargs["base_url"] = base_url

    return LlamaCloudIndex(name, **kwargs)


@app.on_event("startup")
def on_startup():
    load_dotenv()
    _init_llm_from_env()
    app.state.index = _init_llama_cloud_index()


def _run_query(
    query: str,
    top_k: int,
    prompt_text: Optional[str] = None,
) -> RagResponse:
    """Run retrieval + synthesis. If prompt_text is provided, inject it."""
    try:
        index: LlamaCloudIndex = app.state.index
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Index not initialized: {e}")

    # Build retriever (hybrid + rerank is a solid default)
    retriever = index.as_retriever(
        dense_similarity_top_k=top_k,
        sparse_similarity_top_k=top_k,
        alpha=0.5,
        enable_reranking=True,
        rerank_top_n=top_k,
    )

    # Build query engine; optionally inject a custom text QA prompt
    qe_kwargs = dict(response_mode="compact", similarity_top_k=top_k)
    if prompt_text:
        qe_kwargs["text_qa_template"] = PromptTemplate(prompt_text)

    query_engine = index.as_query_engine(**qe_kwargs)

    # Execute
    response = query_engine.query(query)

    # Collect sources (ids, snippets, metadata)
    srcs: List[Dict[str, Any]] = []
    try:
        for sn in getattr(response, "source_nodes", []) or []:
            snippet = (sn.node.get_content() or "")[:500]
            srcs.append(
                {
                    "score": getattr(sn, "score", None),
                    "snippet": snippet,
                    "metadata": getattr(sn.node, "metadata", {}) or {},
                    "id": getattr(sn.node, "node_id", None),
                }
            )
    except Exception:
        # If source parsing fails, still return the answer
        pass

    return RagResponse(answer=str(response), sources=srcs)


# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this for production with specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _run_query_stream(query: str, top_k: int, prompt_text: Optional[str] = None):
    """Stream response chunks from the query engine."""
    try:
        index: LlamaCloudIndex = app.state.index
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Index not initialized: {e}")

    retriever = index.as_retriever(
        dense_similarity_top_k=top_k,
        sparse_similarity_top_k=top_k,
        alpha=0.5,
        enable_reranking=True,
        rerank_top_n=top_k,
    )
    qe_kwargs = dict(response_mode="compact", similarity_top_k=top_k)
    if prompt_text:
        qe_kwargs["text_qa_template"] = PromptTemplate(prompt_text)
    query_engine = index.as_query_engine(**qe_kwargs)

    def stream_gen():
        for chunk in query_engine.query_stream(query):
            yield chunk.text
    return stream_gen

# ---------- Routes ----------
@app.get("/health", summary="Health check endpoint")
def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy", "service": "AKASHA-AI RAG API"}


@app.get("/", summary="Root endpoint")
def root():
    """Root endpoint with API information."""
    return {
        "message": "AKASHA-AI RAG API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


@app.post("/chat", response_model=RagResponse, summary="Default chat over your index")
def chat(req: ChatRequest):
    """
    Default prompt/behavior. Uses CHAT_PROMPT from prompt.py.
    """
    # Safety: ensure placeholders exist (recommended)
    prompt_to_use = CHAT_PROMPT
    if "{query_str}" not in prompt_to_use or "{context_str}" not in prompt_to_use:
        raise HTTPException(
            status_code=400,
            detail="Your prompt must include {query_str} and {context_str} placeholders.",
        )
    try:
        return _run_query(query=req.query, top_k=req.top_k, prompt_text=prompt_to_use)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/code", response_model=RagResponse, summary="Custom-prompt query over your index")
def code(req: CodeRequest):
    """
    Custom prompt per request. Uses SYSTEM_PROMPT from prompt.py.
    """
    # Safety: ensure placeholders exist (recommended)
    prompt_to_use = SYSTEM_PROMPT
    if "{query_str}" not in prompt_to_use or "{context_str}" not in prompt_to_use:
        raise HTTPException(
            status_code=400,
            detail="Your prompt must include {query_str} and {context_str} placeholders.",
        )
    try:
        return _run_query(query=req.query, top_k=req.top_k, prompt_text=prompt_to_use)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/stream", summary="Streaming chat over your index")
def chat_stream(req: ChatRequest):
    prompt_to_use = CHAT_PROMPT
    if "{query_str}" not in prompt_to_use or "{context_str}" not in prompt_to_use:
        raise HTTPException(
            status_code=400,
            detail="Your prompt must include {query_str} and {context_str} placeholders.",
        )
    try:
        return StreamingResponse(_run_query_stream(req.query, req.top_k, prompt_to_use)(), media_type="text/plain")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/code/stream", summary="Streaming code over your index")
def code_stream(req: CodeRequest):
    prompt_to_use = SYSTEM_PROMPT
    if "{query_str}" not in prompt_to_use or "{context_str}" not in prompt_to_use:
        raise HTTPException(
            status_code=400,
            detail="Your prompt must include {query_str} and {context_str} placeholders.",
        )
    try:
        return StreamingResponse(_run_query_stream(req.query, req.top_k, prompt_to_use)(), media_type="text/plain")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))