import os
import google.generativeai as genai
from PyPDF2 import PdfReader
from app.config import get_settings

settings = get_settings()

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)


def extract_text_from_pdf(file_path: str, max_pages: int = 20) -> str:
    try:
        reader = PdfReader(file_path)
        text = ""
        for i, page in enumerate(reader.pages[:max_pages]):
            text += page.extract_text() or ""
        return text[:30000]
    except Exception as e:
        return f"Error extracting PDF: {str(e)}"


def summarize_pdf(file_path: str) -> dict:
    if not settings.GEMINI_API_KEY:
        return {"error": "Gemini API key not configured"}

    text = extract_text_from_pdf(file_path)
    if not text or text.startswith("Error"):
        return {"error": "Could not extract text from PDF"}

    model = genai.GenerativeModel("gemini-2.0-flash")

    prompt = f"""Analyze this study material and provide:

1. **Summary**: A concise 2-3 paragraph summary of the content
2. **Key Topics**: List 5-10 main topics covered
3. **Important Concepts**: List key concepts students should understand
4. **Study Tips**: 3-5 tips for studying this material

Content:
{text[:15000]}"""

    try:
        response = model.generate_content(prompt)
        return {
            "summary": response.text,
            "status": "success"
        }
    except Exception as e:
        return {"error": f"AI analysis failed: {str(e)}"}


def analyze_pyq(file_path: str) -> dict:
    if not settings.GEMINI_API_KEY:
        return {"error": "Gemini API key not configured"}

    text = extract_text_from_pdf(file_path)
    if not text or text.startswith("Error"):
        return {"error": "Could not extract text from PDF"}

    model = genai.GenerativeModel("gemini-2.0-flash")

    prompt = f"""Analyze this Previous Year Question Paper and provide:

1. **Exam Pattern**: Describe the exam pattern (sections, marking scheme)
2. **Frequently Asked Topics**: List topics that appear most frequently
3. **Important Units/Chapters**: Identify which units/chapters are most important
4. **Question Types**: List different types of questions asked
5. **Difficulty Analysis**: Rate difficulty level and which topics are hardest
6. **Preparation Tips**: Tips for preparing for this exam based on the paper

Question Paper Content:
{text[:15000]}"""

    try:
        response = model.generate_content(prompt)
        return {
            "analysis": response.text,
            "status": "success"
        }
    except Exception as e:
        return {"error": f"AI analysis failed: {str(e)}"}


def study_assistant(query: str, context: str = "") -> dict:
    if not settings.GEMINI_API_KEY:
        return {"error": "Gemini API key not configured"}

    model = genai.GenerativeModel("gemini-2.0-flash")

    system_prompt = """You are LU Academic Vault's AI Study Assistant for Lucknow University students.
You help students with:
- Answering academic questions
- Explaining concepts
- Providing study guidance
- Helping with exam preparation

Be helpful, accurate, and encouraging. If you're not sure about something, say so.
Keep responses concise and student-friendly."""

    prompt = f"""{system_prompt}

{f'Context from study materials: {context[:5000]}' if context else ''}

Student Question: {query}"""

    try:
        response = model.generate_content(prompt)
        return {
            "response": response.text,
            "status": "success"
        }
    except Exception as e:
        return {"error": f"AI assistant failed: {str(e)}"}


def search_resources_with_ai(query: str, resources_text: str) -> dict:
    if not settings.GEMINI_API_KEY:
        return {"error": "Gemini API key not configured"}

    model = genai.GenerativeModel("gemini-2.0-flash")

    prompt = f"""Based on the student's search query, rank these resources by relevance.
Return the top 5 resource IDs in order of relevance.

Query: {query}

Available Resources:
{resources_text[:10000]}

Return ONLY a JSON array of resource IDs like: [1, 5, 3, 8, 2]"""

    try:
        response = model.generate_content(prompt)
        import json
        import re
        match = re.search(r'\[[\d,\s]+\]', response.text)
        if match:
            ids = json.loads(match.group())
            return {"ranked_ids": ids, "status": "success"}
        return {"ranked_ids": [], "status": "success"}
    except Exception as e:
        return {"error": f"AI ranking failed: {str(e)}"}
