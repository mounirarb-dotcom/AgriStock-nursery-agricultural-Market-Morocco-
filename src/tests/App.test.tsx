import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import App from '../App';

describe('App Component', () => {
  it('renders application shell and core navbar branding', async () => {
    await act(async () => {
      render(<App />);
    });
    // Verify that primary branding elements or search navigation exist
    const elements = screen.getAllByText(/Morocco Nursery|مشاتل|Agri|Pépinière/i);
    expect(elements.length).toBeGreaterThan(0);
  });
});

