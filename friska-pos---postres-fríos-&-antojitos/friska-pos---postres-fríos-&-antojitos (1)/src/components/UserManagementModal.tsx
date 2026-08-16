import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, UserProfile } from '../types';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { 
  Users, 
  X, 
  ShieldCheck, 
  Briefcase, 
  ShoppingBag, 
  ChefHat, 
  Check, 
  Loader2, 
  UserPlus, 
  Mail, 
  Clock 
} from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const UserManagementModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { userProfile, role, updateUserRole } = useAuth();
  const [userList, setUserList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingUid, setSavingUid] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    try {
      const usersRef = collection(db, 'users');
      const unsubscribe = onSnapshot(usersRef, (snapshot) => {
        const loaded: UserProfile[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as UserProfile;
          loaded.push({
            uid: d.id,
            email: data.email || 'Sin correo',
            displayName: data.displayName || 'Usuario Friska',
            photoURL: data.photoURL,
            role: data.role || 'Cajero',
            createdAt: data.createdAt || Date.now(),
            lastLogin: data.lastLogin || Date.now(),
            status: data.status || 'active',
          });
        });
        setUserList(loaded);
        setLoading(false);
      }, (error) => {
        console.warn('Could not list users from Firestore (rules or offline):', error);
        // Provide current user in list if Firestore listing is restricted
        if (userProfile) {
          setUserList([userProfile]);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error fetching users:', err);
      setLoading(false);
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

  const handleRoleChange = async (targetUid: string, newRole: UserRole) => {
    setSavingUid(targetUid);
    setSuccessNotice(null);
    try {
      await updateUserRole(targetUid, newRole);
      setSuccessNotice(`Rol actualizado a "${newRole}" exitosamente.`);
      setTimeout(() => setSuccessNotice(null), 3000);
    } catch (err) {
      console.error('Error updating user role:', err);
    } finally {
      setSavingUid(null);
    }
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'CEO':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Supervisor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cajero':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cocinero':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 text-orange-400 rounded-xl border border-orange-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                Control de Usuarios & Roles (RBAC)
              </h2>
              <p className="text-xs text-slate-400">
                Administración de permisos y perfiles en Firestore
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Notice */}
        {successNotice && (
          <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-2 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-600 space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-orange-600" />
              <span>Matriz de Permisos por Rol:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="font-bold text-purple-700">CEO / Admin:</span> Acceso total a POS, Cocina, Menú, Historial, Reportes y Usuarios.
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="font-bold text-blue-700">Supervisor:</span> Acceso a POS, Cocina, Menú, Historial y Reportes.
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="font-bold text-emerald-700">Cajero:</span> Acceso a POS, Cocina e Historial de ventas.
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="font-bold text-orange-700">Cocinero:</span> Acceso prioritario y exclusivo a Cocina / KDS.
              </div>
            </div>
          </div>

          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Usuarios Registrados ({userList.length})
          </h3>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
              <span className="text-xs">Cargando usuarios desde Firestore...</span>
            </div>
          ) : userList.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No se encontraron otros usuarios.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
              {userList.map((u) => {
                const isCurrent = u.uid === userProfile?.uid;
                const isSaving = savingUid === u.uid;

                return (
                  <div key={u.uid} className="p-4 bg-white hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-black text-sm flex items-center justify-center shadow-xs">
                        {u.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{u.displayName}</span>
                          {isCurrent && (
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              Tú
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{u.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Role Selector Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isSaving ? (
                        <div className="flex items-center gap-1.5 text-xs text-orange-600 px-3 py-1.5">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Guardando...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                          {(['CEO', 'Supervisor', 'Cajero', 'Cocinero'] as UserRole[]).map((r) => {
                            const isSelected = u.role === r;
                            return (
                              <button
                                key={r}
                                type="button"
                                onClick={() => handleRoleChange(u.uid, r)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                  isSelected
                                    ? 'bg-orange-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                }`}
                              >
                                {r}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
          >
            Cerrar Panel
          </button>
        </div>

      </div>
    </div>
  );
};
