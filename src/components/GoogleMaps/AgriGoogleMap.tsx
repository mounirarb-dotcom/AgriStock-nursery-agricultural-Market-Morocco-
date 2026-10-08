import React, { useState, useCallback, useEffect } from 'react';
import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useAdvancedMarkerRef,
  useMap,
  useApiLoadingStatus,
  APILoadingStatus,
} from '@vis.gl/react-google-maps';
import { ProduceListing } from '../../types';
import { BUYER_DESTINATION_HUBS, BuyerDestinationHub, CLUSTER_DATA, ClusterInfo } from '../ProduceSupplyClusterMap';
import {
  Layers,
  MapPin,
  Navigation,
  Sparkles,
  Truck,
  Maximize2,
  ExternalLink,
  Info,
  CheckCircle2,
  Compass,
} from 'lucide-react';

interface AgriGoogleMapProps {
  produceListings: ProduceListing[];
  selectedRegion: string | null;
  onSelectRegion: (region: string | null) => void;
  selectedBuyerHubId: string;
  onSelectBuyerHubId: (hubId: string) => void;
  activeCategoryFilter?: string;
  height?: string;
}

// Morocco center
const MOROCCO_CENTER = { lat: 31.7917, lng: -7.0926 };
const MOROCCO_DEFAULT_ZOOM = 6;

/**
 * Helper component to pan/zoom when selectedRegion or buyer hub changes
 */
function MapCameraHandler({
  selectedCluster,
  selectedHub,
}: {
  selectedCluster: ClusterInfo | null;
  selectedHub: BuyerDestinationHub | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (selectedCluster) {
      map.panTo({ lat: selectedCluster.lat, lng: selectedCluster.lon });
      map.setZoom(8);
    } else if (selectedHub) {
      map.panTo({ lat: selectedHub.lat, lng: selectedHub.lon });
    }
  }, [map, selectedCluster, selectedHub]);

  return null;
}

export const AgriGoogleMap: React.FC<AgriGoogleMapProps> = ({
  produceListings,
  selectedRegion,
  onSelectRegion,
  selectedBuyerHubId,
  onSelectBuyerHubId,
  activeCategoryFilter = 'ALL',
  height = '540px',
}) => {
  const apiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    (typeof window !== 'undefined' && (window as any).GOOGLE_MAPS_API_KEY) ||
    '';
  const apiLoadingStatus = useApiLoadingStatus();

  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('hybrid');
  const [activeMarkerRef, activeMarker] = useAdvancedMarkerRef();

  const activeHub =
    BUYER_DESTINATION_HUBS.find((h) => h.id === selectedBuyerHubId) || BUYER_DESTINATION_HUBS[0];

  const selectedCluster = selectedRegion ? CLUSTER_DATA[selectedRegion] || null : null;

  // Compute listing stats per cluster
  const clusterStats = React.useMemo(() => {
    const stats: Record<string, { count: number; totalVolume: number; avgPrice: number }> = {};
    Object.keys(CLUSTER_DATA).forEach((regionName) => {
      const regionListings = produceListings.filter((l) => {
        const matchRegion = l.region.includes(regionName.split(' ')[0]);
        const matchCat =
          activeCategoryFilter === 'ALL' || l.category === activeCategoryFilter;
        return matchRegion && matchCat;
      });
      const count = regionListings.length;
      const totalVolume = regionListings.reduce((sum, l) => sum + (l.quantityTonnes || 0), 0);
      const avgPrice =
        count > 0
          ? Math.round(regionListings.reduce((sum, l) => sum + (l.pricePerKgMAD || 0), 0) / count)
          : 0;
      stats[regionName] = { count, totalVolume, avgPrice };
    });
    return stats;
  }, [produceListings, activeCategoryFilter]);

  if (!apiKey) {
    return (
      <div
        style={{ height }}
        className="w-full rounded-2xl bg-stone-900 border border-stone-800 p-6 flex flex-col items-center justify-center text-center text-stone-300 space-y-3"
      >
        <MapPin className="w-10 h-10 text-emerald-400" />
        <h4 className="font-bold text-white text-base">Google Maps Platform Actif</h4>
        <p className="text-xs text-stone-400 max-w-md">
          Clé API Google Maps requise dans l'environnement pour afficher le rendu satellite et cartographique temps réel.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-emerald-900/40 shadow-xl bg-stone-950">
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 bg-stone-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-700/80 shadow-md pointer-events-auto text-xs text-white">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">Google Maps Live</span>
          <span className="text-[10px] text-stone-400 hidden sm:inline">| Bassins Agricoles du Maroc</span>
        </div>

        {/* Map Type & Hub Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Map Type Switcher */}
          <div className="bg-stone-900/90 backdrop-blur-md p-1 rounded-xl border border-stone-700/80 shadow-md flex items-center gap-1 text-[11px]">
            <button
              type="button"
              onClick={() => setMapType('hybrid')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                mapType === 'hybrid' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => setMapType('terrain')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                mapType === 'terrain' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              Relief
            </button>
            <button
              type="button"
              onClick={() => setMapType('roadmap')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                mapType === 'roadmap' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              Plan
            </button>
          </div>

          {/* Reset Zoom / Center */}
          <button
            type="button"
            onClick={() => onSelectRegion(null)}
            className="bg-stone-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-stone-700/80 shadow-md text-stone-200 hover:text-white text-xs font-semibold flex items-center gap-1 transition"
            title="Vue générale Maroc"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Vue Maroc</span>
          </button>
        </div>
      </div>

      {/* Google Maps Container */}
      <div style={{ height, width: '100%' }}>
        {apiLoadingStatus === APILoadingStatus.LOADING && (
          <div className="w-full h-full bg-stone-900 rounded-xl flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="font-semibold text-xs text-stone-200">Chargement de la cartographie Google Maps...</p>
            <p className="text-[11px] text-stone-400 mt-1">Localisation des 9 bassins agricoles et marchés de gros</p>
          </div>
        )}

        {(apiLoadingStatus === APILoadingStatus.FAILED ||
          apiLoadingStatus === APILoadingStatus.AUTH_FAILURE ||
          apiLoadingStatus === APILoadingStatus.NOT_LOADED) && (
          <div className="w-full h-full bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 rounded-xl p-5 flex flex-col justify-between text-white border border-stone-800 shadow-inner">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-stone-100">Cartographie Agricole du Royaume</h4>
                  <p className="text-[11px] text-stone-400">9 bassins de production majeurs • 7 marchés de gros et ports</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Mode Sécurisé
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 my-3">
              {Object.entries(CLUSTER_DATA).slice(0, 6).map(([regName, cluster]) => (
                <button
                  key={regName}
                  type="button"
                  onClick={() => onSelectRegion(selectedRegion === regName ? null : regName)}
                  className={`p-2 rounded-xl text-left transition border text-xs ${
                    selectedRegion === regName
                      ? 'bg-emerald-600/30 border-emerald-400 text-white'
                      : 'bg-stone-800/80 border-stone-700/60 text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  <div className="text-[11px] font-bold truncate">{cluster.label}</div>
                  <div className="text-[10px] text-stone-400 truncate">{cluster.specialtyTag}</div>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-800 text-xs">
              <span className="text-stone-400 text-[11px]">
                Bassin actif : <strong className="text-emerald-400">{selectedCluster?.label || 'Tous les bassins'}</strong>
              </span>
              <button
                type="button"
                onClick={() => onSelectRegion(null)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition"
              >
                Vue Maroc
              </button>
            </div>
          </div>
        )}

        {apiLoadingStatus === APILoadingStatus.LOADED && (
          <Map
            mapId="DEMO_MAP_ID"
            defaultCenter={MOROCCO_CENTER}
            defaultZoom={MOROCCO_DEFAULT_ZOOM}
            mapTypeId={mapType}
            gestureHandling="greedy"
            disableDefaultUI={false}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
          >
            <MapCameraHandler selectedCluster={selectedCluster} selectedHub={activeHub} />

            {/* Destination Wholesale Hubs Markers (Blue) */}
            {BUYER_DESTINATION_HUBS.map((hub) => {
              const isSelectedHub = hub.id === selectedBuyerHubId;
              return (
                <AdvancedMarker
                  key={`hub-${hub.id}`}
                  position={{ lat: hub.lat, lng: hub.lon }}
                  title={hub.name}
                  onClick={() => {
                    onSelectBuyerHubId(hub.id);
                    setSelectedMarkerId(`hub-${hub.id}`);
                  }}
                >
                  <div className="relative group cursor-pointer transition-transform duration-200 hover:scale-110">
                    <Pin
                      background={isSelectedHub ? '#2563eb' : '#1e3a8a'}
                      borderColor="#ffffff"
                      glyphColor="#ffffff"
                      scale={isSelectedHub ? 1.25 : 1.0}
                    >
                      <span className="text-[11px] font-black">🏢</span>
                    </Pin>
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-blue-950/90 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm border border-blue-600/50">
                      {hub.city}
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* Agricultural Production Basin Clusters (Green / Amber / Emerald) */}
            {Object.entries(CLUSTER_DATA).map(([regionName, cluster]) => {
              const isSelected = selectedRegion === regionName;
              const stats = clusterStats[regionName] || { count: 0, totalVolume: 0, avgPrice: 0 };
              const distToHub =
                cluster.roadDistanceMatrixKm[selectedBuyerHubId as keyof typeof cluster.roadDistanceMatrixKm] || 0;

              return (
                <AdvancedMarker
                  key={`cluster-${regionName}`}
                  position={{ lat: cluster.lat, lng: cluster.lon }}
                  title={`${cluster.label} — ${cluster.specialtyTag}`}
                  onClick={() => {
                    onSelectRegion(isSelected ? null : regionName);
                    setSelectedMarkerId(`cluster-${regionName}`);
                  }}
                >
                  <div
                    className={`relative cursor-pointer transition-all duration-300 flex flex-col items-center ${
                      isSelected ? 'scale-125 z-30' : 'hover:scale-115 z-10'
                    }`}
                  >
                    {/* Visual pulse glow for selected basin */}
                    {isSelected && (
                      <span className="absolute -inset-2 rounded-full bg-emerald-400 opacity-60 animate-ping pointer-events-none" />
                    )}

                    <Pin
                      background={isSelected ? '#059669' : '#047857'}
                      borderColor="#ffffff"
                      glyphColor="#ffffff"
                      scale={isSelected ? 1.3 : 1.05}
                    >
                      <span className="text-xs">{cluster.dominantIcon}</span>
                    </Pin>

                    {/* Badge Label */}
                    <div
                      className={`mt-1 whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md border ${
                        isSelected
                          ? 'bg-emerald-950 text-emerald-200 border-emerald-400 font-black'
                          : 'bg-stone-900/90 text-stone-100 border-stone-700/80'
                      }`}
                    >
                      <span>{cluster.hubCity.split('/')[0]}</span>
                      {stats.count > 0 && (
                        <span className="ml-1 px-1 rounded-full bg-emerald-600 text-white text-[9px]">
                          {stats.count}
                        </span>
                      )}
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* InfoWindow for Selected Basin */}
            {selectedCluster && (
              <InfoWindow
                position={{
                  lat: selectedCluster.lat,
                  lng: selectedCluster.lon,
                }}
                onCloseClick={() => onSelectRegion(null)}
                pixelOffset={[0, -35]}
              >
                <div className="p-2 max-w-xs text-stone-900 font-sans space-y-2">
                  <div className="flex items-center gap-2 border-b border-stone-200 pb-1.5">
                    <span className="text-xl">{selectedCluster.dominantIcon}</span>
                    <div>
                      <h4 className="font-black text-xs text-stone-900 leading-tight">
                        {selectedCluster.label}
                      </h4>
                      <p className="text-[10px] text-stone-500 font-arabic">
                        {selectedCluster.labelAr}
                      </p>
                    </div>
                  </div>

                  <div className="text-[11px] text-stone-600 space-y-1">
                    <p>
                      <strong>Spécialités :</strong> {selectedCluster.specialtyTag}
                    </p>
                    <p className="text-stone-500 text-[10px]">
                      🌱 {selectedCluster.soilType}
                    </p>
                    <p className="text-stone-500 text-[10px]">
                      💧 {selectedCluster.irrigationType}
                    </p>
                  </div>

                  {/* Distance to Hub */}
                  <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-[11px] text-emerald-900">
                    <div className="flex items-center gap-1 font-semibold">
                      <Truck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Vers {activeHub.city} :</span>
                    </div>
                    <span className="font-mono font-black text-emerald-700">
                      {selectedCluster.roadDistanceMatrixKm[selectedBuyerHubId] || 'N/A'}{' '}
                      km
                    </span>
                  </div>

                  {/* Listings summary in this cluster */}
                  <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1">
                    <span>
                      Lots disponibles :{' '}
                      <strong className="text-stone-900">
                        {selectedRegion ? clusterStats[selectedRegion]?.count || 0 : 0}
                      </strong>
                    </span>
                    <span>
                      Volume :{' '}
                      <strong className="text-stone-900">
                        {selectedRegion ? clusterStats[selectedRegion]?.totalVolume || 0 : 0} T
                      </strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('marketplace-listings-grid');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full mt-1 py-1.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] text-center transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Voir les offres de ce bassin</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </InfoWindow>
            )}
          </Map>
        )}
      </div>

      {/* Bottom Summary Bar */}
      <div className="bg-stone-900 px-4 py-2 text-xs text-stone-300 flex flex-wrap items-center justify-between gap-2 border-t border-stone-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Bassins de Production (9 Régions)</span>
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            <span>Marchés de Gros & Ports (7 Hubs)</span>
          </div>
        </div>

        <div className="text-[11px] text-stone-400">
          Destination active : <strong className="text-white">{activeHub.name}</strong>
        </div>
      </div>
    </div>
  );
};
