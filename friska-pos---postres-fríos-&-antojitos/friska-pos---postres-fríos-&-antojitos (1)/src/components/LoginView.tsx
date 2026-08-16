import React, { useState } from 'react';
import { useAuth, ADMIN_EMAIL, ADMIN_PASSWORD } from '../context/AuthContext';
import { 
  IceCream, 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Loader2, 
  ShieldAlert,
  KeyRound,
  Sparkles
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { signInWithEmail } = useAuth();
  
  const [email, setEmail] = useState<string>('Friskadmi@friskapos.com');
  const [password, setPassword] = useState<string>('Frisk@1234');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Por favor ingresa tu correo y contraseña.');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(
        err?.message || 'Credenciales inválidas. Acceso restringido al personal autorizado.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoFillAndLogin = async () => {
    setEmail(ADMIN_EMAIL);
    setPassword(ADMIN_PASSWORD);
    setErrorMessage('');
    setIsLoading(true);
    try {
      await signInWithEmail(ADMIN_EMAIL, ADMIN_PASSWORD);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Background Subtle Gradient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Center Administrative Card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 p-0.5 shadow-lg mx-auto mb-3 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-orange-400">
              <IceCream className="w-8 h-8 stroke-[2.2]" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span>Friska POS</span>
          </h1>
          <div className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Acceso al Sistema</span>
          </div>
        </div>

        {/* Credentials helper card */}
        <div className="mb-4 p-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl text-xs flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
              <KeyRound className="w-3 h-3 text-amber-400" />
              <span>Cuenta Administrador:</span>
            </div>
            <div className="text-slate-200 font-mono font-bold text-[11px] truncate">
              {ADMIN_EMAIL}
            </div>
          </div>
          <button
            type="button"
            onClick={handleAutoFillAndLogin}
            disabled={isLoading}
            className="px-2.5 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 rounded-xl text-[11px] font-bold transition flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
            title="Ingresar automáticamente con la cuenta autorizada"
          >
            <Sparkles className="w-3 h-3 text-orange-400" />
            <span>Auto-Ingreso</span>
          </button>
        </div>

        {/* Feedback Message */}
        {errorMessage && (
          <div className="mb-4 p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Clean Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                id="login-email-input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Friskadmi@friskapos.com"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="login-password-input"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:from-orange-700 active:to-orange-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-950/40 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Ingresando al sistema...</span>
              </>
            ) : (
              <>
                <span>Ingresar al Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>

      {/* Security Note Footer */}
      <div className="mt-6 text-center text-slate-500 text-[11px] flex items-center gap-1.5 z-10">
        <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
        <span>Sistema protegido • Friska POS</span>
      </div>
    </div>
  );
};


