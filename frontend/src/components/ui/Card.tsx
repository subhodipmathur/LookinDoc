import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={`bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-800/80 shadow-xl shadow-black/20 text-slate-100 ${
        hoverEffect ? 'hover:border-slate-700 hover:bg-slate-900/90 transition-all duration-200 hover:shadow-brand-500/5 hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
