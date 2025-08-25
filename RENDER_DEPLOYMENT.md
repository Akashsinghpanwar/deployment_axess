# 🚀 Render Deployment Guide

## Quick Deploy Steps:

1. **Go to [dashboard.render.com](https://dashboard.render.com)**
2. **Click "New" → "Blueprint"**
3. **Connect your GitHub repository**
4. **Select your repository** (deployment_axess)
5. **Render will detect the `render.yaml` file automatically**
6. **Add your API keys as environment variables:**
   - `OPENAI_API_KEY`
   - `LLAMA_CLOUD_API_KEY` 
   - `LLAMA_CLOUD_ORG_ID`
7. **Click "Apply"**

## What will be deployed:

- **Backend**: `https://axess-backend-api.onrender.com`
- **Frontend**: `https://axess-frontend.onrender.com`

## Environment Variables to set:

**Backend Service:**
```
OPENAI_API_KEY=your_openai_api_key_here
LLAMA_CLOUD_API_KEY=your_llama_cloud_api_key_here
LLAMA_CLOUD_ORG_ID=your_llama_cloud_org_id_here
```

**Frontend Service:**
```
REACT_APP_API_URL=https://axess-backend-api.onrender.com
```

## Test after deployment:

1. **Backend Health**: Visit `https://axess-backend-api.onrender.com/health`
2. **Frontend**: Visit `https://axess-frontend.onrender.com`
3. **Chat**: Try sending a message!

That's it! Your Axess Intelligence app will be live! 🎉
