/**
 * @file components.test.jsx
 * @description Unit tests for frontend UI components.
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '../src/components/Badge.jsx';
import Button from '../src/components/Button.jsx';

describe('Frontend UI Components', () => {
  it('renders Badge with correct status label and CSS class', () => {
    const { container } = render(<Badge status="PAID" />);
    const badgeElement = screen.getByText('PAID');
    expect(badgeElement).toBeDefined();
    expect(container.querySelector('.badge-paid')).not.toBeNull();
  });

  it('renders Button with children and handles disabled state', () => {
    render(<Button disabled>Click Me</Button>);
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).toBeDefined();
    expect(buttonElement.getAttribute('disabled')).not.toBeNull();
  });

  it('renders Button in loading state with Loading... text', () => {
    render(<Button isLoading>Submit</Button>);
    expect(screen.getByText('Loading...')).toBeDefined();
  });
});
