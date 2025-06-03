#!/usr/bin/env python3
"""
Test script for Resume Optimizer backend functionality
Tests file processing, AI integration, and document generation
"""

import requests
import json
import os
from pathlib import Path

# Test configuration
API_BASE = "http://localhost:5001/resume-optimizer-app/us-central1/api"
TEST_DATA_DIR = Path(__file__).parent / "test_data"

def test_health_endpoint():
    """Test the health check endpoint"""
    print("Testing health endpoint...")
    try:
        response = requests.get(f"{API_BASE}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_job_posting_processing():
    """Test job posting processing with sample text"""
    print("\nTesting job posting processing...")
    
    sample_job = """
    Software Engineer - Full Stack
    
    We are looking for a talented Full Stack Software Engineer to join our team.
    
    Requirements:
    - 3+ years of experience in web development
    - Proficiency in React, Node.js, and Python
    - Experience with databases (PostgreSQL, MongoDB)
    - Knowledge of cloud platforms (AWS, GCP)
    - Strong problem-solving skills
    - Bachelor's degree in Computer Science or related field
    
    Responsibilities:
    - Develop and maintain web applications
    - Collaborate with cross-functional teams
    - Write clean, maintainable code
    - Participate in code reviews
    """
    
    try:
        response = requests.post(
            f"{API_BASE}/process-job-posting",
            json={"jobText": sample_job},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print("✅ Job posting processing passed")
                print(f"   Key requirements found: {len(data.get('keyRequirements', []))}")
                return True
            else:
                print(f"❌ Job posting processing failed: {data.get('error')}")
                return False
        else:
            print(f"❌ Job posting processing failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Job posting processing error: {e}")
        return False

def create_sample_resume():
    """Create a sample resume file for testing"""
    sample_resume = """
John Doe
Software Engineer
Email: john.doe@email.com
Phone: (555) 123-4567

SUMMARY
Experienced software engineer with 4 years of experience in full-stack web development.
Proficient in modern web technologies and passionate about creating efficient solutions.

EXPERIENCE
Senior Software Engineer | Tech Company | 2022-Present
- Developed and maintained web applications using React and Node.js
- Collaborated with cross-functional teams to deliver high-quality software
- Implemented RESTful APIs and database solutions
- Participated in code reviews and mentored junior developers

Software Engineer | StartupCorp | 2020-2022
- Built responsive web applications using JavaScript and Python
- Worked with PostgreSQL and MongoDB databases
- Deployed applications on AWS cloud platform
- Improved application performance by 30%

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2020

SKILLS
- Programming Languages: JavaScript, Python, Java
- Frontend: React, HTML, CSS, TypeScript
- Backend: Node.js, Express, Django
- Databases: PostgreSQL, MongoDB, MySQL
- Cloud: AWS, Docker, Kubernetes
"""
    
    # Create test data directory
    TEST_DATA_DIR.mkdir(exist_ok=True)
    
    # Save as text file (will be converted to PDF for testing)
    resume_path = TEST_DATA_DIR / "sample_resume.txt"
    with open(resume_path, "w") as f:
        f.write(sample_resume)
    
    return resume_path, sample_resume

def test_ai_optimization():
    """Test AI optimization with sample data"""
    print("\nTesting AI optimization...")
    
    # Create sample data
    _, sample_resume = create_sample_resume()
    
    sample_job = """
    Senior Full Stack Developer position requiring React, Node.js, Python, 
    and cloud experience. Must have 3+ years experience and strong problem-solving skills.
    """
    
    try:
        response = requests.post(
            f"{API_BASE}/optimize-resume",
            json={
                "resumeText": sample_resume,
                "jobDescription": sample_job
            },
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print("✅ AI optimization passed")
                print(f"   Optimized resume length: {len(data.get('optimizedResume', ''))}")
                print(f"   Download URLs provided: {bool(data.get('downloads'))}")
                return True
            else:
                print(f"❌ AI optimization failed: {data.get('error')}")
                return False
        else:
            print(f"❌ AI optimization failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ AI optimization error: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Resume Optimizer Backend Tests")
    print("=" * 40)
    
    # Create test data directory
    TEST_DATA_DIR.mkdir(exist_ok=True)
    
    tests = [
        test_health_endpoint,
        test_job_posting_processing,
        # test_ai_optimization,  # Commented out until Gemini API key is configured
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed!")
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
    
    # Note about AI testing
    print("\n📝 Note: AI optimization test is disabled until Gemini API key is configured.")
    print("   To enable AI testing, set up the GEMINI_API_KEY environment variable.")

if __name__ == "__main__":
    main()

