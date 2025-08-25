# AKASHA-AI RAG API

A FastAPI-based RAG (Retrieval-Augmented Generation) API for Axess Corrosion Intelligence, powered by OpenAI and LlamaCloud.

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Akashsinghpanwar/backend_Axess.git
   cd backend_Axess
   ```

2. **Set up virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set environment variables**
   Create a `.env` file with:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   LLAMA_CLOUD_API_KEY=your_llama_cloud_api_key
   LLAMA_CLOUD_ORG_ID=your_llama_cloud_org_id
   LLAMA_CLOUD_PROJECT_NAME=Akash-Ai
   LLAMA_CLOUD_INDEX_NAME=AKASHA-AI
   OPENAI_MODEL=gpt-4o
   ```

5. **Run the server**
   ```bash
   uvicorn api:app --host 0.0.0.0 --port 8000 --reload
   ```

## 🌐 API Endpoints

- **GET /** - Root endpoint with API information
- **GET /health** - Health check endpoint
- **GET /docs** - Interactive API documentation (Swagger UI)
- **POST /chat** - Default chat endpoint using CHAT_PROMPT
- **POST /code** - Custom prompt endpoint using SYSTEM_PROMPT
- **POST /chat/stream** - Streaming chat endpoint
- **POST /code/stream** - Streaming code endpoint

## 📋 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | ✅ |
| `LLAMA_CLOUD_API_KEY` | Your LlamaCloud API key | ✅ |
| `LLAMA_CLOUD_ORG_ID` | Your LlamaCloud organization ID | ✅ |
| `LLAMA_CLOUD_PROJECT_NAME` | LlamaCloud project name | ❌ (default: "Default") |
| `LLAMA_CLOUD_INDEX_NAME` | LlamaCloud index name | ❌ (default: "AKASHA-AI") |
| `OPENAI_MODEL` | OpenAI model to use | ❌ (default: "gpt-4o") |

## 🚀 Deployment on Render

### Automatic Deployment

1. **Connect your GitHub repository** to Render
2. **Create a new Web Service**
3. **Configure the service:**
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn api:app --host 0.0.0.0 --port $PORT`
   - **Environment:** Python 3.11

### Environment Variables Setup

In Render dashboard, add these environment variables:

```
OPENAI_API_KEY=your_openai_api_key
LLAMA_CLOUD_API_KEY=your_llama_cloud_api_key
LLAMA_CLOUD_ORG_ID=your_llama_cloud_org_id
LLAMA_CLOUD_PROJECT_NAME=Akash-Ai
LLAMA_CLOUD_INDEX_NAME=AKASHA-AI
OPENAI_MODEL=gpt-4o
```

### Manual Deployment

1. **Push your code** to GitHub
2. **Create a new Web Service** on Render
3. **Connect your repository**
4. **Set environment variables** as listed above
5. **Deploy**

## 🔧 Configuration Files

- `render.yaml` - Render deployment configuration
- `Procfile` - Process file for Render
- `runtime.txt` - Python version specification
- `requirements.txt` - Python dependencies

## 📊 Monitoring

- **Health Check:** `GET /health`
- **API Documentation:** `GET /docs`
- **Root Endpoint:** `GET /`

## 🛠️ Tech Stack

- **Framework:** FastAPI
- **LLM:** OpenAI GPT-4o
- **Vector Database:** LlamaCloud
- **RAG Engine:** LlamaIndex
- **Server:** Uvicorn
- **Deployment:** Render

## 📝 API Usage Examples

### Chat Endpoint
```bash
curl -X POST "https://your-render-app.onrender.com/chat" \
  -H "Content-Type: application/json" \
  -d '{"query": "Hello", "top_k": 5}'
```

### Health Check
```bash
curl "https://your-render-app.onrender.com/health"
```

## 🔒 Security Notes

- Configure CORS origins for production
- Use environment variables for sensitive data
- Monitor API usage and costs
- Implement rate limiting if needed

## 📞 Support

For issues or questions, please contact:
- **Developer:** Akash Panwar
- **Repository:** https://github.com/Akashsinghpanwar/backend_Axess
