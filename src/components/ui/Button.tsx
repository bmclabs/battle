'use client';

import React, { useState } from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'dark';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  fullWidth?: boolean;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
  fullWidth = false,
  isLoading = false,
}) => {
  // State to track hover/active state
  const [isHovered, setIsHovered] = useState(false);
  
  // CSS Variables
  const colors = {
    primary: '#14F195',
    secondary: '#FF69B4',
    danger: '#dc2626',
    dark: 'rgba(0, 0, 0, 0.8)',
  };
  
  const getBackgroundColor = () => {
    return isHovered ? getHoverBackgroundColor() : colors[variant] || colors.primary;
  };
  
  const getHoverBackgroundColor = () => {
    return variant === 'secondary' ? colors.primary : colors.secondary;
  };
  
  const getTextColor = () => {
    // Always return white text when hovered
    if (isHovered) {
      return '#ffffff';
    }
    // Default text colors for different variants
    return variant === 'danger' || variant === 'dark' ? '#ffffff' : '#000000';
  };
  
  const getBorderColor = () => {
    return variant === 'dark' ? colors.primary : '#000000';
  };
  
  // Base classes
  const baseClasses = `
    font-pixel
    rounded
    uppercase 
    transition-colors
    relative 
    transform 
    outline-none
    ${fullWidth ? 'w-full' : ''}
  `;
  
  // Size specific classes
  const sizeClasses = {
    xs: 'text-xs py-1 px-3',
    sm: 'text-xs py-1.5 px-4',
    md: 'text-sm py-2 px-6',
    lg: 'text-base py-3 px-8',
  };
  
  // Active and disabled state classes
  const stateClasses = (disabled || isLoading) 
    ? 'opacity-50 cursor-not-allowed' 
    : 'cursor-pointer shadow-[2px_2px_0_rgba(0,0,0,0.8)] hover:shadow-[1px_1px_0_rgba(0,0,0,0.8)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]';
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${sizeClasses[size]} ${stateClasses} ${className} border-2`}
      onClick={onClick}
      disabled={disabled || isLoading}
      style={{ 
        backgroundColor: getBackgroundColor(),
        color: getTextColor(),
        borderColor: getBorderColor(),
        textShadow: '1px 1px 0 rgba(0,0,0,0.2)',
        boxShadow: disabled || isLoading ? 'none' : '2px 2px 0 rgba(0,0,0,0.8)',
      }}
      onMouseEnter={() => {
        if (!disabled && !isLoading) {
          setIsHovered(true);
        }
      }}
      onMouseLeave={() => {
        if (!disabled && !isLoading) {
          setIsHovered(false);
        }
      }}
    >
      {isLoading ? 'LOADING...' : children}
    </button>
  );
};

export default Button; 