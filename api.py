from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import openai
from llama_cloud import LlamaCloud
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

app = FastAPI(title="Axess Intelligence API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")
openai_model = os.getenv("OPENAI_MODEL", "gpt-4o")

# Configure LlamaCloud
llama_cloud_api_key = os.getenv("LLAMA_CLOUD_API_KEY")
llama_cloud_org_id = os.getenv("LLAMA_CLOUD_ORG_ID")
llama_cloud_project_name = os.getenv("LLAMA_CLOUD_PROJECT_NAME", "Akash-Ai")
llama_cloud_index_name = os.getenv("LLAMA_CLOUD_INDEX_NAME", "AKASHA-AI")

# Initialize LlamaCloud client
llama_client = LlamaCloud(
    api_key=llama_cloud_api_key,
    org_id=llama_cloud_org_id
)

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    answer: str

@app.get("/")
async def root():
    return {"message": "Axess Intelligence API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "axess-backend-api"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # First, search LlamaCloud for relevant context
        search_results = []
        if llama_cloud_api_key and llama_cloud_org_id:
            try:
                # Search in LlamaCloud index
                search_response = llama_client.search(
                    project_name=llama_cloud_project_name,
                    index_name=llama_cloud_index_name,
                    query=request.query,
                    limit=5
                )
                
                if search_response and hasattr(search_response, 'results'):
                    search_results = [result.text for result in search_response.results]
                elif isinstance(search_response, dict) and 'results' in search_response:
                    search_results = [result.get('text', '') for result in search_response['results']]
                    
            except Exception as e:
                print(f"LlamaCloud search error: {e}")
                # Continue without LlamaCloud results
        
        # Build context from search results
        context = ""
        if search_results:
            context = "Based on the available information:\n" + "\n".join(search_results[:3]) + "\n\n"
        
        # Prepare the prompt
        system_prompt = """You are Axess Intelligence, a helpful AI assistant specializing in corrosion prevention and industrial solutions. 
        Provide accurate, helpful, and professional responses. If you have relevant information from the knowledge base, use it to enhance your response."""
        
        user_prompt = f"{context}User question: {request.query}"
        
        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model=openai_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        
        answer = response.choices[0].message.content.strip()
        
        return ChatResponse(answer=answer)
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
