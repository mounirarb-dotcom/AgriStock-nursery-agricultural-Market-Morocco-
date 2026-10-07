import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import { SmartImage } from './SmartImage';
import {
  ShieldCheck,
  MapPin,
  Scale,
  Sparkles,
  Phone,
  MessageCircle,
  ShoppingCart,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Eye,
  Award,
} from 'lucide-react';
import { ProduceListing, NurseryLot } from '../types';
import { isItemOwnedByUser } from '../utils/ownershipUtils';

export interface ProductCardProps {
  item: ProduceListing | (NurseryLot & { type?: 'nursery' });
  onViewDetails?: (item: any) => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  item,
  onViewDetails,
  className = '',
}) => {
  const {
    language,
    userProfile,
    googleUser,
    openEscrowPayment,
    openDiscussion,
    setActiveTab,
    navigateToProduceCategory,
    navigateToNurseryDepartment,
  } = useApp();

  const [isHovered, setIsHovered] = useState(false);

  // Vérifier si l'article appartient à l'utilisateur connecté (règle stricte: pas d'auto-achat)
  const isOwnItem = isItemOwnedByUser(item, userProfile, googleUser);

  // Déterminer s'il s'agit d'un lot pépinière ou d'une annonce récolte
  const isNursery = 'species' in item;

  // Normalisation des données communes
  const id = item.id;
  const title = isNursery
    ? `${(item as NurseryLot).species} - ${(item as NurseryLot).variety}`
    : (item as ProduceListing).title;
  const category = item.category;
  const variety = item.variety;
  const region = item.region;
  const availableQty = item.quantityAvailable;
  const unit = isNursery ? tr(language, 'plants', 'شتلة', 'plants') : (item as ProduceListing).unit || 'T';
  const price = isNursery ? (item as NurseryLot).unitPriceMAD : (item as ProduceListing).pricePerUnitMAD;
  const seller = item.sellerName || tr(language, 'Producteur Partenaire', 'منتج شريك', 'Partner Grower');
  const phone = isNursery ? (item as NurseryLot).sellerPhone : (item as ProduceListing).phone;
  const whatsapp = isNursery ? (item as NurseryLot).sellerPhone : ((item as ProduceListing).whatsapp || phone);
  const imageUrl = item.imageUrl;
  const isCertifiedONSSA = isNursery
    ? Boolean((item as NurseryLot).onssaStatus?.includes('ONSSA'))
    : Boolean((item as ProduceListing).certifications?.some(c => c.includes('ONSSA')));
  const isGlobalGap = !isNursery && (item as ProduceListing).certifications?.includes('GlobalG.A.P');
  const isBioMaroc = !isNursery && (item as ProduceListing).certifications?.includes('Bio Maroc');
  const isAgriForex = !isNursery && (item as ProduceListing).verifiedAgriForex;
  const isLivestock = category === 'Élevage & Bétail';

  // Formatage du prix en MAD
  const formattedPrice = Number(price || 0).toLocaleString('fr-FR', {
    minimumFractionDigits: isNursery ? 2 : 0,
    maximumFractionDigits: 2,
  });

  const handleOrderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOwnItem) return;
    if (isNursery) {
      openEscrowPayment('nursery_lot', item as NurseryLot, Math.min(200, availableQty));
    } else {
      openEscrowPayment('produce_listing', item as ProduceListing, Math.min(5, availableQty));
    }
  };

  const handleNegotiateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOwnItem) return;
    openDiscussion(
      id,
      title,
      isNursery ? 'nursery' : 'produce',
      seller,
      phone
    );
  };

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(item);
    } else if (isNursery) {
      setActiveTab('nursery');
    } else {
      setActiveTab('market');
    }
  };

  return (
    <article
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex flex-col justify-between bg-white rounded-2xl border border-stone-200 hover:border-emerald-500/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden cursor-pointer ${className}`}
    >
      {/* Zone Image avec ratio 16:10 */}
      <div className="relative w-full aspect-16/10 bg-stone-100 overflow-hidden">
        <SmartImage
          src={imageUrl}
          alt={title}
          category={category}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient subtil en overlay bas */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-black/20 pointer-events-none" />

        {/* Labels supérieurs */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none gap-2">
          {/* Badge secteur */}
          <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md bg-stone-900/80 text-white backdrop-blur-xs shadow-xs">
            {isNursery
              ? tr(language, 'Pépinière', 'مشتل', 'Nursery')
              : isLivestock
              ? tr(language, 'Élevage', 'مواشي', 'Livestock')
              : category || tr(language, 'Agricole', 'فلاحي', 'Agricultural')}
          </span>

          {/* Certifications ONSSA / AgriForex */}
          <div className="flex items-center gap-1">
            {isCertifiedONSSA && (
              <span
                className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-xs backdrop-blur-xs"
                title={tr(language, 'Agrément ONSSA vérifié', 'اعتماد أونسا رسمي', 'ONSSA Approved')}
              >
                <ShieldCheck className="w-3 h-3" />
                <span>ONSSA</span>
              </span>
            )}
            {isBioMaroc && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-700 text-white shadow-xs">
                Bio
              </span>
            )}
            {isGlobalGap && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-sky-700 text-white shadow-xs">
                GAP
              </span>
            )}
          </div>
        </div>

        {/* Informations incrustées en bas de photo */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px] font-medium pointer-events-none">
          <div className="flex items-center gap-1 drop-shadow-sm truncate max-w-[70%]">
            <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">
              {!isNursery && (item as ProduceListing).locationCity
                ? `${(item as ProduceListing).locationCity}, `
                : ''}
              {region ? region.split('(')[0].trim() : 'Maroc'}
            </span>
          </div>

          <div className="flex items-center gap-1 font-bold text-emerald-300 drop-shadow-sm">
            <Scale className="w-3 h-3 shrink-0" />
            <span>
              {availableQty.toLocaleString('fr-FR')} {unit}
            </span>
          </div>
        </div>
      </div>

      {/* Contenu textuel */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Métadonnées calmes sans pilule */}
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium mb-1 truncate">
            <span>{variety || category}</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="truncate">{seller}</span>
          </div>

          {/* Titre produit */}
          <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
            {title}
          </h3>

          {/* Spécificités du lot */}
          <div className="mt-2 flex flex-wrap items-center gap-y-1 gap-x-2 text-[11px] text-stone-600">
            {isNursery ? (
              <>
                {(item as NurseryLot).containerType && (
                  <span className="text-stone-600">{(item as NurseryLot).containerType}</span>
                )}
                {(item as NurseryLot).stage && (
                  <>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span className="text-emerald-700 font-medium">{(item as NurseryLot).stage}</span>
                  </>
                )}
              </>
            ) : (
              <>
                {(item as ProduceListing).calibre && (
                  <span>{(item as ProduceListing).calibre}</span>
                )}
                {(item as ProduceListing).packaging && (
                  <>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span className="text-stone-500 truncate max-w-[140px]">{(item as ProduceListing).packaging}</span>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Prix & Actions E-commerce */}
        <div className="pt-3 border-t border-stone-100 space-y-2.5">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs text-stone-400 block font-medium">
                {isNursery
                  ? tr(language, 'Prix unitaire HT', 'السعر للشتلة', 'Unit price')
                  : (item as ProduceListing).priceType || tr(language, 'Prix départ ferme', 'سعر الضيعة', 'Farm-gate price')}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
                  {formattedPrice}
                </span>
                <span className="text-xs font-bold text-emerald-800">
                  MAD / {unit}
                </span>
              </div>
            </div>

            {/* Badge de paiement garanti ou Propriétaire */}
            {isOwnItem ? (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-1 rounded-md border border-amber-300"
                title={tr(language, 'Vous êtes le propriétaire de ce lot', 'أنت صاحب هذا العرض', 'You own this listing')}
              >
                <span>{tr(language, 'Mon Annonce', 'إعلاني', 'My Listing')}</span>
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md"
                title={tr(language, 'Transaction protégée par compte séquestre CMI', 'معاملة محمية بحساب بنكي وسيط', 'Protected via escrow')}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Séquestre</span>
              </span>
            )}
          </div>

          {/* Boutons d'interaction ou Gestion du lot */}
          {isOwnItem ? (
            <div className="pt-1">
              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/90 border border-amber-200/90 text-amber-900">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[11px] font-extrabold">{tr(language, 'Votre propre produit', 'منتجك الخاص (معلن)', 'Your own product')}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isNursery) {
                      setActiveTab('nursery_space');
                    } else {
                      setActiveTab('seller_space');
                    }
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-lg transition shadow-xs cursor-pointer"
                >
                  {tr(language, 'Gérer / Modifier', 'تعديل / إدارة', 'Manage')}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleNegotiateClick}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-stone-700 hover:text-emerald-800 text-xs font-bold transition active:scale-95 cursor-pointer"
                title={tr(language, 'Contacter le producteur et négocier', 'التواصل مع المنتج والتفاوض', 'Contact grower')}
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>{tr(language, 'Discuter', 'تفاوض', 'Chat')}</span>
              </button>

              <button
                type="button"
                onClick={handleOrderClick}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs hover:shadow-md transition active:scale-95 cursor-pointer"
                title={tr(language, 'Commander avec séquestre bancaire garanti', 'طلب مؤمن بالحساب البنكي الوسيط', 'Order with escrow')}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{tr(language, 'Commander', 'طلب', 'Order')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
