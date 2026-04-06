import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import Button from "../components/ui/Button";
import { formatCurrencyBRL, formatWeight } from "../utils/formatters";
import { getMaterialMargin, normalizeMaterial } from "../utils/materials";
import {
  createMaterial,
  deleteMaterial,
  getMateriais,
  updateMaterial,
} from "../services/materialService";

function MaterialMetric({ label, value, tone = "neutral" }) {
  const toneClass = {
    positive: "text-emerald-400",
    negative: "text-rose-400",
    info: "text-blue-300",
    neutral: "text-slate-100",
  };

  return (
    <div className="surface-panel rounded-2xl p-4">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className={`mt-3 text-2xl font-bold ${toneClass[tone] ?? toneClass.neutral}`}>{value}</p>
    </div>
  );
}

function MaterialField({ label, children, hint }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-200">{label}</span>
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
      <div className="mt-3">{children}</div>
    </label>
  );
}

export default function Materiais() {
  const [materiais, setMateriais] = useState([]);
  const [nome, setNome] = useState("");
  const [precoCompraKg, setPrecoCompraKg] = useState("");
  const [precoVendaKg, setPrecoVendaKg] = useState("");
  const [estoqueMinimoKg, setEstoqueMinimoKg] = useState("");
  const [editando, setEditando] = useState(null);
  const [erro, setErro] = useState("");
  const [feedback, setFeedback] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [removendoId, setRemovendoId] = useState(null);

  async function carregarMateriais() {
    try {
      setErro("");
      const data = await getMateriais();
      setMateriais(Array.isArray(data) ? data.map(normalizeMaterial) : []);
    } catch (error) {
      setErro(error.message);
      setMateriais([]);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarMateriais();
  }, []);

  const resumo = useMemo(() => {
    const total = materiais.length;
    const margemMedia =
      total > 0
        ? materiais.reduce((acc, item) => acc + getMaterialMargin(item), 0) / total
        : 0;
    const maiorMargem = materiais.reduce((top, item) => {
      if (!top || getMaterialMargin(item) > getMaterialMargin(top)) return item;
      return top;
    }, null);
    const comAlerta = materiais.filter(
      (item) => item.estoqueMinimoKg > 0 && item.quantidadeKg <= item.estoqueMinimoKg
    ).length;

    return {
      total,
      margemMedia,
      maiorMargem,
      comAlerta,
    };
  }, [materiais]);

  function resetForm() {
    setNome("");
    setPrecoCompraKg("");
    setPrecoVendaKg("");
    setEstoqueMinimoKg("");
    setEditando(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      nome,
      preco_kg: parseFloat(precoCompraKg),
      preco_compra_kg: parseFloat(precoCompraKg),
      preco_venda_kg: parseFloat(precoVendaKg),
      estoque_minimo_kg: parseFloat(estoqueMinimoKg || 0),
    };

    try {
      setSalvando(true);
      setErro("");
      setFeedback("");

      if (editando) {
        await updateMaterial(editando.id, payload);
        setFeedback("Material atualizado com sucesso.");
      } else {
        await createMaterial(payload);
        setFeedback("Material cadastrado com sucesso.");
      }

      resetForm();
      await carregarMateriais();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  async function apagarMaterial(id) {
    try {
      setRemovendoId(id);
      setErro("");
      setFeedback("");
      await deleteMaterial(id);
      setFeedback("Material removido com sucesso.");
      await carregarMateriais();
    } catch (error) {
      setErro(error.message);
    } finally {
      setRemovendoId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-300">Cadastro estrategico</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-50">Materiais</h1>
          <p className="page-intro mt-3">
            Organize compra, venda e estoque minimo de cada material com uma visao pronta para margem e decisao.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MaterialMetric label="Materiais ativos" value={String(resumo.total)} />
          <MaterialMetric label="Margem media / kg" value={formatCurrencyBRL(resumo.margemMedia)} tone={resumo.margemMedia >= 0 ? "positive" : "negative"} />
          <MaterialMetric
            label="Maior margem"
            value={resumo.maiorMargem ? resumo.maiorMargem.nome : "--"}
            tone="info"
          />
          <MaterialMetric
            label="Itens em alerta"
            value={String(resumo.comAlerta)}
            tone={resumo.comAlerta > 0 ? "negative" : "positive"}
          />
        </div>
      </header>

      {erro && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/12 px-4 py-3 text-sm text-rose-100">
          {erro}
        </div>
      )}

      {feedback && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/12 px-4 py-3 text-sm text-emerald-100">
          {feedback}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.1fr_1.7fr]">
        <div className="surface-panel-strong rounded-[28px] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                {editando ? "Editar material" : "Novo material"}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-50">
                {editando ? "Atualize preco e estoque" : "Cadastre com margem clara"}
              </h2>
            </div>
            {editando && (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setFeedback("");
                }}
                className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-700"
                disabled={salvando}
              >
                Limpar
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <MaterialField label="Nome do material" hint="Use um nome curto e claro para o pátio e o balcão.">
              <input
                className="surface-soft w-full rounded-2xl px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-400"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={salvando}
                placeholder="Ex.: Cobre misto"
                required
              />
            </MaterialField>

            <div className="grid gap-4 md:grid-cols-2">
              <MaterialField label="Preco de compra / kg" hint="Quanto a empresa paga para entrar no pátio.">
                <input
                  type="number"
                  step="0.01"
                  className="surface-soft w-full rounded-2xl px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-400"
                  value={precoCompraKg}
                  onChange={(e) => setPrecoCompraKg(e.target.value)}
                  disabled={salvando}
                  placeholder="0,00"
                  required
                />
              </MaterialField>

              <MaterialField label="Preco de venda / kg" hint="Quanto a empresa cobra na saída.">
                <input
                  type="number"
                  step="0.01"
                  className="surface-soft w-full rounded-2xl px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-400"
                  value={precoVendaKg}
                  onChange={(e) => setPrecoVendaKg(e.target.value)}
                  disabled={salvando}
                  placeholder="0,00"
                  required
                />
              </MaterialField>
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
              <MaterialField label="Estoque minimo / kg" hint="Quando chegar nesse limite, vira alerta no dashboard.">
                <input
                  type="number"
                  step="0.01"
                  className="surface-soft w-full rounded-2xl px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-400"
                  value={estoqueMinimoKg}
                  onChange={(e) => setEstoqueMinimoKg(e.target.value)}
                  disabled={salvando}
                  placeholder="0,00"
                />
              </MaterialField>

              <div className="surface-panel rounded-2xl p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Margem por kg</p>
                <p className={`mt-3 text-2xl font-bold ${
                  Number(precoVendaKg || 0) - Number(precoCompraKg || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {formatCurrencyBRL(Number(precoVendaKg || 0) - Number(precoCompraKg || 0))}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="submit"
                disabled={salvando}
                className="min-w-[180px] justify-center px-6 py-3 text-base"
              >
                {editando ? <Pencil size={18} /> : <Plus size={18} />}
                {salvando ? "Salvando..." : editando ? "Atualizar material" : "Cadastrar material"}
              </Button>

              {editando && (
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setFeedback("");
                  }}
                  className="rounded-2xl border border-slate-700 bg-transparent px-5 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800"
                  disabled={salvando}
                >
                  Cancelar edicao
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="surface-panel-strong overflow-hidden rounded-[28px]">
          <div className="flex flex-col gap-3 border-b border-slate-700/80 px-6 py-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Tabela operacional</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-50">Margens e limites por material</h2>
            </div>
            <p className="text-sm text-slate-400">
              {carregando ? "Sincronizando materiais..." : `${materiais.length} materiais carregados`}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead className="table-header-row border-b border-slate-700/70">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Material</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Compra</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Venda</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Margem</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Minimo</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-right">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {!carregando && materiais.length > 0 ? (
                  materiais.map((m) => {
                    const margem = getMaterialMargin(m);
                    const emAlerta = m.estoqueMinimoKg > 0 && m.quantidadeKg <= m.estoqueMinimoKg;

                    return (
                      <tr key={m.id} className="table-row-hover">
                        <td className="px-6 py-5">
                          <div>
                            <p className="font-semibold text-slate-100">{m.nome}</p>
                            <p className="mt-1 text-xs text-slate-400">
                              {emAlerta ? "Minimo merece atencao" : "Margem pronta para consulta rapida"}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-5 font-medium text-slate-300">{formatCurrencyBRL(m.precoCompraKg)}</td>
                        <td className="px-6 py-5 font-medium text-blue-300">{formatCurrencyBRL(m.precoVendaKg)}</td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <span className={`font-bold ${margem >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                              {formatCurrencyBRL(margem)}
                            </span>
                            <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-800">
                              <div
                                className={`h-full rounded-full ${margem >= 0 ? "bg-emerald-500" : "bg-rose-500"}`}
                                style={{ width: `${Math.min(100, Math.max(18, Math.abs(margem) * 18))}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            emAlerta
                              ? "bg-rose-500/14 text-rose-300"
                              : "bg-slate-800 text-slate-300"
                          }`}>
                            {formatWeight(m.estoqueMinimoKg)}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => {
                                setEditando(m);
                                setNome(m.nome);
                                setPrecoCompraKg(String(m.precoCompraKg));
                                setPrecoVendaKg(String(m.precoVendaKg));
                                setEstoqueMinimoKg(String(m.estoqueMinimoKg));
                              }}
                              className="inline-flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-sm font-semibold text-blue-200 transition-colors hover:bg-blue-500/16 disabled:opacity-50"
                              disabled={salvando || removendoId === m.id}
                            >
                              <Pencil size={15} />
                              Editar
                            </button>
                            <button
                              onClick={() => apagarMaterial(m.id)}
                              className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-200 transition-colors hover:bg-rose-500/16 disabled:opacity-50"
                              disabled={salvando || removendoId === m.id}
                            >
                              <Trash2 size={15} />
                              {removendoId === m.id ? "Excluindo..." : "Excluir"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : carregando ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                      Carregando materiais...
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="mx-auto max-w-sm">
                        <p className="text-lg font-semibold text-slate-200">Nenhum material cadastrado ainda</p>
                        <p className="mt-2 text-sm text-slate-400">
                          Comece pelo formulário ao lado para montar sua base de preços e estoque mínimo.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
