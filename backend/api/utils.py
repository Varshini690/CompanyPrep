import re
import fitz
import json
import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ----------------------------------------------------
# PDF TEXT EXTRACTION (KEEPS LINE BREAKS)
# ----------------------------------------------------
def extract_text_from_pdf(file_obj):
    file_obj.seek(0)
    pdf_bytes = file_obj.read()

    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""

    for page in doc:
        raw = page.get_text("text")
        cleaned = "\n".join(
            re.sub(r"\s+", " ", line).strip()
            for line in raw.split("\n")
        )
        text += cleaned + "\n"

    return text


# ----------------------------------------------------
# AI-POWERED RESUME PARSER (OPENAI ONLY + SAFE JSON)
# ----------------------------------------------------
def parse_resume_text_from_fileobj(file_obj):
    text = extract_text_from_pdf(file_obj)

    prompt = f"""
    You are an expert resume parser.
    Extract the following information strictly in JSON format:
    - contact: name, phone, email, linkedin, github
    - summary
    - education: list with institution, duration, degree, location, scores
    - projects: list with title, year, description
    - experience: list with role, company, duration, description
    - skills: programming, frameworks/tools, soft skills
    - certifications
    - achievements

    RULES:
    - Return only VALID JSON.
    - No markdown.
    - No text before or after the JSON.
    - No comments.
    
    Resume Text:
    {text}
    """

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": "Return only valid JSON. No markdown, no explanation."},
            {"role": "user", "content": prompt}
        ]
    )

    raw = response.choices[0].message.content.strip()

    # Remove ```json or ``` wrappers if present
    if raw.startswith("```"):
        raw = re.sub(r"```(json)?", "", raw)
        raw = raw.replace("```", "")
        raw = raw.strip()

    print("\n\n🔍 RAW OPENAI OUTPUT:\n", raw, "\n")

    # Try parsing JSON
    try:
        return json.loads(raw)

    except json.JSONDecodeError:
        # Try repairing using OpenAI again
        repair_prompt = f"""
        Fix this text and return VALID JSON only. 
        Remove markdown, remove explanations, correct format.

        Text:
        {raw}
        """

        repair = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": "Fix invalid JSON and output only correct JSON."},
                {"role": "user", "content": repair_prompt}
            ]
        )

        fixed = repair.choices[0].message.content.strip()

        if fixed.startswith("```"):
            fixed = re.sub(r"```(json)?", "", fixed)
            fixed = fixed.replace("```", "")
            fixed = fixed.strip()

        print("\n\n🔧 FIXED JSON OUTPUT:\n", fixed, "\n")

        try:
            return json.loads(fixed)
        except:
            return {
                "error": "OpenAI returned invalid JSON twice.",
                "raw_output": raw,
                "fixed_output": fixed
            }


# ----------------------------------------------------
# GPT QUESTION GENERATOR (OPENAI ONLY)
# ----------------------------------------------------
def generate_questions_from_resume(resume_data, job_role, difficulty, interview_type, page=1, page_size=10):
    start = (page - 1) * page_size + 1
    end = start + page_size - 1

    prompt = f"""
    You are an AI technical interviewer.

    Based on the candidate's resume and interview settings:

    Resume:
    {resume_data}

    Job Role: {job_role}
    Difficulty: {difficulty}
    Interview Type: {interview_type}

    Generate interview questions NUMBERED from {start} to {end}.

    STRICT RULES:
    - Output ONLY questions {start} to {end}
    - No explanations
    - No extra text
    - Format:
      {start}. <question>
      {start+1}. <question>
      ...
      {end}. <question>
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=500,
        temperature=0.6
    )

    output = response.choices[0].message.content.strip()
    
    questions = []
    for line in output.split("\n"):
        if re.match(r"^\d+\.\s", line):
            q = line.split(". ", 1)[1]
            questions.append(q)

    return questions
