import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div className={`p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-200 backdrop-blur-md ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-rose-200">{title}</h4>
          <p className="text-xs text-rose-300/80 mt-1 leading-relaxed">{message}</p>
          {onRetry && (
            <div className="mt-3">
              <Button size="sm" variant="outline" className="border-rose-700/60 text-rose-200 hover:bg-rose-900/40" onClick={onRetry}>
                Try again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
