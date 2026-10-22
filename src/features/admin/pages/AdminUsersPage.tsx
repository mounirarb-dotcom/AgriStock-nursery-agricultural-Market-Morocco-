import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { tr } from '../../../utils/translations';
import { UserRole, UserProfile } from '../../../types';
import {
  Users,
  Search,
  ShieldCheck,
  UserX,
  UserCheck,
  ArrowLeft,
  Mail,
  Phone,
  Building,
} from 'lucide-react';
import { RoleAccessRestrictedNotice } from '../../../components/RoleAccessRestrictedNotice';

export const AdminUsersPage: React.FC = () => {
  const {
    language,
    userAccountsList,
    suspendUserAccount,
    reactivateUserAccount,
    validateUserProfessionalProfile,
    adminSession,
    setActiveTab,
  } = useApp();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');

  if (!adminSession || !adminSession.token) {
    return (
      <RoleAccessRestrictedNotice
        requiredRole="admin"
        title="Accès Administrateur Requis"
        description="La gestion des comptes utilisateurs est strictement réservée à l'équipe de supervision."
      />
    );
  }

  const filtered = userAccountsList.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        (u.displayName && u.displayName.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.companyName && u.companyName.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-6 px-3 sm:px-6 space-y-6 animate-in fade-in duration-200 pb-20 md:pb-8">
      <button
        type="button"
        onClick={() => setActiveTab('admin_dashboard')}
        className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{tr(language, 'Retour à la supervision', 'العودة للإدارة', 'Back to Admin')}</span>
      </button>

      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-bold border border-purple-200 mb-1.5">
            <Users className="w-3.5 h-3.5 text-purple-600" />
            <span>GESTION DES COMPTES UTILISATEURS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Utilisateurs & Profils Professionnels ({userAccountsList.length})
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Validation des agréments, modération des accès et gestion des statuts de compte.
          </p>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher nom, email, société..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:border-purple-500 focus:outline-hidden"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          {(['ALL', 'seller', 'buyer', 'nursery', 'carrier'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r as any)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 ${
                roleFilter === r ? 'bg-stone-900 text-white font-bold' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {r === 'ALL' ? 'Tous' : r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table des utilisateurs */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-stone-100 text-xs">
          {filtered.map((u) => (
            <div key={u.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/50 transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-sm shrink-0">
                  {u.displayName ? u.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-stone-900">{u.displayName || 'Utilisateur'}</span>
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-mono font-bold uppercase">
                      {u.role}
                    </span>
                    {u.status === 'suspended' ? (
                      <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold">
                        Suspendu
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Actif
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-stone-500 text-[11px] mt-0.5 flex-wrap">
                    {u.companyName && <span>🏢 {u.companyName}</span>}
                    {u.email && <span>✉️ {u.email}</span>}
                    {u.phone && <span>📞 {u.phone}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => validateUserProfessionalProfile(u.id, u.isProCertified ? 'rejected' : 'verified')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer ${
                    u.isProCertified
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{u.isProCertified ? 'Agréé Pro' : 'Valider Agréé'}</span>
                </button>

                {u.status === 'suspended' ? (
                  <button
                    type="button"
                    onClick={() => reactivateUserAccount(u.id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 transition"
                  >
                    Réactiver
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const reason = prompt('Motif de suspension administrative :');
                      if (reason) suspendUserAccount(u.id, reason);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold transition"
                  >
                    Suspendre
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
