import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  Building2,
  CheckCircle2,
  X,
  Package,
  MapPin,
  Truck,
  MessageSquare,
  ArrowRight,
  Plus,
  Minus,
} from 'lucide-react';
import { MOROCCAN_REGIONS } from '../data/mockData';

const CITIES = [
  'Casablanca',
  'Rabat',
  'Agadir',
  'Marrakech',
  'Tanger',
  'Fès',
  'Meknès',
  'Oujda',
  'Kénitra',
  'Tétouan',
  'Béni Mellal',
  'Taroudant',
  'Nador',
  'Larache',
  'El Jadida',
  'Berkane',
];

export const SimpleOrderModal: React.FC = () => {
  const {
    language,
    isSimpleOrderModalOpen,
    closeSimpleOrder,
    simpleOrderItem,
    createEscrowTransaction,
    openOfferDiscussion,
    setActiveTab,
    userProfile,
  } = useApp();

  const [quantity, setQuantity] = useState<number>(1);
  const [city, setCity] = useState<string>('Casablanca');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'carte_cmi' | 'virement_sequestre'>('carte_cmi');
  const [confirmedTx, setConfirmedTx] = useState<{ id: string; referenceNumber: string; totalAmount: number } | null>(null);

  useEffect(() => {
    if (simpleOrderItem) {
      setQuantity(1);
      setConfirmedTx(null);
      setDeliveryAddress(userProfile.address || '');
      setCity(userProfile.region?.split('(')[0].trim() || 'Casablanca');
    }
  }, [simpleOrderItem, userProfile]);

  if (!isSimpleOrderModalOpen || !simpleOrderItem) return null;

  const itemTitle =
    simpleOrderItem.title ||
    (simpleOrderItem.species ? `${simpleOrderItem.species} (${simpleOrderItem.variety})` : 'Produit Agricole');
  const unitPrice =
    simpleOrderItem.pricePerUnitMAD ??
    simpleOrderItem.pricePerUnit ??
    simpleOrderItem.priceMAD ??
    simpleOrderItem.unitPriceMAD ??
    simpleOrderItem.pricePerHectareMAD ??
    0;
  const unit = simpleOrderItem.unit || 'Kg';
  const availableQty = simpleOrderItem.quantityAvailable || simpleOrderItem.surfaceHectares || 100;
  const sellerName = simpleOrderItem.sellerName || 'Exploitant Agricole Vendeur';

  const subtotal = quantity * unitPrice;
  const commission = Math.round(subtotal * 0.05); // 5%
  const totalWithEscrow = subtotal + commission;

  const handleOrder = () => {
    if (!deliveryAddress.trim()) {
      alert(tr(language, 'Veuillez saisir votre adresse de livraison.', 'يرجى إدخال عنوان التوصيل.', 'Please enter delivery address.'));
      return;
    }

    const itemType = simpleOrderItem.species
      ? 'nursery_lot'
      : simpleOrderItem.surfaceHectares
      ? 'farm_standing'
      : 'produce';

    const tx = createEscrowTransaction({
      itemType,
      itemId: simpleOrderItem.id,
      itemTitle,
      sellerName,
      sellerPhone: simpleOrderItem.sellerPhone || '+212600000000',
      buyerName: userProfile.displayName || 'Acheteur AGRIStock',
      buyerPhone: userProfile.phone || '+212611223344',
      buyerEmail: userProfile.email || 'acheteur@agristock.ma',
      deliveryAddress,
      destinationCity: city,
      quantity,
      unit,
      unitPriceMAD: unitPrice,
      paymentMethod,
      notes: `Commande simplifiée directe depuis le Marché Acheteur`,
    });

    setConfirmedTx({
      id: tx.id,
      referenceNumber: tx.referenceNumber || `#ESC-2026-MA-${tx.id.slice(-4).toUpperCase()}`,
      totalAmount: totalWithEscrow,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden my-auto">
        {/* Header Modale */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-4 sm:p-5 relative">
          <button
            type="button"
            onClick={closeSimpleOrder}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>PAIEMENT SÉQUÉSTRE CMI 100% GARANTI</span>
          </div>

          <h2 className="text-lg font-black tracking-tight text-white">
            {confirmedTx
              ? tr(language, 'Commande confirmée avec succès !', 'تم تأكيد طلبك بنجاح !', 'Order successfully confirmed !')
              : tr(language, 'Commander en direct', 'طلب فوري مباشر', 'Direct Order')}
          </h2>
          <p className="text-xs text-emerald-100/90 mt-0.5">
            {confirmedTx
              ? tr(language, 'Fonds consignés jusqu’à votre inspection de conformité', 'الأموال محفوظة حتى فحص الجودة والتسليم', 'Funds held until quality inspection')
              : tr(language, 'Vos fonds restent consignés jusqu’à réception conforme.', 'أموالك محمية بحساب بنكي وسيط حتى الاستلام.', 'Your funds remain protected until delivery.')}
          </p>
        </div>

        {/* Contenu selon étape */}
        {confirmedTx ? (
          <div className="p-5 sm:p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-mono font-black">
                {confirmedTx.referenceNumber}
              </span>
              <h3 className="text-base font-bold text-stone-900 mt-2">
                {tr(language, 'Commande transmise au vendeur !', 'تم إرسال الطلب إلى الفلاح البائع !', 'Order sent to seller !')}
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                {tr(
                  language,
                  `Montant séquestré : ${confirmedTx.totalAmount.toLocaleString('fr-FR')} MAD. Le vendeur prépare votre livraison à destination de ${city}.`,
                  `المبلغ المحجوز: ${confirmedTx.totalAmount.toLocaleString('fr-FR')} درهم. البائع يجهز الشحنة الآن متوجهة إلى ${city}.`,
                  `Escrow amount: ${confirmedTx.totalAmount.toLocaleString('fr-FR')} MAD. Seller is preparing delivery to ${city}.`
                )}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-left text-xs space-y-1.5">
              <div className="flex justify-between text-stone-600">
                <span>Article commandé :</span>
                <strong className="text-stone-900">{itemTitle}</strong>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Quantité :</span>
                <strong>{quantity} {unit}</strong>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Destination :</span>
                <strong>{city} ({deliveryAddress})</strong>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  closeSimpleOrder();
                  openOfferDiscussion(simpleOrderItem.id, 'produce', simpleOrderItem);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{tr(language, 'Discuter avec le vendeur', 'مراسلة البائع', 'Chat with seller')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  closeSimpleOrder();
                  setActiveTab('orders');
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Package className="w-4 h-4" />
                <span>{tr(language, 'Suivre mes commandes', 'تتبع طلبياتي', 'Track my orders')}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6 space-y-4">
            {/* Aperçu produit */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-stone-200 overflow-hidden shrink-0">
                <img
                  src={
                    simpleOrderItem.imageUrl ||
                    simpleOrderItem.images?.[0] ||
                    'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=300&q=80'
                  }
                  alt={itemTitle}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xs sm:text-sm text-stone-900 truncate">{itemTitle}</h3>
                <p className="text-[11px] text-stone-500">
                  Vendeur : <strong className="text-emerald-800">{sellerName}</strong>
                </p>
                <div className="text-xs font-black text-stone-900 mt-0.5">
                  {unitPrice.toLocaleString('fr-FR')} MAD <span className="text-[10px] text-stone-500 font-normal">/ {unit}</span>
                </div>
              </div>
            </div>

            {/* Champ 1 : Quantité */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-800">
                  {tr(language, '1. Quantité souhaitée', '1. الكمية المطلوبة', '1. Desired Quantity')}
                </label>
                <span className="text-[11px] text-stone-500">
                  Disponible : <strong className="text-stone-900">{availableQty} {unit}</strong>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center font-bold text-base transition cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="number"
                    min={1}
                    max={availableQty}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(availableQty, Number(e.target.value) || 1)))}
                    className="w-full py-2.5 px-3 text-center text-base font-black rounded-xl border border-stone-300 text-stone-900 bg-white focus:ring-2 focus:ring-emerald-600"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                    {unit}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(availableQty, q + 1))}
                  className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center font-bold text-base transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Champ 2 : Ville & Adresse de livraison */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800 block">
                {tr(language, '2. Destination & Adresse de livraison', '2. وجهة وعنوان التسليم', '2. Delivery Destination & Address')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-xs font-medium text-stone-900"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      📍 {c}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Quartier, entrepôt ou marché de gros..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 placeholder-stone-400 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Champ 3 : Mode de paiement */}
            <div>
              <label className="text-xs font-bold text-stone-800 mb-1.5 block">
                {tr(language, '3. Mode de règlement sécurisé', '3. طريقة الأداء المضمونة', '3. Escrow Payment Method')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('carte_cmi')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    paymentMethod === 'carte_cmi'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-1 ring-emerald-600 font-bold'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                    <span className="text-[10px] text-emerald-700 font-black">CMI B2B</span>
                  </div>
                  <div className="text-xs">Carte Bancaire CMI</div>
                  <div className="text-[10px] opacity-75 font-normal">Validation instantanée</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('virement_sequestre')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    paymentMethod === 'virement_sequestre'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-1 ring-emerald-600 font-bold'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Building2 className="w-4 h-4 text-blue-700" />
                    <span className="text-[10px] text-blue-700 font-black">RIB</span>
                  </div>
                  <div className="text-xs">Virement Séquestre</div>
                  <div className="text-[10px] opacity-75 font-normal">Banque Al-Maghrib</div>
                </button>
              </div>
            </div>

            {/* Récapitulatif Total */}
            <div className="p-3.5 rounded-2xl bg-stone-900 text-white space-y-1">
              <div className="flex justify-between text-xs text-stone-300">
                <span>Sous-total produit ({quantity} {unit}) :</span>
                <span>{subtotal.toLocaleString('fr-FR')} MAD</span>
              </div>
              <div className="flex justify-between text-[11px] text-emerald-400">
                <span>Frais séquestre CMI & garantie conformité (5%) :</span>
                <span>+{commission.toLocaleString('fr-FR')} MAD</span>
              </div>
              <div className="flex justify-between text-sm font-black pt-1.5 border-t border-stone-700 text-white">
                <span>Total consigné sous séquestre :</span>
                <span className="text-emerald-300 text-base">{totalWithEscrow.toLocaleString('fr-FR')} MAD</span>
              </div>
            </div>

            {/* Bouton de confirmation */}
            <button
              type="button"
              onClick={handleOrder}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{tr(language, 'COMMANDER SOUS SÉQUESTRE GARANTI', 'تأكيد الطلب مع الحساب الضامن', 'CONFIRM ORDER WITH ESCROW')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
