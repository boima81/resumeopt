import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDF = async (resumeText) => {
  try {
    // Create a temporary div to render the resume content    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; background: rgb(255, 255, 255);">
        <h1 style="color: rgb(45, 45, 45); font-size: 24px; margin-bottom: 20px; text-align: center;">Optimized Resume</h1>
        <div style="white-space: pre-wrap; font-size: 12px; line-height: 1.5; color: rgb(35, 35, 35);">
          ${resumeText}
        </div>
      </div>
    `;
    document.body.appendChild(tempDiv);    // Convert the div to canvas with optimized settings for color compatibility
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      logging: false,
      useCORS: true,
      removeContainer: true,
      backgroundColor: '#ffffff',
      foreignObjectRendering: false
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
