import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Parse resume text into sections
function parseResumeText(text) {
  const sections = {
    name: '',
    contact: '',
    summary: '',
    skills: '',
    experience: '',
    education: '',
    certifications: ''
  };

  // Split text into lines and process each section
  const lines = text.split('\n');
  let currentSection = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;

    // Check if this is a section header
    if (line.startsWith('"') && line.endsWith('"')) {
      const header = line.replace(/"/g, '').toLowerCase();
      
      // Map the header to a section
      if (header.includes('name')) {
        currentSection = 'name';
      } else if (header.includes('summary')) {
        currentSection = 'summary';
      } else if (header.includes('technical skill')) {
        currentSection = 'skills';
      } else if (header.includes('experience')) {
        currentSection = 'experience';
      } else if (header.includes('education')) {
        currentSection = 'education';
      } else if (header.includes('certification')) {
        currentSection = 'certifications';
      }
      continue;
    }

    // Add content to current section
    if (currentSection === 'name' && !sections.contact && line.includes('@')) {
      sections.contact = line;
    } else if (currentSection) {
      sections[currentSection] = sections[currentSection] 
        ? sections[currentSection] + '\n' + line 
        : line;
    }
  }

  // Clean up any quotation marks in the content
  Object.keys(sections).forEach(key => {
    sections[key] = sections[key].replace(/"/g, '');
  });

  return sections;
}

export const generatePDF = async (resumeText) => {
  try {
    // Create a temporary div to render the resume content    const tempDiv = document.createElement('div');    // Parse the resume text into sections
    const sections = parseResumeText(resumeText);
    
    tempDiv.innerHTML = `
      <div style="font-family: 'Arial', sans-serif; padding: 25mm; max-width: 210mm; margin: 0 auto; background: rgb(255, 255, 255); color: rgb(35, 35, 35);">
        <!-- Header Section -->
        <div style="margin-bottom: 20px;">
          <h1 style="font-size: 24px; margin: 0 0 8px 0; color: rgb(45, 45, 45);">${sections.name || ''}</h1>
          <div style="font-size: 11px; color: rgb(70, 70, 70);">${sections.contact || ''}</div>
        </div>

        <!-- Summary Section -->
        ${sections.summary ? `
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 14px; text-transform: uppercase; margin: 0 0 8px 0; color: rgb(45, 45, 45); border-bottom: 1px solid rgb(200, 200, 200); padding-bottom: 4px;">Professional Summary</h2>
          <div style="font-size: 11px; line-height: 1.5;">${sections.summary}</div>
        </div>
        ` : ''}

        <!-- Technical Skills Section -->
        ${sections.skills ? `
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 14px; text-transform: uppercase; margin: 0 0 8px 0; color: rgb(45, 45, 45); border-bottom: 1px solid rgb(200, 200, 200); padding-bottom: 4px;">Technical Skills</h2>
          <div style="font-size: 11px; line-height: 1.5;">${sections.skills}</div>
        </div>
        ` : ''}

        <!-- Professional Experience Section -->
        ${sections.experience ? `
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 14px; text-transform: uppercase; margin: 0 0 8px 0; color: rgb(45, 45, 45); border-bottom: 1px solid rgb(200, 200, 200); padding-bottom: 4px;">Professional Experience</h2>
          <div style="font-size: 11px; line-height: 1.5;">${sections.experience}</div>
        </div>
        ` : ''}

        <!-- Education Section -->
        ${sections.education ? `
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 14px; text-transform: uppercase; margin: 0 0 8px 0; color: rgb(45, 45, 45); border-bottom: 1px solid rgb(200, 200, 200); padding-bottom: 4px;">Education</h2>
          <div style="font-size: 11px; line-height: 1.5;">${sections.education}</div>
        </div>
        ` : ''}

        <!-- Certifications Section -->
        ${sections.certifications ? `
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 14px; text-transform: uppercase; margin: 0 0 8px 0; color: rgb(45, 45, 45); border-bottom: 1px solid rgb(200, 200, 200); padding-bottom: 4px;">Certifications</h2>
          <div style="font-size: 11px; line-height: 1.5;">${sections.certifications}</div>
        </div>
        ` : ''}
      </div>
    `;
    document.body.appendChild(tempDiv);    // Convert the div to canvas with optimized settings for color compatibility    const canvas = await html2canvas(tempDiv, {
      scale: 3, // Higher scale for better quality
      logging: false,
      useCORS: true,
      removeContainer: true,
      backgroundColor: '#ffffff',
      foreignObjectRendering: false,
      letterRendering: true, // Improve text rendering
      allowTaint: false,
      imageTimeout: 0,
      windowWidth: 1024 // Consistent rendering width
    });

    // Remove the temporary div
    document.body.removeChild(tempDiv);

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgData = canvas.toDataURL('image/png');
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, width, height);

    return pdf;
  } catch (error) {    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. If this error persists, try switching to light theme before downloading.');
  }
};
