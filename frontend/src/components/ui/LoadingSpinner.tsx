import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-6 ${className}`}>
      <div
        className={`${sizeMap[size]} border-slate-800 border-t-brand-400 rounded-full animate-spin`}
        role="status"
        aria-label="loading"
      />
      {label && <p className="text-xs font-semibold text-slate-400 animate-pulse">{label}</p>}
    </div>
  );
};
