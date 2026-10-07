import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SmartImage } from '../components/SmartImage';

describe('SmartImage Component Tests', () => {
  it('renders image with secure attributes including loading="lazy" and decoding="async"', () => {
    render(
      <SmartImage
        src="https://images.unsplash.com/photo-1542838132-92c53300491e"
        alt="Primeurs du Souss"
        className="test-image"
      />
    );

    const img = screen.getByRole('img');
    expect(img).not.toBeNull();
    expect(img.getAttribute('alt')).toBe('Primeurs du Souss');
    expect(img.getAttribute('loading')).toBe('lazy');
    expect(img.getAttribute('decoding')).toBe('async');
    expect(img.getAttribute('referrerpolicy')).toBe('no-referrer');
  });

  it('renders category fallback when src is missing or empty', () => {
    render(
      <SmartImage
        alt="Agrumes Val d'Argana"
        category="Arbres Fruitiers (Agrumes)"
      />
    );

    // Fallback badge should display the category label
    expect(screen.queryByText(/Fruits & Vergers/i)).not.toBeNull();
  });

  it('switches to fallback on image loading error', () => {
    render(
      <SmartImage
        src="https://invalid-broken-domain-999.xyz/broken.jpg"
        alt="Olivier de pépinière"
        category="Olivier (Olea europaea)"
      />
    );

    const img = screen.getByRole('img');
    // Simulate error event
    fireEvent.error(img);

    // Should render the fallback container showing alt text and category
    expect(screen.queryByText(/Olivier de pépinière/i)).not.toBeNull();
  });
});

