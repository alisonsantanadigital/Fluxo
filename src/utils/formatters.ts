export function formatBRL(value: number, includeDecimals = false): string {
  if (isNaN(value)) return 'R$ 0';
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(absValue);

  if (isNegative) {
    return `- ${formatted}`;
  }
  return formatted;
}

export function formatPrivacyBRL(value: number, isPrivacyMode: boolean, includeDecimals = false): string {
  if (isPrivacyMode) {
    return 'R$ ••••••';
  }
  return formatBRL(value, includeDecimals);
}

export function maskName(name: string, hideNames: boolean): string {
  if (!hideNames || !name) return name;
  if (name.length <= 3) return '•••';
  return `${name[0]}••••${name[name.length - 1]}`;
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
