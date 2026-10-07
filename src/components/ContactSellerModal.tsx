import React from 'react';
import { sanitizeUrl } from '../utils/securityUtils';
import { ProduceListing } from '../types';
import { useApp } from '../context/AppContext';
import { isItemOwnedByUser } from '../utils/ownershipUtils';
import { StarRating } from './StarRating';
import {
  MessageSquare,
  Phone,
  MapPin,
  ShieldCheck,
  X,
  Lock,
  Star,
  ExternalLink,
  Mail,
  Award,
} from 'lucide-react';

interface Props {
  listing: ProduceListing;
  onClose: () => void;
}

export const ContactSellerModal: React.FC<Props> = ({ listing, onClose }) => {
  const {
    setActiveTab,
    openComposeModal,
    platformPaymentProtected,
    maskUserPhone,
    openOfferDiscussion,
    openRatingModal,
    openEscrowPayment,
    userProfile,
    googleUser,
  } = useApp();

  const isOwnListing = isItemOwnedByUser(listing, userProfile, googleUser);

  const handleOpenDiscussion = () => {
    onClose();
    openOfferDiscussion(listing.id, 'produce', listing);
  };

  // Construct clean Moroccan WhatsApp message
  const whatsappNumber = listing.whatsapp.replace(/\D/g, '');
  const priceDisplayString = `${listing.pricePerUnitMAD.toLocaleString('fr-FR')} MAD / ${listing.unit}${
    listing.unit === 'Tonnes' ? ` (soit ${(listing.pricePerUnitMAD / 1000).toFixed(2)} MAD/kg)` : ''
  }`;
  const messageText = encodeURIComponent(
    `Salam alaykoum / Bonjour,\nJe vous contacte via la plateforme AgriStock Maroc au sujet de votre lot :\n` +
      `🌿 Produit : ${listing.title} (${listing.variety})\n` +
      `📦 Volume disponible : ${listing.quantityAvailable} ${listing.unit}\n` +
      `💰 Prix affiché : ${priceDisplayString} (${listing.priceType})\n` +
      `📍 Région : ${listing.region} (${listing.locationCity})\n` +
      `Je souhaiterais obtenir plus de détails et convenir des modalités de livraison / visite sur exploitation. Merci !`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${messageText}`;

  const handleContactGmail = () => {
    const defaultSellerEmail = `${listing.sellerName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '.')}@agrimaroc.ma`;

    const emailSubject = `Devis / Contact Achat — ${listing.title} (${listing.quantityAvailable} ${listing.unit})`;
    const emailBody =
      `Salam alaykoum / Bonjour ${listing.sellerName},\n\n` +
      `Je vous contacte via la plateforme AgriStock Maroc concernant votre annonce :\n` +
      `- Produit : ${listing.title} (${listing.variety})\n` +
      `- Région : ${listing.region} (${listing.locationCity})\n` +
      `- Quantité : ${listing.quantityAvailable} ${listing.unit}\n` +
      `- Prix affiché : ${priceDisplayString} (${listing.priceType})\n\n` +
      `Je serais intéressé par un volume de commande et souhaiterais convenir des modalités d'expédition ou de visite sur champ.\n\n` +
      `Dans l'attente de votre retour,\nBien cordialement.`;

    onClose();
    setActiveTab('gmail');
    openComposeModal({
      to: defaultSellerEmail,
      subject: emailSubject,
      body: emailBody,
      sourceContext: `Annonce : ${listing.title}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">
              {platformPaymentProtected
                ? 'Discussion & Séquestre Sécurisé'
                : 'Mise en relation directe (Maroc)'}
            </span>
            <h3 className="text-base font-bold text-stone-900">
              {platformPaymentProtected
                ? 'Espace de Négociation & Paiement'
                : 'Contacter le Producteur / Vendeur'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Listing Snapshot */}
        <div className="mt-4 p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center gap-3">
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
          />
          <div className="text-xs">
            <h4 className="font-bold text-stone-900 leading-snug">{listing.title}</h4>
            <p className="text-stone-500">{listing.variety}</p>
            <p className="font-bold text-emerald-800 mt-1">
              {listing.pricePerUnitMAD.toLocaleString('fr-FR')} MAD / {listing.unit}{' '}
              {listing.unit === 'Tonnes' && (
                <span className="text-[11px] font-semibold text-emerald-700">
                  (soit {(listing.pricePerUnitMAD / 1000).toFixed(2)} MAD/kg){' '}
                </span>
              )}
              <span className="font-normal text-stone-500 text-[10px]">({listing.priceType})</span>
            </p>
          </div>
        </div>

        {/* Seller Info & Star Rating */}
        <div className="mt-4 space-y-2 text-xs">
          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-stone-400 block uppercase font-bold">
                Exploitant / Vendeur
              </span>
              <p className="font-bold text-stone-900 text-sm">{listing.sellerName}</p>
              <div className="mt-1 flex items-center gap-2">
                <StarRating
                  rating={listing.rating || 4.8}
                  reviewsCount={listing.reviewsCount || 12}
                  size="sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openRatingModal(listing.sellerName, listing.title, listing.id);
                  }}
                  className="text-[10px] text-emerald-700 font-bold hover:underline"
                >
                  Voir avis / Noter
                </button>
              </div>
            </div>
            <div className="text-right text-stone-600 flex items-center gap-1 text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span>{listing.locationCity}</span>
            </div>
          </div>
        </div>

        {/* Coordonnées & Protection Anti-Court-circuitage */}
        {platformPaymentProtected ? (
          <div className="mt-4 space-y-3">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs">
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900">
                    Coordonnées directes masquées pour votre sécurité
                  </p>
                  <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                    Pour garantir les paiements et éviter les litiges ou impayés, les transactions
                    et échanges se font via l'espace de discussion de la plateforme. L'argent est bloqué
                    sous séquestre bancaire et reversé au vendeur après livraison conforme.
                  </p>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-amber-200 flex items-center justify-between text-[11px] text-amber-800">
                <span>Téléphone : <strong className="font-mono">{maskUserPhone(listing.phone)}</strong></span>
                <span className="text-[10px] bg-amber-200/60 px-2 py-0.5 rounded font-semibold">Protégé</span>
              </div>
            </div>

            {/* Si c'est sa propre annonce, afficher message explicite et bouton de gestion */}
            {isOwnListing ? (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-center space-y-2">
                <p className="text-xs font-bold">
                  Vous êtes l'annonceur / propriétaire de cette offre.
                </p>
                <p className="text-[11px] text-amber-800">
                  La réglementation interdit à un annonceur d'acheter ou de négocier ses propres articles.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setActiveTab('seller_space');
                  }}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer"
                >
                  Accéder à mon espace Vendeur
                </button>
              </div>
            ) : (
              <>
                {/* Action 1: Espace de Discussion */}
                <button
                  type="button"
                  id={`btn-open-offer-discussion-${listing.id}`}
                  onClick={handleOpenDiscussion}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>Ouvrir l'Espace de Discussion & Négocier</span>
                </button>

                {/* Action 2: Payer sous Séquestre */}
                <button
                  type="button"
                  id={`btn-contact-escrow-${listing.id}`}
                  onClick={() => {
                    onClose();
                    openEscrowPayment(
                      'produce_listing',
                      listing,
                      Math.max(1, Math.min(5, listing.quantityAvailable))
                    );
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Acheter avec Paiement Séquestre Garanti</span>
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-2.5">
            {/* WhatsApp Action */}
            <a
              href={sanitizeUrl(whatsappUrl, '#')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-md transition"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Discuter directement sur WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            {/* Espace de Discussion interne */}
            <button
              type="button"
              onClick={handleOpenDiscussion}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Discuter dans l'App (Espace Négociation)</span>
            </button>

            {/* Direct Phone Call */}
            <a
              href={`tel:${listing.phone.replace(/[^\d+]/g, '')}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-sm transition"
            >
              <Phone className="w-4 h-4" />
              <span>Appeler le {listing.phone}</span>
            </a>
          </div>
        )}

        <p className="mt-4 text-[10px] text-stone-400 text-center leading-relaxed">
          {platformPaymentProtected
            ? 'Plateforme sécurisée AgriStock Maroc : Commission transparente (3% à 8%) prélevée lors du déblocage des fonds.'
            : 'Transaction directe de gré à gré entre producteur et acheteur. Prix sortie de champ en Dirham marocain (MAD).'}
        </p>
      </div>
    </div>
  );
};
