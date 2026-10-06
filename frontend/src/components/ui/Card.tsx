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
      className={`bg-[#12131a] rounded-2xl border border-zinc-800/90 shadow-xl shadow-black/25 text-zinc-200 ${
        hoverEffect ? 'hover:border-zinc-700 hover:bg-[#151720] transition-all duration-200 hover:shadow-indigo-500/5 hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
