import re
from typing import Dict, List, Any


class BiasDetector:
    """Detects bias in job descriptions and resume analysis"""
    
    # Formatting bias indicators (anti-Scoremi!)
    FORMATTING_BIAS_INDICATORS = [
        "template",
        "design",
        "format",
        "layout",
        "font",
        "color",
        "aesthetic",
        "visual",
        "cosmetic",
        "appearance",
        "style",
        "professional looking",
        "well-formatted",
        "clean design"
    ]
    
    # Gender-coded words (research-based)
    MASCULINE_CODED = [
        "aggressive", "ambitious", "analytical", "assertive", "athletic",
        "autonomous", "battle", "boast", "challenge", "champion", "competitive",
        "confident", "courage", "decide", "decision", "determination", "dominant",
        "driven", "fearless", "fight", "force", "headstrong", "hostile", "independent",
        "intellectual", "leader", "logic", "objective", "opinion", "outspoken",
        "persistent", "principle", "reckless", "self-reliant", "self-sufficient",
        "stubborn", "superior", "unreasonable"
    ]
    
    FEMININE_CODED = [
        "affectionate", "agree", "ambitious", "attentive", "cheerful", "child",
        "collaborate", "committed", "cooperative", "depend", "emotional", "empathy",
        "encourage", "feel", "flatterable", "gentle", "honest", "hospitable",
        "interpersonal", "kind", "loyal", "modest", "nagging", "nurture", "pleasant",
        "polite", "quiet", "relationship", "sensitive", "subordinate", "support",
        "sympathetic", "tender", "together", "trust", "understand", "warm", "yield"
    ]
    
    # Age-related indicators
    AGE_INDICATORS = [
        "recent graduate", "young", "energetic", "digital native",
        "5+ years experience", "10+ years experience", "junior", "senior"
    ]
    
    # Educational prestige bias
    PRESTIGE_SCHOOLS = [
        "harvard", "mit", "stanford", "yale", "princeton", "columbia",
        "oxford", "cambridge", "caltech", "uchicago"
    ]
    
    def detect_bias(
        self,
        job_description: str = "",
        resume_data: Dict[str, Any] = None,
        analysis_result: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Comprehensive bias detection
        
        Args:
            job_description: Job description text
            resume_data: Parsed resume data
            analysis_result: AI analysis result
            
        Returns:
            Bias report with detected issues and recommendations
        """
        detected_biases = []
        recommendations = []
        bias_score = 0.0
        
        # Check job description for bias
        if job_description:
            jd_biases = self._check_job_description_bias(job_description)
            detected_biases.extend(jd_biases["biases"])
            recommendations.extend(jd_biases["recommendations"])
            bias_score += jd_biases["score"]
        
        # Check for educational prestige bias
        if resume_data:
            edu_bias = self._check_education_bias(resume_data)
            detected_biases.extend(edu_bias["biases"])
            recommendations.extend(edu_bias["recommendations"])
            bias_score += edu_bias["score"]
        
        # Check analysis for unfair patterns
        if analysis_result:
            analysis_bias = self._check_analysis_bias(analysis_result)
            detected_biases.extend(analysis_bias["biases"])
            recommendations.extend(analysis_bias["recommendations"])
            bias_score += analysis_bias["score"]
        
        # Check for formatting bias (Scoremi's weakness!)
        if job_description or resume_data:
            formatting_bias = self._check_formatting_bias(job_description, resume_data)
            detected_biases.extend(formatting_bias["biases"])
            recommendations.extend(formatting_bias["recommendations"])
            bias_score += formatting_bias["score"]
        
        # Normalize bias score to 0-100
        bias_score = min(100, bias_score)
        
        # Determine fairness rating
        if bias_score < 20:
            fairness_rating = "High"
        elif bias_score < 50:
            fairness_rating = "Medium"
        else:
            fairness_rating = "Low"
        
        return {
            "bias_score": round(bias_score, 2),
            "detected_biases": list(set(detected_biases)),  # Remove duplicates
            "recommendations": list(set(recommendations)),
            "fairness_rating": fairness_rating
        }
    
    def _check_job_description_bias(self, job_description: str) -> Dict[str, Any]:
        """Check job description for gender-coded language and other biases"""
        biases = []
        recommendations = []
        score = 0
        
        text_lower = job_description.lower()
        
        # Check for masculine-coded words
        masculine_found = [word for word in self.MASCULINE_CODED if word in text_lower]
        if len(masculine_found) > 3:
            biases.append(f"Masculine-coded language detected: {', '.join(masculine_found[:5])}")
            recommendations.append("Use more gender-neutral language to attract diverse candidates")
            score += 20
        
        # Check for feminine-coded words (less concerning, but still worth noting)
        feminine_found = [word for word in self.FEMININE_CODED if word in text_lower]
        if len(feminine_found) > 5:
            biases.append(f"Overly feminine-coded language: {', '.join(feminine_found[:5])}")
            recommendations.append("Ensure language appeals to all genders equally")
            score += 10
        
        # Check for age-related bias
        age_found = [phrase for phrase in self.AGE_INDICATORS if phrase in text_lower]
        if age_found:
            biases.append(f"Age-related language detected: {', '.join(age_found)}")
            recommendations.append("Focus on skills and competencies rather than years of experience or age indicators")
            score += 15
        
        # Check for unnecessary degree requirements
        if re.search(r'\b(master\'?s|phd|bachelor\'?s)\s+(degree\s+)?(required|mandatory|must)', text_lower):
            biases.append("Potentially restrictive degree requirements")
            recommendations.append("Consider if degree requirements are truly necessary or if equivalent experience suffices")
            score += 10
        
        return {
            "biases": biases,
            "recommendations": recommendations,
            "score": score
        }
    
    def _check_education_bias(self, resume_data: Dict[str, Any]) -> Dict[str, Any]:
        """Check for educational prestige bias"""
        biases = []
        recommendations = []
        score = 0
        
        education = resume_data.get("education", [])
        for edu in education:
            edu_text = f"{edu.get('degree_or_institution', '')} {edu.get('details', '')}".lower()
            
            # Check if analysis over-weights prestigious schools
            if any(school in edu_text for school in self.PRESTIGE_SCHOOLS):
                biases.append("Prestigious institution detected - ensure evaluation focuses on skills, not school name")
                recommendations.append("Evaluate candidates based on demonstrated skills and experience, not institutional prestige")
                score += 15
        
        return {
            "biases": biases,
            "recommendations": recommendations,
            "score": score
        }
    
    def _check_analysis_bias(self, analysis_result: Dict[str, Any]) -> Dict[str, Any]:
        """Check AI analysis results for potential bias patterns"""
        biases = []
        recommendations = []
        score = 0
        
        # Check if missing skills are actually essential
        missing_skills = analysis_result.get("missing_skills", [])
        if len(missing_skills) > 5:
            biases.append("High number of missing skills flagged - may indicate overly strict criteria")
            recommendations.append("Review if all missing skills are truly essential or just 'nice to have'")
            score += 15
        
        # Check for employment gap penalties
        feedback = analysis_result.get("feedback", "").lower()
        if "gap" in feedback and ("concern" in feedback or "issue" in feedback):
            biases.append("Employment gaps flagged as concern")
            recommendations.append("Employment gaps are common and should not negatively impact evaluation")
            score += 20
        
        return {
            "biases": biases,
            "recommendations": recommendations,
            "score": score
        }
    
    def _check_formatting_bias(self, job_description: str = "", resume_data: Dict = None) -> Dict[str, Any]:
        """
        Detect formatting bias - penalizing resumes based on design rather than substance
        This is Scoremi's claimed advantage, but we do it better!
        """
        biases = []
        recommendations = []
        score = 0
        
        # Check job description for formatting requirements
        if job_description:
            jd_lower = job_description.lower()
            
            formatting_mentions = [
                indicator for indicator in self.FORMATTING_BIAS_INDICATORS 
                if indicator in jd_lower
            ]
            
            if formatting_mentions:
                biases.append(f"Job description focuses on formatting: {', '.join(formatting_mentions)}")
                recommendations.append("Focus on skills and experience, not resume design")
                score += 25
            
            # Check for template requirements
            if any(word in jd_lower for word in ["must use template", "specific format", "required layout"]):
                biases.append("Requires specific resume template/format")
                recommendations.append("This may disadvantage candidates who don't use professional resume services")
                score += 30
        
        # Check if resume parsing penalizes formatting
        if resume_data:
            raw_text = resume_data.get("raw_text", "")
            
            # Detect if resume is text-heavy (good) vs design-heavy (potential bias)
            text_length = len(raw_text.strip())
            
            if text_length < 200:
                biases.append("Very short resume content - may indicate over-focus on design")
                recommendations.append("Substance matters more than design")
                score += 15
        
        return {
            "biases": biases,
            "recommendations": recommendations,
            "score": score
        }
