import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/translations';
import {
  fetchGmailProfile,
  listGmailMessages,
  getGmailMessageDetail,
  sendGmailMessage,
  trashGmailMessage,
  modifyGmailLabels,
  GmailProfile,
  GmailMessageDetail,
} from '../services/gmailApi';
import {
  Mail,
  Send,
  Trash2,
  Star,
  RefreshCw,
  Search,
  PenSquare,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ArrowLeft,
  Reply,
  ShieldCheck,
  UserCheck,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

export const GmailManager: React.FC = () => {
  const {
    language,
    googleUser,
    googleAccessToken,
    isAuthLoading,
    loginWithGoogle,
    logoutFromGoogle,
    composeState,
    openComposeModal,
    closeComposeModal,
  } = useApp();

  const t = useTranslation(language);

  const [profile, setProfile] = useState<GmailProfile | null>(null);
  const [messages, setMessages] = useState<GmailMessageDetail[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMessage, setSelectedMessage] = useState<GmailMessageDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Error & Status feedback
  const [apiError, setApiError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Compose State
  const [composeTo, setComposeTo] = useState<string>('');
  const [composeCc, setComposeCc] = useState<string>('');
  const [composeSubject, setComposeSubject] = useState<string>('');
  const [composeBody, setComposeBody] = useState<string>('');
  const [showCc, setShowCc] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  // Mandatory Confirmation Dialogs per Workspace security guidelines
  const [confirmSendOpen, setConfirmSendOpen] = useState<boolean>(false);
  const [confirmDeleteMessageId, setConfirmDeleteMessageId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Sync composeState from global context (e.g. opened from ContactSellerModal or PassportModal)
  useEffect(() => {
    if (composeState) {
      setComposeTo(composeState.to || '');
      setComposeSubject(composeState.subject || '');
      setComposeBody(composeState.body || '');
      setShowCc(false);
    }
  }, [composeState]);

  // Fetch user profile and messages when authenticated
  const loadGmailData = useCallback(async () => {
    if (!googleAccessToken) return;
    setLoadingMessages(true);
    setApiError(null);

    try {
      // 1. Profile
      try {
        const p = await fetchGmailProfile(googleAccessToken);
        setProfile(p);
      } catch (err: any) {
        console.warn('Profile fetch warning:', err);
      }

      // 2. Query construction
      let q = searchQuery.trim();
      if (activeFilter === 'unread') {
        q = q ? `${q} is:unread` : 'is:unread';
      } else if (activeFilter === 'starred') {
        q = q ? `${q} is:starred` : 'is:starred';
      } else if (activeFilter === 'nursery') {
        q = q ? `${q} (pépinière OR plant OR olivier OR agrumes)` : '(pépinière OR plant OR olivier OR agrumes)';
      } else if (activeFilter === 'onssa') {
        q = q ? `${q} (ONSSA OR phytosanitaire OR agrément)` : '(ONSSA OR phytosanitaire OR agrément)';
      } else if (activeFilter === 'market') {
        q = q ? `${q} (fruits OR légumes OR commande OR devis OR MAD)` : '(fruits OR légumes OR commande OR devis OR MAD)';
      }

      const { messages: list } = await listGmailMessages(googleAccessToken, q, 15);

      // Fetch details for each message in parallel
      const detailedMessages = await Promise.all(
        list.slice(0, 15).map(async (item) => {
          try {
            return await getGmailMessageDetail(googleAccessToken, item.id);
          } catch (e) {
            return null;
          }
        })
      );

      setMessages(detailedMessages.filter((m): m is GmailMessageDetail => m !== null));
    } catch (err: any) {
      console.error('Failed to load Gmail messages:', err);
      setApiError(err.message || 'Impossible de charger les emails.');
    } finally {
      setLoadingMessages(false);
    }
  }, [googleAccessToken, searchQuery, activeFilter]);

  useEffect(() => {
    if (googleAccessToken) {
      loadGmailData();
    }
  }, [googleAccessToken, loadGmailData]);

  // Show a temporary success message
  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  // Toggle Star
  const handleToggleStar = async (msg: GmailMessageDetail, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!googleAccessToken) return;

    const newStarred = !msg.isStarred;
    // Optimistic UI update
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, isStarred: newStarred } : m))
    );
    if (selectedMessage?.id === msg.id) {
      setSelectedMessage((prev) => (prev ? { ...prev, isStarred: newStarred } : null));
    }

    try {
      if (newStarred) {
        await modifyGmailLabels(googleAccessToken, msg.id, ['STARRED'], []);
      } else {
        await modifyGmailLabels(googleAccessToken, msg.id, [], ['STARRED']);
      }
    } catch (err: any) {
      console.error('Failed to star message', err);
      loadGmailData();
    }
  };

  // Toggle Read / Unread
  const handleToggleRead = async (msg: GmailMessageDetail, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!googleAccessToken) return;

    const newUnread = !msg.isUnread;
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, isUnread: newUnread } : m))
    );

    try {
      if (newUnread) {
        await modifyGmailLabels(googleAccessToken, msg.id, ['UNREAD'], []);
      } else {
        await modifyGmailLabels(googleAccessToken, msg.id, [], ['UNREAD']);
      }
    } catch (err: any) {
      console.error('Failed to mark read/unread', err);
      loadGmailData();
    }
  };

  // Open Message Detail
  const handleOpenMessage = async (msg: GmailMessageDetail) => {
    setSelectedMessage(msg);
    // Mark as read automatically if unread
    if (msg.isUnread && googleAccessToken) {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, isUnread: false } : m))
      );
      modifyGmailLabels(googleAccessToken, msg.id, [], ['UNREAD']).catch(console.error);
    }
  };

  // Pre-fill reply in compose modal
  const handleReply = (msg: GmailMessageDetail) => {
    openComposeModal({
      to: msg.from.includes('<')
        ? msg.from.substring(msg.from.indexOf('<') + 1, msg.from.indexOf('>'))
        : msg.from,
      subject: msg.subject.startsWith('Re:') ? msg.subject : `Re: ${msg.subject}`,
      body: `\n\n--- Message d'origine (${msg.date}) ---\nDe: ${msg.from}\n${msg.bodyText || msg.snippet}`,
    });
  };

  // Prompt delete with confirmation
  const handleRequestDelete = (msgId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setConfirmDeleteMessageId(msgId);
  };

  // Confirm delete handler (Explicit user confirmation per instructions)
  const handleConfirmDelete = async () => {
    if (!confirmDeleteMessageId || !googleAccessToken) return;
    setIsDeleting(true);
    try {
      await trashGmailMessage(googleAccessToken, confirmDeleteMessageId);
      triggerToast('Message déplacé vers la corbeille Gmail avec succès.');
      setMessages((prev) => prev.filter((m) => m.id !== confirmDeleteMessageId));
      if (selectedMessage?.id === confirmDeleteMessageId) {
        setSelectedMessage(null);
      }
      setConfirmDeleteMessageId(null);
    } catch (err: any) {
      setApiError(err.message || 'Impossible de supprimer cet email.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Request Send (Opens confirmation dialog first)
  const handleRequestSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleUser || !googleAccessToken) {
      setApiError("Veuillez d'abord vous connecter avec votre compte Google pour envoyer un email.");
      loginWithGoogle();
      return;
    }
    if (!composeTo.trim()) {
      setApiError('Veuillez renseigner l\'adresse email du destinataire.');
      return;
    }
    if (!composeSubject.trim()) {
      setApiError('Veuillez indiquer un objet pour l\'email.');
      return;
    }
    // Open explicit confirmation modal per Workspace security guidelines
    setConfirmSendOpen(true);
  };

  // Confirm and actually send via Gmail API
  const handleConfirmSend = async () => {
    if (!googleAccessToken) {
      setApiError('Session Google expirée ou non connectée. Veuillez vous reconnecter.');
      loginWithGoogle();
      return;
    }
    setIsSending(true);
    setConfirmSendOpen(false);

    try {
      await sendGmailMessage(googleAccessToken, {
        to: composeTo,
        cc: composeCc,
        subject: composeSubject,
        body: composeBody,
      });

      triggerToast(`Email envoyé avec succès à ${composeTo}`);
      closeComposeModal();
      setComposeTo('');
      setComposeCc('');
      setComposeSubject('');
      setComposeBody('');
      // Reload sent/inbox messages
      loadGmailData();
    } catch (err: any) {
      console.error('Error sending email:', err);
      setApiError(err.message || 'Échec de l\'envoi de l\'email.');
    } finally {
      setIsSending(false);
    }
  };

  // Quick Moroccan Agriculture Templates
  const applyTemplate = (type: 'quote_nursery' | 'order_produce' | 'passport_onssa' | 'wholesale_offer') => {
    switch (type) {
      case 'quote_nursery':
        setComposeSubject('Demande de Devis — Plants certifiés ONSSA (AgriStock Maroc)');
        setComposeBody(
          `Salam alaykoum / Bonjour,\n\n` +
            `Dans le cadre de l'aménagement de notre exploitation agricole, nous souhaitons recevoir votre meilleure proposition tarifaire pour les plants suivants :\n` +
            `- Espèce : Olivier (Picholine Marocaine / Haouzia)\n` +
            `- Quantité souhaitée : 500 plants en pot 3L\n` +
            `- Exigence : Certificat & Passeport phytosanitaire ONSSA (Catégorie Bleue)\n\n` +
            `Merci de nous indiquer le prix unitaire en MAD (départ pépinière ou livré), le délai de livraison et les facilités de chargement.\n\n` +
            `Cordialement,\nService Approvisionnement Agricole`
        );
        break;
      case 'order_produce':
        setComposeSubject('Bon de Commande — Fruits & Légumes sortie de champ');
        setComposeBody(
          `Salam alaykoum / Bonjour,\n\n` +
            `Faisant suite à notre consultation sur la bourse AgriStock Maroc, nous vous confirmons notre intérêt pour l'achat du lot suivant :\n` +
            `- Produit : Tomates rondes de plein champ / Sous serre\n` +
            `- Volume : 10 Tonnes (Calibre 1, Extra)\n` +
            `- Conditionnement : Caisses plastiques IFCO\n` +
            `- Prix convenu : Départ exploitation en Dirhams marocains (MAD)\n\n` +
            `Merci de nous préciser le calendrier de cueillette et l'adresse exacte pour la mise à disposition des camions.\n\n` +
            `Bien cordialement,`
        );
        break;
      case 'passport_onssa':
        setComposeSubject('Transmission Fiche Lot & Passeport Phytosanitaire ONSSA');
        setComposeBody(
          `Monsieur l'Inspecteur / Cher Partenaire,\n\n` +
            `Veuillez trouver ci-joint les éléments de traçabilité relatifs à notre lot de pépinière homologué :\n` +
            `- Numéro de Lot : LOT-2025-MAR-088\n` +
            `- Passeport Phytosanitaire : ONSSA-MA-2025-PP-4421\n` +
            `- Statut Sanitaire : Contrôlé & conforme aux normes sanitaires nationales\n` +
            `- Origine : Pépinière agréée région Souss-Massa / Berkane\n\n` +
            `Restant à votre entière disposition pour tout contrôle complémentaire.\n\n` +
            `Salutations distinguées,`
        );
        break;
      case 'wholesale_offer':
        setComposeSubject('Offre Commerciale — Cotation Prix Marché de Gros');
        setComposeBody(
          `Bonjour,\n\n` +
            `Nous mettons à votre disposition une cotation actualisée basée sur les derniers cours des marchés de gros d'Inezgane et Casablanca :\n` +
            `- Disponibilité : Immédiate\n` +
            `- Tarifs préférentiels pour commandes groupées ou coopératives\n\n` +
            `N'hésitez pas à nous contacter pour convenir des quantités et des conditions de règlement.\n\n` +
            `L'équipe AgriStock Maroc`
        );
        break;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Feedback */}
      {successToast && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-800 text-white rounded-xl shadow-xl border border-emerald-600 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span className="text-xs font-semibold">{successToast}</span>
        </div>
      )}

      {/* Global Error Banner */}
      {apiError && (
        <div className="flex items-center justify-between p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{apiError}</span>
          </div>
          <button
            onClick={() => setApiError(null)}
            className="p-1 hover:bg-rose-100 rounded text-rose-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Auth Status & Main Header */}
      {!googleUser ? (
        /* Not Logged In: Official Sign in with Google card */
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200/80 text-center max-w-2xl mx-auto my-6">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-xs">
            <Mail className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-black text-stone-900 tracking-tight">
            Messagerie Professionnelle Gmail & Correspondance Agricole
          </h2>
          <p className="mt-2 text-xs text-stone-600 leading-relaxed max-w-md mx-auto">
            Connectez votre compte Gmail pour échanger directement avec les pépiniéristes, exploitants agricoles, acheteurs de fruits & légumes et les services de l'ONSSA au Maroc.
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-3">
            {/* Official Sign in with Google Button */}
            <button
              id="btn-google-signin"
              onClick={loginWithGoogle}
              disabled={isAuthLoading}
              className="flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-sm rounded-xl border border-stone-300 shadow-sm hover:shadow transition active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span>
                {isAuthLoading ? 'Connexion en cours...' : 'Se connecter avec Google'}
              </span>
            </button>

            <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>
                Accès direct et sécurisé à Gmail avec votre autorisation. Les jetons restent en mémoire.
              </span>
            </div>
          </div>

          {/* Value props */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-6 border-t border-stone-100">
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
              <h4 className="font-bold text-stone-900 text-xs">🌱 Demandes de Devis</h4>
              <p className="text-[11px] text-stone-600 mt-1">
                Envoyez des demandes précises pour lots d'agrumes, oliviers ou plants maraîchers.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
              <h4 className="font-bold text-stone-900 text-xs">📋 Suivi ONSSA</h4>
              <p className="text-[11px] text-stone-600 mt-1">
                Transmettez les passeports phytosanitaires et certificats sanitaires aux inspecteurs.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
              <h4 className="font-bold text-stone-900 text-xs">🚚 Bons de Commande</h4>
              <p className="text-[11px] text-stone-600 mt-1">
                Confirmez les volumes, conditionnements et prix sortie de champ en Dirham (MAD).
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Logged In View */
        <div className="space-y-4">
          {/* Account Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {googleUser?.photoURL ? (
                <img
                  src={googleUser.photoURL}
                  alt={googleUser?.displayName || 'Compte Google'}
                  className="w-11 h-11 rounded-full border-2 border-emerald-500 object-cover"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                  {googleUser?.displayName?.charAt(0) || googleUser?.email?.charAt(0) || 'G'}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                    {googleUser?.displayName || 'Utilisateur Gmail'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Connecté
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-mono">
                  {profile?.emailAddress || googleUser?.email || ''}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => loadGmailData()}
                disabled={loadingMessages}
                title="Actualiser la boîte de réception"
                className="p-2.5 rounded-xl border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loadingMessages ? 'animate-spin text-emerald-600' : ''}`} />
              </button>

              <button
                id="btn-compose-email"
                onClick={() => openComposeModal()}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-xs transition"
              >
                <PenSquare className="w-4 h-4" />
                <span>Rédiger un email</span>
              </button>

              <button
                onClick={logoutFromGoogle}
                className="px-3 py-2.5 text-stone-500 hover:text-stone-800 text-xs font-semibold hover:bg-stone-100 rounded-xl transition"
              >
                Déconnexion
              </button>
            </div>
          </div>

          {/* Inbox Search & Filter Pills */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-stone-200 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') loadGmailData();
                }}
                placeholder="Rechercher par expéditeur, mot-clé, commande, ONSSA, pépinière..."
                className="w-full pl-10 pr-24 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              />
              <button
                onClick={() => loadGmailData()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-semibold rounded-lg transition"
              >
                Filtrer
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: 'Boîte de réception' },
                { id: 'unread', label: 'Non lus' },
                { id: 'starred', label: 'Favoris' },
                { id: 'nursery', label: '🌱 Pépinières & Plants' },
                { id: 'onssa', label: '🛡️ ONSSA & Passeports' },
                { id: 'market', label: '📦 Commandes Marché' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap text-xs transition ${
                    activeFilter === f.id
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Email View Section */}
          <div className="bg-white rounded-2xl shadow-xs border border-stone-200 overflow-hidden">
            {selectedMessage ? (
              /* Detail View */
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 p-1 rounded-lg hover:bg-stone-100 transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Retour à la liste</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleToggleStar(selectedMessage, e)}
                      title={selectedMessage.isStarred ? 'Retirer des favoris' : 'Marquer comme favori'}
                      className="p-2 rounded-lg text-stone-400 hover:text-amber-500 hover:bg-amber-50 transition"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          selectedMessage.isStarred ? 'fill-amber-400 text-amber-500' : ''
                        }`}
                      />
                    </button>

                    <button
                      onClick={() => handleReply(selectedMessage)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg transition"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span>Répondre</span>
                    </button>

                    <button
                      onClick={() => handleRequestDelete(selectedMessage.id)}
                      title="Supprimer cet email"
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Email Subject & Meta */}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-stone-900">
                    {selectedMessage.subject}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 pt-2 border-t border-stone-100">
                    <div>
                      <span className="font-bold text-stone-800">{selectedMessage.from}</span>
                      {selectedMessage.to && (
                        <span className="text-[11px] text-stone-400 block sm:inline sm:ml-2">
                          À : {selectedMessage.to}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-stone-400 font-mono">
                      {selectedMessage.date}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="mt-4 p-4 rounded-xl bg-stone-50/70 border border-stone-200/80 text-xs text-stone-800 leading-relaxed font-sans min-h-[160px] overflow-auto">
                  {selectedMessage.bodyHtml ? (
                    <div
                      className="prose prose-xs max-w-none break-words"
                      dangerouslySetInnerHTML={{ __html: selectedMessage.bodyHtml }}
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans">
                      {selectedMessage.bodyText || selectedMessage.snippet}
                    </pre>
                  )}
                </div>
              </div>
            ) : (
              /* Message List */
              <div>
                {loadingMessages ? (
                  <div className="p-12 text-center text-xs text-stone-500 space-y-3">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
                    <p>Chargement des emails depuis votre compte Gmail...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="p-12 text-center text-xs text-stone-500 space-y-2">
                    <Mail className="w-8 h-8 mx-auto text-stone-300" />
                    <p className="font-semibold text-stone-700">Aucun message trouvé pour ce filtre</p>
                    <p className="text-stone-400">
                      Utilisez le bouton "Rédiger un email" pour initier une demande ou contactez un vendeur.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        onClick={() => handleOpenMessage(msg)}
                        className={`p-3.5 sm:p-4 hover:bg-emerald-50/40 cursor-pointer transition flex items-start gap-3 ${
                          msg.isUnread ? 'bg-emerald-50/20 font-semibold' : 'bg-white'
                        }`}
                      >
                        {/* Unread dot / Star */}
                        <div className="flex flex-col items-center gap-1.5 pt-0.5">
                          <button
                            onClick={(e) => handleToggleStar(msg, e)}
                            className="text-stone-300 hover:text-amber-400 p-0.5 transition"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                msg.isStarred ? 'fill-amber-400 text-amber-500' : ''
                              }`}
                            />
                          </button>
                          {msg.isUnread && (
                            <span className="w-2 h-2 rounded-full bg-emerald-600 block" title="Non lu" />
                          )}
                        </div>

                        {/* Message content summary */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-bold text-stone-900 truncate">
                              {msg.from.replace(/<.*?>/, '').trim() || msg.from}
                            </h4>
                            <span className="text-[10px] text-stone-400 whitespace-nowrap font-mono">
                              {msg.date ? new Date(msg.date).toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'en' ? 'en-US' : 'fr-FR', {
                                month: 'short',
                                day: 'numeric',
                              }) : ''}
                            </span>
                          </div>

                          <p className="text-xs text-stone-800 font-medium truncate mt-0.5">
                            {msg.subject}
                          </p>

                          <p className="text-[11px] text-stone-500 truncate mt-0.5 leading-normal">
                            {msg.snippet}
                          </p>
                        </div>

                        {/* Quick action buttons */}
                        <div className="flex items-center gap-1 self-center">
                          <button
                            onClick={(e) => handleToggleRead(msg, e)}
                            title={msg.isUnread ? 'Marquer comme lu' : 'Marquer comme non lu'}
                            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 text-[10px] transition"
                          >
                            {msg.isUnread ? 'Lu' : 'Non lu'}
                          </button>
                          <button
                            onClick={(e) => handleRequestDelete(msg.id, e)}
                            title="Supprimer l'email"
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* COMPOSE MODAL */}
      {composeState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-stone-900 text-white">
              <div className="flex items-center gap-2">
                <PenSquare className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold tracking-tight">
                  Rédiger un email (Gmail)
                </h3>
              </div>
              <button
                onClick={closeComposeModal}
                className="p-1 text-stone-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Unauthenticated notice if user is composing without Google login */}
            {!googleUser && (
              <div className="mx-5 mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 text-xs text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Connexion Google requise pour envoyer directement depuis votre compte Gmail.</span>
                </div>
                <button
                  type="button"
                  onClick={loginWithGoogle}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shrink-0 transition"
                >
                  Se connecter
                </button>
              </div>
            )}

            {/* Quick Moroccan Agriculture Templates Picker */}
            <div className="px-5 py-3 bg-stone-50 border-b border-stone-200">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
                Modèles rapides professionnels (Maroc)
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => applyTemplate('quote_nursery')}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition"
                >
                  🌱 Devis Pépinière ONSSA
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('order_produce')}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition"
                >
                  📦 Bon de Commande Fruits/Légumes
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('passport_onssa')}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition"
                >
                  🛡️ Passeport Sanitaire ONSSA
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('wholesale_offer')}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-stone-200 text-stone-800 hover:bg-stone-300 transition"
                >
                  📈 Cotation Prix de Gros
                </button>
              </div>
            </div>

            {/* Compose Form */}
            <form onSubmit={handleRequestSend} className="p-5 space-y-3">
              {/* To field */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-1">
                  <label htmlFor="compose-to">Destinataire (Email) *</label>
                  {!showCc && (
                    <button
                      type="button"
                      onClick={() => setShowCc(true)}
                      className="text-[11px] text-emerald-700 hover:underline"
                    >
                      + Ajouter Cc
                    </button>
                  )}
                </div>
                <input
                  id="compose-to"
                  type="email"
                  required
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="ex: pépinière.agadir@gmail.com ou acheteur@coopérative.ma"
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* CC field */}
              {showCc && (
                <div>
                  <label htmlFor="compose-cc" className="block text-xs font-semibold text-stone-700 mb-1">
                    Copie (Cc)
                  </label>
                  <input
                    id="compose-cc"
                    type="email"
                    value={composeCc}
                    onChange={(e) => setComposeCc(e.target.value)}
                    placeholder="ex: assoc-agricole@onssa.gov.ma"
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              )}

              {/* Subject */}
              <div>
                <label htmlFor="compose-subject" className="block text-xs font-semibold text-stone-700 mb-1">
                  Objet *
                </label>
                <input
                  id="compose-subject"
                  type="text"
                  required
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Objet du message"
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Message body */}
              <div>
                <label htmlFor="compose-body" className="block text-xs font-semibold text-stone-700 mb-1">
                  Corps du message *
                </label>
                <textarea
                  id="compose-body"
                  rows={8}
                  required
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Écrivez votre message ici..."
                  className="w-full px-3 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-sans leading-relaxed"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={closeComposeModal}
                  className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800 rounded-xl transition"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Vérifier & Envoyer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANDATORY CONFIRMATION DIALOG FOR SENDING EMAIL */}
      {confirmSendOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-emerald-800 pb-3 border-b border-stone-100">
              <Mail className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base font-bold text-stone-900">
                Confirmer l'envoi de l'email
              </h3>
            </div>

            <p className="mt-3 text-xs text-stone-600 leading-relaxed">
              Vous êtes sur le point d'envoyer un email officiel depuis votre compte Gmail connecté (<strong>{googleUser?.email || profile?.emailAddress || 'compte Google'}</strong>) :
            </p>

            <div className="mt-3 p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
              <p>
                <span className="font-bold text-stone-500">Destinataire : </span>
                <span className="font-semibold text-stone-900">{composeTo}</span>
              </p>
              {composeCc && (
                <p>
                  <span className="font-bold text-stone-500">Copie : </span>
                  <span className="font-semibold text-stone-900">{composeCc}</span>
                </p>
              )}
              <p>
                <span className="font-bold text-stone-500">Objet : </span>
                <span className="font-semibold text-stone-900">{composeSubject}</span>
              </p>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={handleConfirmSend}
                disabled={isSending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Confirmer l'envoi</span>
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={isSending}
                onClick={() => setConfirmSendOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY CONFIRMATION DIALOG FOR TRASHING/DELETING EMAIL */}
      {confirmDeleteMessageId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-rose-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-rose-700 pb-3 border-b border-rose-100">
              <Trash2 className="w-5 h-5 text-rose-600" />
              <h3 className="text-base font-bold text-stone-900">
                Supprimer cet email de Gmail ?
              </h3>
            </div>

            <p className="mt-3 text-xs text-stone-600 leading-relaxed">
              Êtes-vous sûr de vouloir déplacer ce message vers la corbeille de votre boîte de réception Gmail ? Cette action est synchronisée directement avec votre compte Google.
            </p>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Suppression...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Confirmer la suppression</span>
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setConfirmDeleteMessageId(null)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
