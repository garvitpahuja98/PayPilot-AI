'use client';

/**
 * @file Button.jsx
 * @description Standardized button component with variants and loading state.
 */

import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = ''
}) {
  const variantClass = `btn-${variant}`;
  const sizeClass = size === 'sm' ? 'btn-sm' : '';

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}
