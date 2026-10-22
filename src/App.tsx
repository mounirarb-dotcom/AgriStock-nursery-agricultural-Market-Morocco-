/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider } from './context/AppContext';
import { APIProvider } from '@vis.gl/react-google-maps';
import { AppShell } from './components/shell';

export default function App() {
  const mapsApiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    (typeof window !== 'undefined' && (window as any).GOOGLE_MAPS_API_KEY) ||
    '';

  const appContent = (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );

  if (mapsApiKey) {
    return (
      <APIProvider
        apiKey={mapsApiKey}
        language="fr"
        region="MA"
        libraries={['marker']}
        onError={(err) => {
          console.warn('[Google Maps] Script loader event:', err);
        }}
      >
        {appContent}
      </APIProvider>
    );
  }

  return appContent;
}
