
import React from 'react';

export const Card = ({ children, className = '' }: { children?: React.ReactNode, className?: string }) => (
  <div className={`bg-surface border border-border rounded shadow-[0_4px_0_rgba(0,0,0,0.3)] ${className}`}>
    {children}
  </div>
);

export const Button = ({ onClick, children, variant = 'primary', className = '', fullWidth = false, disabled = false }: any) => {
  const baseStyle = "px-4 py-3 rounded font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed font-retro uppercase tracking-wide relative top-0 hover:-top-0.5 active:top-0 shadow-[0_4px_0_rgba(0,0,0,0.5)] active:shadow-none";
  
  const variants = {
    primary: "bg-primary hover:bg-primaryHover text-black border-2 border-primary focus:ring-primary",
    success: "bg-success hover:bg-green-400 text-black border-2 border-success focus:ring-success",
    danger: "bg-danger hover:bg-red-500 text-white border-2 border-danger focus:ring-danger",
    outline: "bg-transparent border-2 border-gray-600 hover:border-white text-text hover:bg-white/5",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export const Badge = ({ children, type = 'neutral' }: { children?: React.ReactNode, type?: 'success' | 'danger' | 'neutral' }) => {
  const colors = {
    success: 'bg-success/20 text-success border-success',
    danger: 'bg-danger/20 text-danger border-danger',
    neutral: 'bg-gray-800 text-gray-400 border-gray-600'
  };
  
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-retro border ${colors[type]}`}>
      {children}
    </span>
  );
};

export const TabButton = ({ active, onClick, children }: any) => (
  <button
    onClick={onClick}
    className={`flex-1 py-2 text-xs font-bold font-retro border-b-4 transition-colors ${
      active 
        ? 'border-primary text-primary bg-primary/5' 
        : 'border-transparent text-textSecondary hover:text-white'
    }`}
  >
    {children}
  </button>
);

export const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border-2 border-primary rounded shadow-[0_0_30px_rgba(0,240,255,0.2)] w-full max-w-md overflow-hidden relative flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-border bg-black/40">
          <h3 className="font-bold text-lg text-primary font-retro tracking-widest">{title}</h3>
          <button 
            onClick={onClose} 
            className="h-8 w-8 flex items-center justify-center rounded hover:bg-white/10 text-white transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
            {children}
        </div>
      </div>
    </div>
  );
};

export const ProgressBar = ({ current, max, label, color = 'bg-primary' }: { current: number, max: number, label?: string, color?: string }) => {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));
  return (
    <div className="w-full">
      {label && <div className="text-[10px] font-retro text-textSecondary mb-1 flex justify-between">
        <span>{label}</span>
        <span>{Math.floor(current)} / {max}</span>
      </div>}
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
        <div 
          className={`h-full ${color} transition-all duration-500 ease-out`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'danger';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  const colors = {
    info: 'border-primary bg-surface text-primary shadow-primary/20',
    success: 'border-success bg-surface text-success shadow-success/20',
    danger: 'border-danger bg-surface text-danger shadow-danger/20'
  };

  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`pointer-events-auto w-72 mb-2 p-3 border-l-4 rounded shadow-lg animate-slide-in font-mono text-sm flex justify-between items-start ${colors[type || 'info']} bg-opacity-95 backdrop-blur-sm`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">×</button>
    </div>
  );
};

export const RiskMeter = ({ riskLevel }: { riskLevel: number }) => { 
  let color = 'bg-success';
  let text = 'SAFE';
  let textColor = 'text-success';
  
  if (riskLevel > 33) { color = 'bg-orange-500'; text = 'CAUTION'; textColor = 'text-orange-500'; }
  if (riskLevel > 66) { color = 'bg-danger'; text = 'DEGEN'; textColor = 'text-danger'; }

  return (
    <div className="flex flex-col w-24">
      <div className="flex justify-between text-[8px] font-retro mb-1 text-gray-400">
        <span>RISK</span>
        <span className={`${textColor} font-bold animate-pulse`}>{text}</span>
      </div>
      <div className="flex gap-0.5 h-1.5">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i} 
            className={`flex-1 rounded-sm transition-colors duration-300 ${i * 10 < riskLevel ? color : 'bg-gray-800'}`}
          />
        ))}
      </div>
    </div>
  );
};

export const NewsTicker = ({ headline, type }: { headline: string, type: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' }) => {
  if (!headline) return null;
  
  const colors = {
    POSITIVE: 'text-success',
    NEGATIVE: 'text-danger',
    NEUTRAL: 'text-textSecondary'
  };

  return (
    <div className="absolute bottom-2 left-2 right-2 bg-black/80 border border-gray-700 p-1 rounded overflow-hidden flex items-center z-10 pointer-events-none">
      <div className="bg-primary/20 text-primary px-2 py-0.5 text-[10px] font-bold font-retro mr-2 rounded">
        BREAKING
      </div>
      <div className="overflow-hidden relative w-full h-5">
         <div className={`absolute whitespace-nowrap animate-[slideIn_10s_linear_infinite] font-mono text-sm ${colors[type]}`}>
            {headline}
         </div>
      </div>
    </div>
  );
};
