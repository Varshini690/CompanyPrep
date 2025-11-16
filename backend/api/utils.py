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
# AI-POWERED RESUME PARSER (REPLACE regex)
# ----------------------------------------------------
def parse_resume_text_from_fileobj(file_obj):
    text = extract_text_from_pdf(file_obj)

    prompt = f"""
    You are an expert resume parser.
    Extract the following information from the resume text below:
    - contact: name, phone, email, linkedin, github
    - summary
    - education: list with institution, duration, degree, location, scores
    - projects: list with title, year, description
    - experience: list with role, company, duration, description
    - skills: programming, frameworks/tools, soft skills
    - certifications
    - achievements

    Return JSON only. No explanations.
    Resume Text:
    {text}
    """

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": "Extract structured resume data. Return valid JSON only."},
            {"role": "user", "content": prompt}
        ]
    )

    # FIX: Correct way to access content
    json_output = response.choices[0].message.content

    # Convert string → JSON
    return json.loads(json_output)


# ----------------------------------------------------
# GPT QUESTION GENERATOR
# ----------------------------------------------------
def generate_questions_from_resume(resume_data, job_role, difficulty, interview_type):
    prompt = f"""
    You are an AI technical interviewer.

    Generate EXACTLY 10 interview questions based on:

    Resume:
    {resume_data}

    Job Role: {job_role}
    Difficulty: {difficulty}
    Interview Type: {interview_type}

    STRICT RULES:
    - Output ONLY the 10 questions.
    - No introductions.
    - No explanations.
    - No extra text.
    - Return each question on a new line starting with a number like:
      1. <question>
      2. <question>
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Generate interview questions only."},
            {"role": "user", "content": prompt},
        ],
        max_tokens=300,
        temperature=0.6
    )

    output = response.choices[0].message.content.strip()

    # Split on numbered lines
    questions = []
    for line in output.split("\n"):
        # Match patterns like: "1. Question ..."
        if re.match(r"^\d+\.\s", line):
            questions.append(line.split(". ", 1)[1].strip())

    return questions
