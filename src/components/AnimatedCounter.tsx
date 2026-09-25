import React, { useEffect, useState } from 'react';
import { formatBRL } from '../utils/formatters';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatAsCurrency?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 500,
  formatAsCurrency = true,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let startVal = displayValue;
    const endVal = value;
    if (startVal === endVal) return;

    const startTime = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * easeProgress;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setDisplayValue(endVal);
      }
    };

    const frameId = requestAnimationFrame(updateCounter);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  const formatted = formatAsCurrency
    ? formatBRL(Math.round(displayValue))
    : `${prefix}${Math.round(displayValue).toLocaleString('pt-BR')}${suffix}`;

  return <span className={`tabular-nums ${className}`}>{formatted}</span>;
};
