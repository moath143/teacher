const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

/**
 * Generate a professional student financial and lesson report PDF
 * @param {Object} teacher - Teacher profile information
 * @param {Object} student - Student record
 * @param {Array} lessons - List of lessons for the student
 * @param {Object} summary - Total lessons, total amount, currency
 * @returns {Promise<Uint8Array>} Raw PDF bytes
 */
const generateStudentReportPDF = async ({ teacher, student, lessons, summary }) => {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]); // A4 dimensions in points (595 x 842)
  const { width, height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Palette
  const primaryColor = rgb(0.12, 0.23, 0.54); // Deep Navy #1F3A8A
  const secondaryColor = rgb(0.35, 0.45, 0.65);
  const darkTextColor = rgb(0.1, 0.15, 0.2);
  const mutedTextColor = rgb(0.4, 0.45, 0.5);
  const lightBgColor = rgb(0.95, 0.96, 0.98);
  const borderLineColor = rgb(0.85, 0.88, 0.92);
  const successColor = rgb(0.05, 0.6, 0.38);

  let y = height - 40;

  // Header Banner
  page.drawRectangle({
    x: 0,
    y: height - 100,
    width: width,
    height: 100,
    color: primaryColor,
  });

  page.drawText('STUDENT STATEMENT & LESSON REPORT', {
    x: 40,
    y: height - 50,
    size: 18,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText(`Teacher: ${teacher.name || 'Private Instructor'} | ${teacher.subject || 'Private Tutoring'}`, {
    x: 40,
    y: height - 75,
    size: 11,
    font: fontRegular,
    color: rgb(0.85, 0.9, 1),
  });

  page.drawText(`Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`, {
    x: width - 200,
    y: height - 75,
    size: 10,
    font: fontRegular,
    color: rgb(0.85, 0.9, 1),
  });

  y = height - 130;

  // Student Info Box
  page.drawRectangle({
    x: 40,
    y: y - 80,
    width: width - 80,
    height: 80,
    color: lightBgColor,
    borderColor: borderLineColor,
    borderWidth: 1,
  });

  page.drawText('STUDENT PROFILE', {
    x: 55,
    y: y - 20,
    size: 11,
    font: fontBold,
    color: primaryColor,
  });

  page.drawText(`Full Name: ${student.fullName || 'N/A'}`, {
    x: 55,
    y: y - 40,
    size: 10,
    font: fontRegular,
    color: darkTextColor,
  });

  page.drawText(`Educational Stage: ${student.stage || 'N/A'}`, {
    x: 55,
    y: y - 60,
    size: 10,
    font: fontRegular,
    color: darkTextColor,
  });

  page.drawText(`Education Type: ${student.educationType || 'Lessons'}`, {
    x: 320,
    y: y - 40,
    size: 10,
    font: fontRegular,
    color: darkTextColor,
  });

  const enrollDateStr = student.enrollmentDate
    ? new Date(student.enrollmentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'N/A';

  page.drawText(`Enrollment Date: ${enrollDateStr}`, {
    x: 320,
    y: y - 60,
    size: 10,
    font: fontRegular,
    color: darkTextColor,
  });

  y -= 110;

  // Financial Summary Cards
  const cardWidth = (width - 80 - 20) / 2;

  // Total Lessons Card
  page.drawRectangle({
    x: 40,
    y: y - 55,
    width: cardWidth,
    height: 55,
    color: rgb(0.96, 0.97, 1),
    borderColor: rgb(0.8, 0.85, 0.95),
    borderWidth: 1,
  });

  page.drawText('Total Lessons Attended', {
    x: 55,
    y: y - 22,
    size: 9,
    font: fontRegular,
    color: secondaryColor,
  });

  page.drawText(`${summary.totalLessons || lessons.length} Lessons`, {
    x: 55,
    y: y - 44,
    size: 16,
    font: fontBold,
    color: primaryColor,
  });

  // Total Revenue Card
  page.drawRectangle({
    x: 40 + cardWidth + 20,
    y: y - 55,
    width: cardWidth,
    height: 55,
    color: rgb(0.93, 0.98, 0.95),
    borderColor: rgb(0.7, 0.9, 0.8),
    borderWidth: 1,
  });

  page.drawText('Total Financial Amount', {
    x: 40 + cardWidth + 35,
    y: y - 22,
    size: 9,
    font: fontRegular,
    color: successColor,
  });

  const currencySymbol = summary.currency || '$';
  page.drawText(`${currencySymbol}${Number(summary.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, {
    x: 40 + cardWidth + 35,
    y: y - 44,
    size: 16,
    font: fontBold,
    color: successColor,
  });

  y -= 85;

  // Lessons Table Title
  page.drawText('LESSON HISTORY BREAKDOWN', {
    x: 40,
    y: y,
    size: 12,
    font: fontBold,
    color: primaryColor,
  });

  y -= 20;

  // Table Header
  page.drawRectangle({
    x: 40,
    y: y - 22,
    width: width - 80,
    height: 24,
    color: primaryColor,
  });

  page.drawText('#', { x: 50, y: y - 14, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText('Lesson Title', { x: 80, y: y - 14, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText('Date', { x: 280, y: y - 14, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText('Time', { x: 380, y: y - 14, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText('Amount', { x: 480, y: y - 14, size: 9, font: fontBold, color: rgb(1, 1, 1) });

  y -= 25;

  // Table Rows
  if (lessons.length === 0) {
    page.drawText('No lessons recorded for this student yet.', {
      x: 50,
      y: y - 15,
      size: 10,
      font: fontRegular,
      color: mutedTextColor,
    });
    y -= 30;
  } else {
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      if (y < 80) {
        // Add new page if space runs out
        page = pdfDoc.addPage([595.28, 841.89]);
        y = height - 50;
      }

      const isEven = i % 2 === 0;
      if (isEven) {
        page.drawRectangle({
          x: 40,
          y: y - 20,
          width: width - 80,
          height: 22,
          color: rgb(0.97, 0.98, 0.99),
        });
      }

      // Bottom border for each row
      page.drawLine({
        start: { x: 40, y: y - 21 },
        end: { x: width - 40, y: y - 21 },
        thickness: 0.5,
        color: borderLineColor,
      });

      const dateStr = lesson.lessonDate
        ? new Date(lesson.lessonDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'N/A';

      // Trim title if too long
      let title = lesson.lessonTitle || 'Lesson';
      if (title.length > 28) {
        title = title.substring(0, 25) + '...';
      }

      page.drawText(`${i + 1}`, { x: 50, y: y - 14, size: 9, font: fontRegular, color: mutedTextColor });
      page.drawText(title, { x: 80, y: y - 14, size: 9, font: fontRegular, color: darkTextColor });
      page.drawText(dateStr, { x: 280, y: y - 14, size: 9, font: fontRegular, color: darkTextColor });
      page.drawText(lesson.lessonTime || '-', { x: 380, y: y - 14, size: 9, font: fontRegular, color: darkTextColor });
      page.drawText(`${currencySymbol}${Number(lesson.amount || 0).toFixed(2)}`, {
        x: 480,
        y: y - 14,
        size: 9,
        font: fontBold,
        color: successColor,
      });

      y -= 22;
    }
  }

  // Footer on current page
  page.drawLine({
    start: { x: 40, y: 50 },
    end: { x: width - 40, y: 50 },
    thickness: 0.8,
    color: borderLineColor,
  });

  page.drawText('Teacher Assistant Management System | Confidential Student Statement', {
    x: 40,
    y: 35,
    size: 8,
    font: fontRegular,
    color: mutedTextColor,
  });

  page.drawText(`Contact: ${teacher.email || ''}`, {
    x: width - 200,
    y: 35,
    size: 8,
    font: fontRegular,
    color: mutedTextColor,
  });

  return await pdfDoc.save();
};

module.exports = {
  generateStudentReportPDF,
};
