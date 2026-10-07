import React from 'react';
import { SellerDashboardView } from './SellerDashboardView';

interface SellerMiniDashboardProps {
  onOpenNewLot?: () => void;
  onOpenNewListing?: () => void;
  onNavigateToMarket?: () => void;
}

export const SellerMiniDashboard: React.FC<SellerMiniDashboardProps> = ({
  onOpenNewLot,
}) => {
  return (
    <SellerDashboardView
      onOpenNewNurseryLot={onOpenNewLot}
      onScrollToInventory={() => {
        const el = document.getElementById('nursery-inventory-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }}
    />
  );
};
