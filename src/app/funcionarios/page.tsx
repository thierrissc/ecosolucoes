'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Plus,
  Search,
  KeyRound,
  Copy,
  Check,
  Edit2,
  Trash2,
  ShieldCheck,
  DollarSign,
  Briefcase,
  Layers,
  RefreshCw,
  X,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Funcionario, TipoContrato, PermissoesFuncionario } from '@/types';
import ConfirmModal from '@/components/ui/ConfirmModal';

const TIPOS_CONTRATO: TipoContrato[] = ['CLT', 'PJ', 'Estágio', 'Temporário', 'Jovem Aprendiz', 'Outro'];

function generateRandomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ECO-${code}`;
}

export default function FuncionariosPage() {
  const {
    user,
    isAuthenticated,
    funcionarios,
    funcionariosLoading,
    setores,
    addFuncionario,
    updateFuncionario,
    deleteFuncionario,
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterSetor, setFilterSetor] = useState('todos');
  const [filterContrato, setFilterContrato] = useState('todos');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [setorId, setSetorId] = useState('');
  const [tipoContrato, setTipoContrato] = useState<TipoContrato>('CLT');
  const [salario, setSalario] = useState<string>('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [codigoAcesso, setCodigoAcesso] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [dataAdmissao, setDataAdmissao] = useState('');

  const [permissoes, setPermissoes] = useState<PermissoesFuncionario>({
    podeCriarMural: true,
    podeApagarMural: false,
    podeCriarDemandas: true,
    podeEditarDemandas: true,
    podeApagarDemandas: false,
    podeGerenciarSetores: false,
    podeGerenciarCalendario: true,
    podeVisualizarRelatorios: false,
  });

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const openCreateModal = () => {
    setEditingFuncionario(null);
    setNome('');
    setCargo('');
    setSetorId(setores.length > 0 ? setores[0].id : '');
    setTipoContrato('CLT');
    setSalario('');
    setEmail('');
    setTelefone('');
    setCodigoAcesso(generateRandomCode());
    setAtivo(true);
    setDataAdmissao(new Date().toISOString().split('T')[0]);
    setPermissoes({
      podeCriarMural: true,
      podeApagarMural: false,
      podeCriarDemandas: true,
      podeEditarDemandas: true,
      podeApagarDemandas: false,
      podeGerenciarSetores: false,
      podeGerenciarCalendario: true,
      podeVisualizarRelatorios: false,
    });
    setFeedbackError('');
    setModalOpen(true);
  };

  const openEditModal = (f: Funcionario) => {
    setEditingFuncionario(f);
    setNome(f.nome);
    setCargo(f.cargo);
    setSetorId(f.setorId || '');
    setTipoContrato(f.tipoContrato);
    setSalario(f.salario ? String(f.salario) : '');
    setEmail(f.email || '');
    setTelefone(f.telefone || '');
    setCodigoAcesso(f.codigoAcesso);
    setAtivo(f.ativo);
    setDataAdmissao(f.dataAdmissao || '');
    setPermissoes(f.permissoes || {});
    setFeedbackError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !cargo.trim()) {
      setFeedbackError('Nome e cargo são obrigatórios.');
      return;
    }

    setSaving(true);
    setFeedbackError('');

    const selectedSector = setores.find((s) => s.id === setorId);
    const setorNome = selectedSector ? selectedSector.nome : undefined;

    if (editingFuncionario) {
      const res = await updateFuncionario({
        id: editingFuncionario.id,
        nome: nome.trim(),
        cargo: cargo.trim(),
        setorId: setorId || undefined,
        setorNome,
        tipoContrato,
        salario: Number(salario) || 0,
        email: email.trim() || undefined,
        telefone: telefone.trim() || undefined,
        codigoAcesso: codigoAcesso.trim().toUpperCase(),
        permissoes,
        ativo,
        dataAdmissao: dataAdmissao || undefined,
      });

      setSaving(false);
      if (res.success) {
        setModalOpen(false);
      } else {
        setFeedbackError(res.error || 'Erro ao atualizar colaborador.');
      }
    } else {
      const res = await addFuncionario({
        nome: nome.trim(),
        cargo: cargo.trim(),
        setorId: setorId || undefined,
        setorNome,
        tipoContrato,
        salario: Number(salario) || 0,
        email: email.trim() || undefined,
        telefone: telefone.trim() || undefined,
        codigoAcesso: codigoAcesso.trim().toUpperCase() || generateRandomCode(),
        permissoes,
        ativo,
        dataAdmissao: dataAdmissao || undefined,
      });

      setSaving(false);
      if (res.success) {
        setModalOpen(false);
      } else {
        setFeedbackError(res.error || 'Erro ao cadastrar colaborador.');
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setDeleting(true);
    await deleteFuncionario(deletingId);
    setDeleting(false);
    setDeletingId(null);
  };

  const filteredFuncionarios = useMemo(() => {
    return funcionarios.filter((f) => {
      const matchSearch =
        f.nome.toLowerCase().includes(search.toLowerCase()) ||
        f.cargo.toLowerCase().includes(search.toLowerCase()) ||
        f.codigoAcesso.toLowerCase().includes(search.toLowerCase());

      const matchSetor = filterSetor === 'todos' || f.setorId === filterSetor;
      const matchContrato = filterContrato === 'todos' || f.tipoContrato === filterContrato;

      return matchSearch && matchSetor && matchContrato;
    });
  }, [funcionarios, search, filterSetor, filterContrato]);

  const totalColaboradores = funcionarios.length;
  const colaboradoresAtivos = funcionarios.filter((f) => f.ativo).length;
  const folhaSalarialTotal = funcionarios.reduce((acc, f) => acc + (f.salario || 0), 0);
  const setoresAtendidos = new Set(funcionarios.map((f) => f.setorId).filter(Boolean)).size;

  if (user && user.role === 'funcionario') {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          Acesso Restrito ao Gestor
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 text-sm">
          A área de gestão de equipe e permissões é reservada para a administração da empresa. Se precisar de ajustes em seu acesso, contate seu supervisor.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-sm"
        >
          Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600/15 via-teal-600/10 to-transparent p-6 sm:p-8 border border-emerald-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Equipe & Controle de Acessos
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Gestão de Colaboradores
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              Cadastre sua equipe, defina contratos, salários, setores e distribua códigos de acesso individuais com permissões granulares.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-medium rounded-xl shadow-lg shadow-emerald-600/20 transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              Novo Colaborador
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900/60 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total
              </p>
              <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1">
                <span className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {totalColaboradores}
                </span>
                <span className="text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {colaboradoresAtivos} ativ.
                </span>
              </div>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex-shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/60 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Folha Mensal
              </p>
              <div className="flex items-baseline gap-1 sm:gap-2 mt-1">
                <span className="text-sm sm:text-xl font-bold text-slate-900 dark:text-white truncate max-w-[120px] sm:max-w-none">
                  {folhaSalarialTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </span>
              </div>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-500/20 flex-shrink-0">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/60 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Setores
              </p>
              <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1">
                <span className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {setoresAtendidos}
                </span>
                <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                  de {setores.length}
                </span>
              </div>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 border border-purple-500/20 flex-shrink-0">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/60 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Acessos
              </p>
              <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1">
                <span className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {funcionarios.filter((f) => f.codigoAcesso).length}
                </span>
                <span className="text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  gerados
                </span>
              </div>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-500/20 flex-shrink-0">
              <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, cargo ou código de acesso..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-800 dark:text-slate-200"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterSetor}
            onChange={(e) => setFilterSetor(e.target.value)}
            className="w-full sm:w-auto px-2.5 sm:px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-700 dark:text-slate-300"
          >
            <option value="todos">Todos os Setores</option>
            {setores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>

          <select
            value={filterContrato}
            onChange={(e) => setFilterContrato(e.target.value)}
            className="w-full sm:w-auto px-2.5 sm:px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-700 dark:text-slate-300"
          >
            <option value="todos">Todos os Contratos</option>
            {TIPOS_CONTRATO.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {funcionariosLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Carregando colaboradores...</p>
        </div>
      ) : filteredFuncionarios.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900/60 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
          <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-1">
            {search || filterSetor !== 'todos' || filterContrato !== 'todos'
              ? 'Nenhum colaborador encontrado para os filtros.'
              : 'Nenhum colaborador cadastrado ainda.'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
            {search || filterSetor !== 'todos' || filterContrato !== 'todos'
              ? 'Tente ajustar os termos de busca ou filtros aplicados.'
              : 'Cadastre os membros da sua equipe para gerar códigos de acesso individuais e atribuir permissões.'}
          </p>
          {!search && filterSetor === 'todos' && filterContrato === 'todos' && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Cadastrar Primeiro Colaborador
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Colaborador</th>
                  <th className="py-3.5 px-4">Setor & Contrato</th>
                  <th className="py-3.5 px-4">Remuneração</th>
                  <th className="py-3.5 px-4">Código de Acesso</th>
                  <th className="py-3.5 px-4">Permissões</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                {filteredFuncionarios.map((f) => {
                  const initials = f.nome
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  const activePermsCount = Object.values(f.permissoes || {}).filter(Boolean).length;

                  return (
                    <tr
                      key={f.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center text-xs shadow-sm flex-shrink-0">
                            {initials || 'CO'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {f.nome}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {f.cargo}
                            </div>
                            {f.email && (
                              <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[180px]">
                                {f.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                            <Layers className="w-3 h-3 text-slate-400" />
                            {f.setorNome || 'Geral'}
                          </div>
                          <div>
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                              {f.tipoContrato}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {f.salario
                            ? f.salario.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              })
                            : '—'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                          <span className="font-mono text-xs font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                            {f.codigoAcesso}
                          </span>
                          <button
                            onClick={() => handleCopyCode(f.id, f.codigoAcesso)}
                            title="Copiar código para enviar ao colaborador"
                            className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          >
                            {copiedCodeId === f.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {copiedCodeId === f.id && (
                          <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
                            Copiado!
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                            <ShieldCheck className="w-3 h-3" />
                            {activePermsCount} liberadas
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            f.ativo
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              f.ativo ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {f.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(f)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Editar colaborador"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingId(f.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                            title="Excluir colaborador"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden divide-y divide-slate-200/60 dark:divide-slate-800/60">
            {filteredFuncionarios.map((f) => {
              const initials = f.nome
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              const activePermsCount = Object.values(f.permissoes || {}).filter(Boolean).length;

              return (
                <div key={f.id} className="p-4 space-y-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center text-xs shadow-sm flex-shrink-0">
                        {initials || 'CO'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-white truncate text-sm">
                          {f.nome}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {f.cargo}
                        </div>
                        {f.email && (
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                            {f.email}
                          </div>
                        )}
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0 ${
                        f.ativo
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${f.ativo ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {f.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Setor & Contrato</span>
                      <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-200 truncate">
                        <Layers className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{f.setorNome || 'Geral'}</span>
                        <span className="text-[10px] px-1 py-0.2 bg-emerald-500/10 text-emerald-600 rounded ml-1 font-semibold">{f.tipoContrato}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Remuneração</span>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {f.salario ? f.salario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                      <span className="text-[10px] font-semibold text-slate-500">Acesso:</span>
                      <span className="font-mono text-xs font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                        {f.codigoAcesso}
                      </span>
                      <button
                        onClick={() => handleCopyCode(f.id, f.codigoAcesso)}
                        className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors p-0.5"
                        title="Copiar código"
                      >
                        {copiedCodeId === f.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                        <ShieldCheck className="w-3 h-3" />
                        {activePermsCount} lib.
                      </span>

                      <button
                        onClick={() => openEditModal(f)}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingId(f.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 bg-rose-50 dark:bg-rose-950/30 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingFuncionario ? 'Editar Colaborador' : 'Novo Colaborador'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Defina os dados contratuais e selecione as permissões de acesso ao sistema.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {feedbackError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {feedbackError}
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  1. Informações Pessoais & Contrato
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Eduardo Silveira"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Cargo / Função *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Analista de Operações"
                      value={cargo}
                      onChange={(e) => setCargo(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Setor
                    </label>
                    <select
                      value={setorId}
                      onChange={(e) => setSetorId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-800 dark:text-slate-100"
                    >
                      <option value="">Sem setor definido</option>
                      {setores.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Tipo de Contrato
                    </label>
                    <select
                      value={tipoContrato}
                      onChange={(e) => setTipoContrato(e.target.value as TipoContrato)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-800 dark:text-slate-100"
                    >
                      {TIPOS_CONTRATO.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Salário (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={salario}
                      onChange={(e) => setSalario(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      E-mail de Contato
                    </label>
                    <input
                      type="email"
                      placeholder="colaborador@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Telefone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="(11) 98765-4321"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  2. Credencial de Acesso
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Código de Acesso Único *
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
                        <input
                          type="text"
                          required
                          value={codigoAcesso}
                          onChange={(e) => setCodigoAcesso(e.target.value.toUpperCase())}
                          className="w-full pl-10 pr-3.5 py-2 font-mono font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setCodigoAcesso(generateRandomCode())}
                        title="Gerar outro código"
                        className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Forneça este código para o colaborador entrar na aba &quot;Sou Colaborador&quot;.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-4 sm:pt-0">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ativo}
                        onChange={(e) => setAtivo(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                    <div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-white block">
                        Conta Ativa
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {ativo ? 'Permite login com o código' : 'Bloqueia o acesso temporariamente'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      3. Matriz de Permissões Granulares
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Defina exatamente o que este colaborador pode realizar dentro da plataforma:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={!!permissoes.podeCriarMural}
                      onChange={(e) =>
                        setPermissoes((prev) => ({ ...prev, podeCriarMural: e.target.checked }))
                      }
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-white block">
                        Publicar no Mural
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Pode criar avisos, comunicados e sugestões no mural geral.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={!!permissoes.podeApagarMural}
                      onChange={(e) =>
                        setPermissoes((prev) => ({ ...prev, podeApagarMural: e.target.checked }))
                      }
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-white block">
                        Apagar Postagens do Mural
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Pode excluir avisos e comunicados criados por outros membros.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={!!permissoes.podeCriarDemandas}
                      onChange={(e) =>
                        setPermissoes((prev) => ({ ...prev, podeCriarDemandas: e.target.checked }))
                      }
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-white block">
                        Criar Tarefas & Metas
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Pode cadastrar novas tarefas semanais e metas mensais.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={!!permissoes.podeApagarDemandas}
                      onChange={(e) =>
                        setPermissoes((prev) => ({ ...prev, podeApagarDemandas: e.target.checked }))
                      }
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-white block">
                        Excluir Tarefas & Metas
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Pode apagar registros de demandas e metas do painel.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={!!permissoes.podeGerenciarSetores}
                      onChange={(e) =>
                        setPermissoes((prev) => ({ ...prev, podeGerenciarSetores: e.target.checked }))
                      }
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-white block">
                        Gerenciar Setores
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Pode criar novos setores e excluir departamentos existentes.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={!!permissoes.podeGerenciarCalendario}
                      onChange={(e) =>
                        setPermissoes((prev) => ({ ...prev, podeGerenciarCalendario: e.target.checked }))
                      }
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-white block">
                        Gerenciar Calendário
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Pode agendar e excluir reuniões e compromissos.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-center w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 w-full sm:w-auto"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      {editingFuncionario ? 'Salvar Alterações' : 'Cadastrar Colaborador'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deletingId}
        title="Excluir Colaborador"
        message="Tem certeza de que deseja remover este colaborador? O código de acesso dele deixará de funcionar imediatamente."
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
