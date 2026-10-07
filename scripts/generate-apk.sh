#!/usr/bin/env bash
# ==============================================================================
# AgriStock Maroc - Script de Génération Automatisée d'APK Android (TWA / PWA)
# ==============================================================================
set -e

echo "🚀 Préparation de l'environnement de compilation Android APK / AAB..."

# Vérification de Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js (v18+)."
    exit 1
fi

APP_URL="${1:-https://ais-pre-gmnjaequ5jzb2kmbsr6dqn-96795189534.europe-west1.run.app}"
PACKAGE_NAME="ma.agrimaroc.nurserymarket"
APP_NAME="AgriStock Maroc"

echo "📱 URL de l'application : $APP_URL"
echo "📦 Package ID : $PACKAGE_NAME"

# Installation de Bubblewrap CLI si nécessaire
if ! command -v bubblewrap &> /dev/null; then
    echo "📦 Installation de @bubblewrap/cli..."
    npm install -g @bubblewrap/cli
fi

# Initialisation du projet TWA Android
BUILD_DIR="./android-twa-build"
mkdir -p "$BUILD_DIR"
cd "$BUILD_DIR"

echo "⚙️ Génération du projet Android depuis le Web Manifest..."
bubblewrap init --manifest="${APP_URL}/manifest.webmanifest"

echo "🔨 Compilation du fichier APK et AAB..."
bubblewrap build

echo "✅ Compilation terminée avec succès !"
echo "📁 Vos fichiers se trouvent dans $BUILD_DIR :"
echo "   - app-release-signed.apk (Installation directe sur smartphone / test)"
echo "   - app-release-bundle.aab (Téléversement sur Google Play Console)"
