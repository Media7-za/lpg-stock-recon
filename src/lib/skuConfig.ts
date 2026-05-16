// SKU Mapping Configuration
export const SKU_CONFIG = {
  sizes: ['9kg', '14kg', '19kg', 'SV', 'DV'] as const,

  depositSkus: {
    '9kg': '9.1',
    '14kg': '14.1',
    '19kg': '19.1',
    'SV': 'S.1',
    'DV': 'D.1'
  } as const,

  contentSkuToSize: {
    '9.3': '9kg', '9.4': '9kg', '901': '9kg',
    '14.3': '14kg', '14.4': '14kg', '1401': '14kg',
    '19.3': '19kg', '19.4': '19kg', '1901': '19kg',
    'S.3': 'SV', 'S.4': 'SV', 'S01': 'SV', 's01': 'SV',
    'D.3': 'DV', 'D.4': 'DV', 'D01': 'DV'
  } as Record<string, string>,

  contentSkuToBrand: {
    '9.3': 'Easigas', '9.4': 'Oryx', '901': 'Multibrand',
    '14.3': 'Easigas', '14.4': 'Oryx', '1401': 'Multibrand',
    '19.3': 'Easigas', '19.4': 'Oryx', '1901': 'Multibrand',
    'S.3': 'Easigas', 'S.4': 'Oryx', 'S01': 'Multibrand', 's01': 'Multibrand',
    'D.3': 'Easigas', 'D.4': 'Oryx', 'D01': 'Multibrand'
  } as Record<string, 'Oryx' | 'Multibrand' | 'Easigas'>,

  // Get all content SKUs for a given size
  getContentSkusForSize: (size: string): string[] => {
    return Object.entries(SKU_CONFIG.contentSkuToSize)
      .filter(([, s]) => s === size)
      .map(([sku]) => sku);
  },

  // Get size from content SKU
  getSizeFromSku: (sku: string): string | undefined => {
    return SKU_CONFIG.contentSkuToSize[sku];
  },

  // Get brand from content SKU
  getBrandFromSku: (sku: string): 'Oryx' | 'Multibrand' | 'Easigas' | undefined => {
    return SKU_CONFIG.contentSkuToBrand[sku];
  },

  // Get deposit SKU for a size
  getDepositSku: (size: string): string | undefined => {
    return SKU_CONFIG.depositSkus[size as keyof typeof SKU_CONFIG.depositSkus];
  }
};

