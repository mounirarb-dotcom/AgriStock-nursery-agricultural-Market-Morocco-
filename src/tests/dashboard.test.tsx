import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import { Dashboard } from '../components/Dashboard';

describe('Dashboard Component with Recharts', () => {
  it('renders correctly with national observatory header and Moroccan commodities', async () => {
    await act(async () => {
      render(
        <AppProvider>
          <Dashboard />
        </AppProvider>
      );
    });

    // Verify main header and observatory title
    expect(Boolean(screen.getByText(/Observatoire B2B National/i))).toBe(true);
    expect(Boolean(screen.getByText(/Baromètre & Tendances des Cours/i))).toBe(true);

    // Verify presence of produce and animal commodities in KPI cards or filters
    expect(screen.getAllByText(/Tomates Rondes/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Béliers Sardi/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Taurillons Tadla/i).length).toBeGreaterThan(0);
  });

  it('allows switching sector filters between All, Produce, and Livestock', async () => {
    await act(async () => {
      render(
        <AppProvider>
          <Dashboard />
        </AppProvider>
      );
    });

    // Filter to Livestock & Animals
    const livestockBtn = screen.getByRole('button', { name: /Bétail & Élevage/i });
    expect(Boolean(livestockBtn)).toBe(true);
    fireEvent.click(livestockBtn);

    // Filter back to Produce
    const produceBtn = screen.getByRole('button', { name: /Fruits & Légumes/i });
    expect(Boolean(produceBtn)).toBe(true);
    fireEvent.click(produceBtn);
  });

  it('renders recent deal transactions table with Moroccan regions and dirham pricing', async () => {
    await act(async () => {
      render(
        <AppProvider>
          <Dashboard />
        </AppProvider>
      );
    });

    // Verify deal table entries
    expect(Boolean(screen.getByText(/Marché de Gros d'Inezgane/i))).toBe(true);
    expect(Boolean(screen.getByText(/Souk Hebdomadaire de Settat/i))).toBe(true);
    expect(Boolean(screen.getByText(/Souk de Fkih Ben Salah/i))).toBe(true);
    expect(screen.getAllByText(/AgriForex/i).length).toBeGreaterThan(0);
  });
});
