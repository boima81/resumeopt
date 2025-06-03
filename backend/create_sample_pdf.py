#!/usr/bin/env python3
"""
PDF generation utility for testing resume optimization
Creates sample PDF resumes for testing file upload functionality
"""

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from pathlib import Path

def create_sample_pdf_resume():
    """Create a sample PDF resume for testing"""
    
    # Create test data directory
    test_dir = Path(__file__).parent / "test_data"
    test_dir.mkdir(exist_ok=True)
    
    # Output file path
    pdf_path = test_dir / "sample_resume.pdf"
    
    # Create PDF document
    doc = SimpleDocTemplate(str(pdf_path), pagesize=letter)
    story = []
    
    # Get styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        spaceAfter=30,
        alignment=1  # Center alignment
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        spaceAfter=12,
        spaceBefore=12
    )
    
    # Resume content
    story.append(Paragraph("John Doe", title_style))
    story.append(Paragraph("Software Engineer", styles['Normal']))
    story.append(Paragraph("Email: john.doe@email.com | Phone: (555) 123-4567", styles['Normal']))
    story.append(Spacer(1, 20))
    
    # Summary
    story.append(Paragraph("PROFESSIONAL SUMMARY", heading_style))
    story.append(Paragraph(
        "Experienced software engineer with 4 years of experience in full-stack web development. "
        "Proficient in modern web technologies including React, Node.js, and Python. "
        "Passionate about creating efficient, scalable solutions and collaborating with cross-functional teams.",
        styles['Normal']
    ))
    story.append(Spacer(1, 12))
    
    # Experience
    story.append(Paragraph("PROFESSIONAL EXPERIENCE", heading_style))
    
    story.append(Paragraph("<b>Senior Software Engineer</b> | Tech Company | 2022-Present", styles['Normal']))
    story.append(Paragraph(
        "• Developed and maintained web applications using React and Node.js<br/>"
        "• Collaborated with cross-functional teams to deliver high-quality software<br/>"
        "• Implemented RESTful APIs and database solutions using PostgreSQL<br/>"
        "• Participated in code reviews and mentored junior developers<br/>"
        "• Improved application performance by 25% through optimization",
        styles['Normal']
    ))
    story.append(Spacer(1, 8))
    
    story.append(Paragraph("<b>Software Engineer</b> | StartupCorp | 2020-2022", styles['Normal']))
    story.append(Paragraph(
        "• Built responsive web applications using JavaScript and Python<br/>"
        "• Worked with PostgreSQL and MongoDB databases<br/>"
        "• Deployed applications on AWS cloud platform<br/>"
        "• Implemented automated testing and CI/CD pipelines<br/>"
        "• Reduced bug reports by 40% through comprehensive testing",
        styles['Normal']
    ))
    story.append(Spacer(1, 12))
    
    # Education
    story.append(Paragraph("EDUCATION", heading_style))
    story.append(Paragraph(
        "<b>Bachelor of Science in Computer Science</b><br/>"
        "University of Technology | 2020<br/>"
        "GPA: 3.8/4.0",
        styles['Normal']
    ))
    story.append(Spacer(1, 12))
    
    # Skills
    story.append(Paragraph("TECHNICAL SKILLS", heading_style))
    story.append(Paragraph(
        "<b>Programming Languages:</b> JavaScript, Python, Java, TypeScript<br/>"
        "<b>Frontend Technologies:</b> React, HTML5, CSS3, Vue.js<br/>"
        "<b>Backend Technologies:</b> Node.js, Express, Django, Flask<br/>"
        "<b>Databases:</b> PostgreSQL, MongoDB, MySQL, Redis<br/>"
        "<b>Cloud & DevOps:</b> AWS, Docker, Kubernetes, Jenkins<br/>"
        "<b>Tools:</b> Git, JIRA, Slack, VS Code",
        styles['Normal']
    ))
    
    # Build PDF
    doc.build(story)
    
    print(f"✅ Sample PDF resume created: {pdf_path}")
    return pdf_path

if __name__ == "__main__":
    create_sample_pdf_resume()

