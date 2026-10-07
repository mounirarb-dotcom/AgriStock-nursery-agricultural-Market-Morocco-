import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AdministratorAccount,
  AdminModulePermission,
} from '../../types';
import { ALL_ADMIN_MODULE_PERMISSIONS } from '../../services/adminFirestore';
import {
  ShieldAlert,
  ShieldCheck,
  Key,
  Users,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Eye,
  Lock,
  Truck,
  Sprout,
  Package,
  DollarSign,
  MessageSquare,
  FileText,
  Clock,
  Sparkles,
  Check,
  X,
  Search,
  AlertTriangle,
  Zap,
  Phone,
  Mail,
  Briefcase,
  UserCheck,
  SlidersHorizontal,
} from 'lucide-react';

interface AdminRoleManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminRoleManagementModal: React.FC<AdminRoleManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    adminSession,
    administratorAccounts,
    createAdministratorAccount,
    updateAdministratorAccount,
    toggleAdministratorStatus,
    deleteAdministratorAccount,
    switchAdminSessionPreview,
    isSuperAdmin,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'ALL' | 'super_admin' | 'admin' | 'suspended'>('ALL');

  // Edit / Details Modal State
  const [editingAccount, setEditingAccount] = useState<AdministratorAccount | null>(null);

  // New Account Creation Form State
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newAccountForm, setNewAccountForm] = useState<{
    displayName: string;
    email: string;
    jobTitle: string;
    phone: string;
    role: 'super_admin' | 'admin';
    permissions: AdminModulePermission[];
    customPasskey: string;
    notes: string;
  }>({
    displayName: '',
    email: '',
    jobTitle: '',
    phone: '',
    role: 'admin',
    permissions: ['overview', 'market'],
    customPasskey: 'Admin2026!',
    notes: '',
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered Accounts
  const filteredAccounts = useMemo(() => {
    return administratorAccounts.filter((acc) => {
      const matchesSearch =
        acc.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (acc.jobTitle && acc.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        acc.permissions.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedRoleFilter === 'super_admin') return acc.role === 'super_admin';
      if (selectedRoleFilter === 'admin') return acc.role === 'admin' && acc.status !== 'suspended';
      if (selectedRoleFilter === 'suspended') return acc.status === 'suspended';

      return true;
    });
  }, [administratorAccounts, searchQuery, selectedRoleFilter]);

  if (!isOpen) return null;

  // Preset permissions templates for fast allocation
  const applyPresetTemplate = (template: 'transport' | 'pepinieres' | 'market' | 'pub' | 'full') => {
    if (!editingAccount) return;
    let nextPermissions: AdminModulePermission[] = ['overview'];
    if (template === 'transport') {
      nextPermissions = ['overview', 'transport', 'documents'];
    } else if (template === 'pepinieres') {
      nextPermissions = ['overview', 'pepinieres', 'documents'];
    } else if (template === 'market') {
      nextPermissions = ['overview', 'market', 'moderation'];
    } else if (template === 'pub') {
      nextPermissions = ['overview', 'pub'];
    } else if (template === 'full') {
      nextPermissions = [
        'overview',
        'pub',
        'pepinieres',
        'market',
        'transport',
        'escrow',
        'commissions',
        'users',
        'moderation',
        'documents',
        'audit',
        'admin_roles',
      ];
    }
    setEditingAccount({
      ...editingAccount,
      permissions: nextPermissions,
      role: template === 'full' ? 'super_admin' : 'admin',
    });
  };

  const applyNewAccountPreset = (template: 'transport' | 'pepinieres' | 'market' | 'pub' | 'full') => {
    let nextPermissions: AdminModulePermission[] = ['overview'];
    if (template === 'transport') {
      nextPermissions = ['overview', 'transport', 'documents'];
    } else if (template === 'pepinieres') {
      nextPermissions = ['overview', 'pepinieres', 'documents'];
    } else if (template === 'market') {
      nextPermissions = ['overview', 'market', 'moderation'];
    } else if (template === 'pub') {
      nextPermissions = ['overview', 'pub'];
    } else if (template === 'full') {
      nextPermissions = [
        'overview',
        'pub',
        'pepinieres',
        'market',
        'transport',
        'escrow',
        'commissions',
        'users',
        'moderation',
        'documents',
        'audit',
        'admin_roles',
      ];
    }
    setNewAccountForm((prev) => ({
      ...prev,
      permissions: nextPermissions,
      role: template === 'full' ? 'super_admin' : 'admin',
    }));
  };

  const handleTogglePermission = (permId: AdminModulePermission) => {
    if (!editingAccount) return;
    const current = editingAccount.permissions || [];
    let updated: AdminModulePermission[];
    if (current.includes(permId)) {
      updated = current.filter((p) => p !== permId);
      if (updated.length === 0) {
        updated = ['overview'];
      }
    } else {
      updated = [...current, permId];
    }
    setEditingAccount({
      ...editingAccount,
      permissions: updated,
    });
  };

  const handleToggleNewAccountPermission = (permId: AdminModulePermission) => {
    const current = newAccountForm.permissions || [];
    let updated: AdminModulePermission[];
    if (current.includes(permId)) {
      updated = current.filter((p) => p !== permId);
      if (updated.length === 0) updated = ['overview'];
    } else {
      updated = [...current, permId];
    }
    setNewAccountForm((prev) => ({
      ...prev,
      permissions: updated,
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingAccount) return;
    await updateAdministratorAccount(editingAccount);
    showToast(`Pouvoirs mis à jour pour ${editingAccount.displayName}`);
    setEditingAccount(null);
  };

  const handleCreateAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountForm.displayName || !newAccountForm.email) {
      alert('Veuillez renseigner le nom et l\'adresse email.');
      return;
    }

    const emailNorm = newAccountForm.email.trim().toLowerCase();
    const existing = administratorAccounts.find((a) => a.email.toLowerCase() === emailNorm);
    if (existing) {
      alert('Un compte administrateur avec cette adresse email existe déjà.');
      return;
    }

    await createAdministratorAccount({
      displayName: newAccountForm.displayName.trim(),
      email: emailNorm,
      jobTitle: newAccountForm.jobTitle.trim() || 'Administrateur de Volet',
      phone: newAccountForm.phone.trim() || '+212 6 00 00 00 00',
      role: newAccountForm.role,
      permissions: newAccountForm.permissions,
      status: 'active',
      customPasskey: newAccountForm.customPasskey.trim() || 'Admin2026!',
      notes: newAccountForm.notes.trim() || 'Compte créé par le Super Administrateur',
    });

    showToast(`Compte administrateur créé avec succès pour ${newAccountForm.displayName}`);
    setIsCreatingNew(false);
    setNewAccountForm({
      displayName: '',
      email: '',
      jobTitle: '',
      phone: '',
      role: 'admin',
      permissions: ['overview', 'market'],
      customPasskey: 'Admin2026!',
      notes: '',
    });
  };

  return (
    <div
      id="modal-admin-roles-settings"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="bg-stone-950 border border-purple-900/60 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950/80 via-stone-900 to-stone-900 border-b border-purple-800/40 p-4 sm:p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Gestion des Pouvoirs d'Accès Administrateurs
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-600/40">
                  SUPER ADMIN EXCLUSIF
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Déléguez et restreignez les volets opérationnels : <span className="text-amber-400 font-semibold">Pub</span>, <span className="text-emerald-400 font-semibold">Pépinières</span>, <span className="text-green-400 font-semibold">Market</span>, <span className="text-blue-400 font-semibold">Transport</span>, etc.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsCreatingNew(true);
                setEditingAccount(null);
              }}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-purple-950/60 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Ajouter Administrateur</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Super Admin Notice Bar */}
        <div className="bg-purple-950/30 border-b border-purple-900/30 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-300">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Session active : <strong className="text-purple-300 font-semibold">{adminSession?.displayName}</strong> ({adminSession?.email})
            </span>
            <span className="text-stone-500">•</span>
            <span className="text-stone-400">Rôle : {adminSession?.role === 'super_admin' ? 'Super Administrateur Fondateur' : 'Administrateur'}</span>
          </div>
          <div className="text-[11px] text-stone-400">
            {administratorAccounts.length} administrateurs enregistrés • {administratorAccounts.filter((a) => a.status === 'active').length} actifs
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/50 px-6 py-2 text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Main Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* SEARCH & FILTERS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-900/60 p-3 rounded-2xl border border-stone-800/80">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom, email, volet..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs scrollbar-none">
              {(
                [
                  { id: 'ALL', label: 'Tous' },
                  { id: 'super_admin', label: 'Super Admins' },
                  { id: 'admin', label: 'Admins de Volet' },
                  { id: 'suspended', label: 'Suspendus' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedRoleFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap cursor-pointer ${
                    selectedRoleFilter === f.id
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* LIST OF ADMINISTRATORS */}
          <div className="space-y-4">
            {filteredAccounts.length === 0 ? (
              <div className="text-center py-12 bg-stone-900/30 rounded-2xl border border-stone-800/50">
                <Users className="w-10 h-10 text-stone-600 mx-auto mb-2" />
                <p className="text-sm text-stone-400 font-medium">Aucun compte administrateur ne correspond à votre filtre.</p>
              </div>
            ) : (
              filteredAccounts.map((acc) => {
                const isCurrentSelf = (adminSession?.email || '').toLowerCase() === acc.email.toLowerCase();
                const isSuper = acc.role === 'super_admin';

                return (
                  <div
                    key={acc.id}
                    className={`rounded-2xl border transition p-4 sm:p-5 ${
                      acc.status === 'suspended'
                        ? 'bg-rose-950/10 border-rose-900/40 opacity-75'
                        : isSuper
                        ? 'bg-stone-900/80 border-purple-900/40 shadow-sm'
                        : 'bg-stone-900/60 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Admin Info */}
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shadow-inner shrink-0 ${
                            isSuper
                              ? 'bg-purple-600/30 text-purple-300 border border-purple-400/40'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-600/30'
                          }`}
                        >
                          {acc.displayName ? acc.displayName.charAt(0).toUpperCase() : 'A'}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm sm:text-base text-white">
                              {acc.displayName}
                            </h3>
                            {isCurrentSelf && (
                              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold border border-purple-400/30">
                                VOUS
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                isSuper
                                  ? 'bg-purple-950 text-purple-300 border-purple-600/40'
                                  : 'bg-stone-800 text-stone-300 border-stone-700'
                              }`}
                            >
                              {isSuper ? 'Super Admin' : 'Admin de Volet'}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                acc.status === 'active'
                                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                                  : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                              }`}
                            >
                              {acc.status === 'active' ? 'Actif' : 'Suspendu'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-400">
                            <div className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-stone-500" />
                              <span className="font-mono text-stone-300">{acc.email}</span>
                            </div>
                            {acc.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 text-stone-500" />
                                <span>{acc.phone}</span>
                              </div>
                            )}
                            {acc.jobTitle && (
                              <div className="flex items-center gap-1">
                                <Briefcase className="w-3.5 h-3.5 text-stone-500" />
                                <span className="text-stone-300">{acc.jobTitle}</span>
                              </div>
                            )}
                          </div>

                          {acc.notes && (
                            <p className="text-[11px] text-stone-400 italic pt-0.5">{acc.notes}</p>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
                        {/* Simulation / Preview button for Super Admin testing */}
                        {isSuperAdmin && !isCurrentSelf && (
                          <button
                            type="button"
                            onClick={() => {
                              switchAdminSessionPreview(acc.id);
                              showToast(`Mode aperçu activé : Vous testez la console avec les droits de ${acc.displayName}`);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                            title="Tester la console avec les droits restreints de cet administrateur"
                          >
                            <Eye className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Tester Droits</span>
                          </button>
                        )}

                        {/* Edit Permissions Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAccount(acc);
                            setIsCreatingNew(false);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 text-purple-300" />
                          <span>Régler Volets ({acc.permissions?.length || 0})</span>
                        </button>

                        {/* Suspend / Reactivate */}
                        {!isSuper && (
                          <button
                            type="button"
                            onClick={() => toggleAdministratorStatus(acc.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer border ${
                              acc.status === 'active'
                                ? 'bg-stone-900 hover:bg-rose-950/40 text-rose-400 border-rose-900/40'
                                : 'bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/40'
                            }`}
                          >
                            {acc.status === 'active' ? (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                <span>Suspendre</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Réactiver</span>
                              </>
                            )}
                          </button>
                        )}

                        {/* Delete Button */}
                        {!isSuper && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Confirmez-vous la suppression de l'administrateur ${acc.displayName} ?`)) {
                                deleteAdministratorAccount(acc.id);
                                showToast(`Administrateur ${acc.displayName} supprimé`);
                              }
                            }}
                            className="p-1.5 rounded-xl bg-stone-900 hover:bg-rose-950/50 text-stone-500 hover:text-rose-300 border border-stone-800 hover:border-rose-900/50 transition cursor-pointer"
                            title="Supprimer définitivement"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Volets Badges List */}
                    <div className="mt-3.5 pt-3 border-t border-stone-800/80">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold uppercase text-stone-400 tracking-wider">
                          Volets opérationnels autorisés ({acc.permissions?.length || 0}) :
                        </span>
                        {isSuper && (
                          <span className="text-[10px] text-purple-300 font-mono">
                            Pleins pouvoirs sur tous les 11 volets
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {ALL_ADMIN_MODULE_PERMISSIONS.map((perm) => {
                          const isAssigned = acc.permissions?.includes(perm.id);
                          return (
                            <span
                              key={perm.id}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition ${
                                isAssigned
                                  ? `${perm.badgeColor} font-semibold shadow-sm`
                                  : 'bg-stone-950 text-stone-600 border-stone-800/50 opacity-40 line-through'
                              }`}
                              title={perm.description}
                            >
                              {isAssigned ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <X className="w-3 h-3 text-stone-600" />
                              )}
                              <span>{perm.shortLabel}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-900/80 border-t border-stone-800 p-4 px-6 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-purple-400" />
            <span>Chaque administrateur dispose d'un accès strictement cloisonné à ses volets attribués.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold cursor-pointer"
          >
            Fermer la fenêtre
          </button>
        </div>
      </div>

      {/* ====================================================
          SUB-MODAL: CONFIGURATEUR GRANULAIRE DE VOLETS
         ==================================================== */}
      {editingAccount && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md">
          <div className="bg-stone-950 border border-purple-800/80 rounded-3xl p-6 max-w-2xl w-full text-stone-100 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    Attribution des Volets : {editingAccount.displayName}
                  </h3>
                  <p className="text-xs text-stone-400 font-mono">{editingAccount.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAccount(null)}
                className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Role & Title Quick Edit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-stone-400 font-semibold mb-1">Rôle Système :</label>
                <select
                  value={editingAccount.role}
                  onChange={(e) => {
                    const r = e.target.value as 'super_admin' | 'admin';
                    if (r === 'super_admin') {
                      applyPresetTemplate('full');
                    } else {
                      setEditingAccount({ ...editingAccount, role: r });
                    }
                  }}
                  className="w-full p-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white font-medium"
                >
                  <option value="admin">Administrateur de Volets Spécifiques</option>
                  <option value="super_admin">Super Administrateur (Pleins Pouvoirs)</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">Intitulé de Fonction :</label>
                <input
                  type="text"
                  value={editingAccount.jobTitle || ''}
                  onChange={(e) => setEditingAccount({ ...editingAccount, jobTitle: e.target.value })}
                  placeholder="Ex: Responsable Pôle Transport"
                  className="w-full p-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white"
                />
              </div>
            </div>

            {/* Quick Presets Buttons */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                Modèles d'attribution rapide en 1 clic :
              </label>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => applyPresetTemplate('transport')}
                  className="px-3 py-1.5 rounded-xl bg-blue-950/60 text-blue-300 border border-blue-600/40 hover:bg-blue-900/60 font-medium cursor-pointer"
                >
                  🚛 Volet Transport Frigo
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetTemplate('pepinieres')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-600/40 hover:bg-emerald-900/60 font-medium cursor-pointer"
                >
                  🌱 Volet Pépinières ONSSA
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetTemplate('market')}
                  className="px-3 py-1.5 rounded-xl bg-green-950/60 text-green-300 border border-green-600/40 hover:bg-green-900/60 font-medium cursor-pointer"
                >
                  🍎 Volet Market & Récoltes
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetTemplate('pub')}
                  className="px-3 py-1.5 rounded-xl bg-amber-950/60 text-amber-300 border border-amber-600/40 hover:bg-amber-900/60 font-medium cursor-pointer"
                >
                  📢 Volet Pub & Boosts B2B
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetTemplate('full')}
                  className="px-3 py-1.5 rounded-xl bg-purple-950/60 text-purple-300 border border-purple-600/40 hover:bg-purple-900/60 font-medium cursor-pointer"
                >
                  ⭐ Tous les Volets (Super Admin)
                </button>
              </div>
            </div>

            {/* Volets Granular Checklist */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
                Sélection manuelle des volets et fonctionnalités :
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto p-1 scrollbar-thin">
                {ALL_ADMIN_MODULE_PERMISSIONS.map((perm) => {
                  const isChecked = editingAccount.permissions?.includes(perm.id);
                  return (
                    <div
                      key={perm.id}
                      onClick={() => handleTogglePermission(perm.id)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 select-none ${
                        isChecked
                          ? 'bg-purple-950/30 border-purple-500/60 text-white'
                          : 'bg-stone-900/40 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent div
                        className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 bg-stone-950 border-stone-700"
                      />
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                          <span>{perm.label}</span>
                        </div>
                        <p className="text-[11px] text-stone-400 leading-snug">{perm.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Passkey Optional */}
            <div className="pt-2 border-t border-stone-800 text-xs">
              <label className="block text-stone-400 font-semibold mb-1">
                Clé d'accès administrateur personnalisée (optionnel) :
              </label>
              <input
                type="text"
                value={editingAccount.customPasskey || ''}
                onChange={(e) => setEditingAccount({ ...editingAccount, customPasskey: e.target.value })}
                placeholder="Ex: TaziTransport2026! (laisse vide pour clé générale)"
                className="w-full p-2.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-200 font-mono text-xs"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setEditingAccount(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-purple-950/60 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Enregistrer les Pouvoirs</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          SUB-MODAL: CRÉATION D'UN NOUVEL ADMINISTRATEUR
         ==================================================== */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md">
          <form
            onSubmit={handleCreateAccountSubmit}
            className="bg-stone-950 border border-purple-800/80 rounded-3xl p-6 max-w-2xl w-full text-stone-100 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-3 border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    Créer un Nouveau Compte Administrateur
                  </h3>
                  <p className="text-xs text-stone-400">
                    Définissez les coordonnées et les volets autorisés pour ce collaborateur
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Identity Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">Nom et Prénom * :</label>
                <input
                  type="text"
                  required
                  value={newAccountForm.displayName}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, displayName: e.target.value })}
                  placeholder="Ex: Hicham Naciri"
                  className="w-full p-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">Email de Connexion * :</label>
                <input
                  type="email"
                  required
                  value={newAccountForm.email}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, email: e.target.value })}
                  placeholder="Ex: naciri@agristock.ma"
                  className="w-full p-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">Intitulé de Poste / Pôle :</label>
                <input
                  type="text"
                  value={newAccountForm.jobTitle}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, jobTitle: e.target.value })}
                  placeholder="Ex: Responsable Régie Pub & B2B"
                  className="w-full p-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">Numéro Téléphone :</label>
                <input
                  type="tel"
                  value={newAccountForm.phone}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, phone: e.target.value })}
                  placeholder="+212 6 00 00 00 00"
                  className="w-full p-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white"
                />
              </div>
            </div>

            {/* Presets */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                Modèles de volets prédéfinis :
              </label>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => applyNewAccountPreset('transport')}
                  className="px-3 py-1.5 rounded-xl bg-blue-950/60 text-blue-300 border border-blue-600/40 hover:bg-blue-900/60 font-medium cursor-pointer"
                >
                  🚛 Volet Transport
                </button>
                <button
                  type="button"
                  onClick={() => applyNewAccountPreset('pepinieres')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-600/40 hover:bg-emerald-900/60 font-medium cursor-pointer"
                >
                  🌱 Volet Pépinières
                </button>
                <button
                  type="button"
                  onClick={() => applyNewAccountPreset('market')}
                  className="px-3 py-1.5 rounded-xl bg-green-950/60 text-green-300 border border-green-600/40 hover:bg-green-900/60 font-medium cursor-pointer"
                >
                  🍎 Volet Market
                </button>
                <button
                  type="button"
                  onClick={() => applyNewAccountPreset('pub')}
                  className="px-3 py-1.5 rounded-xl bg-amber-950/60 text-amber-300 border border-amber-600/40 hover:bg-amber-900/60 font-medium cursor-pointer"
                >
                  📢 Volet Pub & Boosts
                </button>
                <button
                  type="button"
                  onClick={() => applyNewAccountPreset('full')}
                  className="px-3 py-1.5 rounded-xl bg-purple-950/60 text-purple-300 border border-purple-600/40 hover:bg-purple-900/60 font-medium cursor-pointer"
                >
                  ⭐ Tous les Volets
                </button>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
                Volets autorisés pour cet administrateur ({newAccountForm.permissions.length}) :
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1 scrollbar-thin">
                {ALL_ADMIN_MODULE_PERMISSIONS.map((perm) => {
                  const isChecked = newAccountForm.permissions.includes(perm.id);
                  return (
                    <div
                      key={perm.id}
                      onClick={() => handleToggleNewAccountPermission(perm.id)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 select-none ${
                        isChecked
                          ? 'bg-purple-950/30 border-purple-500/60 text-white'
                          : 'bg-stone-900/40 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 bg-stone-950 border-stone-700"
                      />
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-stone-100">{perm.label}</div>
                        <p className="text-[11px] text-stone-400 leading-snug">{perm.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Passkey */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-stone-800">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  Code d'accès initial :
                </label>
                <input
                  type="text"
                  required
                  value={newAccountForm.customPasskey}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, customPasskey: e.target.value })}
                  placeholder="Admin2026!"
                  className="w-full p-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  Rôle Système :
                </label>
                <select
                  value={newAccountForm.role}
                  onChange={(e) => {
                    const r = e.target.value as 'super_admin' | 'admin';
                    if (r === 'super_admin') {
                      applyNewAccountPreset('full');
                    } else {
                      setNewAccountForm({ ...newAccountForm, role: r });
                    }
                  }}
                  className="w-full p-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white"
                >
                  <option value="admin">Administrateur de Volet (Restreint)</option>
                  <option value="super_admin">Super Administrateur (Pleins Pouvoirs)</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-purple-950/60 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Créer le Compte Administrateur</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
