'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Building, ArrowRight, Eye, EyeOff, Sparkles, Building2, AlertCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export default function RegistroPage() {
  const router = useRouter();
  const { checkAuth } = useApp();

  const [companyName, setCompanyName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve conter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Falha ao realizar cadastro.');
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
      <div className="w-full max-w-lg card overflow-hidden shadow-2xl animate-fade-up">
        <div className="relative overflow-hidden gradient-mesh p-8 text-white">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/15 blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/10 blur-2xl translate-y-1/2 -translate-x-1/4" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-white/15 backdrop-blur-md flex items-center justify-center p-2 mb-3 border border-white/20 shadow-lg">
              <img src="/icon.png" alt="Eco Soluções" className="w-full h-full object-contain" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 text-white text-xs font-semibold backdrop-blur-sm mb-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Nova Empresa
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight">Criar Conta no Eco Soluções</h1>
            <p className="text-white/80 text-xs sm:text-sm mt-1 max-w-sm">
              Cadastre sua empresa para começar a gerenciar setores, demandas e metas em tempo real.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8 bg-surface-1">
          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2 animate-fade-up">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-text-secondary text-xs font-semibold mb-1.5 uppercase tracking-wider">
                  Nome da Empresa
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Minha Empresa S/A"
                    className="input input-with-icon"
                  />
                </div>
              </div>

              <div>
                <label className="block text-text-secondary text-xs font-semibold mb-1.5 uppercase tracking-wider">
                  Seu Nome / Cargo
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Diretor / Gestor"
                    className="input input-with-icon"
                  />
                </div>
              </div>
            </div>

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
                  placeholder="contato@suaempresa.com"
                  className="input input-with-icon"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-text-secondary text-xs font-semibold mb-1.5 uppercase tracking-wider">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
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

              <div>
                <label className="block text-text-secondary text-xs font-semibold mb-1.5 uppercase tracking-wider">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="input input-with-icon"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 mt-2 text-sm font-bold shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <span>Criando conta da empresa...</span>
              ) : (
                <>
                  Criar Conta e Começar
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-surface-border text-center space-y-3">
            <p className="text-xs text-text-muted">
              Já possui uma conta?{' '}
              <Link href="/login" className="text-brand font-bold hover:underline">
                Fazer login
              </Link>
            </p>

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
