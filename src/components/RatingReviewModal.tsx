import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StarRating } from './StarRating';
import {
  X,
  Star,
  Award,
  ShieldCheck,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  User,
  MapPin,
} from 'lucide-react';

export const RatingReviewModal: React.FC = () => {
  const {
    ratingModalTarget,
    closeRatingModal,
    getSellerReviews,
    getSellerReputation,
    addReview,
    userProfile,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'reviews' | 'write'>('reviews');
  const [overallRating, setOverallRating] = useState<number>(5);
  const [qualityRating, setQualityRating] = useState<number>(5);
  const [punctualityRating, setPunctualityRating] = useState<number>(5);
  const [communicationRating, setCommunicationRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState(
    userProfile.displayName || 'Acheteur Agréé'
  );
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!ratingModalTarget) return null;

  const { sellerName, offerTitle, offerId } = ratingModalTarget;
  const sellerReviews = getSellerReviews(sellerName);
  const reputation = getSellerReputation(sellerName);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    addReview({
      targetSellerName: sellerName,
      targetOfferId: offerId,
      targetOfferTitle: offerTitle,
      reviewerName: reviewerName.trim() || 'Acheteur Vérifié',
      reviewerRegion: userProfile.region || 'Souss-Massa (Agadir)',
      rating: overallRating,
      criteria: {
        productQuality: qualityRating,
        deliveryPunctuality: punctualityRating,
        communication: communicationRating,
      },
      comment: comment.trim(),
      verifiedEscrowPurchase: true,
    });

    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setActiveTab('reviews');
      setComment('');
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      id="modal-rating-review"
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-stone-900 via-emerald-950 to-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
              <Award className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-black text-white">
                  {sellerName}
                </h3>
                {reputation.averageRating >= 4.8 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-stone-950 flex items-center gap-1">
                    <Award className="w-3 h-3" /> Top Vendeur
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-300">
                Évaluations certifiées & Fidélisation par étoiles
              </p>
            </div>
          </div>

          <button
            onClick={closeRatingModal}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reputation Score Summary Card */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-center px-4 py-2 bg-white rounded-2xl border border-stone-200 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-stone-900">
                {reputation.averageRating.toFixed(1)}
              </div>
              <div className="text-[10px] uppercase font-bold text-stone-500">
                Sur 5.0
              </div>
            </div>

            <div>
              <StarRating
                rating={reputation.averageRating}
                totalReviews={reputation.totalReviews}
                size="md"
                showNumber={false}
              />
              <div className="text-xs text-stone-600 mt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold text-emerald-800">
                  {reputation.satisfactionRatePercent}% de satisfaction
                </span>
                <span>• {reputation.totalReviews} avis vérifiés</span>
              </div>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-xl self-start sm:self-center">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'reviews'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Avis ({sellerReviews.length})
            </button>
            <button
              onClick={() => setActiveTab('write')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'write'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Noter le vendeur
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'reviews' ? (
            sellerReviews.length > 0 ? (
              <div className="space-y-3">
                {sellerReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-stone-900">
                            {rev.reviewerName}
                          </span>
                          {rev.verifiedEscrowPurchase && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Achat Séquestre Vérifié
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-stone-400">
                          {rev.reviewerRegion} • {rev.date}
                        </span>
                      </div>

                      <StarRating
                        rating={rev.rating}
                        size="xs"
                        showNumber={true}
                      />
                    </div>

                    {/* Criteria tags */}
                    <div className="flex flex-wrap gap-2 text-[10px] font-medium text-stone-600">
                      <span className="px-2 py-0.5 rounded-md bg-stone-100">
                        Qualité : <strong>{rev.criteria.productQuality}★</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-stone-100">
                        Ponctualité :{' '}
                        <strong>{rev.criteria.deliveryPunctuality}★</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-stone-100">
                        Communication :{' '}
                        <strong>{rev.criteria.communication}★</strong>
                      </span>
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed">
                      "{rev.comment}"
                    </p>

                    {rev.sellerResponse && (
                      <div className="mt-2 p-2.5 rounded-xl bg-stone-50 border-l-2 border-emerald-600 text-xs text-stone-600">
                        <span className="font-bold text-emerald-900 block text-[11px]">
                          Réponse du vendeur ({rev.sellerResponse.date}) :
                        </span>
                        <p className="mt-0.5">{rev.sellerResponse.text}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-stone-500 text-xs">
                Aucun avis n'a encore été déposé pour ce producteur. Soyez le
                premier à noter sa prestation !
              </div>
            )
          ) : (
            /* Write Review Tab */
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {submittedSuccess ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-950">
                    Merci pour votre avis !
                  </h4>
                  <p className="text-xs text-emerald-800">
                    Votre note contribue à récompenser et fidéliser les
                    meilleurs producteurs de la plateforme.
                  </p>
                </div>
              ) : (
                <>
                  {/* Overall Rating */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-center space-y-2">
                    <label className="block text-xs font-bold text-amber-950 uppercase tracking-wide">
                      Note Globale
                    </label>
                    <StarRating
                      rating={overallRating}
                      size="lg"
                      interactive={true}
                      onRatingChange={(val) => setOverallRating(val)}
                      showNumber={false}
                      className="justify-center"
                    />
                    <span className="text-xs font-black text-amber-800">
                      {overallRating === 5
                        ? 'Exceptionnel (5/5)'
                        : overallRating === 4
                        ? 'Très bon (4/5)'
                        : overallRating === 3
                        ? 'Moyen (3/5)'
                        : 'Insuffisant'}
                    </span>
                  </div>

                  {/* Criteria Rating sliders */}
                  <div className="space-y-2.5 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                    <span className="text-xs font-bold text-stone-800 block mb-1">
                      Critères détaillés :
                    </span>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-600">
                        Qualité & Conformité (calibre, fraîcheur) :
                      </span>
                      <StarRating
                        rating={qualityRating}
                        size="xs"
                        interactive={true}
                        onRatingChange={(v) => setQualityRating(v)}
                        showNumber={false}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-600">
                        Respect des Délais de livraison :
                      </span>
                      <StarRating
                        rating={punctualityRating}
                        size="xs"
                        interactive={true}
                        onRatingChange={(v) => setPunctualityRating(v)}
                        showNumber={false}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-600">
                        Communication & Séquestre :
                      </span>
                      <StarRating
                        rating={communicationRating}
                        size="xs"
                        interactive={true}
                        onRatingChange={(v) => setCommunicationRating(v)}
                        showNumber={false}
                      />
                    </div>
                  </div>

                  {/* Comment input */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Votre commentaire ou retour d'expérience *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Précisez la qualité reçue, la conformité de la marchandise ou le respect des accords..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-600 outline-hidden bg-stone-50 focus:bg-white transition"
                    />
                  </div>

                  {/* Reviewer Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Votre Nom / Entreprise
                      </label>
                      <input
                        type="text"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-600 outline-hidden"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-[11px] text-emerald-800 font-semibold">
                        Avis vérifié sous séquestre
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition active:scale-95"
                  >
                    Publier mon évaluation ({overallRating}★)
                  </button>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
