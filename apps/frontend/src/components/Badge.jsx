'use client';

/**
 * @file Badge.jsx
 * @description Status badge component reflecting invoice and payment lifecycle states.
 */

import React from 'react';
import { getInvoiceStatusClass } from '../utils/formatters.js';

export default function Badge({ status = 'DRAFT', label = null }) {
  const normalizedStatus = String(status).toUpperCase();
  const cssClass = getInvoiceStatusClass(normalizedStatus);

  return (
    <span className={`badge ${cssClass}`}>
      {label || normalizedStatus}
    </span>
  );
}
