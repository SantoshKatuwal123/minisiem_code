from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
import requests
import json
from app.utils.security import get_current_user


router = APIRouter(
    prefix="/api",
    tags=['chat'],
    dependencies=[Depends(get_current_user)]
)



OLLAMA_URL = "http://localhost:11434/api/generate"

# Strong system prompt for MiniSIM
SYSTEM_PROMPT = """
You are MiniSIEM AI, a virtual assistant for a small-scale Security Information and Event Management (SIEM) system called MiniSIM. 

Guidelines:
1. Only provide answers related to MiniSIM’s capabilities: log collection, normalization, event correlation, pattern-based threat detection, dashboard alerts, and small IT environments. 
2. Do not provide answers outside MiniSIM. Give clear, actionable advice, and explain limitations when necessary.
3. Only mention or explain the short-term memory (memory_context) if the user explicitly asks about it. Otherwise, ignore it.
4. Focus on practical guidance suitable for small IT environments, and avoid suggesting enterprise-level solutions or features outside MiniSIM’s scope.
"""

short_memory = []  # stores last 5 prompts

# Stream helper
def ollama_stream(prompt: str, model: str):
    if not model:
        yield json.dumps({"error": "Model not found. Please provide a valid model."})
        return

    # Update short-term memory
    short_memory.append(prompt)
    if len(short_memory) > 5:
        short_memory.pop(0)  # remove oldest prompt

    # Combine memory with current prompt
    memory_context = "\n".join([f"User: {p}" for p in short_memory])

    payload = {
        "model": model,
        "prompt": f"{SYSTEM_PROMPT}\n\n memory_context:{memory_context}\nAssistant:",
        "stream": True
    }

    

    try:
        with requests.post(OLLAMA_URL, json=payload, stream=True) as r:
            r.raise_for_status()
            for line in r.iter_lines():
                if line:
                    data = json.loads(line.decode("utf-8"))
                    token = data.get("response", "")
                    yield token
    except requests.RequestException as e:
        yield f"Error contacting Ollama: {str(e)}"


# FastAPI endpoint
@router.get("/chat")
def chat(
    p: str = Query(..., description="Prompt text"),
    m: str = Query(None, description="Model name")
):
    if not m:
        raise HTTPException(status_code=400, detail="Model not provided or not found")

    return StreamingResponse(
        ollama_stream(prompt=p, model=m),
        media_type="text/plain"
    )