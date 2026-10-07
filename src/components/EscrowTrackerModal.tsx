import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Truck,
  X,
  FileText,
  DollarSign,
  Phone,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EscrowTransaction, EscrowTransactionStatus } from '../types';
import FinanceService from '../services/FinanceService';

export const EscrowTrackerModal: React.FC = () => {
  const {
    isEscrowListModalOpen,
    setIsEscrowListModalOpen,
    escrowTransactions,
    updateEscrowStatus,
    releaseEscrowFunds,
    openLitigation,
    openLogisticsModal,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);
  const [litigationReason, setLitigationReason] = useState<string>('');
  const [activeLitigationTxId, setActiveLitigationTxId] = useState<string | null>(null);

  if (!isEscrowListModalOpen) return null;

  const filteredList = escrowTransactions.filter((tx) => {
    if (filterStatus === 'all') return true;
    return tx.status === filterStatus;
  });

  const handleConfirmReceipt = (tx: EscrowTransaction) => {
    const confirmRelease = window.confirm(
      `Confirmez-vous que les ${tx.quantity} ${tx.unit} de « ${tx.itemTitle} » ont été réceptionnés en parfait état de conformité ?\n\nCette action va débloquer ${tx.sellerPayoutAmountMAD.toLocaleString('fr-FR')} MAD et les virer immédiatement sur le compte bancaire du vendeur (${tx.sellerName}).`
    );
    if (confirmRelease) {
      releaseEscrowFunds(tx.id);
    }
  };

  const handleOpenLitigationSubmit = (txId: string) => {
    if (!litigationReason.trim()) {
      alert('Veuillez préciser le motif du litige (ex: plants desséchés, calibre non conforme, 50 caisses manquantes...).');
      return;
    }
    openLitigation(txId, litigationReason);
    setActiveLitigationTxId(null);
    setLitigationReason('');
  };

  const getStatusBadge = (status: EscrowTransactionStatus) => {
    switch (status) {
      case 'funds_held':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Lock className="w-3 h-3 mr-1" />
            Fonds Consignés Séquestre
          </span>
        );
      case 'in_transit':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
            <Truck className="w-3 h-3 mr-1" />
            En Acheminement / Expédié
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300">
            <Clock className="w-3 h-3 mr-1" />
            Livré - Inspection 48h
          </span>
        );
      case 'released':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Conforme & Vendeur Payé
          </span>
        );
      case 'disputed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Litige Qualité Ouvert
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      id="escrow-tracker-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm overflow-y-auto"
    >
      <div
        id="escrow-tracker-modal"
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-stone-900 text-white px-6 py-5 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-white flex items-center space-x-2">
                <span>Transactions & Séquestre CMI / Stripe</span>
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
                  {escrowTransactions.length} dossiers
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                Supervision des fonds bloqués, commissions de plateforme et déblocage à la livraison
              </p>
            </div>
          </div>
          <button
            id="close-escrow-tracker-btn"
            onClick={() => setIsEscrowListModalOpen(false)}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-6 py-3 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-1 sm:space-x-2 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-stone-900 text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              Toutes ({escrowTransactions.length})
            </button>
            <button
              onClick={() => setFilterStatus('funds_held')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterStatus === 'funds_held'
                  ? 'bg-amber-700 text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              Fonds consignés
            </button>
            <button
              onClick={() => setFilterStatus('in_transit')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterStatus === 'in_transit'
                  ? 'bg-blue-700 text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              En transit
            </button>
            <button
              onClick={() => setFilterStatus('released')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterStatus === 'released'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              Débloquées
            </button>
            <button
              onClick={() => setFilterStatus('disputed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterStatus === 'disputed'
                  ? 'bg-rose-700 text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              Litiges
            </button>
          </div>

          <div className="text-xs text-stone-500 font-medium">
            Protection totale acheteur & vendeur
          </div>
        </div>

        {/* List of Escrow Transactions */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filteredList.length === 0 ? (
            <div className="text-center py-12 text-stone-500 text-sm">
              Aucun dossier séquestre ne correspond à ce filtre.
            </div>
          ) : (
            filteredList.map((tx) => {
              const isExpanded = expandedTxId === tx.id;

              return (
                <div
                  key={tx.id}
                  className="bg-white border border-stone-200 rounded-xl shadow-sm hover:border-stone-300 transition-all overflow-hidden"
                >
                  {/* Top card bar */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/50 border-b border-stone-100">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-mono text-xs font-bold text-stone-800 bg-stone-200/70 px-2 py-0.5 rounded">
                          {tx.referenceNumber}
                        </span>
                        {getStatusBadge(tx.status)}
                        <span className="text-[11px] text-stone-400">
                          {tx.paymentDate}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-stone-900">
                        {tx.itemTitle}
                      </h4>
                      <p className="text-xs text-stone-500">
                        Vendeur : <strong className="text-stone-700">{tx.sellerName}</strong> • Acheteur : <strong className="text-stone-700">{tx.buyerName}</strong> ({tx.destinationCity})
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[11px] text-stone-500 block">Total payé par l'acheteur</span>
                      <span className="text-lg font-black text-emerald-800 font-mono">
                        {FinanceService.formatMAD(tx.totalPaidByBuyerMAD)}
                      </span>
                      <span className="text-[10px] text-stone-600 block font-medium">
                        Commission AgriStock ({(tx.platformCommissionRate * 100).toFixed(1)} %) : {FinanceService.formatMAD(tx.platformCommissionMAD)}
                      </span>
                    </div>
                  </div>

                  {/* Quick details */}
                  <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
                    <div className="flex items-center space-x-4">
                      <span>
                        Qté : <strong>{tx.quantity} {tx.unit}</strong> ({tx.unitPriceMAD} MAD/{tx.unit})
                      </span>
                      <span>
                        Transporteur : <strong>{tx.trackingCarrier || 'Non assigné'}</strong>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                        className="text-stone-600 hover:text-stone-900 flex items-center space-x-1 font-semibold"
                      >
                        <span>{isExpanded ? 'Masquer détails' : 'Voir historique & traçabilité'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Actions & History */}
                  {isExpanded && (
                    <div className="p-5 bg-stone-50 border-t border-stone-200 space-y-4 text-xs animate-in fade-in-50">
                      {/* Financial breakdown standardisé (Marchandise, Frais séquestre, Commission, Total acheteur, Net vendeur) */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-white p-3.5 rounded-lg border border-stone-200">
                        <div>
                          <span className="text-stone-400 block text-[11px]">Marchandise</span>
                          <span className="font-bold text-stone-800 font-mono">{FinanceService.formatMAD(tx.subtotalAmountMAD)}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[11px]">Frais séquestre (1,5 %)</span>
                          <span className="font-bold text-emerald-700 font-mono">+{FinanceService.formatMAD(tx.escrowGuaranteeFeeMAD)}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[11px]">Commission AgriStock ({(tx.platformCommissionRate * 100).toFixed(1)} %)</span>
                          <span className="font-bold text-amber-700 font-mono">-{FinanceService.formatMAD(tx.platformCommissionMAD)}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[11px]">Total payé acheteur</span>
                          <span className="font-black text-emerald-800 font-mono">{FinanceService.formatMAD(tx.totalPaidByBuyerMAD)}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[11px]">Net vendeur</span>
                          <span className="font-bold text-stone-900 font-mono">{FinanceService.formatMAD(tx.sellerPayoutAmountMAD)}</span>
                        </div>
                      </div>

                      {/* Delivery address */}
                      <div className="bg-white p-3 rounded-lg border border-stone-200">
                        <span className="text-stone-400 block text-[11px] mb-0.5">Adresse de livraison spécifiée :</span>
                        <p className="font-medium text-stone-800">{tx.deliveryAddress}, {tx.destinationCity} (Contact: {tx.buyerPhone})</p>
                      </div>

                      {/* Timeline of events */}
                      <div className="space-y-2">
                        <span className="font-bold text-stone-700 block">Historique du séquestre :</span>
                        <div className="space-y-1.5 border-l-2 border-emerald-500 pl-3">
                          {tx.statusHistory.map((h, i) => (
                            <div key={i} className="text-stone-600">
                              <span className="font-mono text-[11px] text-stone-400 mr-2">{h.timestamp}</span>
                              <strong className="text-stone-800">{h.note}</strong>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Dispute alert if any */}
                      {tx.status === 'disputed' && tx.disputeReason && (
                        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-rose-900">
                          <strong className="block text-xs font-bold mb-1">Litige en cours de médiation :</strong>
                          <p className="text-xs">{tx.disputeReason}</p>
                          <p className="text-[11px] text-rose-700 mt-1">
                            L'équipe AgriMaroc bloque les fonds jusqu'à inspection par un expert agronome agréé ou accord amiable de compensation.
                          </p>
                        </div>
                      )}

                      {/* Action buttons depending on status */}
                      <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-stone-200">
                        {tx.status === 'funds_held' && (
                          <>
                            <button
                              onClick={() => updateEscrowStatus(tx.id, 'in_transit', 'Marchandise prise en charge par le transporteur AgriFret.')}
                              className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold flex items-center space-x-1"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Marquer comme Expédié</span>
                            </button>
                            <button
                              onClick={() =>
                                openLogisticsModal({
                                  destinationCity: tx.destinationCity,
                                  itemTitle: tx.itemTitle,
                                  volumeTonnes: Math.max(1, Math.round(tx.quantity / 500)),
                                })
                              }
                              className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-white font-medium"
                            >
                              Réserver un transporteur AgriFret
                            </button>
                          </>
                        )}

                        {tx.status === 'in_transit' && (
                          <button
                            onClick={() => updateEscrowStatus(tx.id, 'delivered', 'Livraison réceptionnée par l\'acheteur. Période d\'inspection de 48 heures démarrée.')}
                            className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-semibold flex items-center space-x-1"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Marquer comme Réceptionné (Inspection 48h)</span>
                          </button>
                        )}

                        {(tx.status === 'in_transit' || tx.status === 'delivered') && (
                          <>
                            <button
                              onClick={() => handleConfirmReceipt(tx)}
                              className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center space-x-1.5 shadow-sm"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Valider la conformité & Débloquer les fonds au vendeur</span>
                            </button>

                            {activeLitigationTxId !== tx.id ? (
                              <button
                                onClick={() => setActiveLitigationTxId(tx.id)}
                                className="px-3 py-2 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold"
                              >
                                Ouvrir un litige de conformité
                              </button>
                            ) : (
                              <div className="w-full bg-white p-3 rounded-lg border border-rose-300 space-y-2 mt-2">
                                <label className="block text-xs font-bold text-rose-900">
                                  Motif du litige / non-conformité :
                                </label>
                                <textarea
                                  value={litigationReason}
                                  onChange={(e) => setLitigationReason(e.target.value)}
                                  placeholder="Décrivez précisément l'anomalie constatée : lot abîmé, vigueur insuffisante, calibre non respecté, mortalité anormale..."
                                  rows={2}
                                  className="w-full p-2 text-xs border border-rose-300 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none"
                                />
                                <div className="flex justify-end space-x-2">
                                  <button
                                    onClick={() => setActiveLitigationTxId(null)}
                                    className="px-2.5 py-1 text-stone-500 hover:text-stone-700"
                                  >
                                    Annuler
                                  </button>
                                  <button
                                    onClick={() => handleOpenLitigationSubmit(tx.id)}
                                    className="px-3 py-1 bg-rose-700 text-white font-bold rounded"
                                  >
                                    Bloquer le versement & Notifier médiation
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {tx.status === 'released' && (
                          <span className="text-emerald-700 font-bold flex items-center space-x-1 text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Vendeur payé : {tx.sellerPayoutAmountMAD.toLocaleString('fr-FR')} MAD reversés</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary */}
        <div className="bg-stone-100 px-6 py-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600 shrink-0">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-emerald-700" />
            <span>Séquestre régulé conforme aux normes du commerce agricole interentreprises marocain.</span>
          </div>
          <button
            onClick={() => setIsEscrowListModalOpen(false)}
            className="px-4 py-2 rounded-lg bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
