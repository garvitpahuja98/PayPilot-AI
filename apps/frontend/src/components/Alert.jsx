'use client';

/**
 * @file Alert.jsx
 * @description Contextual alert banner component.
 */

import React from 'react';

export default function Alert({ type = 'info', title, children }) {
  return (
    <div className={`alert alert-${type}`} role="alert">
      <div>
        {title && <strong>{title}: </strong>}
        {children}
      </div>
    </div>
  );
}
