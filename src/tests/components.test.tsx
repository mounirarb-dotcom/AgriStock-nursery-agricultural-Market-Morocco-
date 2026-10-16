import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { SmartImage } from '../components/SmartImage';
import { AppProvider, useApp } from '../context/AppContext';
import { NurseryDashboardView } from '../components/NurseryDashboardView';

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

describe('NurseryDashboardView Rules of Hooks Tests', () => {
  it('renders without hook order errors when role switches between unauthorized and authorized', async () => {
    const TestWrapper: React.FC = () => {
      const { updateUserRoles } = useApp();
      return (
        <div>
          <button onClick={() => updateUserRoles(['buyer'])}>Set Buyer</button>
          <button onClick={() => updateUserRoles(['nursery'])}>Set Nursery</button>
          <NurseryDashboardView />
        </div>
      );
    };

    let renderResult: any;
    await act(async () => {
      renderResult = render(
        <AppProvider>
          <TestWrapper />
        </AppProvider>
      );
    });

    // Set to buyer (canManageNursery becomes false -> displays RoleAccessRestrictedNotice)
    const buyerBtn = screen.getByText('Set Buyer');
    await act(async () => {
      fireEvent.click(buyerBtn);
    });
    expect(screen.getByText(/Espace Pépiniériste Producteur Réservé/i)).not.toBeNull();

    // Set to nursery (canManageNursery becomes true -> displays Nursery Dashboard)
    // Hooks must execute in identical order without React error!
    const nurseryBtn = screen.getByText('Set Nursery');
    await act(async () => {
      fireEvent.click(nurseryBtn);
    });
    expect(screen.getByText(/Espace Pépiniériste Agréé ONSSA/i)).not.toBeNull();

    // Switch once more back to buyer to ensure repeated transitions don't break hook orders
    await act(async () => {
      fireEvent.click(buyerBtn);
    });
    expect(screen.getByText(/Espace Pépiniériste Producteur Réservé/i)).not.toBeNull();
  });
});

