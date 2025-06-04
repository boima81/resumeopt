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
    // Minimal test: render Hello World visibly
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'fixed';
    tempDiv.style.left = '0';
    tempDiv.style.top = '0';
    tempDiv.style.width = '794px';
    tempDiv.style.height = '1123px';
    tempDiv.style.background = '#fff';
    tempDiv.style.zIndex = '99999';
    tempDiv.style.opacity = '1';
    tempDiv.style.display = 'block';
    tempDiv.innerHTML = `<div style='font-size:48px;color:#222;text-align:center;margin-top:200px;'>Hello World PDF Test</div>`;
    document.body.appendChild(tempDiv);
    await new Promise((resolve) => setTimeout(resolve, 100));
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      logging: true,
      useCORS: true,
      backgroundColor: '#fff',
      windowWidth: 794,
      windowHeight: 1123
    });
    document.body.removeChild(tempDiv);
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
    throw new Error('Failed to generate PDF.');
  }
}
