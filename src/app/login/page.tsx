'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Building2,
  AlertCircle,
  KeyRound,
  UserCheck,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export default function LoginPage() {
  const router = useRouter();
  const { checkAuth } = useApp();

  const [tab, setTab] = useState<'empresa' | 'colaborador'>('empresa');

  // Login Empresa
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Login Colaborador
  const [codigoAcesso, setCodigoAcesso] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmpresaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Falha ao realizar login.');
        setLoading(false);
        return;
      }

      await checkAuth();
      router.push('/');
    } catch {
      setError('Erro de conexão com o servidor.');
      setLoading(false);
    }
  };

  const handleColaboradorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!codigoAcesso.trim()) {
      setError('Por favor, informe o seu código de acesso.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/employee-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigoAcesso: codigoAcesso.trim().toUpperCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Código de acesso inválido ou expirado.');
        setLoading(false);
        return;
      }

      await checkAuth();
      router.push('/');
    } catch {
      setError('Erro de conexão com o servidor.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-md card overflow-hidden shadow-2xl animate-fade-up">
        {/* ─── Hero Banner com o Degradê gradient-mesh ─── */}
        <div className="relative overflow-hidden gradient-mesh p-8 text-white">
          {/* Decorative glowing orbs */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/15 blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/10 blur-2xl translate-y-1/2 -translate-x-1/4" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-white/15 backdrop-blur-md flex items-center justify-center p-2 mb-3 border border-white/20 shadow-lg">
              <img src="/icon.png" alt="Eco Soluções" className="w-full h-full object-contain" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 text-white text-xs font-semibold backdrop-blur-sm mb-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              {tab === 'empresa' ? 'Acesso Corporativo' : 'Acesso de Colaborador'}
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight">Eco Soluções</h1>
            <p className="text-white/80 text-xs sm:text-sm mt-1 max-w-xs">
              {tab === 'empresa'
                ? 'Entre com a conta da sua empresa para gerenciar setores, demandas e equipe.'
                : 'Insira seu código de acesso pessoal fornecido pelo gestor da sua empresa.'}
            </p>
          </div>
        </div>

        {/* ─── Abas de Login (Empresa vs Colaborador) ─── */}
        <div className="flex border-b border-surface-border bg-surface-2/40">
          <button
            type="button"
            onClick={() => {
              setTab('empresa');
              setError('');
            }}
            className={`flex-1 py-3.5 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              tab === 'empresa'
                ? 'border-brand text-brand bg-surface-1'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Sou Empresa
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('colaborador');
              setError('');
            }}
            className={`flex-1 py-3.5 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              tab === 'colaborador'
                ? 'border-brand text-brand bg-surface-1'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            Sou Colaborador
          </button>
        </div>

        {/* ─── Formulário ─── */}
        <div className="p-6 sm:p-8 bg-surface-1">
          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2 animate-fade-up">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {tab === 'empresa' ? (
            /* Formulário Empresa */
            <form onSubmit={handleEmpresaSubmit} className="space-y-4">
              <div>
                <label className="block text-text-secondary text-xs font-semibold mb-1.5 uppercase tracking-wider">
                  E-mail Corporativo
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="gestor@suaempresa.com"
                    className="input input-with-icon"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider">
                    Senha
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input input-with-icon pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 mt-2 text-sm font-bold shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <span>Acessando...</span>
                ) : (
                  <>
                    Entrar na Empresa
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Formulário Colaborador */
            <form onSubmit={handleColaboradorSubmit} className="space-y-4">
              <div>
                <label className="block text-text-secondary text-xs font-semibold mb-1.5 uppercase tracking-wider">
                  Código de Acesso do Colaborador
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand" />
                  <input
                    type="text"
                    required
                    autoFocus
                    value={codigoAcesso}
                    onChange={(e) => setCodigoAcesso(e.target.value.toUpperCase())}
                    placeholder="Ex: ECO-XXXX"
                    className="input input-with-icon font-mono font-bold tracking-widest text-brand"
                  />
                </div>
                <p className="text-[11px] text-text-muted mt-2">
                  Solicite o código de acesso exclusivo ao responsável da sua empresa. O código vincula você diretamente ao espaço de trabalho da organização.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 mt-2 text-sm font-bold shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <span>Validando Código...</span>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    Acessar como Colaborador
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-surface-border text-center space-y-3">
            {tab === 'empresa' && (
              <p className="text-xs text-text-muted">
                Ainda não tem conta da empresa?{' '}
                <Link href="/registro" className="text-brand font-bold hover:underline">
                  Cadastrar empresa
                </Link>
              </p>
            )}

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              <Building2 className="w-3.5 h-3.5" />
              Continuar navegando como visitante
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
