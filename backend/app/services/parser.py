import os
import re
import pdfplumber
from docx import Document
from typing import Dict, List, Any
import spacy

# Load spaCy NLP model (run: python -m spacy download en_core_web_sm)
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("spaCy model not found. Run: python -m spacy download en_core_web_sm")
    nlp = None


class ResumeParser:
    """Lightweight resume parser using PyPDF2, pdfplumber, and python-docx"""
    
    def parse_resume(self, file_path: str) -> Dict[str, Any]:
        """
        Parse a resume file and extract structured data
        
        Args:
            file_path: Path to the resume file (PDF/DOCX)
            
        Returns:
            Dictionary with extracted resume data
        """
        file_ext = os.path.splitext(file_path)[1].lower()
        
        try:
            if file_ext == '.pdf':
                text = self._extract_pdf_text(file_path)
            elif file_ext in ['.docx', '.doc']:
                text = self._extract_docx_text(file_path)
            else:
                raise ValueError(f"Unsupported file type: {file_ext}")
            
            return self._extract_resume_info(text)
            
        except Exception as e:
            raise Exception(f"Failed to parse resume: {str(e)}")
    
    def _extract_pdf_text(self, file_path: str) -> str:
        """Extract text from PDF using pdfplumber"""
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text
    
    def _extract_docx_text(self, file_path: str) -> str:
        """Extract text from DOCX"""
        doc = Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    
    def _extract_resume_info(self, text: str) -> Dict[str, Any]:
        """Extract structured information from resume text"""
        
        # Extract email
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        emails = re.findall(email_pattern, text)
        email = emails[0] if emails else None
        
        # Extract phone number
        phone_pattern = r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        phones = re.findall(phone_pattern, text)
        phone = phones[0] if phones else None
        
        # Extract name (using NLP if available)
        name = self._extract_name(text)
        
        # Extract skills
        skills = self._extract_skills(text)
        
        # Extract experience
        experience = self._extract_experience(text)
        
        # Extract education
        education = self._extract_education(text)
        
        return {
            "name": name,
            "email": email,
            "phone": phone,
            "skills": skills,
            "experience": experience,
            "education": education,
            "raw_text": text
        }
    
    def _extract_name(self, text: str) -> str:
        """Extract name using spaCy NER or fallback to regex"""
        if nlp:
            doc = nlp(text[:500])  # Analyze first 500 chars
            for ent in doc.ents:
                if ent.label_ == "PERSON":
                    return ent.text
        
        # Fallback: First line that's not contact info
        lines = text.strip().split('\n')
        for line in lines[:5]:
            line = line.strip()
            if line and len(line.split()) <= 4 and not re.search(r'@|\d{3}|http', line):
                return line
        
        return None
    
    def _extract_skills(self, text: str) -> List[str]:
        """Extract technical skills from resume text"""
        technical_skills = [
            "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust",
            "React", "Angular", "Vue", "Node.js", "Express", "Django", "FastAPI", "Flask",
            "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch",
            "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "CI/CD",
            "Git", "REST API", "GraphQL", "Microservices", "Agile", "Scrum",
            "Machine Learning", "Deep Learning", "NLP", "Computer Vision",
            "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy",
            "HTML", "CSS", "Tailwind", "Bootstrap", "SASS",
            "Linux", "Windows", "Networking", "Security"
        ]
        
        found_skills = []
        text_lower = text.lower()
        for skill in technical_skills:
            if skill.lower() in text_lower:
                found_skills.append(skill)
        
        return found_skills
    
    def _extract_experience(self, text: str) -> List[Dict[str, str]]:
        """Extract work experience sections"""
        experience = []
        lines = text.split('\n')
        current_entry = {}
        
        for line in lines:
            line = line.strip()
            # Look for company names or job titles
            if re.match(r'^[A-Z][a-zA-Z\s&,.]+$', line) and len(line) > 3:
                if current_entry:
                    experience.append(current_entry)
                current_entry = {"title_or_company": line, "description": ""}
            elif current_entry and len(line) > 10:
                current_entry["description"] += line + " "
        
        if current_entry:
            experience.append(current_entry)
        
        return experience[:5]
    
    def _extract_education(self, text: str) -> List[Dict[str, str]]:
        """Extract education sections"""
        education = []
        edu_keywords = [
            "Bachelor", "Master", "PhD", "BS", "MS", "MBA", "BSc", "MSc", 
            "University", "College", "Institute", "B.Tech", "M.Tech"
        ]
        lines = text.split('\n')
        
        for i, line in enumerate(lines):
            if any(keyword in line for keyword in edu_keywords):
                edu_entry = {"degree_or_institution": line.strip()}
                if i + 1 < len(lines):
                    edu_entry["details"] = lines[i + 1].strip()
                education.append(edu_entry)
        
        return education[:3]
