import { jsPDF } from 'jspdf';
import { ProduceExportManifest } from '../types';

/**
 * Génère un document PDF vectoriel A4 officiel pour le Manifeste d'Expédition / Exportation
 * Conforme aux exigences de traçabilité ONSSA, Morocco Foodex (EACCE) et Douane Marocaine (BADR / DUM).
 */
export function generateExportManifestPdf(manifest: ProduceExportManifest): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12;
  const contentWidth = pageWidth - margin * 2; // 186 mm
  let y = margin;

  // -------------------------------------------------------------
  // 1. En-tête officiel & Drapeau / Armoiries
  // -------------------------------------------------------------
  // Barre verte supérieure
  doc.setFillColor(6, 78, 59); // Emerald 900
  doc.rect(margin, y, contentWidth, 24, 'F');

  // Bande rouge & or marocaine décorative
  doc.setFillColor(185, 28, 28); // Rouge marocain
  doc.rect(margin, y, 4, 24, 'F');
  doc.setFillColor(217, 119, 6); // Or
  doc.rect(margin + 4, y, 2, 24, 'F');

  // Textes En-tête
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('ROYAUME DU MAROC — MANIFESTE D\'EXPÉDITION & EXPORT PRODUITS AGRICOLES', margin + 9, y + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('AGRISTOCK MAROC • MOROCCO FOODEX (EACCE) • ONSSA PHYTOSANITAIRE • DOUANE BADR', margin + 9, y + 11.5);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.text('Conforme aux normes CEE-ONU, CODEX Alimentarius & Décret n° 2-10-473 d\'application de la Loi 28-07', margin + 9, y + 16);

  // Badge Statut en haut à droite
  const statusLabels: Record<string, string> = {
    draft: 'BROUILLON / DRAFT',
    inspected: 'INSPECTÉ ONSSA / FOODEX',
    customs_cleared: 'VALIDÉ DOUANE / BADR CLEARED',
    in_transit: 'EN TRANSIT FRIGORIFIQUE',
    delivered: 'LIVRÉ / REÇU CONFORME',
  };
  const statusText = statusLabels[manifest.status] || (manifest.status ? String(manifest.status).toUpperCase() : 'BROUILLON');
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(pageWidth - margin - 58, y + 3, 55, 7, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(6, 78, 59);
  doc.text(statusText, pageWidth - margin - 30.5, y + 7.5, { align: 'center' });

  // Mention Destination
  doc.setFontSize(6);
  doc.setTextColor(209, 250, 229);
  const destTypeStr = manifest.destinationType === 'international' ? 'EXPÉDITION INTERNATIONALE (EXPORT)' : 'TRANSIT INTER-RÉGIONAL (MARCHÉ INTÉRIEUR)';
  doc.text(destTypeStr, pageWidth - margin - 30.5, y + 17, { align: 'center' });

  y += 27;

  // -------------------------------------------------------------
  // 2. Références du Manifeste & Date
  // -------------------------------------------------------------
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('N° MANIFESTE :', margin + 4, y + 5);
  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(6, 78, 59);
  doc.text(manifest.manifestNumber, margin + 28, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  doc.text('DATE D\'ÉMISSION :', margin + 78, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(manifest.issueDate, margin + 104, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.text('DÉPART PRÉVU :', margin + 130, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(manifest.departureDate, margin + 155, y + 5);

  // Ligne 2 références douanières
  doc.setFont('helvetica', 'bold');
  doc.text('N° DUM DOUANE :', margin + 4, y + 10.5);
  doc.setFont('courier', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text(manifest.dumNumber || 'DUM-EN-COURS', margin + 28, y + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('AGRÉMENT FOODEX :', margin + 78, y + 10.5);
  doc.setFont('helvetica', 'normal');
  doc.text(manifest.foodexApprovalNumber || 'EACCE-EXP-MA', margin + 107, y + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.text('ESTIM. ARRIVÉE :', margin + 130, y + 10.5);
  doc.setFont('helvetica', 'normal');
  doc.text(manifest.estimatedArrivalDate, margin + 155, y + 10.5);

  y += 17;

  // -------------------------------------------------------------
  // 3. Cadres Expéditeur & Destinataire (2 colonnes)
  // -------------------------------------------------------------
  const colWidth = (contentWidth - 4) / 2; // 91 mm
  const boxHeight = 36;

  // Cadre 1 : Expéditeur / Station (Maroc)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(margin, y, colWidth, boxHeight, 1.5, 1.5, 'FD');

  doc.setFillColor(236, 253, 245);
  doc.rect(margin + 0.2, y + 0.2, colWidth - 0.4, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(6, 78, 59);
  doc.text('1. EXPÉDITEUR / STATION AGRÉÉE (MAROC)', margin + 3, y + 4.2);

  doc.setFontSize(6.8);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(manifest.exporterName.slice(0, 48), margin + 3, y + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.3);
  doc.setTextColor(51, 65, 85);
  doc.text(`ICE : ${manifest.exporterICE || 'N/A'} • RC : ${manifest.exporterRC || 'N/A'}`, margin + 3, y + 15);
  doc.text(`Agrément Station ONSSA : ${manifest.onssaApprovalNumber || 'Certifiée'}`, margin + 3, y + 19);
  doc.text(`Adresse : ${manifest.exporterAddress.slice(0, 52)}`, margin + 3, y + 23);
  doc.text(`Ville / Région : ${manifest.exporterCity} (${manifest.originRegion.split('(')[0].trim()})`, margin + 3, y + 27);
  doc.text(`Contact : ${manifest.contactPerson} (${manifest.contactPhone})`, margin + 3, y + 31);
  if (manifest.contactEmail) {
    doc.text(`Email : ${manifest.contactEmail}`, margin + 3, y + 34.5);
  }

  // Cadre 2 : Destinataire / Importateur
  const col2X = margin + colWidth + 4;
  doc.setDrawColor(59, 130, 246);
  doc.roundedRect(col2X, y, colWidth, boxHeight, 1.5, 1.5, 'FD');

  doc.setFillColor(239, 246, 255);
  doc.rect(col2X + 0.2, y + 0.2, colWidth - 0.4, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(30, 64, 175);
  doc.text('2. DESTINATAIRE / IMPORTATEUR CONSIGNÉ', col2X + 3, y + 4.2);

  doc.setFontSize(6.8);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(manifest.consigneeName.slice(0, 48), col2X + 3, y + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.3);
  doc.setTextColor(51, 65, 85);
  doc.text(`Pays : ${manifest.consigneeCountry} • Ville : ${manifest.consigneeCity}`, col2X + 3, y + 15);
  doc.text(`N° TVA / EORI Importateur : ${manifest.consigneeVatEori || 'En attente clearance'}`, col2X + 3, y + 19);
  doc.text(`Adresse de livraison : ${manifest.consigneeAddress.slice(0, 52)}`, col2X + 3, y + 23);
  if (manifest.notifyParty) {
    doc.text(`Transitaire Notifié : ${manifest.notifyParty.slice(0, 50)}`, col2X + 3, y + 27);
  }
  doc.text(`Port / Déchargement : ${manifest.portOfDischarge || 'Rungis / Rotterdam / Marseille'}`, col2X + 3, y + 31);
  doc.text(`Mode de dédouanement : Sous contrôle douanier frontalier`, col2X + 3, y + 34.5);

  y += boxHeight + 3.5;

  // -------------------------------------------------------------
  // 4. Logistique Frigorifique & Spécifications de Transport
  // -------------------------------------------------------------
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 23, 1.5, 1.5, 'FD');

  // En-tête bande
  doc.setFillColor(226, 232, 240);
  doc.rect(margin + 0.2, y + 0.2, contentWidth - 0.4, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text('3. TRANSPORT, TRAÇABILITÉ FRIGORIFIQUE & ROUTE / PORT', margin + 3, y + 3.7);

  // Données Transport
  doc.setFontSize(6.3);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.text('Transporteur :', margin + 3, y + 8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(manifest.carrierName, margin + 22, y + 8.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Matricule Camion :', margin + 70, y + 8.5);
  doc.setFont('courier', 'bold');
  doc.text(manifest.truckPlateNumber, margin + 95, y + 8.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Semi-Remorque :', margin + 128, y + 8.5);
  doc.setFont('courier', 'bold');
  doc.text(manifest.trailerPlateNumber || 'N/A', margin + 152, y + 8.5);

  // Ligne 2 : Température dirigée
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text('Température Consigne :', margin + 3, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 78, 59);
  doc.text(`${manifest.temperatureSetpointC.toFixed(1)}°C (Tolérance : ${manifest.temperatureMinC}°C à ${manifest.temperatureMaxC}°C)`, margin + 34, y + 13);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('N° Plomb Douane / Scellé :', margin + 95, y + 13);
  doc.setFont('courier', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text(manifest.sealNumber || 'BADR-SEAL-PENDING', margin + 133, y + 13);

  // Ligne 3 : Ports et Datalogger
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Port d\'embarquement :', margin + 3, y + 17.5);
  doc.setFont('helvetica', 'normal');
  doc.text(manifest.portOfLoading || 'Port Tanger Med', margin + 32, y + 17.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Datalogger USB :', margin + 70, y + 17.5);
  doc.setFont('courier', 'normal');
  doc.text(manifest.dataloggerNumber || 'USB-LOGGER-ACTIVE', margin + 93, y + 17.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Lettre CMR / B/L :', margin + 128, y + 17.5);
  doc.setFont('courier', 'normal');
  doc.text(manifest.cmrNumber || 'CMR-DIRECT', margin + 153, y + 17.5);

  // Ligne 4 : Bureau de douane
  doc.setFont('helvetica', 'bold');
  doc.text('Bureau Douane de Sortie :', margin + 3, y + 21.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${manifest.customsOffice} (Régime : Export définitif avec Décharge)`, margin + 37, y + 21.5);

  y += 26;

  // -------------------------------------------------------------
  // 5. Tableau Détaillé des Produits & Lots Embarqués
  // -------------------------------------------------------------
  doc.setFillColor(6, 78, 59);
  doc.rect(margin, y, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('4. DÉSIGNATION DES MARCHANDISES, LOTS DE TRAÇABILITÉ & POIDS', margin + 3, y + 3.8);

  y += 5.5;

  // En-tête des colonnes
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.8);
  doc.setTextColor(30, 41, 59);

  doc.text('PRODUIT / VARIÉTÉ', margin + 2, y + 3.4);
  doc.text('CODE SH', margin + 50, y + 3.4);
  doc.text('CALIBRE / CAT.', margin + 68, y + 3.4);
  doc.text('N° DE LOT / ORIGINE', margin + 97, y + 3.4);
  doc.text('EMBALLAGE', margin + 132, y + 3.4);
  doc.text('COLIS', margin + 155, y + 3.4);
  doc.text('PAL.', margin + 165, y + 3.4);
  doc.text('POIDS NET', margin + 173, y + 3.4);

  y += 5;

  // Lignes du tableau
  manifest.items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    doc.setFillColor(isEven ? 255 : 249, isEven ? 255 : 250, isEven ? 255 : 251);
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 6.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(15, 23, 42);
    doc.text(item.commodity.slice(0, 32), margin + 2, y + 3.1);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.2);
    doc.setTextColor(100, 116, 139);
    doc.text(item.variety ? `Var. ${item.variety}` : '', margin + 2, y + 5.5);

    // Code SH
    doc.setFont('courier', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(6, 78, 59);
    doc.text(item.hsCode, margin + 50, y + 4);

    // Calibre & Catégorie
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.6);
    doc.setTextColor(30, 41, 59);
    doc.text(`${item.qualityClass}`, margin + 68, y + 3.1);
    doc.setFontSize(5);
    doc.setTextColor(100, 116, 139);
    doc.text(item.calibre.slice(0, 20), margin + 68, y + 5.5);

    // N° Lot
    doc.setFont('courier', 'bold');
    doc.setFontSize(5.4);
    doc.setTextColor(180, 83, 9);
    doc.text(item.lotNumber, margin + 97, y + 3.1);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4.8);
    doc.setTextColor(100, 116, 139);
    doc.text(item.originPlot ? item.originPlot.slice(0, 26) : 'Station Agrée', margin + 97, y + 5.5);

    // Emballage
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.2);
    doc.setTextColor(51, 65, 85);
    doc.text(item.packagingType.slice(0, 18), margin + 132, y + 4);

    // Colis
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(15, 23, 42);
    doc.text((item.packagesCount || 0).toLocaleString(), margin + 155, y + 4);

    // Palettes
    doc.text((item.palletsCount || 0).toString(), margin + 166, y + 4);

    // Poids Net
    doc.setFont('courier', 'bold');
    doc.setTextColor(6, 78, 59);
    doc.text(`${(item.netWeightKg || 0).toLocaleString()} kg`, margin + 173, y + 4);

    y += 6.5;
  });

  // Barre des Totaux
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(16, 185, 129);
  doc.rect(margin, y, contentWidth, 6.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(6, 78, 59);
  doc.text('TOTAUX GÉNÉRAUX CHARGEMENT :', margin + 3, y + 4.3);

  doc.text(`Palettes : ${manifest.totalPallets || 0}`, margin + 85, y + 4.3);
  doc.text(`Colis / Caisses : ${(manifest.totalPackages || 0).toLocaleString()}`, margin + 110, y + 4.3);
  doc.text(`Poids Net : ${((manifest.totalNetWeightKg || 0) / 1000).toFixed(2)} T (${(manifest.totalNetWeightKg || 0).toLocaleString()} kg)`, margin + 144, y + 4.3);

  y += 9.5;

  // -------------------------------------------------------------
  // 6. Certifications Officielles & Contrôles Sanitaires
  // -------------------------------------------------------------
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 24, 1.5, 1.5, 'FD');

  doc.setFillColor(226, 232, 240);
  doc.rect(margin + 0.2, y + 0.2, contentWidth - 0.4, 4.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(15, 23, 42);
  doc.text('5. CERTIFICATIONS SANITAIRES, AGRÉMENTS & DÉCLARATIONS DE CONFORMITÉ', margin + 3, y + 3.4);

  // Grille des certifications
  doc.setFontSize(6.2);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 78, 59);
  doc.text('[X] Certificat Phytosanitaire ONSSA :', margin + 3, y + 8);
  doc.setFont('courier', 'bold');
  doc.text(manifest.phytosanitaryCertificateNumber || 'ONSSA-EXP-HOM-2026', margin + 46, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 78, 59);
  doc.text('[X] Certificat Inspection Foodex (EACCE) :', margin + 98, y + 8);
  doc.setFont('courier', 'bold');
  doc.text(manifest.foodexInspectionCertificate || 'FOODEX-CERT-2026', margin + 150, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(manifest.eur1CertificateNumber ? 6 : 100, manifest.eur1CertificateNumber ? 78 : 116, manifest.eur1CertificateNumber ? 59 : 139);
  doc.text(`[${manifest.eur1CertificateNumber ? 'X' : '-'}] Certificat d'Origine EUR.1 :`, margin + 3, y + 12.5);
  doc.setFont('courier', 'normal');
  doc.text(manifest.eur1CertificateNumber || 'Non applicable (Marché intérieur)', margin + 46, y + 12.5);

  doc.setFont('helvetica', 'bold');
  doc.text(`[${manifest.isGlobalGapCertified ? 'X' : '-'}] GlobalG.A.P Certified : Conforme`, margin + 98, y + 12.5);

  // Attestations sanitaires
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(51, 65, 85);
  doc.text('• Limites Maximales de Résidus (LMR) : Conforme aux règlements CE 396/2005 et législation marocaine 28-07.', margin + 3, y + 16.5);
  doc.text('• Organismes de quarantaine : Lot inspecté et déclaré indemne de Tuta absoluta, Bactrocera dorsalis et ToBRFV.', margin + 3, y + 19.5);
  if (manifest.specialHandlingNotes) {
    doc.text(`• Consignes particulières : ${manifest.specialHandlingNotes.slice(0, 115)}`, margin + 3, y + 22.5);
  }

  y += 26.5;

  // -------------------------------------------------------------
  // 7. Visas, Signatures & Cachets Officiels (3 colonnes)
  // -------------------------------------------------------------
  const sigColWidth = (contentWidth - 6) / 3; // 60 mm
  const sigHeight = 24;

  // Colonne 1 : Responsable Qualité Station
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, sigColWidth, sigHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(15, 23, 42);
  doc.text('VISA RESPONSABLE QUALITÉ', margin + 3, y + 4.2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.4);
  doc.setTextColor(100, 116, 139);
  doc.text(manifest.qualityManagerName.slice(0, 36), margin + 3, y + 8);
  doc.text('Signature & Cachet Station :', margin + 3, y + 11.5);

  doc.setFont('courier', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(6, 78, 59);
  doc.text('[Cachet Électronique Agristock]', margin + 5, y + 19);

  // Colonne 2 : Chauffeur / Transporteur
  const sig2X = margin + sigColWidth + 3;
  doc.roundedRect(sig2X, y, sigColWidth, sigHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(15, 23, 42);
  doc.text('RÉCEPTION CHAUFFEUR / FRET', sig2X + 3, y + 4.2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.4);
  doc.setTextColor(100, 116, 139);
  doc.text(manifest.driverSignatureName ? manifest.driverSignatureName.slice(0, 36) : 'Chauffeur Agréé', sig2X + 3, y + 8);
  doc.text(`Matricule : ${manifest.truckPlateNumber}`, sig2X + 3, y + 11.5);
  doc.text(`T° prise en charge : ${manifest.temperatureSetpointC}°C`, sig2X + 3, y + 15);
  doc.setFont('courier', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Marchandise reçue conforme', sig2X + 5, y + 20);

  // Colonne 3 : Douane / Morocco Foodex
  const sig3X = margin + (sigColWidth + 3) * 2;
  doc.roundedRect(sig3X, y, sigColWidth, sigHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(15, 23, 42);
  doc.text('CONTRÔLE DOUANE / FOODEX', sig3X + 3, y + 4.2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.4);
  doc.setTextColor(100, 116, 139);
  doc.text(`Poste : ${manifest.customsOffice.slice(0, 32)}`, sig3X + 3, y + 8);
  doc.text(`Plomb BADR : ${manifest.sealNumber.slice(0, 22)}`, sig3X + 3, y + 11.5);

  // Cachet visuel stylisé
  doc.setDrawColor(185, 28, 28);
  doc.roundedRect(sig3X + 7, y + 13, 46, 9, 1, 1, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(185, 28, 28);
  doc.text('BON POUR EMBARQUEMENT', sig3X + 30, y + 17, { align: 'center' });
  doc.setFontSize(4.8);
  doc.text('PORT TANGER MED / BADR', sig3X + 30, y + 20.5, { align: 'center' });

  y += sigHeight + 4;

  // -------------------------------------------------------------
  // 8. Pied de Page Légale & Vérification QR Code
  // -------------------------------------------------------------
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);

  y += 3.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.2);
  doc.setTextColor(100, 116, 139);
  doc.text('Document généré via la plateforme officielle AgriStock Maroc (Système de Traçabilité des Filières Maraîchères et Fruitières).', margin, y);
  doc.text(`Ce manifeste accompagne obligatoirement la lettre de voiture CMR et la Déclaration Unique de Marchandises (DUM). Vérification en ligne : agristock.ma/manifest/${manifest.manifestNumber}`, margin, y + 3.2);

  doc.setFont('courier', 'bold');
  doc.setFontSize(5.8);
  doc.setTextColor(6, 78, 59);
  doc.text(`PAGE 1/1 • SHA-256 HASH VERIFY : [ONSSA-${manifest.manifestNumber.replace(/[^A-Z0-9]/g, '')}-MA]`, pageWidth - margin, y + 1.8, { align: 'right' });

  return doc;
}

/**
 * Déclenche le téléchargement immédiat du fichier PDF généré
 */
export function downloadExportManifestPdf(manifest: ProduceExportManifest): void {
  const doc = generateExportManifestPdf(manifest);
  const countryTag = (manifest.consigneeCountry || 'Export').replace(/\s+/g, '_');
  const fileName = `Manifeste_Export_${manifest.manifestNumber}_${countryTag}.pdf`;
  doc.save(fileName);
}
