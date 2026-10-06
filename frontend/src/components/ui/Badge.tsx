import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'success' | 'warning' | 'error' | 'neutral' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'brand',
  size = 'md',
  className = '',
  icon,
}) => {
  const variantStyles = {
    brand: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25',
    success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
    warning: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
    error: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
    neutral: 'bg-zinc-800/90 text-zinc-300 border-zinc-700/80',
    purple: 'bg-purple-500/10 text-purple-300 border-purple-500/25',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 font-medium',
    md: 'text-xs px-3 py-1 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-sm ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
};
