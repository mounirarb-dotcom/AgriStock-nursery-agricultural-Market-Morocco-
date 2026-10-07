# Morocco Nursery & Produce Market | مشاتل وسوق الخضر والفواكه بالمغرب

Plateforme B2B et bourse agricole professionnelle au Maroc dédiée à la gestion d'inventaires de pépinières certifiées ONSSA, à la commercialisation de fruits et légumes (sur pied et récoltés), aux manifestes d'exportation douaniers (Morocco Foodex / BADR) et à la mise en relation avec le fret frigorifique.

---

## 🚀 Démarrage Rapide

### 1. Prérequis
- **Node.js** : v20.x ou supérieure
- **NPM** : v10.x ou supérieure

### 2. Installation
```bash
# Cloner le dépôt et installer les dépendances
npm install
```

### 3. Configuration des variables d'environnement
Copiez le fichier de modèle et complétez les valeurs nécessaires :
```bash
cp .env.example .env
```

Pour les déploiements en environnement conteneurisé de production (Cloud Run, Kubernetes, VPS) :
```bash
cp .env.production.example .env.production
```

### 4. Commandes disponibles
| Commande | Action |
| :--- | :--- |
| `npm run dev` | Lance le serveur full-stack de développement sur `http://localhost:3000` avec Vite middleware et HMR |
| `npm run build` | Compile l'application React (Vite) + bundle le serveur Node en ESM (`dist/server.js`) |
| `npm run start` | Démarre le serveur compilé en mode production optimisé (`dist/server.js`) |
| `npm run test` | Exécute la suite de tests automatisés Vitest |
| `npm run lint` | Valide la compilation TypeScript (`tsc --noEmit`) |
| `npm run preview` | Prévisualise le build Vite |

---

## 🛡️ Architecture & Sécurité (OWASP & ASVS)

L'application intègre des contrôles stricts de sécurité à chaque couche :

1. **Headers de Sécurité Durcis (server.ts)** :
   - Content Security Policy (CSP) sans `unsafe-eval`, restreint aux CDN et API légitimes (Google Fonts, Firebase, Open-Meteo).
   - HSTS (`Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`).
   - Permissions-Policy (`camera=(self), microphone=(self), geolocation=(self)`).
   - `Cross-Origin-Resource-Policy: same-origin` & `Cross-Origin-Opener-Policy: same-origin`.
   - Protection contre le MIME-sniffing (`X-Content-Type-Options: nosniff`) et Clickjacking (`X-Frame-Options: SAMEORIGIN`).

2. **Défense Anti-Déni de Service & Rate Limiting** :
   - Moteur de limitation par fenêtre glissante (Token Bucket) par IP et chemin.
   - Headers normalisés `X-RateLimit-*` et code retour `429 Too Many Requests`.

3. **Protection contre l'Injection SQL & XSS** :
   - Nettoyage automatique des charges utiles JSON (`<script>`, octets nuls, protocoles suspects).
   - Validation stricte des requêtes paramétrées via `/api/query` (détection des motifs d'injection SQL).

4. **Sécurité Firestore (firestore.rules)** :
   - Modèle Default-Deny par défaut.
   - Contrôle d'accès basé sur les rôles (RBAC) : Acheteur, Vendeur/Producteur, Pépiniériste, Transporteur, Administrateur.
   - Validation numérique stricte (prix $\ge 0$, quantités $\ge 0$).
   - Protection Anti-IDOR sur les commandes, séquestres et discussions.

---

## 📦 Structure du Projet

```
.
├── .github/workflows/
│   └── ci.yml                     # Pipeline GitHub Actions (Lint, Test, Build)
├── src/
│   ├── components/                # Composants d'interface (Marché, Pépinière, B2B...)
│   │   └── modals/
│   │       └── AppModalsContainer.tsx  # Orchestrateur modulaire des dialogues et toasts
│   ├── context/
│   │   └── AppContext.tsx         # Gestion d'état global réactif
│   ├── data/                      # Données de référence agronomiques et annuaires
│   ├── services/                  # Connecteurs Firebase, Météo, Auth, Excel
│   ├── tests/                     # Tests automatisés Vitest
│   ├── types.ts                   # Définitions TypeScript complètes
│   ├── App.tsx                    # Shell applicatif épuré
│   └── main.tsx                   # Point d'entrée React
├── server.ts                      # Backend Express sécurisé avec proxy API & middleware Vite
├── firestore.rules                # Règles de sécurité Firebase Firestore
├── firebase-blueprint.json        # Schéma déclaratif de données
├── PRIVACY_POLICY.md              # Politique de confidentialité conforme RGPD & CNDP Maroc
├── TERMS.md                       # Conditions Générales d'Utilisation B2B
└── vitest.config.ts               # Configuration de test Vitest
```

---

## 🧪 Tests Automatisés

Pour lancer la suite de tests unitaires et de sécurité :
```bash
npm run test
```

---

## 📜 Conformité Légale & Données

- **CNDP (Maroc - Loi 09-08)** & **RGPD (UE 2016/679)** : Consulter `PRIVACY_POLICY.md`.
- **Règlementation Phytosanitaire ONSSA** : Consulter `TERMS.md` pour les règles de vente de matériel végétal certifié.
