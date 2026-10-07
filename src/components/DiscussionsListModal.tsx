import React from 'react';
import { useApp } from '../context/AppContext';
import { StarRating } from './StarRating';
import { OfferDiscussionThread } from '../types';
import {
  X,
  MessageSquare,
  ShieldCheck,
  Tag,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const DiscussionsListModal: React.FC = () => {
  const {
    isDiscussionsListModalOpen,
    setIsDiscussionsListModalOpen,
    discussions,
    openOfferDiscussion,
    produceListings,
    nurseryLots,
    farmStandingListings,
  } = useApp();

  if (!isDiscussionsListModalOpen) return null;

  const discussionList: OfferDiscussionThread[] = (Object.values(discussions) as OfferDiscussionThread[]).sort(
    (a, b) =>
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
  );

  const handleOpenThread = (thread: OfferDiscussionThread) => {
    // Find matching offer
    let offer =
      produceListings.find((p) => p.id === thread.offerId) ||
      nurseryLots.find((n) => n.id === thread.offerId) ||
      farmStandingListings.find((f) => f.id === thread.offerId);

    if (!offer) {
      offer = {
        id: thread.offerId,
        title: thread.offerTitle,
        sellerName: thread.sellerName,
        pricePerUnitMAD: thread.offerPriceMAD,
        unit: thread.offerUnit,
      };
    }

    setIsDiscussionsListModalOpen(false);
    openOfferDiscussion(thread.offerId, thread.offerType, offer);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      id="modal-discussions-list"
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-stone-900 via-emerald-950 to-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Messagerie & Négociations Sécurisées
              </h3>
              <p className="text-xs text-stone-300">
                Discussions par offre • Coordonnées protégées sous séquestre
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDiscussionsListModalOpen(false)}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="p-3 bg-emerald-50 border-b border-emerald-200 flex items-center gap-2 text-xs text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Les coordonnées des acheteurs et vendeurs sont protégées afin de
            sécuriser les fonds sur le compte séquestre bancaire.
          </span>
        </div>

        {/* Discussions List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 divide-y divide-stone-100">
          {discussionList.length > 0 ? (
            discussionList.map((thread) => {
              const lastMsg = thread.messages[thread.messages.length - 1];

              return (
                <div
                  key={thread.offerId}
                  onClick={() => handleOpenThread(thread)}
                  className="pt-2 first:pt-0 pb-2 flex items-start justify-between gap-3 p-3 rounded-xl hover:bg-stone-50 cursor-pointer transition border border-transparent hover:border-stone-200"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                        {thread.offerTitle}
                      </span>
                      {thread.unreadCount && thread.unreadCount > 0 ? (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">
                          Nouveau
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                      <span className="font-medium text-emerald-800">
                        {thread.sellerName}
                      </span>
                      {thread.sellerRating && (
                        <StarRating
                          rating={thread.sellerRating}
                          size="xs"
                          showNumber={true}
                        />
                      )}
                    </div>

                    <p className="text-xs text-stone-600 line-clamp-1 italic">
                      {lastMsg ? lastMsg.content : 'Nouvelle négociation'}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] text-stone-400 font-mono">
                      {thread.lastUpdated}
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      {thread.offerPriceMAD} MAD/{thread.offerUnit}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-stone-500 text-xs">
              Aucune discussion active. Ouvrez une offre pour poser une
              question ou faire une offre de prix au producteur.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
