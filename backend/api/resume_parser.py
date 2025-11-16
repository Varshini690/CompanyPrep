import re

def extract_contact(text):
    name_match = re.search(r"([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)", text)
    phone_match = re.search(r"(\+?\d[\d\s-]{8,})", text)
    email_match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
    linkedin_match = re.search(r"(linkedin\.com\/[^\s]+)", text)
    github_match = re.search(r"(github\.com\/[^\s]+)", text)

    return {
        "name": name_match.group(1) if name_match else "",
        "phone": phone_match.group(1) if phone_match else "",
        "email": email_match.group(0) if email_match else "",
        "linkedin": linkedin_match.group(1) if linkedin_match else "",
        "github": github_match.group(1) if github_match else ""
    }


def extract_summary(text):
    match = re.search(r"Profile Summary(.+?)Education", text, re.DOTALL)
    return match.group(1).strip() if match else ""


def extract_education(text):
    matches = re.findall(r"(.*?)\s(\d{4}\s–\s\d{4}|Present)(.+?)(?=\n\n|Notable Projects)", text, re.DOTALL)

    results = []
    for inst, duration, body in matches:
        location = ""
        score_lines = []

        lines = body.strip().split("\n")
        for l in lines:
            if "India" in l:
                location = l.strip()
            elif "%" in l or "Scored" in l:
                score_lines.append(l.strip())

        results.append({
            "institution": inst.strip(),
            "duration": duration.strip(),
            "degree": inst.strip(),
            "location": location,
            "details": score_lines
        })
    return results


def extract_projects(text):
    blocks = re.split(r"(?=\n[A-Z][A-Za-z ]+\s20\d{2})", text)
    results = []

    for b in blocks:
        match = re.match(r"\n(.+?)\s(20\d{2})(.+)", b, re.DOTALL)
        if match:
            title, year, description = match.groups()
            results.append({
                "title": title.strip(),
                "year": year.strip(),
                "description": description.strip()
            })
    return results


def extract_experience(text):
    return []


def extract_skills(text):
    programming = re.findall(r"Programming:\s(.+)", text)
    frameworks = re.findall(r"Frameworks\/Tools:\s(.+)", text)
    soft = re.findall(r"Soft Skills:\s(.+)", text)

    return {
        "programming": programming[0].split(", ") if programming else [],
        "frameworks_tools": frameworks[0].split(", ") if frameworks else [],
        "soft_skills": soft[0].split(", ") if soft else []
    }


def extract_certifications(text):
    certs = re.findall(r"AWS Certified Cloud Practitioner", text)
    return certs


def extract_achievements(text):
    block = re.search(r"Achievements(.+)", text, re.DOTALL)
    if not block:
        return []
    lines = [l.strip() for l in block.group(1).split("\n") if l.strip()]
    return lines[:3]
