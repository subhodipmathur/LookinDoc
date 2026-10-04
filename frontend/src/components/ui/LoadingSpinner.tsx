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
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-6 ${className}`}>
      <div
        className={`${sizeMap[size]} border-brand-200 border-t-brand-600 rounded-full animate-spin`}
        role="status"
        aria-label="loading"
      />
      {label && <p className="text-sm font-medium text-slate-600 animate-pulse">{label}</p>}
    </div>
  );
};
