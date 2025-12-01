import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'arcade';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 border-b-4 border-brand-800 active:border-b-0 active:translate-y-1",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white border-b-4 border-gray-900 active:border-b-0 active:translate-y-1",
    danger: "bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/30 border-b-4 border-red-700 active:border-b-0 active:translate-y-1",
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-gray-800",
    arcade: "rounded-none font-retro uppercase tracking-widest border-2 border-arcade-neon bg-black text-arcade-neon hover:bg-arcade-neon hover:text-black shadow-[4px_4px_0px_0px_#39ff14] active:shadow-none active:translate-x-1 active:translate-y-1"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  // Adjust sizes for arcade variant to be slightly larger for pixel fonts
  if (variant === 'arcade') {
     sizes.sm = "px-4 py-2 text-lg";
     sizes.md = "px-8 py-4 text-xl";
     sizes.lg = "px-10 py-6 text-2xl";
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;