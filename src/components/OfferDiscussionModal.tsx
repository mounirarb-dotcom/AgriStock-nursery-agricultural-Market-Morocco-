import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { StarRating } from './StarRating';
import {
  X,
  Send,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  MessageSquare,
  Sparkles,
  Tag,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { filterChatMessage } from '../data/reviewsAndDiscussionsData';
import { isItemOwnedByUser } from '../utils/ownershipUtils';

export const OfferDiscussionModal: React.FC = () => {
  const {
    activeDiscussionOffer,
    closeOfferDiscussion,
    discussions,
    sendOfferMessage,
    acceptPriceOffer,
    userProfile,
    googleUser,
    openEscrowPayment,
    openRatingModal,
    platformPaymentProtected,
  } = useApp();

  const isOwnOffer = isItemOwnedByUser(activeDiscussionOffer?.offer, userProfile, googleUser);

  const [messageText, setMessageText] = useState('');
  const [showPriceOfferBox, setShowPriceOfferBox] = useState(false);
  const [proposedPrice, setProposedPrice] = useState<number>(0);
  const [proposedQuantity, setProposedQuantity] = useState<number>(1);
  const [maskedWarningVisible, setMaskedWarningVisible] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const thread = activeDiscussionOffer
    ? discussions[activeDiscussionOffer.offerId]
    : null;

  // Initialize price proposal default
  useEffect(() => {
    if (activeDiscussionOffer?.offer) {
      const p =
        activeDiscussionOffer.offer.pricePerUnitMAD ||
        activeDiscussionOffer.offer.unitPriceMAD ||
        activeDiscussionOffer.offer.pricePerHectareMAD ||
        10;
      setProposedPrice(p);
      setProposedQuantity(
        activeDiscussionOffer.offer.minOrderQuantity || 1
      );
    }
    setMaskedWarningVisible(false);
  }, [activeDiscussionOffer]);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    if (thread?.messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [thread?.messages]);

  if (!activeDiscussionOffer) return null;

  const { offerId, offerType, offer } = activeDiscussionOffer;
  const sellerName =
    offer.sellerName || 'Producteur Agricole Certifié';
  const sellerRating = offer.rating || 4.9;
  const reviewsCount = offer.reviewsCount || 28;
  const itemTitle =
    offer.title ||
    `${offer.species || 'Lot'} - ${offer.variety || 'Sélection'}`;
  const price =
    offer.pricePerUnitMAD ||
    offer.unitPriceMAD ||
    offer.pricePerHectareMAD ||
    0;
  const unit =
    offer.unit ||
    (offer.surfaceHectares ? 'Ha' : 'Unité / Plant');

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim()) return;

    // Check if platform payment protection masks direct phone or email
    const { hasMaskedContent } = filterChatMessage(messageText);
    if (platformPaymentProtected && hasMaskedContent) {
      setMaskedWarningVisible(true);
    } else {
      setMaskedWarningVisible(false);
    }

    sendOfferMessage(offerId, messageText, {
      messageType: 'text',
    });
    setMessageText('');
  };

  const handleSendPriceOffer = () => {
    if (proposedPrice <= 0 || proposedQuantity <= 0) return;

    sendOfferMessage(
      offerId,
      `Proposition d'achat : ${proposedPrice} MAD/${unit} pour un volume de ${proposedQuantity} ${unit}. Paiement garanti sous séquestre bancaire.`,
      {
        messageType: 'price_offer',
        proposedPriceMAD: proposedPrice,
        proposedQuantity: proposedQuantity,
      }
    );
    setShowPriceOfferBox(false);
  };

  const handleQuickChip = (text: string) => {
    setMessageText(text);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      id="modal-offer-discussion"
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header with Offer info & Anti-disintermediation Shield */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-stone-900 via-emerald-950 to-stone-900 text-white flex flex-col gap-2 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {offer.imageUrl && (
                <img
                  src={offer.imageUrl}
                  alt={itemTitle}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-white/20 shrink-0"
                />
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Discussion Sécurisée
                  </span>
                  <span className="text-xs font-semibold text-stone-300">
                    {price} MAD / {unit}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-white line-clamp-1">
                  {itemTitle}
                </h3>
                <div className="flex items-center gap-2 text-xs text-stone-300 flex-wrap">
                  <span className="font-semibold text-emerald-200">
                    {sellerName}
                  </span>
                  <StarRating
                    rating={sellerRating}
                    totalReviews={reviewsCount}
                    size="xs"
                    showBadge={true}
                    onClick={() =>
                      openRatingModal(sellerName, itemTitle, offerId)
                    }
                  />
                </div>
              </div>
            </div>

            <button
              onClick={closeOfferDiscussion}
              className="p-1.5 sm:p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Guarantee / Anti-Circumvention Banner */}
          <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-emerald-900/60 border border-emerald-500/30 text-[11px] text-emerald-200">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Coordonnées protégées :</strong> Échangez ici pour
                bloquer le paiement sous séquestre CMI / Stripe à la livraison.
              </span>
            </div>
            {!isOwnOffer ? (
              <button
                onClick={() => {
                  closeOfferDiscussion();
                  openEscrowPayment(
                    offerType === 'nursery'
                      ? 'nursery_lot'
                      : offerType === 'farm_standing'
                      ? 'farm_standing'
                      : 'produce',
                    offer,
                    proposedQuantity || 1
                  );
                }}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-xs flex items-center gap-1 transition"
              >
                <CreditCard className="w-3 h-3" />
                <span>Payer Séquestre</span>
              </button>
            ) : (
              <span className="shrink-0 px-2.5 py-1 rounded-lg bg-stone-800 text-stone-300 font-semibold text-[11px] border border-stone-700">
                Votre annonce (Vendeur)
              </span>
            )}
          </div>
        </div>

        {/* Warning if phone/email was detected & masked */}
        {maskedWarningVisible && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-xs text-amber-800 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Sécurité Séquestre :</strong> Les numéros de téléphone et
              emails directs sont masqués pour votre protection et garantir le
              déblocage bancaire officiel.
            </span>
          </div>
        )}

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FBFBF9]">
          {/* Introductory system card */}
          <div className="text-center py-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-200/80 text-stone-600 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Historique des négociations et traçabilité de l'offre
            </span>
          </div>

          {thread?.messages && thread.messages.length > 0 ? (
            thread.messages.map((msg) => {
              const isMe = msg.senderRole === userProfile.role;
              const isSystem = msg.senderRole === 'system' || msg.messageType === 'escrow_prompt';

              if (isSystem) {
                return (
                  <div
                    key={msg.id}
                    className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2 shadow-xs"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium leading-relaxed">{msg.content}</p>
                      <span className="text-[10px] text-emerald-700 font-mono mt-1 block">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isMe ? 'items-end' : 'items-start'
                  } space-y-1`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-500 px-1">
                    <span className="font-bold text-stone-700">
                      {msg.senderName}
                    </span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Price Offer Card inside chat */}
                  {msg.messageType === 'price_offer' ? (
                    <div
                      className={`p-3.5 rounded-2xl max-w-sm border shadow-xs ${
                        isMe
                          ? 'bg-emerald-900 text-white border-emerald-800'
                          : 'bg-white text-stone-900 border-amber-300 ring-2 ring-amber-100'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-1">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Offre de Prix Formelle</span>
                      </div>
                      <div className="text-base font-black">
                        {msg.proposedPriceMAD} MAD / {unit}
                      </div>
                      <div className="text-xs opacity-90 mb-2">
                        Quantité : {msg.proposedQuantity} {unit} (Total :{' '}
                        {(
                          (msg.proposedPriceMAD || 0) *
                          (msg.proposedQuantity || 1)
                        ).toLocaleString()}{' '}
                        MAD)
                      </div>

                      <p className="text-xs opacity-80 mb-3">{msg.content}</p>

                      {!isMe && msg.offerStatus === 'pending' && (
                        <div className="flex items-center gap-2 pt-2 border-t border-stone-200">
                          <button
                            onClick={() =>
                              acceptPriceOffer(offerId, msg.id)
                            }
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Accepter l'offre
                          </button>
                          <button
                            onClick={() => {
                              closeOfferDiscussion();
                              openEscrowPayment(
                                offerType === 'nursery'
                                  ? 'nursery_lot'
                                  : offerType === 'farm_standing'
                                  ? 'farm_standing'
                                  : 'produce',
                                {
                                  ...offer,
                                  pricePerUnitMAD: msg.proposedPriceMAD,
                                },
                                msg.proposedQuantity
                              );
                            }}
                            className="py-1.5 px-2.5 rounded-lg bg-stone-900 hover:bg-black text-white text-xs font-bold transition flex items-center justify-center gap-1"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                            Payer
                          </button>
                        </div>
                      )}

                      {msg.offerStatus === 'accepted' && (
                        <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3" /> Offre acceptée
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Regular Text Bubble */
                    <div
                      className={`p-3 rounded-2xl max-w-sm sm:max-w-md text-xs sm:text-sm leading-relaxed ${
                        isMe
                          ? 'bg-emerald-800 text-white rounded-br-xs shadow-xs'
                          : 'bg-white text-stone-800 border border-stone-200 rounded-bl-xs shadow-xs'
                      }`}
                    >
                      {msg.content}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-stone-500 text-xs">
              Aucun message pour l'instant. Démarrez la discussion pour
              négocier le prix ou demander des précisions.
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Interactive Price Offer Drawer */}
        {showPriceOfferBox && (
          <div className="p-3 bg-amber-50/90 border-t border-amber-200 animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1 text-xs font-bold text-amber-900">
                <Tag className="w-3.5 h-3.5 text-amber-700" />
                <span>
                  {offer.listingIntent === 'buy'
                    ? "Formulaire de Proposition de Fourniture (Sous Séquestre)"
                    : "Formulaire d'Offre de Prix (Sous Séquestre)"}
                </span>
              </div>
              <button
                onClick={() => setShowPriceOfferBox(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-stone-600 text-[11px] font-semibold mb-1">
                  {offer.listingIntent === 'buy' ? 'Prix Proposé Fournisseur' : 'Prix Proposé'} (MAD / {unit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={proposedPrice}
                  onChange={(e) => setProposedPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white font-bold text-stone-900 text-xs focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>
              <div>
                <label className="block text-stone-600 text-[11px] font-semibold mb-1">
                  Volume Proposé ({unit})
                </label>
                <input
                  type="number"
                  value={proposedQuantity}
                  onChange={(e) => setProposedQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white font-bold text-stone-900 text-xs focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[11px] text-amber-800 font-semibold">
                Total estimé :{' '}
                <strong>
                  {(proposedPrice * proposedQuantity).toLocaleString()} MAD
                </strong>
              </span>
              <button
                onClick={handleSendPriceOffer}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition"
              >
                {offer.listingIntent === 'buy' ? "Envoyer l'Offre à l'Acheteur" : "Envoyer l'Offre au Vendeur"}
              </button>
            </div>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-2 bg-stone-100/90 border-t border-stone-200 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
          <button
            onClick={() => setShowPriceOfferBox(!showPriceOfferBox)}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold shadow-xs transition flex items-center gap-1"
          >
            <Tag className="w-3 h-3" />
            <span>{offer.listingIntent === 'buy' ? 'Proposer Fourniture' : 'Négocier Prix'}</span>
          </button>
          {offer.listingIntent === 'buy' ? (
            <>
              <button
                onClick={() =>
                  handleQuickChip('Je dispose du tonnage/volume requis immédiatement et certifié.')
                }
                className="shrink-0 px-2.5 py-1 rounded-lg bg-white hover:bg-stone-200 text-stone-700 text-[11px] font-medium border border-stone-300 transition"
              >
                Volume disponible immédiat
              </button>
              <button
                onClick={() =>
                  handleQuickChip('Nos produits sont homologués ONSSA avec certificat sanitaire.')
                }
                className="shrink-0 px-2.5 py-1 rounded-lg bg-white hover:bg-stone-200 text-stone-700 text-[11px] font-medium border border-stone-300 transition"
              >
                Homologué ONSSA
              </button>
              <button
                onClick={() =>
                  handleQuickChip('Possibilité d\'assurer la livraison par camion frigo direct à votre dépôt.')
                }
                className="shrink-0 px-2.5 py-1 rounded-lg bg-white hover:bg-stone-200 text-stone-700 text-[11px] font-medium border border-stone-300 transition"
              >
                Livraison frigo incluse
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() =>
                  handleQuickChip('Quel est le délai d\'expédition possible pour cette commande ?')
                }
                className="shrink-0 px-2.5 py-1 rounded-lg bg-white hover:bg-stone-200 text-stone-700 text-[11px] font-medium border border-stone-300 transition"
              >
                Délai d'expédition ?
              </button>
              <button
                onClick={() =>
                  handleQuickChip('Pouvez-vous confirmer le passeport phytosanitaire ONSSA ?')
                }
                className="shrink-0 px-2.5 py-1 rounded-lg bg-white hover:bg-stone-200 text-stone-700 text-[11px] font-medium border border-stone-300 transition"
              >
                Passeport ONSSA ?
              </button>
              <button
                onClick={() =>
                  handleQuickChip('Est-il possible de recevoir un échantillon avant validation ?')
                }
                className="shrink-0 px-2.5 py-1 rounded-lg bg-white hover:bg-stone-200 text-stone-700 text-[11px] font-medium border border-stone-300 transition"
              >
                Demander échantillon
              </button>
            </>
          )}
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Écrivez un message sécurisé (prix, quantité, transport)..."
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-xs sm:text-sm text-stone-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-hidden transition"
          />
          <button
            type="submit"
            disabled={!messageText.trim()}
            className="p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white transition shadow-xs shrink-0"
            title="Envoyer le message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
