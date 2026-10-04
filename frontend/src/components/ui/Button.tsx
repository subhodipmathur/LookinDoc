import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer';

  const variantStyles = {
    primary: 'bg-brand-500 text-white hover:bg-brand-400 focus:ring-brand-400 shadow-md shadow-brand-500/25 border border-brand-400/30',
    glow: 'bg-gradient-to-r from-brand-500 to-indigo-600 text-white hover:from-brand-400 hover:to-indigo-500 focus:ring-brand-400 shadow-lg shadow-brand-500/30 border border-brand-300/30',
    secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 hover:text-white border border-slate-700/80 focus:ring-slate-600 shadow-sm',
    outline: 'border border-slate-700/90 text-slate-200 bg-slate-900/60 hover:bg-slate-800/80 hover:text-white hover:border-slate-600 focus:ring-brand-500 shadow-sm backdrop-blur-sm',
    danger: 'bg-rose-600/90 text-white hover:bg-rose-500 border border-rose-500/30 focus:ring-rose-500 shadow-md shadow-rose-600/20',
    ghost: 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 focus:ring-slate-700',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
