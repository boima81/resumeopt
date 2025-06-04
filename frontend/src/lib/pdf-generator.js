import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

  const lines = text.split('\n');
  let currentSection = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      const header = trimmed.replace(/"/g, '').toLowerCase();
      if (header.includes('name')) currentSection = 'name';
      else if (header.includes('summary')) currentSection = 'summary';
      else if (header.includes('technical skill')) currentSection = 'skills';
      else if (header.includes('experience')) currentSection = 'experience';
      else if (header.includes('education')) currentSection = 'education';
      else if (header.includes('certification')) currentSection = 'certifications';
      continue;
    }

    if (currentSection === 'name' && !sections.contact && trimmed.includes('@')) {
      sections.contact = trimmed;
    } else if (currentSection) {
      sections[currentSection] = sections[currentSection] 
        ? sections[currentSection] + '\n' + trimmed 
        : trimmed;
    }
  }

  Object.keys(sections).forEach(key => {
    sections[key] = sections[key].replace(/"/g, '');
  });

  return sections;
}

export async function generatePDF(resumeText) {
  try {
    // Create a temporary div to render the resume content
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'fixed';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '794px'; // A4 width at 96dpi
    tempDiv.style.height = '1123px'; // A4 height at 96dpi
    tempDiv.style.background = '#fff';
    tempDiv.style.zIndex = '10000';
    tempDiv.style.overflow = 'visible';

    // Parse the resume text into sections
    const sections = parseResumeText(resumeText);

    // Log the optimized resume text and the generated HTML for debugging
    console.log('Optimized Resume Text:', resumeText);
    
    const htmlContent = `
      <div style="font-family: 'Arial', sans-serif; padding: 25mm; max-width: 210mm; margin: 0 auto; background: rgb(255, 255, 255); color: rgb(35, 35, 35);">
        <!-- Header Section -->
        <div style="margin-bottom: 20px;">
          <h1 style="font-size: 24px; margin: 0 0 8px 0; color: rgb(45, 45, 45);">${sections.name || ''}</h1>
          <div style="font-size: 11px; color: rgb(70, 70, 70);">${sections.contact || ''}</div>
        </div>
        ${sections.summary ? `
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 14px; text-transform: uppercase; margin: 0 0 8px 0; color: rgb(45, 45, 45); border-bottom: 1px solid rgb(200, 200, 200); padding-bottom: 4px;">Professional Summary</h2>
          <div style="font-size: 11px; line-height: 1.5;">${sections.summary}</div>
        </div>
        ` : ''}
        ${sections.skills ? `
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 14px; text-transform: uppercase; margin: 0 0 8px 0; color: rgb(45, 45, 45); border-bottom: 1px solid rgb(200, 200, 200); padding-bottom: 4px;">Technical Skills</h2>
          <div style="font-size: 11px; line-height: 1.5;">${sections.skills}</div>
        </div>
        ` : ''}
        ${sections.experience ? `
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 14px; text-transform: uppercase; margin: 0 0 8px 0; color: rgb(45, 45, 45); border-bottom: 1px solid rgb(200, 200, 200); padding-bottom: 4px;">Professional Experience</h2>
          <div style="font-size: 11px; line-height: 1.5;">${sections.experience}</div>
        </div>
        ` : ''}
        ${sections.education ? `
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 14px; text-transform: uppercase; margin: 0 0 8px 0; color: rgb(45, 45, 45); border-bottom: 1px solid rgb(200, 200, 200); padding-bottom: 4px;">Education</h2>
          <div style="font-size: 11px; line-height: 1.5;">${sections.education}</div>
        </div>
        ` : ''}
        ${sections.certifications ? `
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 14px; text-transform: uppercase; margin: 0 0 8px 0; color: rgb(45, 45, 45); border-bottom: 1px solid rgb(200, 200, 200); padding-bottom: 4px;">Certifications</h2>
          <div style="font-size: 11px; line-height: 1.5;">${sections.certifications}</div>
        </div>
        ` : ''}
      </div>
    `;

    tempDiv.innerHTML = htmlContent;
    console.log('Generated HTML:', htmlContent);

    document.body.appendChild(tempDiv);
    // Wait for the browser to render the element
    await new Promise((resolve) => requestAnimationFrame(resolve));

    // Convert the div to canvas with optimized settings for color compatibility
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      logging: true,
      useCORS: true,
      backgroundColor: '#ffffff',
      letterRendering: true,
      windowWidth: 794,
      windowHeight: 1123
    });

    // Remove the temporary div
    document.body.removeChild(tempDiv);

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [794, 1123]
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 794, 1123);
    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. If this error persists, try switching to light theme before downloading.');
  }
}
