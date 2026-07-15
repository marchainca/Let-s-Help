'use client';

import { useEffect, useState } from 'react';
import { Typography } from '@mui/material';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  variant?: 'h4' | 'h5' | 'h6';
  color?: string;
}

export default function AnimatedCounter({
  value,
  duration = 800,
  suffix = '',
  variant = 'h4',
  color,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <Typography variant={variant} fontWeight="bold" sx={{ color }}>
      {displayValue.toLocaleString()}
      {suffix}
    </Typography>
  );
}
