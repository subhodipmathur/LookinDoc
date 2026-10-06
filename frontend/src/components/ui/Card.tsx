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
      className={`bg-[#111827]/90 backdrop-blur-xl rounded-2xl border border-slate-800/90 shadow-xl shadow-black/25 text-[#e2e8f0] ${
        hoverEffect ? 'hover:border-slate-700 hover:bg-[#162032] transition-all duration-200 hover:shadow-brand-500/5 hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
