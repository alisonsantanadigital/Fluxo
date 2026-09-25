export function formatBRL(value: number, includeDecimals = false): string {
  if (isNaN(value)) return 'R$ 0';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(value);
}

export function formatCompactBRL(value: number): string {
  if (isNaN(value)) return 'R$ 0';
  if (Math.abs(value) >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1).replace('.', ',')}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(1).replace('.', ',')}k`;
  }
  return formatBRL(value);
}

export function formatPercent(value: number, decimals = 1): string {
  if (isNaN(value) || !isFinite(value)) return '0%';
  return `${value.toFixed(decimals).replace('.', ',')}%`;
}

export function parseBRLInput(text: string): number {
  if (!text) return 0;
  // Strip non-digits except comma and period
  const cleaned = text.replace(/[^0-9,.-]/g, '');
  // If Brazilian format like 1.500,50
  if (cleaned.includes(',') && cleaned.includes('.')) {
    const normalized = cleaned.replace(/\./g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
  }
  if (cleaned.includes(',')) {
    return parseFloat(cleaned.replace(',', '.')) || 0;
  }
  return parseFloat(cleaned) || 0;
}
