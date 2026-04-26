import json
import re
import psutil
import requests
from typing import Dict, Any
from sentence_transformers import SentenceTransformer, util
from rake_nltk import Rake
import textstat
from app.config import settings


class SmartAnalyzer:
    """
    Intelligent analyzer that automatically picks the best method based on PC specs
    
    - 8GB+ RAM: Uses local AI models
    - 4-8GB RAM: Uses hybrid approach (lightweight local + cloud fallback)
    - <4GB RAM: Uses cloud API only (works on any PC)
    """
    
    def __init__(self):
        self.ram_gb = psutil.virtual_memory().total / (1024**3)
        self.cpu_cores = psutil.cpu_count()
        
        # Determine best mode
        if settings.AI_MODE == "auto":
            if self.ram_gb >= 8:
                self.mode = "local"
            elif self.ram_gb >= 4:
                self.mode = "hybrid"
            else:
                self.mode = "cloud"
        else:
            self.mode = settings.AI_MODE
        
        print(f"🖥️  PC Specs: {self.ram_gb:.1f}GB RAM, {self.cpu_cores} CPU cores")
        print(f"🤖 AI Mode: {self.mode}")
        
        # Initialize components based on mode
        self.semantic_model = None
        if self.mode in ["local", "hybrid"]:
            try:
                print("📦 Loading semantic model...")
                self.semantic_model = SentenceTransformer(settings.SEMANTIC_MODEL)
                print("✅ Semantic model loaded")
            except Exception as e:
                print(f"⚠️  Failed to load semantic model: {e}")
        
        self.rake = Rake()
    
    def analyze_resume(
        self, 
        resume_data: Dict[str, Any], 
        job_description: str,
        fast_mode: bool = False
    ) -> Dict[str, Any]:
        """
        Analyze resume with automatic method selection
        
        Args:
            resume_data: Parsed resume data
            job_description: Job description text
            fast_mode: Skip AI for ultra-fast analysis
            
        Returns:
            Analysis results with scores and feedback
        """
        
        # Fast mode: Skip AI, use only rule-based
        if fast_mode or settings.FAST_MODE:
            return self._fast_analysis(resume_data, job_description)
        
        # Mode-specific analysis
        try:
            if self.mode == "local":
                return self._local_analysis(resume_data, job_description)
            elif self.mode == "cloud":
                return self._cloud_analysis(resume_data, job_description)
            else:  # hybrid
                return self._hybrid_analysis(resume_data, job_description)
        except Exception as e:
            print(f"⚠️  Primary analysis failed: {e}")
            print("🔄 Falling back to cloud API...")
            return self._cloud_analysis(resume_data, job_description)
    
    def _fast_analysis(self, resume_data: Dict, job_desc: str) -> Dict:
        """Ultra-fast rule-based analysis (<1 second)"""
        skills = resume_data.get("skills", [])
        job_lower = job_desc.lower()
        
        # Skills matching
        matched_skills = [s for s in skills if s.lower() in job_lower]
        skills_score = int((len(matched_skills) / max(len(skills), 1)) * 100)
        
        # Experience score
        exp_count = len(resume_data.get("experience", []))
        experience_score = min(100, exp_count * 20)
        
        # Education score
        edu_count = len(resume_data.get("education", []))
        education_score = min(100, edu_count * 33)
        
        # Overall
        overall_score = int((skills_score * 0.6 + experience_score * 0.25 + education_score * 0.15))
        
        return {
            "scores": {
                "skills_score": skills_score,
                "experience_score": experience_score,
                "education_score": education_score,
                "overall_score": overall_score
            },
            "career_intelligence": self.calculate_career_intelligence(resume_data),
            "reasoning": f"Skills match: {skills_score}%, Experience: {exp_count} positions, Education: {edu_count} degrees",
            "strengths": self._identify_strengths(resume_data, job_desc),
            "improvements": self._identify_gaps(resume_data, job_desc),
            "missing_skills": self._find_missing_skills(resume_data, job_desc),
            "suggestions": [
                "Add quantifiable achievements to your experience",
                "Tailor your resume to match job keywords",
                "Include relevant certifications"
            ],
            "feedback": f"Your resume has a {overall_score}% match with this position based on keyword analysis.",
            "analysis_time": "< 1 second",
            "ai_enhanced": False
        }
    
    def _local_analysis(self, resume_data: Dict, job_desc: str) -> Dict:
        """Local analysis using semantic similarity"""
        if not self.semantic_model:
            return self._fast_analysis(resume_data, job_desc)
        
        # Semantic similarity
        similarity = self._calculate_similarity(
            resume_data.get("raw_text", ""),
            job_desc
        )
        
        # Combine with fast analysis
        fast_result = self._fast_analysis(resume_data, job_desc)
        
        # Weight semantic similarity
        overall_score = int((similarity * 0.7 + fast_result["scores"]["overall_score"] * 0.3))
        
        fast_result["scores"]["overall_score"] = overall_score
        fast_result["reasoning"] = f"Semantic match: {similarity}%, {fast_result['reasoning']}"
        fast_result["career_intelligence"] = self.calculate_career_intelligence(resume_data)
        fast_result["ai_enhanced"] = True
        
        return fast_result
    
    def _cloud_analysis(self, resume_data: Dict, job_desc: str) -> Dict:
        """Cloud analysis using FREE OpenRouter API"""
        
        if not settings.OPENROUTER_API_KEY:
            print("⚠️  No OpenRouter API key found. Using fast analysis.")
            return self._fast_analysis(resume_data, job_desc)
        
        try:
            prompt = self._build_cloud_prompt(resume_data, job_desc)
            
            headers = {
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
            }
            
            payload = {
                "model": "meta-llama/llama-3-8b-instruct:free",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3,
                "max_tokens": 1000
            }
            
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                json=payload,
                headers=headers,
                timeout=30
            )
            response.raise_for_status()
            
            result = response.json()
            analysis_text = result["choices"][0]["message"]["content"]
            
            return self._parse_cloud_result(analysis_text)
            
        except Exception as e:
            print(f"Cloud analysis failed: {e}")
            return self._fast_analysis(resume_data, job_desc)
    
    def _hybrid_analysis(self, resume_data: Dict, job_desc: str) -> Dict:
        """Hybrid: Fast local + optional cloud enhancement"""
        # Start with fast analysis
        result = self._fast_analysis(resume_data, job_desc)
        
        # Try to enhance with cloud if available
        if settings.OPENROUTER_API_KEY:
            try:
                cloud_result = self._cloud_analysis(resume_data, job_desc)
                # Use cloud reasoning but keep scores
                result["reasoning"] = cloud_result.get("reasoning", result["reasoning"])
                result["feedback"] = cloud_result.get("feedback", result["feedback"])
                result["ai_enhanced"] = True
            except:
                pass  # Keep fast analysis result
        
        return result
    
    def _calculate_similarity(self, text1: str, text2: str) -> int:
        """Calculate semantic similarity"""
        emb1 = self.semantic_model.encode(text1[:2000], convert_to_tensor=True)
        emb2 = self.semantic_model.encode(text2[:2000], convert_to_tensor=True)
        
        similarity = util.pytorch_cos_sim(emb1, emb2)[0][0].item()
        return int((similarity + 1) / 2 * 100)
    
    def _build_cloud_prompt(self, resume_data: Dict, job_desc: str) -> str:
        """Build prompt for cloud AI"""
        return f"""
Analyze this resume against the job description. Return ONLY valid JSON:

RESUME:
Skills: {', '.join(resume_data.get('skills', []))}
Experience: {len(resume_data.get('experience', []))} positions
Education: {len(resume_data.get('education', []))} degrees

JOB DESCRIPTION:
{job_desc[:1000]}

Return JSON format (numbers 0-100):
{{
  "scores": {{
    "skills_score": <number>,
    "experience_score": <number>,
    "education_score": <number>,
    "overall_score": <number>
  }},
  "reasoning": "<brief explanation>",
  "strengths": ["strength1", "strength2"],
  "improvements": ["area1", "area2"],
  "missing_skills": ["skill1", "skill2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "feedback": "<overall feedback>"
}}
"""
    
    def _parse_cloud_result(self, text: str) -> Dict:
        """Parse JSON from cloud response"""
        try:
            if "```json" in text:
                json_str = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                json_str = text.split("```")[1].split("```")[0].strip()
            else:
                json_str = text
            
            result = json.loads(json_str)
            result["ai_enhanced"] = True
            result["analysis_time"] = "3-5 seconds"
            return result
            
        except Exception as e:
            print(f"Failed to parse cloud result: {e}")
            return {}
    
    def _identify_strengths(self, resume_data: Dict, job_desc: str) -> list:
        """Identify candidate strengths"""
        strengths = []
        skills = resume_data.get("skills", [])
        job_lower = job_desc.lower()
        
        matching_skills = [s for s in skills if s.lower() in job_lower]
        if matching_skills:
            strengths.append(f"Strong match in: {', '.join(matching_skills[:5])}")
        
        if len(resume_data.get("experience", [])) >= 2:
            strengths.append("Solid work experience history")
        
        if resume_data.get("education"):
            strengths.append("Relevant educational background")
        
        return strengths
    
    def _identify_gaps(self, resume_data: Dict, job_desc: str) -> list:
        """Identify improvement areas"""
        gaps = []
        raw_text = resume_data.get("raw_text", "").lower()
        
        word_count = len(resume_data.get("raw_text", "").split())
        if word_count < 200:
            gaps.append("Resume is too short, add more details")
        
        if not resume_data.get("skills"):
            gaps.append("Add technical skills section")
        
        return gaps
    
    def _find_missing_skills(self, resume_data: Dict, job_desc: str) -> list:
        """Find skills in job but not in resume"""
        common_skills = [
            "python", "javascript", "aws", "docker", "kubernetes",
            "react", "sql", "machine learning", "api", "git"
        ]
        
        resume_lower = resume_data.get("raw_text", "").lower()
        job_lower = job_desc.lower()
        
        missing = [s for s in common_skills if s in job_lower and s not in resume_lower]
        return missing[:5]
    
    def calculate_career_intelligence(self, resume_data: Dict) -> Dict[str, Any]:
        """
        Calculate advanced career intelligence metrics (like Scoremi but better!)
        
        Returns:
            Dictionary with role_clarity, skill_depth, project_intelligence, achievement_signals
        """
        return {
            "role_clarity": self._calculate_role_clarity(resume_data),
            "skill_depth": self._calculate_skill_depth(resume_data),
            "project_intelligence": self._calculate_project_intelligence(resume_data),
            "achievement_signals": self._calculate_achievement_signals(resume_data),
            "substance_score": self._calculate_substance_score(resume_data),
            "career_level": self._determine_career_level(resume_data),
            "growth_trajectory": self._assess_growth_trajectory(resume_data)
        }
    
    def _calculate_role_clarity(self, resume_data: Dict) -> int:
        """
        Measure how clear the candidate's career direction is
        Score: 0-100
        """
        experience = resume_data.get("experience", [])
        
        if not experience:
            return 30  # No experience = unclear direction
        
        # Check for career progression
        roles = [exp.get("title_or_company", "").lower() for exp in experience]
        
        # Progression indicators
        progression_keywords = [
            "senior", "lead", "manager", "director", "principal", 
            "head", "vp", "chief", "founder", "co-founder"
        ]
        
        progression_count = sum(
            1 for role in roles 
            if any(kw in role for kw in progression_keywords)
        )
        
        # Check role consistency (same field/industry)
        base_score = 50
        progression_bonus = min(30, progression_count * 15)
        
        # More experience = clearer role
        experience_bonus = min(20, len(experience) * 5)
        
        return min(100, base_score + progression_bonus + experience_bonus)
    
    def _calculate_skill_depth(self, resume_data: Dict) -> int:
        """
        Evaluate applied expertise beyond surface-level skill listings
        Checks if skills are mentioned in context (projects, achievements)
        Score: 0-100
        """
        skills = resume_data.get("skills", [])
        raw_text = resume_data.get("raw_text", "").lower()
        
        if not skills:
            return 20
        
        # Check if skills are mentioned with action verbs or metrics
        skill_context_score = 0
        
        for skill in skills:
            skill_lower = skill.lower()
            
            # Look for skill mentioned in context of work
            context_patterns = [
                f"built with {skill_lower}",
                f"used {skill_lower}",
                f"implemented {skill_lower}",
                f"developed using {skill_lower}",
                f"{skill_lower} improved",
                f"{skill_lower} reduced",
                f"{skill_lower} increased",
                f"architected with {skill_lower}",
                f"optimized {skill_lower}",
                f"led {skill_lower}"
            ]
            
            if any(pattern in raw_text for pattern in context_patterns):
                skill_context_score += 1
        
        # Calculate percentage
        depth_percentage = int((skill_context_score / len(skills)) * 100)
        
        # Bonus for having many skills with context
        if len(skills) >= 10 and depth_percentage >= 50:
            depth_percentage = min(100, depth_percentage + 10)
        
        return depth_percentage
    
    def _calculate_project_intelligence(self, resume_data: Dict) -> int:
        """
        Measure complexity, ownership, and impact clarity
        Score: 0-100
        """
        experience = resume_data.get("experience", [])
        
        if not experience:
            return 25
        
        total_score = 0
        
        for exp in experience:
            desc = exp.get("description", "").lower()
            exp_score = 0
            
            # Ownership indicators (20 points each)
            ownership_words = ["led", "managed", "owned", "architected", "spearheaded", "directed"]
            if any(word in desc for word in ownership_words):
                exp_score += 25
            
            # Complexity indicators (15 points each)
            complexity_words = [
                "scalable", "distributed", "microservices", "enterprise",
                "high-availability", "fault-tolerant", "multi-threaded"
            ]
            if any(word in desc for word in complexity_words):
                exp_score += 20
            
            # Impact metrics (25 points each)
            impact_patterns = [r'\d+%', r'\$\d+', r'\d+x', r'improved', r'reduced', r'increased']
            impact_count = sum(1 for pattern in impact_patterns if re.search(pattern, desc))
            exp_score += min(30, impact_count * 15)
            
            # Team size indicators
            if re.search(r'team of \d+|\d+ members|\d+ people', desc):
                exp_score += 15
            
            total_score += exp_score
        
        # Average across all experiences
        avg_score = total_score / len(experience)
        return min(100, int(avg_score))
    
    def _calculate_achievement_signals(self, resume_data: Dict) -> int:
        """
        Detect quantification and measurable outcomes
        Strong achievements = numbers, percentages, dollar amounts
        Score: 0-100
        """
        raw_text = resume_data.get("raw_text", "")
        
        # Count quantified achievements
        metrics_patterns = [
            r'\d+%',              # Percentages
            r'\$[\d,]+',          # Dollar amounts
            r'\d+x',              # Multipliers
            r'\d+ users',         # User counts
            r'\d+ customers',     # Customer counts
            r'\d+ projects',      # Project counts
            r'\d+ team',          # Team sizes
            r'increased by',      # Growth indicators
            r'reduced by',        # Reduction indicators
            r'improved by'        # Improvement indicators
        ]
        
        total_metrics = 0
        for pattern in metrics_patterns:
            matches = re.findall(pattern, raw_text, re.IGNORECASE)
            total_metrics += len(matches)
        
        # Score based on number of metrics
        if total_metrics == 0:
            return 20
        elif total_metrics <= 3:
            return 40
        elif total_metrics <= 6:
            return 60
        elif total_metrics <= 10:
            return 80
        else:
            return 100
    
    def _calculate_substance_score(self, resume_data: Dict) -> int:
        """
        Overall substance score (like Scoremi's SubstanceScore)
        Weighted average of all career intelligence metrics
        """
        role_clarity = self._calculate_role_clarity(resume_data)
        skill_depth = self._calculate_skill_depth(resume_data)
        project_intel = self._calculate_project_intelligence(resume_data)
        achievement = self._calculate_achievement_signals(resume_data)
        
        # Weighted average
        substance_score = int(
            role_clarity * 0.25 +
            skill_depth * 0.30 +
            project_intel * 0.25 +
            achievement * 0.20
        )
        
        return substance_score
    
    def _determine_career_level(self, resume_data: Dict) -> str:
        """Determine career level based on experience"""
        experience = resume_data.get("experience", [])
        raw_text = resume_data.get("raw_text", "").lower()
        
        # Check for senior-level keywords
        senior_keywords = ["senior", "lead", "principal", "staff", "manager"]
        executive_keywords = ["director", "vp", "vice president", "chief", "cto", "ceo", "founder"]
        
        has_executive = any(kw in raw_text for kw in executive_keywords)
        has_senior = any(kw in raw_text for kw in senior_keywords)
        
        if has_executive or len(experience) >= 5:
            return "Executive"
        elif has_senior or len(experience) >= 3:
            return "Senior"
        elif len(experience) >= 2:
            return "Mid-Level"
        else:
            return "Entry-Level"
    
    def _assess_growth_trajectory(self, resume_data: Dict) -> str:
        """Assess career growth trajectory"""
        experience = resume_data.get("experience", [])
        
        if len(experience) <= 1:
            return "Early Career"
        
        # Check for progression in titles
        titles = [exp.get("title_or_company", "").lower() for exp in experience]
        
        progression_indicators = 0
        for i in range(1, len(titles)):
            if any(kw in titles[i] for kw in ["senior", "lead", "manager"]):
                progression_indicators += 1
        
        if progression_indicators >= 2:
            return "Rapid Growth"
        elif progression_indicators >= 1:
            return "Steady Growth"
        else:
            return "Lateral Movement"
