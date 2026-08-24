// Client-side receipt processing pipeline — FR-CCR-RECEIPT-001.
// docs/Card-Recon/Dev_Plan.md Section 3. Pure logic, no Supabase calls,
// so it's independently unit-testable.

export interface ProcessedReceipt {
  blob: Blob;
  mimeType: string;
  sizeBytes: number;
}

export class ReceiptUnreadableError extends Error {
  constructor(message = "Couldn't read this file — try another photo.") {
    super(message);
    this.name = 'ReceiptUnreadableError';
  }
}

const MAX_LONGEST_EDGE = 2000;
const TARGET_SIZE_BYTES = 500 * 1024;
const QUALITY_START = 0.8;
const QUALITY_FLOOR = 0.5;
const QUALITY_STEP = 0.1;
// Not specified by FR-CCR-RECEIPT-001 -- a reasonable default pending PM
// confirmation, same status as the AUTO_FUZZY match window in Dev Plan
// Section 3.
const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;

const HEIC_TYPES = ['image/heic', 'image/heif'];
const RASTER_IMAGE_TYPES = ['image/jpeg', 'image/png', ...HEIC_TYPES];

export async function processReceiptFile(file: File): Promise<ProcessedReceipt> {
  if (file.type === 'application/pdf') {
    if (file.size > MAX_PDF_SIZE_BYTES) {
      throw new Error(`PDF is too large — max ${Math.round(MAX_PDF_SIZE_BYTES / 1024 / 1024)}MB`);
    }
    return { blob: file, mimeType: 'application/pdf', sizeBytes: file.size };
  }

  if (!RASTER_IMAGE_TYPES.includes(file.type)) {
    throw new ReceiptUnreadableError('Unsupported file type — attach a JPEG, PNG, HEIC photo, or a PDF.');
  }

  // Browsers other than Safari on Apple hardware can't decode HEIC via
  // Canvas/createImageBitmap at all, so it's converted to JPEG first.
  // heic2any is ~1.4MB (bundles libheif WASM) -- dynamically imported so
  // it's a separate chunk the PWA only fetches when a HEIC file is
  // actually selected, not part of the main bundle every user downloads.
  // A static import pushed the main chunk past vite-plugin-pwa's default
  // precache size limit, which would have broken offline capability for
  // the existing stock-counting PWA, not just this epic.
  let sourceBlob: Blob = file;
  if (HEIC_TYPES.includes(file.type)) {
    try {
      const { default: heic2any } = await import('heic2any');
      const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
      sourceBlob = Array.isArray(converted) ? converted[0] : converted;
    } catch {
      throw new ReceiptUnreadableError();
    }
  }

  // imageOrientation: 'from-image' applies the EXIF orientation tag
  // automatically -- no separate manual EXIF-orientation read needed.
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(sourceBlob, { imageOrientation: 'from-image' });
  } catch {
    throw new ReceiptUnreadableError();
  }

  const scale = Math.min(1, MAX_LONGEST_EDGE / Math.max(bitmap.width, bitmap.height));
  const targetWidth = Math.round(bitmap.width * scale);
  const targetHeight = Math.round(bitmap.height * scale);

  const canvas = new OffscreenCanvas(targetWidth, targetHeight);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new ReceiptUnreadableError();
  }
  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
  bitmap.close();

  // The canvas re-encode below is what strips EXIF (including location) --
  // canvas export never carries source metadata, so no separate
  // metadata-stripping step is needed.
  let quality = QUALITY_START;
  let outputBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality });
  while (outputBlob.size > TARGET_SIZE_BYTES && quality > QUALITY_FLOOR) {
    // Rounded to avoid floating-point drift (0.8 - 0.1 - 0.1 - 0.1 !==
    // 0.5 in JS) causing an extra iteration past the intended floor.
    quality = Math.max(QUALITY_FLOOR, Math.round((quality - QUALITY_STEP) * 100) / 100);
    outputBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality });
  }
  // If still over target at the quality floor, the larger file is
  // accepted rather than degraded further -- "where this can be achieved
  // without making the receipt unreadable" (FR-CCR-RECEIPT-001).

  // Reject if the processed output can't be reliably re-decoded.
  try {
    const verifyBitmap = await createImageBitmap(outputBlob);
    verifyBitmap.close();
  } catch {
    throw new ReceiptUnreadableError();
  }

  return { blob: outputBlob, mimeType: 'image/jpeg', sizeBytes: outputBlob.size };
}
