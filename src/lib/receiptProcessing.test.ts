import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('heic2any', () => ({
  default: vi.fn(),
}));

import heic2any from 'heic2any';
import { processReceiptFile, ReceiptUnreadableError } from './receiptProcessing';

// jsdom doesn't implement createImageBitmap/OffscreenCanvas at all, so
// the image pipeline is exercised against mocks that model the real
// contract (dimensions in, blob out) rather than real decoding — this is
// the "flag if jsdom can't run it" case noted in Dev Plan Section 6.
// Playwright/manual verification covers real decoding end to end.

function makeFakeBitmap(width: number, height: number) {
  return { width, height, close: vi.fn() };
}

function stubCanvasPipeline(blobSizesBySequentialCall: number[]) {
  let callIndex = 0;
  const convertToBlob = vi.fn(async () => {
    const size = blobSizesBySequentialCall[Math.min(callIndex, blobSizesBySequentialCall.length - 1)];
    callIndex++;
    return new Blob([new Uint8Array(size)], { type: 'image/jpeg' });
  });
  const ctx = { drawImage: vi.fn() };
  class FakeOffscreenCanvas {
    width: number;
    height: number;
    constructor(w: number, h: number) {
      this.width = w;
      this.height = h;
    }
    getContext() {
      return ctx;
    }
    convertToBlob = convertToBlob;
  }
  vi.stubGlobal('OffscreenCanvas', FakeOffscreenCanvas);
  return { convertToBlob, ctx };
}

describe('processReceiptFile', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('passes a PDF through unprocessed', async () => {
    const file = new File([new Uint8Array(1024)], 'receipt.pdf', { type: 'application/pdf' });
    const result = await processReceiptFile(file);
    expect(result.mimeType).toBe('application/pdf');
    expect(result.sizeBytes).toBe(1024);
    expect(result.blob).toBe(file);
  });

  it('rejects a PDF over the size limit', async () => {
    const file = new File([new Uint8Array(11 * 1024 * 1024)], 'huge.pdf', { type: 'application/pdf' });
    await expect(processReceiptFile(file)).rejects.toThrow(/too large/i);
  });

  it('rejects an unsupported file type before touching the image pipeline', async () => {
    const file = new File([new Uint8Array(10)], 'notes.txt', { type: 'text/plain' });
    await expect(processReceiptFile(file)).rejects.toBeInstanceOf(ReceiptUnreadableError);
  });

  it('resizes an oversized image and stops reducing quality at the floor', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn(async () => makeFakeBitmap(4000, 3000)));
    // Every quality attempt still comes back over the 500KB target, so
    // the loop should run until quality hits the floor and then stop --
    // 0.8, 0.7, 0.6, 0.5 = 4 attempts.
    const { convertToBlob } = stubCanvasPipeline([600_000, 600_000, 600_000, 600_000]);

    const file = new File([new Uint8Array(10)], 'receipt.jpg', { type: 'image/jpeg' });
    const result = await processReceiptFile(file);

    expect(convertToBlob).toHaveBeenCalledTimes(4);
    expect(result.mimeType).toBe('image/jpeg');
    expect(result.sizeBytes).toBe(600_000); // accepted at the floor, not degraded further
  });

  it('stops re-encoding as soon as the target size is met', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn(async () => makeFakeBitmap(3000, 2000)));
    const { convertToBlob } = stubCanvasPipeline([600_000, 400_000]);

    const file = new File([new Uint8Array(10)], 'receipt.png', { type: 'image/png' });
    const result = await processReceiptFile(file);

    expect(convertToBlob).toHaveBeenCalledTimes(2);
    expect(result.sizeBytes).toBe(400_000);
  });

  it('rejects when the processed output cannot be re-decoded', async () => {
    let call = 0;
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(async () => {
        call++;
        if (call === 1) return makeFakeBitmap(1000, 1000);
        throw new Error('decode failed');
      })
    );
    stubCanvasPipeline([100_000]);

    const file = new File([new Uint8Array(10)], 'receipt.jpg', { type: 'image/jpeg' });
    await expect(processReceiptFile(file)).rejects.toBeInstanceOf(ReceiptUnreadableError);
  });

  it('converts HEIC to JPEG before processing', async () => {
    const jpegBlob = new Blob([new Uint8Array(10)], { type: 'image/jpeg' });
    vi.mocked(heic2any).mockResolvedValue(jpegBlob);
    vi.stubGlobal('createImageBitmap', vi.fn(async () => makeFakeBitmap(1000, 1000)));
    stubCanvasPipeline([100_000]);

    const file = new File([new Uint8Array(10)], 'receipt.heic', { type: 'image/heic' });
    const result = await processReceiptFile(file);

    expect(heic2any).toHaveBeenCalledWith({ blob: file, toType: 'image/jpeg', quality: 0.9 });
    expect(result.mimeType).toBe('image/jpeg');
  });

  it('rejects when HEIC conversion fails', async () => {
    vi.mocked(heic2any).mockRejectedValue(new Error('libheif failed'));

    const file = new File([new Uint8Array(10)], 'receipt.heic', { type: 'image/heic' });
    await expect(processReceiptFile(file)).rejects.toBeInstanceOf(ReceiptUnreadableError);
  });
});
