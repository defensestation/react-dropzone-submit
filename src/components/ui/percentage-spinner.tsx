import React, { useEffect, useRef } from 'react';

// Define size variants type
type SizeVariant = 'xs' | 'sm' | 'md' | 'lg';

// Define size variants interface
interface SizeVariantStyles {
  outer: string;
  inner: string;
  text: string;
}

// Define component props interface
interface PercentageSpinnerProps {
  percentage?: number;
  size?: SizeVariant;
}

// Size variants mapping with type safety
const sizeVariants: Record<SizeVariant, SizeVariantStyles> = {
  xs: {
    outer: 'h-9 w-9',
    inner: 'h-6 w-6',
    text: 'text-xs'
  },
  sm: {
    outer: 'h-12 w-12',
    inner: 'h-10 w-10',
    text: 'text-sm'
  },
  md: {
    outer: 'h-16 w-16',
    inner: 'h-14 w-14',
    text: 'text-base'
  },
  lg: {
    outer: 'h-24 w-24',
    inner: 'h-20 w-20',
    text: 'text-lg'
  }
};

const PercentageSpinner: React.FC<PercentageSpinnerProps> = ({ 
  percentage = 0, 
  size = "lg" 
}) => {
  // Validate percentage input
  const validPercentage = Math.max(0, Math.min(100, percentage));

  // Calculate the circle properties
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (validPercentage / 100) * circumference;

  // Ref for the animated circle
  const circleRef = useRef<SVGCircleElement>(null);

  // Animate the circle when percentage changes
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.style.transition = 'stroke-dashoffset 0.5s ease-in-out';
      circleRef.current.style.strokeDashoffset = `${strokeDashoffset}`;
    }
  }, [strokeDashoffset]);

  return (
    <div className={`relative ${sizeVariants[size].outer} flex items-center justify-center`}>
      {/* Spinning outer circle */}
      <div className="absolute inset-0">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="text-muted-foreground/20"
            strokeWidth="4"
            stroke="currentColor"
            fill="none"
            r={radius}
            cx="50"
            cy="50"
          />
          <circle
            ref={circleRef}
            className="text-primary"
            strokeWidth="4"
            strokeLinecap="round"
            stroke="currentColor"
            fill="none"
            r={radius}
            cx="50"
            cy="50"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: circumference, // Initial value
              transformOrigin: '50% 50%',
              transform: 'rotate(-90deg)',
            }}
          />
        </svg>
      </div>
      
      {/* Percentage text */}
      <div className={`${sizeVariants[size].text} font-semibold`}>
        {Math.round(validPercentage)}%
      </div>
    </div>
  );
};

export default PercentageSpinner;