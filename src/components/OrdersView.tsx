import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import { EscrowTransaction, EscrowTransactionStatus } from '../types';
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  DollarSign,
  ShieldCheck,
  Calendar,
  ChevronRight,
  ChevronDown,
  User,
  MapPin,
  ExternalLink,
  MessageSquare,
  FileText,
} from 'lucide-react';

type OrderStatusFilter = 'all' | 'funds_held' | 'in_transit' | 'delivered' | 'released' | 'disputed';

export const OrdersView: React.FC = () => {
  const {
    language,
    escrowTransactions,
    releaseEscrowFunds,
    openLitigation,
    openLogisticsModal,
    openOfferDiscussion,
    produceListings,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [litigationReason, setLitigationReason] = useState('');
  const [activeLitigationId, setActiveLitigationId] = useState<string | null>(null);

  // Filtrage selon le statut demandé
  const filteredOrders = escrowTransactions.filter((tx) => {
    if (statusFilter === 'all') return true;
    return tx.status === statusFilter;
  });

  const getStatusBadge = (status: EscrowTransactionStatus) => {
    switch (status) {
      case 'funds_held':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>🟠 {tr(language, 'En attente (Séquestre consigné)', 'قيد الانتظار (حساب وسيط)', 'Pending (Escrow Held)')}</span>
          </span>
        );
      case 'in_transit':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            <span>🔵 {tr(language, 'En cours (En acheminement)', 'قيد الشحن والتوصيل', 'In Progress (In Transit)')}</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span>🟣 {tr(language, 'Livré (Inspection 48h)', 'تم التسليم (مهلة الفحص 48 س)', 'Delivered (48h Inspection)')}</span>
          </span>
        );
      case 'released':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>🟢 {tr(language, 'Terminée (Vendeur payé)', 'مكتملة (تم تحويل الأموال)', 'Completed (Paid)')}</span>
          </span>
        );
      case 'disputed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>🔴 {tr(language, 'Litige Ouvert', 'نزاع جاري', 'Disputed')}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
            {status}
          </span>
        );
    }
  };

  const handleConfirmReceipt = (tx: EscrowTransaction) => {
    const payout = (tx.sellerPayoutAmountMAD ?? tx.totalPaidByBuyerMAD ?? 0).toLocaleString('fr-FR');
    if (
      confirm(
        `Confirmez-vous que la livraison de « ${tx.itemTitle} » est conforme ?\nCette action va débloquer ${payout} MAD au vendeur.`
      )
    ) {
      releaseEscrowFunds(tx.id);
    }
  };

  const handleSubmitLitigation = (txId: string) => {
    if (!litigationReason.trim()) {
      alert('Veuillez préciser le motif de réclamation.');
      return;
    }
    openLitigation(txId, litigationReason);
    setActiveLitigationId(null);
    setLitigationReason('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200 pb-16 md:pb-8">
      {/* 1. Header Commandes */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-1.5">
            <Package className="w-3.5 h-3.5 text-emerald-600" />
            <span>TRANSACTIONS & COMMANDES B2B</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {tr(language, 'Mes Commandes', 'طلبياتي ومعاملاتي', 'My Orders')}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {tr(
              language,
              'Suivez vos achats et vos ventes sous séquestre sécurisé CMI avec protection des fonds garantie.',
              'تتبع مشترياتك ومبيعاتك عبر نظام الضمان وحساب الائتمان المؤمن.',
              'Track your transactions with full B2B escrow guarantee and funds protection.'
            )}
          </p>
        </div>

        {/* Badge réassurance séquestre */}
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-stone-50 border border-stone-200 shrink-0">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
          <div className="text-left text-xs">
            <span className="font-bold text-stone-900 block">Séquestre CMI 100% Garanti</span>
            <span className="text-[10px] text-stone-500">Fonds consignés jusqu’à livraison</span>
          </div>
        </div>
      </div>

      {/* 2. Filtres par statut d'avancement */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 ${
            statusFilter === 'all'
              ? 'bg-stone-900 text-white font-bold shadow-xs'
              : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
          }`}
        >
          {tr(language, 'Toutes les commandes', 'جميع الطلبات', 'All Orders')} ({escrowTransactions.length})
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('funds_held')}
          className={`px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 ${
            statusFilter === 'funds_held'
              ? 'bg-amber-600 text-white font-bold shadow-xs'
              : 'bg-white hover:bg-amber-50 text-amber-800 border border-stone-200'
          }`}
        >
          🟠 {tr(language, 'En attente', 'قيد الانتظار', 'Pending')}
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('in_transit')}
          className={`px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 ${
            statusFilter === 'in_transit'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'bg-white hover:bg-blue-50 text-blue-800 border border-stone-200'
          }`}
        >
          🔵 {tr(language, 'En cours', 'قيد الشحن', 'In Progress')}
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('released')}
          className={`px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 ${
            statusFilter === 'released'
              ? 'bg-emerald-600 text-white font-bold shadow-xs'
              : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-stone-200'
          }`}
        >
          🟢 {tr(language, 'Terminées', 'المكتملة', 'Completed')}
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('disputed')}
          className={`px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 ${
            statusFilter === 'disputed'
              ? 'bg-rose-600 text-white font-bold shadow-xs'
              : 'bg-white hover:bg-rose-50 text-rose-800 border border-stone-200'
          }`}
        >
          🔴 {tr(language, 'Litiges', 'النزاعات', 'Disputes')}
        </button>
      </div>

      {/* 3. Liste des commandes détaillées */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-stone-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-stone-900 text-sm">
            {tr(language, 'Aucune commande dans cette catégorie', 'لا توجد طلبات في هذا القسم', 'No orders in this category')}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {tr(
              language,
              'Vos commandes passées ou reçues avec séquestre apparaîtront ici automatiquement.',
              'الطلبات المبرمة مع تأمين الدفع ستظهر هنا تلقائياً.',
              'Your escrow orders will appear here automatically.'
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs hover:shadow-xs transition overflow-hidden"
              >
                {/* En-tête de la carte */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-xs shrink-0">
                      <Package className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-stone-900 text-sm">{order.itemTitle}</span>
                        <span className="text-[10px] font-mono text-stone-400">#{order.id.slice(-6)}</span>
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-2">
                        <span>{order.quantity} {order.unit}</span>
                        <span>•</span>
                        <span>{new Date(order.paymentDate || (order as any).createdAt || Date.now()).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    {getStatusBadge(order.status)}

                    <div className="text-right">
                      <div className="text-base font-black text-stone-900">
                        {((order.totalPaidByBuyerMAD ?? (order as any).totalAmount ?? 0)).toLocaleString('fr-FR')} MAD
                      </div>
                      <div className="text-[10px] text-stone-400">Total TTC</div>
                    </div>
                  </div>
                </div>

                {/* Corps de la commande : Vendeur, Produit, Transport, Séquestre */}
                <div className="p-4 sm:p-5 bg-stone-50/50 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {/* Vendeur & Acheteur */}
                    <div className="p-3 rounded-2xl bg-white border border-stone-200/80 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-stone-400">Parties Commerciales</span>
                      <div className="font-bold text-stone-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-stone-500" />
                        <span>Vendeur : {order.sellerName}</span>
                      </div>
                      <div className="text-stone-500 text-[11px]">
                        Acheteur : {order.buyerName}
                      </div>
                    </div>

                    {/* Transport & Logistique */}
                    <div className="p-3 rounded-2xl bg-white border border-stone-200/80 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-stone-400">Fret & Logistique Frigo</span>
                      <div className="font-bold text-stone-900 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-blue-600" />
                        <span>
                          {order.trackingCarrier || (order as any).carrierName
                            ? `${order.trackingCarrier || (order as any).carrierName} (${order.trackingNumber || (order as any).carrierTruckPlate || 'Camion Frigo'})`
                            : 'Fret Frigo en assignation'}
                        </span>
                      </div>
                      <div className="text-stone-500 text-[11px]">
                        Livraison estimée : 24h à 48h
                      </div>
                    </div>

                    {/* Séquestre CMI & Commission */}
                    <div className="p-3 rounded-2xl bg-white border border-stone-200/80 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-stone-400">Séquestre CMI B2B</span>
                      <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Fonds Séquestrés : {((order.totalPaidByBuyerMAD ?? (order as any).totalAmount ?? 0)).toLocaleString('fr-FR')} MAD</span>
                      </div>
                      <div className="text-stone-500 text-[11px]">
                        Commission : {((order.platformCommissionMAD ?? (order as any).platformCommissionAmount ?? 0)).toLocaleString('fr-FR')} MAD ({typeof order.platformCommissionRate === 'number' ? (order.platformCommissionRate > 1 ? order.platformCommissionRate : (order.platformCommissionRate * 100).toFixed(0)) : 5}%)
                      </div>
                    </div>
                  </div>

                  {/* Actions de validation & Litige */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200/60">
                    <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Fonds consignés jusqu’à inspection conforme à destination</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.status === 'funds_held' || order.status === 'in_transit' || order.status === 'delivered' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleConfirmReceipt(order)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirmer Réception & Payer Vendeur</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveLitigationId(order.id)}
                            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-rose-50 text-rose-700 font-semibold text-xs transition cursor-pointer"
                          >
                            Signaler un litige
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {/* Formulaire de litige si ouvert */}
                  {activeLitigationId === order.id && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2.5 animate-in fade-in">
                      <span className="font-bold text-xs text-rose-900">
                        Déclaration de non-conformité ou litige qualité :
                      </span>
                      <textarea
                        rows={2}
                        value={litigationReason}
                        onChange={(e) => setLitigationReason(e.target.value)}
                        placeholder="Précisez le problème constaté (ex: écart de pesage, marchandise endommagée, calibre...)"
                        className="w-full p-2.5 rounded-xl bg-white border border-rose-300 text-xs text-stone-900 focus:outline-hidden"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveLitigationId(null)}
                          className="px-3 py-1 rounded-lg text-xs text-stone-500 hover:text-stone-800"
                        >
                          Annuler
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSubmitLitigation(order.id)}
                          className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer"
                        >
                          Transmettre à l’Arbitrage AGRISTOCK
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
