import uvicorn
from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai
import json
import logging
from config import config
import prompts

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="EduFlex AI Microservice")

# Configure Gemini
if config.GEMINI_API_KEY:
    genai.configure(api_key=config.GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY not found in configuration!")

class AIRequest(BaseModel):
    prompt: str
    system_prompt: Optional[str] = None
    temperature: float = 0.7
    max_tokens: int = 4000

class QuizRequest(BaseModel):
    text: str
    count: int = 5
    difficulty: str = "MEDIUM"
    language: str = "sv"

class CourseRequest(BaseModel):
    text: str

def clean_json_response(text: str) -> str:
    """Cleans the JSON response by removing markdown code blocks."""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

async def call_gemini(system_prompt: str, user_prompt: str, temperature: float = 0.7):
    models_to_try = [config.GEMINI_MODEL] + config.GEMINI_FALLBACK_MODELS
    last_error = None

    for model_name in models_to_try:
        if not model_name: continue
        try:
            logger.info(f"Attempting Gemini call with model: {model_name}")
            model = genai.GenerativeModel(
                model_name=model_name,
                generation_config={
                    "temperature": temperature,
                    "top_p": 0.95,
                    "top_k": 40,
                    "max_output_tokens": 4000,
                    "response_mime_type": "application/json",
                }
            )
            
            full_prompt = f"{system_prompt}\n\n{user_prompt}"
            response = model.generate_content(full_prompt)
            
            if not response.text:
                raise Exception(f"Empty response from {model_name}")
                
            cleaned_text = clean_json_response(response.text)
            return json.loads(cleaned_text)
        except Exception as e:
            last_error = str(e)
            logger.warning(f"Model {model_name} failed: {last_error}. Trying next fallback...")
            continue

    logger.error(f"All models failed. Last error: {last_error}")
    raise HTTPException(status_code=503, detail=f"AI Service unavailable (all fallback models exhausted). Last error: {last_error}")

@app.get("/health")
async def health():
    return {"status": "healthy", "model": config.GEMINI_MODEL}

@app.post("/api/ai/quiz")
async def generate_quiz(request: QuizRequest):
    difficulty_map = {
        "EASY": "enkla (grundläggande förståelse, direkt från texten)",
        "HARD": "svåra (kräver analys och djupare förståelse)",
        "MEDIUM": "medel (blandning av direkt förståelse och viss analys)"
    }
    
    diff_desc = difficulty_map.get(request.difficulty.upper(), "medel")
    lang_instr = "Skriv alla frågor och svar på svenska." if request.language == "sv" else f"Write all questions and answers in {request.language}"
    
    user_prompt = f"""
    Generera exakt {request.count} quiz-frågor baserat på följande text.
    
    Svårighetsgrad: {diff_desc}
    {lang_instr}
    
    KÄLLTEXT:
    ---
    {request.text}
    ---
    """
    
    return await call_gemini(prompts.QUIZ_SYSTEM_PROMPT, user_prompt)

@app.post("/api/ai/course")
async def generate_course(request: CourseRequest):
    user_prompt = f"KÄLLTEXT:\n---\n{request.text}\n---\n"
    return await call_gemini(prompts.COURSE_SYSTEM_PROMPT, user_prompt)

@app.post("/api/ai/script")
async def generate_script(request: CourseRequest):
    user_prompt = f"KÄLLTEXT:\n---\n{request.text}\n---\n"
    return await call_gemini(prompts.VIDEO_SCRIPT_SYSTEM_PROMPT, user_prompt)

@app.post("/api/ai/analyze")
async def analyze_performance(request: CourseRequest):
    user_prompt = f"STUDENTDATA:\n---\n{request.text}\n---\n"
    return await call_gemini(prompts.ANALYSIS_SYSTEM_PROMPT, user_prompt)

@app.post("/api/ai/ppt")
async def generate_ppt(request: CourseRequest):
    user_prompt = f"LEKTIONSTEXT:\n---\n{request.text}\n---\n"
    return await call_gemini(prompts.PPT_SYSTEM_PROMPT, user_prompt)

@app.post("/api/ai/chat")
async def chat(request: AIRequest):
    # Use specialized chat helper for fallback-aware chat
    try:
        return await call_gemini_chat(request.system_prompt, request.prompt, request.temperature)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Chat failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def call_gemini_chat(system_prompt: Optional[str], user_prompt: str, temperature: float = 0.7):
    models_to_try = [config.GEMINI_MODEL] + config.GEMINI_FALLBACK_MODELS
    last_error = None

    for model_name in models_to_try:
        if not model_name: continue
        try:
            logger.info(f"Attempting chat Gemini call with model: {model_name}")
            model = genai.GenerativeModel(model_name)
            
            full_prompt = f"{system_prompt}\n\n{user_prompt}" if system_prompt else user_prompt
            
            response = model.generate_content(
                full_prompt,
                generation_config={
                    "temperature": temperature,
                    "top_p": 0.95,
                    "top_k": 40,
                    "max_output_tokens": 4000,
                }
            )
            
            if not response.text:
                raise Exception(f"Empty response from {model_name}")
                
            return {"text": response.text}
        except Exception as e:
            last_error = str(e)
            logger.warning(f"Chat model {model_name} failed: {last_error}. Trying next fallback...")
            continue

    logger.error(f"All chat models failed. Last error: {last_error}")
    raise HTTPException(status_code=503, detail=f"AI Chat Service unavailable (all fallback models exhausted). Last error: {last_error}")

@app.post("/api/ai/embedding")
async def generate_embedding(text: str = Body(..., embed=True)):
    try:
        result = genai.embed_content(
            model="models/embedding-001",
            content=text,
            task_type="retrieval_document"
        )
        return {"embedding": result['embedding']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=config.PORT)
