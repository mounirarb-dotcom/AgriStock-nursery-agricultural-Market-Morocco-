import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  Building2,
  CheckCircle2,
  X,
  AlertCircle,
  Truck,
  FileCheck2,
  Sparkles,
  ChevronRight,
  Info,
  Layers,
  Scale,
  Plus,
  Minus,
  AlertTriangle,
  HelpCircle,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import FinanceService from '../services/FinanceService';
import {
  normalizePurchaseTransactionData,
  NormalizedPurchaseTransaction,
} from '../utils/transactionNormalizer';
import { isItemOwnedByUser } from '../utils/ownershipUtils';

export const EscrowPaymentModal: React.FC = () => {
  const {
    isEscrowModalOpen,
    closeEscrowPayment,
    activeEscrowItem,
    createEscrowTransaction,
    userProfile,
    googleUser,
    setIsEscrowListModalOpen,
  } = useApp();

  const isOwnItem = isItemOwnedByUser(activeEscrowItem?.item, userProfile, googleUser);

  const [buyerName, setBuyerName] = useState(userProfile.displayName || '');
  const [buyerPhone, setBuyerPhone] = useState(userProfile.phone || userProfile.whatsapp || '');
  const [buyerEmail, setBuyerEmail] = useState(userProfile.email || 'client.agri@gmail.com');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [destinationCity, setDestinationCity] = useState('Casablanca');
  const [paymentMethod, setPaymentMethod] = useState<'carte_cmi' | 'stripe_card' | 'virement_sequestre'>('carte_cmi');
  const [needLogistics, setNeedLogistics] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const [step, setStep] = useState<'checkout' | 'processing' | 'confirmed'>('checkout');
  const [confirmedTxRef, setConfirmedTxRef] = useState<string>('');

  // Saisie utilisateur de quantité sous forme de chaîne pour permettre d'effacer librement n'importe quel chiffre
  const [quantityInput, setQuantityInput] = useState<string>('1');

  // Synchronisation stricte à l'ouverture de l'article avec la fonction utilitaire de normalisation
  useEffect(() => {
    if (isEscrowModalOpen && activeEscrowItem && activeEscrowItem.item) {
      const initialNorm = normalizePurchaseTransactionData({
        itemType: activeEscrowItem.itemType,
        item: activeEscrowItem.item,
        requestedQuantity: activeEscrowItem.defaultQuantity,
        isProCertified: userProfile.isProCertified,
      });

      setQuantityInput(String(initialNorm.selectedQuantity));
      setStep('checkout');
    }
  }, [isEscrowModalOpen, activeEscrowItem, userProfile.isProCertified]);

  // Calcul normalisé en temps réel : source unique de vérité pour l'affichage, les calculs et la validation
  const normalized: NormalizedPurchaseTransaction | null = useMemo(() => {
    if (!isEscrowModalOpen || !activeEscrowItem || !activeEscrowItem.item) return null;

    const parsedQty = quantityInput.trim() === '' ? 0 : Number(quantityInput);

    return normalizePurchaseTransactionData({
      itemType: activeEscrowItem.itemType,
      item: activeEscrowItem.item,
      requestedQuantity: isNaN(parsedQty) ? 0 : parsedQty,
      isProCertified: userProfile.isProCertified,
    });
  }, [isEscrowModalOpen, activeEscrowItem, quantityInput, userProfile.isProCertified]);

  if (!isEscrowModalOpen || !activeEscrowItem || !activeEscrowItem.item || !normalized) return null;

  const {
    itemType,
    title,
    sellerName,
    sellerPhone,
    unit,
    unitLabel,
    isSurface,
    unitPriceMAD,
    formattedUnitPrice,
    availableQuantity,
    formattedAvailableQuantity,
    selectedQuantity,
    stepIncrement,
    surfaceHectares,
    estimatedYieldPerHaTonnes,
    estimatedYieldForQuantityTonnes,
    financials,
    validation,
    presetQuantities,
  } = normalized;

  const handleQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantityInput(e.target.value);
  };

  const handleQuantityInputBlur = () => {
    const trimmed = quantityInput.trim();
    if (trimmed === '' || isNaN(Number(trimmed)) || Number(trimmed) <= 0) {
      const fallback = Math.min(1, availableQuantity);
      setQuantityInput(String(fallback));
    } else if (Number(trimmed) > availableQuantity) {
      setQuantityInput(String(availableQuantity));
    }
  };

  const handleSetPreset = (targetQty: number) => {
    const clamped = Math.max(0.1, Math.min(availableQuantity, targetQty));
    setQuantityInput(String(clamped));
  };

  const handleAdjustStep = (delta: number) => {
    const current = Number(quantityInput) || 0;
    const nextVal = Math.round((current + delta * stepIncrement) * 10) / 10;
    if (nextVal >= 0.1 && nextVal <= availableQuantity) {
      setQuantityInput(String(nextVal));
    }
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (isOwnItem) {
      setFormError("Opération non autorisée : Vous êtes le propriétaire de ce lot. Un annonceur ne peut jamais acheter ses propres produits.");
      return;
    }

    if (!buyerName || !buyerPhone || !deliveryAddress) {
      setFormError('Veuillez remplir tous les champs de livraison obligatoires.');
      return;
    }

    if (!validation.isValid) {
      setFormError(validation.errorMessage || `Veuillez saisir une quantité valide (entre 0.1 et ${availableQuantity} ${unit}).`);
      return;
    }

    setStep('processing');
    setTimeout(() => {
      const tx = createEscrowTransaction({
        itemType,
        itemId: normalized.itemId,
        itemTitle: title,
        sellerName,
        sellerPhone,
        buyerName,
        buyerPhone,
        buyerEmail,
        deliveryAddress,
        destinationCity,
        quantity: financials.quantity,
        unit,
        unitPriceMAD: financials.unitPriceMAD,
        subtotalAmountMAD: financials.subtotalAmountMAD,
        paymentMethod,
        trackingCarrier: needLogistics ? 'AgriFret Maroc Express' : 'Enlèvement par Acheteur',
        notes: `Commande séquestre protégée. ${needLogistics ? 'Transport express réfrigéré/aéré inclus.' : 'Enlèvement sur site producteur.'}`,
      });
      setConfirmedTxRef(tx.referenceNumber);
      setStep('confirmed');
    }, 1200);
  };

  const MOROCCAN_CITIES = [
    'Casablanca',
    'Rabat',
    'Agadir',
    'Marrakech',
    'Fès',
    'Meknès',
    'Tanger',
    'Kénitra',
    'Berkane',
    'Oujda',
    'Béni Mellal',
    'El Jadida',
    'Larache',
    'Taroudant',
    'Zagora',
    'Errachidia',
    'Dakhla',
  ];

  return (
    <div
      id="escrow-payment-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm overflow-y-auto"
    >
      <div
        id="escrow-payment-modal"
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-stone-900 to-emerald-950 text-white px-6 py-5 flex items-center justify-between border-b border-emerald-800/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold tracking-tight text-white">
                  Paiement Séquestre Sécurisé
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Garantie Anti-Impayés & Non-Conformité
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">
                Fonds consignés et protégés jusqu'à validation physique de livraison
              </p>
            </div>
          </div>
          <button
            id="escrow-modal-close-btn"
            onClick={closeEscrowPayment}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'confirmed' ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-900 mb-2">
                Réf: {confirmedTxRef}
              </span>
              <h4 className="text-2xl font-black text-stone-900">
                Paiement Séquestre Consigné avec Succès !
              </h4>
              <p className="text-stone-600 max-w-lg mx-auto text-sm mt-2">
                Vos fonds de <strong className="text-stone-900">{FinanceService.formatMAD(financials.totalPaidByBuyerMAD)}</strong> sont bloqués en toute sécurité sur le compte séquestre. Le vendeur a été notifié pour préparer et expédier le lot.
              </p>
            </div>

            {/* Escrow Guarantee Box */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 text-left max-w-xl mx-auto space-y-2">
              <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
                <Lock className="w-4 h-4 text-emerald-700" />
                <span>Comment fonctionne le déblocage des fonds ?</span>
              </div>
              <ul className="text-xs text-emerald-800 space-y-1.5 list-disc list-inside">
                <li>Le vendeur expédie la commande via AgriFret ou transport dédié.</li>
                <li>À l'arrivée, vous disposez de <strong>48 heures pour inspecter la conformité</strong> (vigueur des plants, calibre, absence de ravageurs).</li>
                <li>Dès votre validation dans l'application, les fonds sont instantanément reversés au vendeur.</li>
                <li>En cas de non-conformité, vous pouvez ouvrir un litige en 1 clic pour bloquer le versement ou demander un remboursement.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                id="view-escrow-orders-btn"
                onClick={() => {
                  closeEscrowPayment();
                  setIsEscrowListModalOpen(true);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-md flex items-center justify-center space-x-2 transition-all"
              >
                <span>Suivre mes commandes séquestres</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={closeEscrowPayment}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold text-sm transition-all"
              >
                Continuer mes achats
              </button>
            </div>
          </div>
        ) : step === 'processing' ? (
          <div className="p-12 text-center space-y-4">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
            <h4 className="text-lg font-bold text-stone-900">
              Sécurisation et consignation des fonds en cours...
            </h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Chiffrement TLS 256 bits via passerelle bancaire agréée CMI / Stripe. Séquestre fiduciaire actif.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitPayment} className="p-6 space-y-6">
            {/* Warning if owner tries to buy their own product */}
            {isOwnItem && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Auto-achat non autorisé</span>
                </div>
                <p className="text-xs leading-relaxed">
                  Vous êtes identifié comme l'annonceur / propriétaire de ce lot (« {title} »).
                  La réglementation B2B d'AGRISTOCK MAROC interdit formellement à un vendeur ou pépiniériste d'acheter ses propres offres sous séquestre.
                </p>
              </div>
            )}

            {formError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span className="text-xs font-semibold">{formError}</span>
              </div>
            )}

            {/* Guarantee Callout */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex items-start space-x-3">
              <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs text-stone-600 leading-relaxed">
                <strong className="text-stone-900 font-bold block mb-0.5">
                  Sécurité Totale Acheteur & Vendeur :
                </strong>
                L'argent ne quitte pas le séquestre tant que vous n'avez pas réceptionné et inspecté les marchandises. Le vendeur a la certitude absolue de la solvabilité des fonds avant d'expédier.
              </div>
            </div>

            {/* Item & Quantity Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-emerald-50/40 p-4 rounded-xl border border-emerald-200/60">
              <div className="md:col-span-2 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  {itemType === 'nursery_lot'
                    ? 'Lot de Pépinière'
                    : isSurface
                    ? 'Récolte sur Pied (Verger / Parcelle)'
                    : 'Produit Maraîcher'}
                </span>
                <h4 className="text-base font-black text-stone-900 leading-tight">
                  {title}
                </h4>
                <p className="text-xs text-stone-600">
                  Vendeur : <span className="font-semibold text-stone-800">{sellerName}</span> ({sellerPhone})
                </p>
                <p className="text-xs text-stone-700 font-medium">
                  Prix normalisé de l'annonce :{' '}
                  <strong className="text-emerald-800 font-extrabold text-sm">
                    {formattedUnitPrice}
                  </strong>
                </p>

                {isSurface && (
                  <div className="text-[11px] text-emerald-900 bg-white p-2.5 rounded-lg border border-emerald-200/80 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-600">Superficie totale de la parcelle :</span>
                      <strong className="font-black text-emerald-950">{formattedAvailableQuantity}</strong>
                    </div>
                    {estimatedYieldPerHaTonnes && (
                      <div className="flex items-center justify-between text-stone-600">
                        <span>Rendement moyen estimé :</span>
                        <span>~{estimatedYieldPerHaTonnes} T / ha</span>
                      </div>
                    )}
                    {estimatedYieldForQuantityTonnes && (
                      <div className="flex items-center justify-between text-emerald-800 font-bold pt-1 border-t border-stone-100">
                        <span>Rendement estimé pour {selectedQuantity} Ha :</span>
                        <span>~{estimatedYieldForQuantityTonnes} Tonnes</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity Input Box */}
              <div className="space-y-2 bg-white p-3 rounded-xl border border-emerald-200 shadow-sm flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isSurface
                      ? `Superficie commandée (${unit}) :`
                      : `Quantité commandée (${unit}) :`}
                  </label>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handleAdjustStep(-1)}
                      disabled={selectedQuantity <= (isSurface ? 0.5 : 1)}
                      className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 active:bg-stone-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-stone-700 transition cursor-pointer"
                      title="Diminuer d'un pas"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <input
                      id="escrow-quantity-input"
                      type="number"
                      step={stepIncrement}
                      min={isSurface ? 0.1 : 1}
                      max={availableQuantity}
                      value={quantityInput}
                      onChange={handleQuantityInputChange}
                      onBlur={handleQuantityInputBlur}
                      placeholder={isSurface ? 'Ex: 8' : 'Ex: 10'}
                      className={`w-full px-2.5 py-1.5 text-center text-base font-black text-stone-900 border rounded-lg focus:ring-2 focus:outline-hidden transition ${
                        validation.isOverMax
                          ? 'border-rose-500 bg-rose-50 text-rose-900 focus:ring-rose-500'
                          : validation.isZeroOrNegative
                          ? 'border-amber-400 bg-amber-50 focus:ring-amber-500'
                          : 'border-stone-300 focus:ring-emerald-600'
                      }`}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => handleAdjustStep(1)}
                      disabled={selectedQuantity >= availableQuantity}
                      className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 active:bg-stone-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-stone-700 transition cursor-pointer"
                      title="Augmenter d'un pas"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Over-Max Error Banner */}
                {validation.isOverMax && (
                  <div className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[10px] space-y-1">
                    <div className="flex items-center gap-1 font-bold">
                      <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                      <span>Max disponible : {formattedAvailableQuantity}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSetPreset(availableQuantity)}
                      className="w-full text-center underline font-black text-rose-900 hover:text-rose-950 cursor-pointer"
                    >
                      Ajuster au maximum ({formattedAvailableQuantity})
                    </button>
                  </div>
                )}

                {/* Empty or Zero Warning */}
                {validation.isZeroOrNegative && (
                  <div className="text-[10px] text-amber-700 font-semibold text-center">
                    {validation.errorMessage}
                  </div>
                )}

                {/* Available Capacity indicator & Quick Presets */}
                <div>
                  <div className="flex items-center justify-between text-[10px] text-stone-500 mb-1">
                    <span>Disponible :</span>
                    <strong className="text-stone-800 font-mono">
                      {formattedAvailableQuantity}
                    </strong>
                  </div>

                  {/* Preset Pills */}
                  <div className="flex items-center gap-1 pt-1 border-t border-stone-100">
                    {presetQuantities.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleSetPreset(preset.value)}
                        className={`flex-1 py-1 rounded-md text-[10px] font-bold transition cursor-pointer border ${
                          selectedQuantity === preset.value
                            ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                        title={`Définir la quantité sur ${preset.label}`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Buyer Delivery Coordinates */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
                <Truck className="w-4 h-4 text-emerald-700" />
                <span>Coordonnées de Livraison & Réception</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Nom de l'acheteur / Entreprise *
                  </label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="ex: Domaine Agricole Atlas"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Téléphone Réceptionnaire *
                  </label>
                  <input
                    type="tel"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="+212 6..."
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Ville de destination *
                  </label>
                  <select
                    value={destinationCity}
                    onChange={(e) => setDestinationCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden bg-white"
                  >
                    {MOROCCAN_CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Adresse de livraison (Exploitation, Quai, Marché de Gros) *
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="ex: Route Nationale 1, Km 18, Serres Bloc Sud"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  required
                />
              </div>

              <div className="flex items-center space-x-2 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                <input
                  type="checkbox"
                  id="needLogistics"
                  checked={needLogistics}
                  onChange={(e) => setNeedLogistics(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                />
                <label htmlFor="needLogistics" className="text-xs text-stone-700 font-medium cursor-pointer">
                  Confier le transport au réseau agréé <strong>AgriFret Maroc Express</strong> (bâchage aéré / camion frigorifique)
                </label>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <span>Passerelle de Paiement Séquestre</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label
                  onClick={() => setPaymentMethod('carte_cmi')}
                  className={`relative flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'carte_cmi'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-stone-900">Carte CMI Maroc</span>
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-[11px] text-stone-500">
                    Cartes bancaires marocaines (Attijari, BCP, BMCE, CIH...)
                  </span>
                </label>

                <label
                  onClick={() => setPaymentMethod('stripe_card')}
                  className={`relative flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'stripe_card'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-stone-900">Visa / Mastercard / Stripe</span>
                    <Lock className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-[11px] text-stone-500">
                    Paiement international & devises (Séquestre Stripe certifié)
                  </span>
                </label>

                <label
                  onClick={() => setPaymentMethod('virement_sequestre')}
                  className={`relative flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'virement_sequestre'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-stone-900">Virement Séquestre</span>
                    <Building2 className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-[11px] text-stone-500">
                    Idéal pour gros montants {'>'} 20 000 MAD (RIB séquestre dédié)
                  </span>
                </label>
              </div>
            </div>

            {/* Décomposition Financière CMI / ONSSA / AgriStock (FinanceService) */}
            <div className="bg-stone-900 text-white rounded-xl p-4 space-y-3 shadow-md border border-stone-800">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <div>
                  <span className="text-xs text-stone-300 font-semibold block">Marchandise</span>
                  <span className="text-[11px] text-stone-400">
                    {financials.quantity.toLocaleString('fr-FR')} {unitLabel} × {financials.unitPriceMAD.toLocaleString('fr-FR')} MAD/{unitLabel}
                  </span>
                </div>
                <span className="text-sm font-bold text-white">
                  {FinanceService.formatMAD(financials.subtotalAmountMAD)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-300 py-0.5">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Frais séquestre ({(financials.escrowRate * 100).toFixed(1)} %)</span>
                  <span className="text-[10px] text-stone-400 hidden sm:inline">(Protection CMI & agrément ONSSA)</span>
                </div>
                <span className="font-semibold text-emerald-400">
                  +{FinanceService.formatMAD(financials.escrowGuaranteeFeeMAD)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-300 py-0.5 border-b border-stone-800 pb-2">
                <div className="flex items-center space-x-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Commission AgriStock ({(financials.commissionRate * 100).toFixed(1)} %)</span>
                  <span className="text-[10px] text-stone-400 hidden sm:inline">
                    ({userProfile.isProCertified ? 'Tarif PRO' : 'Standard'})
                  </span>
                </div>
                <span className="font-mono text-amber-300 font-semibold">
                  -{FinanceService.formatMAD(financials.platformCommissionMAD)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-xs font-bold text-emerald-300 block">Total payé par l'acheteur</span>
                  <span className="text-[10px] text-stone-400">Consigné sur compte séquestre bloqué</span>
                </div>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {FinanceService.formatMAD(financials.totalPaidByBuyerMAD)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-800/80 text-xs">
                <div>
                  <span className="text-stone-300 font-medium block">Net vendeur</span>
                  <span className="text-[10px] text-stone-500">Versé au producteur après validation physique</span>
                </div>
                <span className="font-mono font-bold text-stone-200">
                  {FinanceService.formatMAD(financials.sellerPayoutAmountMAD)}
                </span>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={closeEscrowPayment}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold cursor-pointer"
              >
                Annuler
              </button>
              <button
                id="submit-escrow-payment-btn"
                type="submit"
                disabled={!validation.isValid || isOwnItem}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center space-x-2 transition-all ${
                  validation.isValid && !isOwnItem
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer active:scale-95'
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                }`}
                title={
                  isOwnItem
                    ? "Action impossible : Vous êtes le propriétaire de ce lot."
                    : !validation.isValid
                    ? validation.errorMessage || `La quantité demandée ne doit pas dépasser ${availableQuantity} ${unit}`
                    : 'Confirmer la consignation des fonds'
                }
              >
                <Lock className="w-4 h-4" />
                <span>
                  {isOwnItem
                    ? 'Auto-achat interdit'
                    : `Bloquer les fonds & Confirmer (${FinanceService.formatMAD(financials.totalPaidByBuyerMAD)})`}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
