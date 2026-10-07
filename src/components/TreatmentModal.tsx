import React, { useState, useEffect } from 'react';
import { NurseryLot, TreatmentLog } from '../types';
import { FlaskConical, X, Plus, Calendar, User, ShieldAlert } from 'lucide-react';

interface Props {
  lot: NurseryLot | null;
  onClose: () => void;
  onAddTreatment?: (lotId: string, treatment: Omit<TreatmentLog, 'id'>) => void;
  isOpen?: boolean;
}

export const TreatmentModal: React.FC<Props> = ({ lot, onClose, onAddTreatment, isOpen = true }) => {
  const [product, setProduct] = useState('');
  const [targetPest, setTargetPest] = useState('');
  const [dose, setDose] = useState('');
  const [technician, setTechnician] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !lot) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !targetPest) return;

    if (onAddTreatment) {
      onAddTreatment(lot.id, {
        date,
        product,
        targetPest,
        dose: dose || 'Standard fabricant',
        technician: technician || 'Responsable de serre',
      });
    }

    setProduct('');
    setTargetPest('');
    setDose('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Traitements Phytosanitaires & Entretien
              </h3>
              <p className="text-xs text-stone-500">
                Lot {lot.batchNumber || 'N/A'} — {lot.variety || ''} ({lot.species || ''})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition cursor-pointer"
            title="Fermer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Treatments List */}
        <div className="mt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
            Historique du registre phytosanitaire ({lot.treatments?.length || 0})
          </h4>
          {lot.treatments && lot.treatments.length > 0 ? (
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {lot.treatments.map(t => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">{t.product}</span>
                    <span className="text-[11px] font-mono text-stone-500">{t.date}</span>
                  </div>
                  <div className="text-stone-600 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>Cible / Ravageur : {t.targetPest}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-200/60">
                    <span>Dosage : {t.dose}</span>
                    <span>Opérateur : {t.technician}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-stone-50 border border-dashed border-stone-200 text-center text-xs text-stone-500">
              Aucun traitement consigné pour ce lot pour le moment.
            </div>
          )}
        </div>

        {/* Form to log new treatment */}
        <form onSubmit={handleSubmit} className="mt-5 pt-4 border-t border-stone-200">
          <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5 mb-3">
            <Plus className="w-4 h-4 text-emerald-600" />
            Consigner une nouvelle intervention
          </h4>
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-stone-600 font-medium mb-1">Date d'application</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-emerald-600 text-stone-800"
                  required
                />
              </div>
              <div>
                <label className="block text-stone-600 font-medium mb-1">Produit / Traitement</label>
                <input
                  type="text"
                  placeholder="ex: Bouillie bordelaise, Savon noir..."
                  value={product}
                  onChange={e => setProduct(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-emerald-600 text-stone-800"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-stone-600 font-medium mb-1">Cible / Maladie / Ravageur</label>
                <input
                  type="text"
                  placeholder="ex: Oïdium, Cochenille, Pucerons..."
                  value={targetPest}
                  onChange={e => setTargetPest(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-emerald-600 text-stone-800"
                  required
                />
              </div>
              <div>
                <label className="block text-stone-600 font-medium mb-1">Dose appliquée</label>
                <input
                  type="text"
                  placeholder="ex: 200g / 100L"
                  value={dose}
                  onChange={e => setDose(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-emerald-600 text-stone-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-600 font-medium mb-1">Responsable / Technicien</label>
              <input
                type="text"
                placeholder="ex: Ing. Agronome Karim / Équipe Serre"
                value={technician}
                onChange={e => setTechnician(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-emerald-600 text-stone-800"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="px-3 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold cursor-pointer active:scale-95 transition"
              >
                Fermer
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Enregistrer l'opération
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
