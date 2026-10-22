import React from 'react';
import { SellerDashboardView } from '../../../components/SellerDashboardView';

export const SellerDashboardPage: React.FC = () => {
  return (
    <SellerDashboardView
      onScrollToInventory={() => {
        const el = document.getElementById('seller-stocks-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }}
    />
  );
};
