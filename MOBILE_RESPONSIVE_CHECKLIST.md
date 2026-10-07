# Mobile Responsive & Accessibility Checklist (WCAG 2.1 AA)

**Application :** AgriMaroc / Morocco Nursery & Produce Market  
**Date de validation :** 28 Septembre 2026  
**Statut global :** ✅ CONFORME (Production-Ready)

---

## 1. Configuration Viewport & Meta Tags (`index.html`)

- [x] **Viewport adaptatif sans blocage de zoom :** `width=device-width, initial-scale=1.0, viewport-fit=cover`.
- [x] **Respect du critère WCAG 1.4.4 (Resize Text) :** Suppression de `user-scalable=no` et `maximum-scale=1.0` pour permettre l'agrandissement par pincement jusqu'à 200%.
- [x] **Support des encoches et zones protégées :** Intégration de `viewport-fit=cover` pour gérer les encoches iPhone et barres de geste Android.
- [x] **Compatibilité PWA & Web App :** Balises `theme-color`, `apple-mobile-web-app-capable`, `apple-touch-icon`.

---

## 2. Ergonomie Mobile & Touch Targets ($\ge 44\text{px} - 48\text{px}$)

| Composant | Touch Target Réel | Conforme WCAG / Android Material | Détails |
| :--- | :--- | :--- | :--- |
| **Hamburger Menu Mobile** | $48 \times 48\text{ px}$ (`min-w-[44px] min-h-[44px]`) | ✅ Oui | Bouton d'accès rapide avec retour haptique visuel (`active:scale-95`). |
| **Notifications Navbar** | $44 \times 44\text{ px}$ | ✅ Oui | Pastille de notification animée avec badge lisible. |
| **Profil & Avatar Navbar** | $44 \times 44\text{ px}$ | ✅ Oui | Accès direct au profil et statut de vérification en 1 tap. |
| **Bottom Navigation Bar** | $52\text{ px}$ de hauteur | ✅ Oui | 5 onglets avec icônes agrandies, labels textuels et pastilles de notification. |
| **Boutons d'action Modales** | $48\text{ px}$ de hauteur | ✅ Oui | Boutons pleine largeur sur mobile avec padding généreux. |
| **Fermeture de modales** | $44 \times 44\text{ px}$ | ✅ Oui | Croix de fermeture facilement cliquable au pouce. |

---

## 3. Gestion des Safe Areas (iOS & Android)

- [x] **Padding bas de page :** `<main>` doté de `pb-24 md:pb-8` pour éviter tout chevauchement avec la barre fixe `BottomNav`.
- [x] **Variables CSS d'environnement :** `env(safe-area-inset-bottom)` et `env(safe-area-inset-top)` appliquées sur `.safe-area-bottom` et `.safe-area-top`.
- [x] **Prévention du scroll horizontal :** `overflow-x: hidden` au niveau de `html`, `body` et du conteneur racine.

---

## 4. Breakpoints Testés & Validés

- [x] **320px (Mobile Compact - iPhone SE 1ère/2ème gén, petits smartphones) :**
  - Aucune coupure de texte critique.
  - Cartes de produits et filtres affichés en colonne unique sans débordement horizontal.
  - Sélecteur de langue compact.
- [x] **375px - 414px (Mobile Standard - iPhone 12/13/14/15, Samsung Galaxy S, Pixel) :**
  - Grille 1 à 2 colonnes fluide.
  - Carrousels et bandeaux ticker défilants fluides.
- [x] **768px (Tablettes & iPad portrait) :**
  - Grilles 2 à 3 colonnes pour les lots de pépinières et primeurs.
  - Affichage optimisé des widgets météo et indicateurs financiers.
- [x] **1024px+ (Desktop & Tablettes paysage) :**
  - Bascule automatique vers la barre de navigation desktop étendue.
  - Masquage de la barre de navigation basse `BottomNav` au profit du header complet.

---

## 5. Typographie & Lisibilité Mobile (Anti-Zoom iOS)

- [x] **Taille minimale des champs de formulaire :** Définition stricte de `font-size: 16px` sur tous les `input`, `select` et `textarea` sur écrans $\le 768\text{px}$ dans `src/index.css`. Cela supprime totalement le zoom automatique indésirable d'iOS Safari lors de la mise au focus.
- [x] **Contraste de couleur :** Conforme au ratio 4.5:1 sur fond sombre (`#091b12`) et fond clair (`#F8FAF6`).
- [x] **Touch Action :** `touch-action: manipulation` pour éliminer le délai de 300ms au double-tap sur mobile.

---

## 6. Performance des Médias & Images (`SmartImage.tsx`)

- [x] **Chargement différé natif :** `loading="lazy"` systématique sur toutes les vignettes et photos de plants.
- [x] **Décodage asynchrone :** `decoding="async"` pour libérer le thread principal d'affichage.
- [x] **Fallbacks visuels thématiques :** Fallback SVG vectoriel élégant en dégradé si l'image est indisponible ou hors-ligne.
- [x] **Sanitization stricte des URL d'images :** Protection OWASP contre les attaques XSS par injection d'URL malveillantes.

---

## 7. Compatibilité Multi-Navigateurs Mobile

- [x] **iOS Safari (WebKit) :** Testé pour le support des safe-areas, désactivation du zoom intempestif et swipe navigation.
- [x] **Google Chrome Mobile (Blink/Android) :** Support natif du Web App Manifest et de l'installation PWA hors-ligne.
- [x] **Mozilla Firefox Mobile (Gecko) :** Rendu typographique et barres de défilement masquées via `scrollbar-width: none`.
- [x] **Samsung Internet :** Support complet des boutons tactiles et modales superposées.
