import { supabase } from './supabase';
import { ReceiptExtractedData, ReceiptExtraction, ReceiptReviewDecision } from '../types';

/**
 * Uploads a captured/selected receipt photo to the receipt-images bucket.
 */
export async function uploadReceiptImage(file: File): Promise<string> {
  if (!supabase) throw new Error('Supabase not initialized');

  const timestamp = Date.now();
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `uploads/${timestamp}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from('receipt-images').upload(path, file);
  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage.from('receipt-images').getPublicUrl(path);
  return publicUrl;
}

/**
 * Triggers the receipt-extraction edge function to run the vision model over an
 * uploaded image and store the draft extraction as PENDING_REVIEW.
 */
export async function extractReceipt(
  imageUrl: string,
  documentTypeHint?: string
): Promise<ReceiptExtraction> {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase.functions.invoke('receipt-extraction/extract', {
    body: { imageUrl, documentTypeHint },
  });

  if (error) throw error;
  if (!data?.success) throw new Error(data?.error || 'Extraction failed');
  return data.data as ReceiptExtraction;
}

/**
 * Records a human review decision for a pending extraction. reasonCodes is required
 * for any decision other than ACCEPT.
 */
export async function submitReceiptReview(params: {
  id: string;
  decision: ReceiptReviewDecision;
  reviewedData?: ReceiptExtractedData;
  reasonCodes?: string[];
  notes?: string;
  humanConfidence?: number;
  reviewedBy?: string;
}): Promise<ReceiptExtraction> {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase.functions.invoke('receipt-extraction/review', {
    body: params,
  });

  if (error) throw error;
  if (!data?.success) throw new Error(data?.error || 'Review submission failed');
  return data.data as ReceiptExtraction;
}
