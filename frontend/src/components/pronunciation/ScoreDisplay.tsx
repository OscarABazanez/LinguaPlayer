import { useEffect, useState } from 'react';

interface Props {
  score: number; // 0-100
}

export default function ScoreDisplay({ score }: Props) {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animate score on mount
  useEffect(() => {
    const duration = 800;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(score * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  // Circle SVG parameters
  const size = 100;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  // Color based on score
  const getColor = () => {
    if (score >= 85) return { stroke: '#22c55e', text: 'text-green-500', label: 'Excellent!' };
    if (score >= 70) return { stroke: '#eab308', text: 'text-yellow-500', label: 'Good!' };
    if (score >= 50) return { stroke: '#f97316', text: 'text-orange-500', label: 'Keep practicing' };
    return { stroke: '#ef4444', text: 'text-red-500', label: 'Try again' };
  };

  const color = getColor();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${color.text}`}>
            {animatedScore}%
          </span>
        </div>
      </div>
      <span className={`text-sm font-medium ${color.text}`}>{color.label}</span>
    </div>
  );
}
