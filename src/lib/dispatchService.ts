import { jsPDF } from 'jspdf';
import { PDFDocument } from 'pdf-lib';
import { supabase } from './supabase';

export interface InvoiceHeader {
  doc_no: string;
  tx_date: string;
  account_no: string;
  account_name: string;
  amount_excl: number;
  tax_amount: number;
}

export interface InvoiceItem {
  stock_no: string;
  description: string;
  qty: number;
  retail_price: number;
}

export interface DispatchLog {
  id: string;
  doc_no: string;
  sent_at: string;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'DELIVERED';
  error_details?: string;
  signed_doc_url?: string;
  merged_doc_url?: string;
}

/**
 * Generates a standard LPG Invoice PDF using jsPDF
 */
export async function generateInvoicePDF(header: InvoiceHeader, items: InvoiceItem[]): Promise<Uint8Array> {
  const doc = new jsPDF();
  const margin = 20;
  let y = 20;

  // Header
  doc.setFontSize(22);
  doc.text('TAX INVOICE', margin, y);
  y += 15;

  doc.setFontSize(10);
  doc.text(`Document No: ${header.doc_no}`, margin, y);
  doc.text(`Date: ${header.tx_date}`, 140, y);
  y += 10;

  doc.text(`Account: ${header.account_no}`, margin, y);
  doc.text(`Customer: ${header.account_name}`, margin, y + 5);
  y += 20;

  // Table Headers
  doc.setFont('helvetica', 'bold');
  doc.text('Description', margin, y);
  doc.text('Qty', 120, y);
  doc.text('Price', 140, y);
  doc.text('Total', 170, y);
  y += 5;
  doc.line(margin, y, 190, y);
  y += 10;

  // Items
  doc.setFont('helvetica', 'normal');
  items.forEach((item) => {
    const itemTotal = item.qty * item.retail_price;
    doc.text(item.description, margin, y, { maxWidth: 90 });
    doc.text(item.qty.toString(), 120, y);
    doc.text(item.retail_price.toFixed(2), 140, y);
    doc.text(itemTotal.toFixed(2), 170, y);
    y += 10;
    
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  // Totals
  y += 10;
  if (y > 270) {
    doc.addPage();
    y = 20;
  }
  doc.line(130, y, 190, y);
  y += 10;
  doc.text('Subtotal (Excl):', 130, y);
  doc.text(header.amount_excl.toFixed(2), 170, y);
  y += 7;
  doc.text('VAT:', 130, y);
  doc.text(header.tax_amount.toFixed(2), 170, y);
  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Total (Incl):', 130, y);
  doc.text((header.amount_excl + header.tax_amount).toFixed(2), 170, y);

  return new Uint8Array(doc.output('arraybuffer'));
}

/**
 * Merges the Invoice PDF with a POD (Image or PDF)
 */
export async function mergePOD(invoicePdfBytes: Uint8Array, podFile: File): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();
  
  // Load and add Invoice pages
  const invoicePdf = await PDFDocument.load(invoicePdfBytes);
  const copiedPages = await mergedPdf.copyPages(invoicePdf, invoicePdf.getPageIndices());
  copiedPages.forEach((page) => mergedPdf.addPage(page));

  // Add POD
  if (podFile.type === 'application/pdf') {
    const podPdfBytes = await podFile.arrayBuffer();
    const podPdf = await PDFDocument.load(podPdfBytes);
    const podPages = await mergedPdf.copyPages(podPdf, podPdf.getPageIndices());
    podPages.forEach((page) => mergedPdf.addPage(page));
  } else {
    // Image POD (wrap in page)
    const imageBytes = await podFile.arrayBuffer();
    let image;
    if (podFile.type === 'image/jpeg' || podFile.type === 'image/jpg') {
      image = await mergedPdf.embedJpg(imageBytes);
    } else if (podFile.type === 'image/png') {
      image = await mergedPdf.embedPng(imageBytes);
    }

    if (image) {
      const page = mergedPdf.addPage([595.28, 841.89]); // A4
      const { width, height } = image.scaleToFit(555, 801);
      page.drawImage(image, {
        x: 20,
        y: 841.89 - height - 20,
        width,
        height,
      });
    }
  }

  return await mergedPdf.save();
}

/**
 * Triggers the Supabase Edge Function to dispatch via Whapi.Cloud
 */
export async function triggerWhatsAppDispatch(
  logId: string,
  docNo: string,
  whatsappNumber: string,
  mergedDocUrl: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: 'Supabase not initialized' };

  try {
    const { data, error } = await supabase.functions.invoke('whatsapp-dispatch', {
      body: { logId, docNo, whatsappNumber, mergedDocUrl }
    });

    if (error) throw error;
    return { success: true, ...data };
  } catch (err: any) {
    console.error('[Dispatch] Error triggering WhatsApp:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}
