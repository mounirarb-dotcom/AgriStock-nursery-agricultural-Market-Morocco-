import { UserReview, OfferDiscussionThread } from '../types';

// ===================================================================
// Initial User Reviews & 5-Star Ratings for Moroccan Sellers
// ===================================================================
export const INITIAL_USER_REVIEWS: UserReview[] = [
  {
    id: 'rev-01',
    targetSellerName: 'Domaine El Baraka (Haj Mohammed Alami)',
    targetOfferId: 'prod-01',
    targetOfferTitle: 'Tomate Cerise Allongée (Baby Plum)',
    reviewerName: 'Rachid B. (Grossiste Inezgane)',
    reviewerRegion: 'Souss-Massa (Agadir, Taroudant, Chtouka)',
    rating: 5,
    criteria: {
      productQuality: 5,
      deliveryPunctuality: 5,
      communication: 5,
    },
    comment:
      'Qualité irréprochable sur 4 tonnes livrées en caisses IFCO. Brix élevé (8.5), aucun rejet au tri. Paiement sous séquestre débloqué dès validation de la conformité à quai.',
    date: '2025-02-24',
    verifiedEscrowPurchase: true,
    sellerResponse: {
      date: '2025-02-25',
      text: 'Choukran Si Rachid, ravi de cette collaboration sécurisée. Au plaisir pour le prochain camion.',
    },
  },
  {
    id: 'rev-02',
    targetSellerName: 'Domaine El Baraka (Haj Mohammed Alami)',
    targetOfferId: 'prod-01',
    targetOfferTitle: 'Tomate Cerise Allongée (Baby Plum)',
    reviewerName: 'Sté AgriExport Casablanca',
    reviewerRegion: 'Casablanca - Settat & Doukkala',
    rating: 5,
    criteria: {
      productQuality: 5,
      deliveryPunctuality: 4.8,
      communication: 5,
    },
    comment:
      'Producteur sérieux, rigoureux sur les certifications GlobalG.A.P. Les échanges via la messagerie plateforme ont été très réactifs.',
    date: '2025-02-18',
    verifiedEscrowPurchase: true,
  },
  {
    id: 'rev-03',
    targetSellerName: 'Pépinière Royale du Haouz',
    targetOfferId: 'lot-olv-01',
    targetOfferTitle: 'Olivier (Olea europaea) - Picholine Marocaine',
    reviewerName: 'Driss Mansouri (Investisseur Agricole)',
    reviewerRegion: 'Marrakech - Safi (Haouz, El Kelaâ)',
    rating: 5,
    criteria: {
      productQuality: 5,
      deliveryPunctuality: 5,
      communication: 5,
    },
    comment:
      'Achat de 1 200 plants d\'oliviers en pots 2L avec passeport ONSSA bleu. Reprise remarquable à 99%. Acompte sécurisé par séquestre bancaire très rassurant.',
    date: '2025-02-20',
    verifiedEscrowPurchase: true,
    sellerResponse: {
      date: '2025-02-21',
      text: 'Merci pour votre confiance ! Nous restons à disposition pour le suivi agronomique de votre verger.',
    },
  },
  {
    id: 'rev-04',
    targetSellerName: 'Coopérative Maraîchère du Souss (Coptam)',
    targetOfferId: 'prod-02',
    targetOfferTitle: 'Poivron Carré d\'Export (Rouge / Jaune)',
    reviewerName: 'Yassine K. (Centrale d\'Achat Tanger)',
    reviewerRegion: 'Tanger - Tétouan - Al Hoceïma (Loukkos, Larache)',
    rating: 4.8,
    criteria: {
      productQuality: 4.8,
      deliveryPunctuality: 5,
      communication: 4.7,
    },
    comment:
      'Très beaux poivrons calibre G/GG bien fermes. Frigo arrivé à 9°C conformément aux spécifications logistiques.',
    date: '2025-02-12',
    verifiedEscrowPurchase: true,
  },
  {
    id: 'rev-05',
    targetSellerName: 'Domaines Agricoles du Berkane (Karim Benmoussa)',
    targetOfferId: 'prod-03',
    targetOfferTitle: 'Clémentine Nadorcott Berkane IGP',
    reviewerName: 'Amine El Fassi (Plateforme Rungis & Maroc)',
    reviewerRegion: 'L\'Oriental (Berkane, Oujda, Nador)',
    rating: 5,
    criteria: {
      productQuality: 5,
      deliveryPunctuality: 5,
      communication: 5,
    },
    comment:
      'Le meilleur terroir pour la Nadorcott. Coloration et jus parfaits. Transaction séquestre 100% fluide et transparente.',
    date: '2025-01-29',
    verifiedEscrowPurchase: true,
  },
  {
    id: 'rev-06',
    targetSellerName: 'Ferme Bio Atlas (Fatima Zahra Bennani)',
    targetOfferId: 'prod-04',
    targetOfferTitle: 'Pomme de Terre de Saison (Spunta Bio)',
    reviewerName: 'Omar T. (Bio Market Rabat)',
    reviewerRegion: 'Gharb - Chrarda (Kénitra, Sidi Slimane)',
    rating: 4.9,
    criteria: {
      productQuality: 5,
      deliveryPunctuality: 4.8,
      communication: 5,
    },
    comment:
      'Pommes de terre lavées et calibrées, zéro résidu de pesticides. La discussion en ligne a permis d\'ajuster la livraison par camion 10T.',
    date: '2025-02-05',
    verifiedEscrowPurchase: true,
  },
];

// ===================================================================
// Initial Discussions for Demo Offers (In-Platform Chat Threads)
// ===================================================================
export const INITIAL_OFFER_DISCUSSIONS: Record<string, OfferDiscussionThread> = {
  'prod-01': {
    offerId: 'prod-01',
    offerType: 'produce',
    offerTitle: 'Tomate Cerise Allongée (Baby Plum)',
    offerPriceMAD: 8.5,
    offerUnit: 'Kg',
    sellerName: 'Domaine El Baraka (Haj Mohammed Alami)',
    sellerRating: 4.9,
    buyerName: 'Centrale d\'Achat Maraîchère',
    unreadCount: 1,
    lastUpdated: '2025-02-28 14:40',
    messages: [
      {
        id: 'msg-01-01',
        offerId: 'prod-01',
        offerType: 'produce',
        offerTitle: 'Tomate Cerise Allongée (Baby Plum)',
        senderId: 'buyer-01',
        senderName: 'Centrale d\'Achat Maraîchère',
        senderRole: 'buyer',
        content: 'Salamou alaykoum Si Alami, vos tomates cerises allongées sont-elles récoltées le jour même pour expédition ? Quel est le degré Brix actuel ?',
        timestamp: 'Hier à 10:15',
        messageType: 'text',
      },
      {
        id: 'msg-01-02',
        offerId: 'prod-01',
        offerType: 'produce',
        offerTitle: 'Tomate Cerise Allongée (Baby Plum)',
        senderId: 'seller-alami',
        senderName: 'Domaine El Baraka (Haj Mohammed Alami)',
        senderRole: 'seller',
        content: 'Wa alaykoum salam. Oui, récolte matinale à la fraîche, conditionnement direct sous barquettes 250g ou colis vrac 3kg. Brix mesuré à 8.4 ce matin.',
        timestamp: 'Hier à 11:05',
        messageType: 'text',
      },
      {
        id: 'msg-01-03',
        offerId: 'prod-01',
        offerType: 'produce',
        offerTitle: 'Tomate Cerise Allongée (Baby Plum)',
        senderId: 'buyer-01',
        senderName: 'Centrale d\'Achat Maraîchère',
        senderRole: 'buyer',
        content: 'Parfait ! Nous souhaitons prendre 3 Tonnes. Pouvez-vous faire un geste sur le prix à 8.10 MAD/Kg avec paiement garanti sous séquestre ?',
        timestamp: 'Hier à 11:30',
        messageType: 'price_offer',
        proposedPriceMAD: 8.1,
        proposedQuantity: 3,
        unit: 'Tonnes',
        offerStatus: 'pending',
      },
      {
        id: 'msg-01-04',
        offerId: 'prod-01',
        offerType: 'produce',
        offerTitle: 'Tomate Cerise Allongée (Baby Plum)',
        senderId: 'seller-alami',
        senderName: 'Domaine El Baraka (Haj Mohammed Alami)',
        senderRole: 'seller',
        content: 'D\'accord pour 8.15 MAD/Kg compte tenu du volume et de la garantie du séquestre bancaire de la plateforme. Vous pouvez initier le paiement séquestre.',
        timestamp: 'Aujourd\'hui à 09:20',
        messageType: 'text',
      },
      {
        id: 'msg-01-05',
        offerId: 'prod-01',
        offerType: 'produce',
        offerTitle: 'Tomate Cerise Allongée (Baby Plum)',
        senderId: 'system',
        senderName: 'Plateforme AgriMaroc Protection',
        senderRole: 'seller',
        content: '🔒 Protection Séquestre Active : Vos échanges et accords de prix sont tracés. Vous pouvez cliquer sur "Payer sous Séquestre" pour bloquer les fonds en toute sécurité.',
        timestamp: 'Aujourd\'hui à 09:21',
        messageType: 'escrow_prompt',
      },
    ],
  },
  'lot-olv-01': {
    offerId: 'lot-olv-01',
    offerType: 'nursery',
    offerTitle: 'Olivier (Olea europaea) - Picholine Marocaine',
    offerPriceMAD: 18.5,
    offerUnit: 'Plant (Pot 2L)',
    sellerName: 'Pépinière Royale du Haouz',
    sellerRating: 5.0,
    buyerName: 'Société Agricole Tadla Vergers',
    unreadCount: 0,
    lastUpdated: '2025-02-27 16:10',
    messages: [
      {
        id: 'msg-02-01',
        offerId: 'lot-olv-01',
        offerType: 'nursery',
        offerTitle: 'Olivier (Olea europaea) - Picholine Marocaine',
        senderId: 'buyer-02',
        senderName: 'Société Agricole Tadla Vergers',
        senderRole: 'buyer',
        content: 'Bonjour, les plants ont-ils l\'étiquette bleue ONSSA avec numéro de lot officiel pour le dossier de subvention étatique ?',
        timestamp: 'Le 26 Fév à 14:00',
        messageType: 'text',
      },
      {
        id: 'msg-02-02',
        offerId: 'lot-olv-01',
        offerType: 'nursery',
        offerTitle: 'Olivier (Olea europaea) - Picholine Marocaine',
        senderId: 'seller-haouz',
        senderName: 'Pépinière Royale du Haouz',
        senderRole: 'seller',
        content: 'Absolument, passeport ONSSA-MA-HAOUZ-2025-0921 fourni avec certificat phytosanitaire conforme pour subventions Plan Maroc Vert / Génération Green.',
        timestamp: 'Le 26 Fév à 15:15',
        messageType: 'text',
      },
    ],
  },
};

// ===================================================================
// Helper Utilities for Anti-Circumvention Masking & Security
// ===================================================================

/**
 * Masks a phone number so direct calls/SMS are prevented when platform payment is active.
 * Example: "+212 6 61 23 45 67" -> "+212 6 •• •• •• 67 (Coordonnées protégées)"
 */
export function maskPhoneNumber(phone?: string): string {
  if (!phone) return 'Coordonnées protégées';
  const clean = phone.trim();
  if (clean.length < 6) return '+212 6 •• •• •• •• (Protégé)';
  
  // Keep prefix and last 2 digits
  const last2 = clean.slice(-2);
  const start = clean.startsWith('+212') ? '+212' : clean.startsWith('0') ? '06' : '+212';
  return `${start} •• •• •• ${last2} (Protégé Séquestre)`;
}

/**
 * Masks email address to prevent disintermediation.
 */
export function maskEmail(email?: string): string {
  if (!email) return 'Email protégé';
  const parts = email.split('@');
  if (parts.length !== 2) return 'contact•••@protégé.ma';
  const first = parts[0].slice(0, 1);
  return `${first}••••••@${parts[1]} (Protégé)`;
}

/**
 * Detects whether a text message contains phone numbers, emails, or direct contact details.
 * Replaces them with a security tag and returns the sanitized text + warning flag.
 */
export function filterChatMessage(rawText: string): {
  filteredText: string;
  hasMaskedContent: boolean;
} {
  // Regex detecting phone patterns: e.g. 06..., 07..., 05..., +212..., 8 to 12 contiguous or space-separated digits
  const phoneRegex = /(\+?212|0)[5-7](?:[\s.-]?\d{2}){4}|\b\d{8,12}\b/g;
  
  // Regex detecting email patterns
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  // Regex detecting external whatsapp links
  const waRegex = /wa\.me\/[0-9]+|chat\.whatsapp\.com\/[a-zA-Z0-9]+/gi;

  let hasMaskedContent = false;

  let filtered = rawText.replace(phoneRegex, () => {
    hasMaskedContent = true;
    return '[Numéro direct masqué - Séquestre Plateforme Requis]';
  });

  filtered = filtered.replace(emailRegex, () => {
    hasMaskedContent = true;
    return '[Email masqué - Séquestre Plateforme Requis]';
  });

  filtered = filtered.replace(waRegex, () => {
    hasMaskedContent = true;
    return '[Lien externe masqué - Échangez ici en sécurité]';
  });

  return {
    filteredText: filtered,
    hasMaskedContent,
  };
}
