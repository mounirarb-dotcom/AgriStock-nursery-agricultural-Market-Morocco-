import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { tr } from '../../../utils/translations';
import {
  ArrowLeft,
  Package,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  User,
  MapPin,
  Calendar,
} from 'lucide-react';
import { EscrowTransaction } from '../../../types';

export const OrderDetailPage: React.FC = () => {
  const {
    language,
    escrowTransactions,
    releaseEscrowFunds,
    openLitigation,
    setActiveTab,
  } = useApp();

  const [litigationReason, setLitigationReason] = useState('');
  const [showLitigationBox, setShowLitigationBox] = useState(false);

  // Première commande ou repli
  const order: EscrowTransaction | undefined = escrowTransactions[0];

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <p className="text-stone-500 text-sm">
          {tr(language, 'Aucune commande sélectionnée.', 'لم يتم تحديد أي طلبية.', 'No order selected.')}
        </p>
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
        >
          {tr(language, 'Voir toutes mes commandes', 'عرض جميع الطلبات', 'View all orders')}
        </button>
      </div>
    );
  }

  const handleConfirm = () => {
    if (confirm(`Confirmez-vous la réception conforme de cette commande ? Les fonds (${order.totalPaidByBuyerMAD} MAD) seront débloqués au vendeur.`)) {
      releaseEscrowFunds(order.id);
    }
  };

  const handleLitigation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!litigationReason.trim()) return;
    openLitigation(order.id, litigationReason.trim());
    setShowLitigationBox(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 px-3 sm:px-6 space-y-6 animate-in fade-in duration-200 pb-20 md:pb-8">
      <button
        type="button"
        onClick={() => setActiveTab('orders')}
        className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{tr(language, 'Retour aux commandes', 'العودة للطلبيات', 'Back to Orders')}</span>
      </button>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
        {/* Header Commande */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-bold">
                #{order.id.slice(-8)}
              </span>
              <span className="text-xs text-stone-400">
                {new Date(order.paymentDate || Date.now()).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
              {order.itemTitle}
            </h1>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-emerald-800">
              {order.totalPaidByBuyerMAD.toLocaleString('fr-FR')} MAD
            </span>
            <span className="text-[10px] text-stone-500 block">Paiement Séquestre Garanti CMI</span>
          </div>
        </div>

        {/* Détails Produit & Parties */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
            <span className="text-[10px] uppercase font-bold text-stone-400">Parties</span>
            <div className="space-y-1">
              <p><strong>Vendeur :</strong> {order.sellerName} ({order.sellerPhone || 'Contact direct'})</p>
              <p><strong>Acheteur :</strong> {order.buyerName} ({order.buyerPhone})</p>
              <p><strong>Destination :</strong> {order.destinationCity} ({order.deliveryAddress})</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
            <span className="text-[10px] uppercase font-bold text-stone-400">Ventilation Financière</span>
            <div className="space-y-1">
              <p><strong>Sous-total :</strong> {order.subtotalAmountMAD.toLocaleString('fr-FR')} MAD</p>
              <p><strong>Commission plateforme :</strong> {order.platformCommissionMAD.toLocaleString('fr-FR')} MAD</p>
              <p><strong>Net Vendeur :</strong> {order.sellerPayoutAmountMAD.toLocaleString('fr-FR')} MAD</p>
              <p className="text-emerald-700 font-bold"><strong>Frais de séquestre :</strong> {order.escrowGuaranteeFeeMAD || 0} MAD</p>
            </div>
          </div>
        </div>

        {/* Suivi logistique */}
        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-blue-900">
            <Truck className="w-4 h-4 text-blue-600" />
            <span>Fret & Acheminement Frigorifique</span>
          </div>
          <p className="text-blue-800">
            Transporteur : {order.trackingCarrier || 'Fret Agricole Express'} • N° Suivi : {order.trackingNumber || 'FRIGO-MA-2026-X'}
          </p>
        </div>

        {/* Actions Acheteur / Vendeur */}
        <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Protection jusqu’à confirmation de livraison conforme</span>
          </div>

          <div className="flex items-center gap-2">
            {order.status !== 'released' && order.status !== 'disputed' && (
              <>
                <button
                  type="button"
                  onClick={() => setShowLitigationBox(!showLitigationBox)}
                  className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition cursor-pointer"
                >
                  Ouvrir un litige
                </button>

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmer la réception (Débloquer les fonds)</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Formulaire de litige */}
        {showLitigationBox && (
          <form onSubmit={handleLitigation} className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
            <h4 className="font-bold text-xs text-rose-900">Motif de réclamation & arbitrage</h4>
            <textarea
              value={litigationReason}
              onChange={(e) => setLitigationReason(e.target.value)}
              placeholder="Précisez le problème rencontré (ex: non-conformité calibre, retard frigorifique, casse...)"
              className="w-full p-2.5 bg-white border border-rose-200 rounded-xl text-xs focus:outline-hidden"
              rows={3}
              required
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLitigationBox(false)}
                className="px-3 py-1.5 text-xs text-stone-600 font-bold"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-rose-700 text-white font-bold text-xs rounded-xl"
              >
                Transmettre à la modération
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
