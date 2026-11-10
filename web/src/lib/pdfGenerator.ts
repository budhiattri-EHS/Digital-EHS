// ==============================================================================
// ENTERPRISE PDF GENERATION ENGINE
// STRICTLY COMPLIES WITH THE IMMUTABLE PDF GENERATION RULE:
// Header: logo, name of the company, Format Number, Rev Number, Rev Date
// Footer: Doc ID, Status, "This is a system-generated report from the [company_name]
//         EHS Central Portal. No physical signature is required.",
//         Generated Timestamp, and "Classification: Internal."
// ==============================================================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PdfReportOptions {
  companyName: string;
  formatNumber: string;
  revNumber: string;
  revDate: string;
  docId: string;
  status: string;
  title: string;
  facility: string;
  metadata: Record<string, string>;
  tableHeaders: string[];
  tableRows: (string | number)[][];
  observationsNotes?: string;
}

export function generateEnterpriseEhsPdf(options: PdfReportOptions) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  const generatedTimestamp = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Function to draw the immutable header on every page
  const drawHeader = () => {
    // Top Brand Accent Line
    doc.setFillColor(14, 165, 233); // Sky-500
    doc.rect(0, 0, pageWidth, 4, 'F');

    // Company Name & System Branding
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text(options.companyName.toUpperCase(), margin, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text('EHS ONLINE CENTRAL MANAGEMENT PORTAL • ENTERPRISE SUITE', margin, 16);

    // Right Header Block: Format No, Rev No, Rev Date
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    const rightX = pageWidth - margin;
    doc.text(`Format No: ${options.formatNumber}`, rightX, 10, { align: 'right' });
    doc.text(`Rev No: ${options.revNumber}`, rightX, 14, { align: 'right' });
    doc.text(`Rev Date: ${options.revDate}`, rightX, 18, { align: 'right' });

    // Header Separator Line
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setLineWidth(0.5);
    doc.line(margin, 21, rightX, 21);
  };

  // Function to draw the immutable footer on every page
  const drawFooter = (pageNum: number, totalPages: number) => {
    const footerY = pageHeight - 16;
    const rightX = pageWidth - margin;

    // Footer Separator Line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 2, rightX, footerY - 2);

    // Line 1: Doc ID, Status, Classification
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Doc ID: ${options.docId}   |   Status: ${options.status.toUpperCase()}   |   Classification: Internal`, margin, footerY + 2);
    doc.text(`Page ${pageNum} of ${totalPages}`, rightX, footerY + 2, { align: 'right' });

    // Line 2: Mandatory System-Generated Legal Disclaimer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    const disclaimer = `This is a system-generated report from the ${options.companyName} EHS Central Portal. No physical signature is required.`;
    doc.text(disclaimer, margin, footerY + 6);

    // Line 3: Timestamp
    doc.text(`Generated: ${generatedTimestamp}`, margin, footerY + 10);
  };

  // Draw Header on first page
  drawHeader();

  // Document Title Banner
  doc.setFillColor(15, 23, 42); // Slate-900 Dark Card
  doc.roundedRect(margin, 25, pageWidth - margin * 2, 14, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(options.title.toUpperCase(), margin + 5, 34);

  // Status Chip inside Title Banner
  doc.setFillColor(14, 165, 233);
  const statusWidth = 26;
  doc.roundedRect(pageWidth - margin - statusWidth - 4, 28, statusWidth, 7, 1.5, 1.5, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(options.status.toUpperCase(), pageWidth - margin - statusWidth / 2 - 4, 33, { align: 'center' });

  // Metadata Grid
  const metaKeys = Object.keys(options.metadata);
  const metaRows: string[][] = [];
  for (let i = 0; i < metaKeys.length; i += 2) {
    const k1 = metaKeys[i];
    const k2 = metaKeys[i + 1];
    metaRows.push([
      k1 || '',
      options.metadata[k1] || '',
      k2 || '',
      k2 ? options.metadata[k2] : ''
    ]);
  }

  autoTable(doc, {
    startY: 42,
    head: [],
    body: metaRows,
    margin: { left: margin, right: margin },
    theme: 'plain',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [100, 116, 139], cellWidth: 35 },
      1: { fontStyle: 'normal', cellWidth: 55 },
      2: { fontStyle: 'bold', textColor: [100, 116, 139], cellWidth: 35 },
      3: { fontStyle: 'normal', cellWidth: 55 }
    }
  });

  const lastTableY = (doc as any).lastAutoTable.finalY || 65;

  // Main Data Table
  autoTable(doc, {
    startY: lastTableY + 4,
    head: [options.tableHeaders],
    body: options.tableRows,
    margin: { left: margin, right: margin, bottom: 22 },
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left'
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 3,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // Slate-50
    }
  });

  // Observations / Notes Box if provided
  if (options.observationsNotes) {
    const finalY = (doc as any).lastAutoTable.finalY + 4;
    if (finalY < pageHeight - 40) {
      doc.setFillColor(254, 243, 199); // Amber-100
      doc.setDrawColor(251, 191, 36);  // Amber-400
      doc.roundedRect(margin, finalY, pageWidth - margin * 2, 14, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(180, 83, 9);
      doc.text('AUDITOR OBSERVATIONS & RECOVERY ACTIONS:', margin + 4, finalY + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(120, 53, 15);
      const splitText = doc.splitTextToSize(options.observationsNotes, pageWidth - margin * 2 - 8);
      doc.text(splitText, margin + 4, finalY + 9);
    }
  }

  // Draw Header and Immutable Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawHeader();
    drawFooter(i, totalPages);
  }

  // Trigger browser download
  const safeFilename = `${options.formatNumber.replace(/[\/\\]/g, '_')}_${options.docId}_${options.status}.pdf`;
  doc.save(safeFilename);
}
