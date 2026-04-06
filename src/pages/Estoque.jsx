import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Boxes, Download, RefreshCw, Search, ShieldCheck } from "lucide-react";
import Button from "../components/ui/Button";
import { getEstoque } from "../services/estoqueService";
import { formatCurrencyBRL, formatWeight } from "../utils/formatters";
import {
  getMaterialMargin,
  getMaterialStatus,
  getMaterialStatusLabel,
  normalizeMaterial,
} from "../utils/materials";

const PAGE_SIZE_OPTIONS = [5, 10, 20];

function StockMetric({ label, value, tone = "neutral" }) {
  const toneClass = {
    positive: "text-emerald-400",
    negative: "text-rose-400",
    info: "text-blue-300",
    neutral: "text-slate-100",
  };

  return (
    <div className="surface-panel rounded-2xl p-4">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className={`mt-3 text-2xl font-bold ${toneClass[tone] ?? toneClass.neutral}`}>{value}</p>
    </div>
  );
}

function downloadCsv(rows) {
  const header = ["Material", "QuantidadeKg", "PrecoCompraKg", "PrecoVendaKg", "EstoqueMinimoKg", "ValorCusto", "ValorVenda", "Situacao"];
  const content = rows.map((item) => [
    item.nome,
    item.quantidadeKg.toFixed(2),
    item.precoCompraKg.toFixed(2),
    item.precoVendaKg.toFixed(2),
    item.estoqueMinimoKg.toFixed(2),
    item.valorCustoEstoque.toFixed(2),
    item.valorVendaEstoque.toFixed(2),
    getMaterialStatusLabel(getMaterialStatus(item)).toUpperCase(),
  ]);

  const csv = [header, ...content]
    .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `estoque-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function Estoque() {
  const [materiais, setMateriais] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [ordenarPor, setOrdenarPor] = useState("nome");
  const [direcaoOrdem, setDirecaoOrdem] = useState("asc");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  async function loadEstoque() {
    try {
      setCarregando(true);
      setErro("");
      const data = await getEstoque();
      setMateriais(Array.isArray(data) ? data.map(normalizeMaterial) : []);
    } catch (error) {
      setErro(error.message);
      setMateriais([]);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    loadEstoque();
  }, []);

  const listaFiltradaOrdenada = useMemo(() => {
    const texto = filtro.trim().toLowerCase();
    const filtrada = materiais.filter((material) => {
      const nomeOk = material.nome.toLowerCase().includes(texto);
      const statusOk = filtroStatus === "todos" ? true : getMaterialStatus(material) === filtroStatus;
      return nomeOk && statusOk;
    });

    return [...filtrada].sort((a, b) => {
      const mult = direcaoOrdem === "asc" ? 1 : -1;
      if (ordenarPor === "nome") return a.nome.localeCompare(b.nome) * mult;
      if (ordenarPor === "quantidadeKg") return (a.quantidadeKg - b.quantidadeKg) * mult;
      if (ordenarPor === "precoCompraKg") return (a.precoCompraKg - b.precoCompraKg) * mult;
      if (ordenarPor === "precoVendaKg") return (a.precoVendaKg - b.precoVendaKg) * mult;
      if (ordenarPor === "valorVendaEstoque") return (a.valorVendaEstoque - b.valorVendaEstoque) * mult;
      return 0;
    });
  }, [materiais, filtro, filtroStatus, ordenarPor, direcaoOrdem]);

  const resumo = useMemo(() => {
    const totalKg = materiais.reduce((acc, item) => acc + item.quantidadeKg, 0);
    const valorCusto = materiais.reduce((acc, item) => acc + item.valorCustoEstoque, 0);
    const valorVenda = materiais.reduce((acc, item) => acc + item.valorVendaEstoque, 0);
    const estoqueBaixo = materiais.filter((item) => getMaterialStatus(item) !== "ok").length;

    return { totalKg, valorCusto, valorVenda, estoqueBaixo };
  }, [materiais]);

  const totalPaginas = Math.max(1, Math.ceil(listaFiltradaOrdenada.length / itensPorPagina));

  useEffect(() => {
    setPaginaAtual(1);
  }, [filtro, filtroStatus, ordenarPor, direcaoOrdem, itensPorPagina]);

  const paginaSegura = Math.min(paginaAtual, totalPaginas);
  const inicio = (paginaSegura - 1) * itensPorPagina;
  const itensPagina = listaFiltradaOrdenada.slice(inicio, inicio + itensPorPagina);

  function alterarOrdenacao(coluna) {
    if (ordenarPor === coluna) {
      setDirecaoOrdem((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setOrdenarPor(coluna);
    setDirecaoOrdem("asc");
  }

  function labelOrdem(coluna) {
    if (ordenarPor !== coluna) return "";
    return direcaoOrdem === "asc" ? " (asc)" : " (desc)";
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-300">Controle do patio</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-50">Estoque</h1>
          <p className="page-intro mt-3">
            Acompanhe o peso, custo, valor de venda e os pontos de alerta por material em um painel unico.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={loadEstoque} className="px-4 py-2.5">
            <RefreshCw size={16} />
            Atualizar
          </Button>
          <Button type="button" onClick={() => downloadCsv(listaFiltradaOrdenada)} className="px-4 py-2.5">
            <Download size={16} />
            Exportar CSV
          </Button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StockMetric label="Materiais monitorados" value={String(materiais.length)} />
        <StockMetric label="Peso total" value={formatWeight(resumo.totalKg)} tone="info" />
        <StockMetric label="Valor de custo" value={formatCurrencyBRL(resumo.valorCusto)} />
        <StockMetric
          label="Itens em alerta"
          value={String(resumo.estoqueBaixo)}
          tone={resumo.estoqueBaixo > 0 ? "negative" : "positive"}
        />
      </div>

      {erro && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/12 px-4 py-3 text-sm text-rose-100">
          {erro}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[0.95fr_2.05fr]">
        <div className="surface-panel-strong rounded-[28px] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Filtros e leitura</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-50">Encontre rapido o que precisa</h2>

          <div className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-semibold text-slate-200">Pesquisar material</span>
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/70 px-4 py-3">
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={filtro}
                  placeholder="Ex.: cobre, aluminio..."
                  className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
                  onChange={(e) => setFiltro(e.target.value)}
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-200">Status do estoque</span>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="surface-soft mt-3 w-full rounded-2xl px-4 py-3 text-slate-100 outline-none focus:border-blue-400"
              >
                <option value="todos">Todos</option>
                <option value="ok">Disponivel</option>
                <option value="baixo">Abaixo do minimo</option>
                <option value="zerado">Sem estoque</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-200">Itens por pagina</span>
              <select
                value={itensPorPagina}
                onChange={(e) => setItensPorPagina(Number(e.target.value))}
                className="surface-soft mt-3 w-full rounded-2xl px-4 py-3 text-slate-100 outline-none focus:border-blue-400"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} por pagina
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="surface-panel rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <Boxes className="h-5 w-5 text-blue-300" />
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Valor de venda</p>
                </div>
                <p className="mt-4 text-2xl font-bold text-blue-300">{formatCurrencyBRL(resumo.valorVenda)}</p>
              </div>

              <div className="surface-panel rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-rose-400" />
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Atencao</p>
                </div>
                <p className="mt-4 text-sm text-slate-300">
                  {resumo.estoqueBaixo > 0
                    ? `${resumo.estoqueBaixo} materiais precisam de revisao.`
                    : "Nenhum material em estado critico no momento."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="surface-panel-strong overflow-hidden rounded-[28px]">
          <div className="flex flex-col gap-3 border-b border-slate-700/80 px-6 py-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Tabela de materiais</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-50">Saldo, precos e situacao do estoque</h2>
            </div>
            <div className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-slate-400">
              {carregando ? "Sincronizando estoque..." : `${listaFiltradaOrdenada.length} resultados`}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="table-header-row border-b border-slate-700/70">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em]">
                    <button type="button" onClick={() => alterarOrdenacao("nome")} className="transition-colors hover:text-slate-50">
                      Material{labelOrdem("nome")}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.18em]">
                    <button type="button" onClick={() => alterarOrdenacao("quantidadeKg")} className="transition-colors hover:text-slate-50">
                      Quantidade{labelOrdem("quantidadeKg")}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.18em]">
                    <button type="button" onClick={() => alterarOrdenacao("precoCompraKg")} className="transition-colors hover:text-slate-50">
                      Compra / kg{labelOrdem("precoCompraKg")}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.18em]">
                    <button type="button" onClick={() => alterarOrdenacao("precoVendaKg")} className="transition-colors hover:text-slate-50">
                      Venda / kg{labelOrdem("precoVendaKg")}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.18em]">
                    <button type="button" onClick={() => alterarOrdenacao("valorVendaEstoque")} className="transition-colors hover:text-slate-50">
                      Valor em estoque{labelOrdem("valorVendaEstoque")}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.18em]">Margem / kg</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.18em]">Situacao</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {!carregando && itensPagina.map((material) => {
                  const status = getMaterialStatus(material);
                  const margem = getMaterialMargin(material);
                  const barra = Math.min(100, Math.max(16, material.estoqueMinimoKg > 0
                    ? (material.quantidadeKg / material.estoqueMinimoKg) * 100
                    : 100));

                  return (
                    <tr key={material.id} className="table-row-hover transition-colors">
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-semibold text-slate-100">{material.nome}</p>
                          <p className="mt-2 text-xs text-slate-400">Minimo: {formatWeight(material.estoqueMinimoKg)}</p>
                          <div className="mt-3 h-1.5 w-28 overflow-hidden rounded-full bg-slate-800">
                            <div
                              className={`h-full rounded-full ${
                                status === "ok" ? "bg-emerald-500" : status === "baixo" ? "bg-blue-400" : "bg-rose-500"
                              }`}
                              style={{ width: `${barra}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center font-semibold text-blue-300">{formatWeight(material.quantidadeKg)}</td>
                      <td className="px-6 py-5 text-center text-slate-300">{formatCurrencyBRL(material.precoCompraKg)}</td>
                      <td className="px-6 py-5 text-center text-blue-300">{formatCurrencyBRL(material.precoVendaKg)}</td>
                      <td className="px-6 py-5 text-center font-semibold text-slate-100">{formatCurrencyBRL(material.valorVendaEstoque)}</td>
                      <td className={`px-6 py-5 text-center font-semibold ${margem >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {formatCurrencyBRL(margem)}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          status === "ok"
                            ? "bg-emerald-500/12 text-emerald-300"
                            : status === "baixo"
                              ? "bg-blue-500/12 text-blue-200"
                              : "bg-rose-500/12 text-rose-200"
                        }`}>
                          {getMaterialStatusLabel(status).toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {carregando && (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                      Carregando dados de estoque...
                    </td>
                  </tr>
                )}

                {!carregando && listaFiltradaOrdenada.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="mx-auto max-w-sm">
                        <ShieldCheck className="mx-auto h-10 w-10 text-slate-500" />
                        <p className="mt-4 text-lg font-semibold text-slate-200">Nenhum material encontrado</p>
                        <p className="mt-2 text-sm text-slate-400">
                          Ajuste os filtros ou atualize o estoque para visualizar os materiais cadastrados.
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

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
        <p>
          Mostrando {itensPagina.length} de {listaFiltradaOrdenada.length} resultados
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={paginaSegura <= 1}
            onClick={() => setPaginaAtual((pagina) => Math.max(1, pagina - 1))}
            className="px-3 py-1.5"
          >
            Anterior
          </Button>
          <span>
            Pagina {paginaSegura} de {totalPaginas}
          </span>
          <Button
            type="button"
            variant="secondary"
            disabled={paginaSegura >= totalPaginas}
            onClick={() => setPaginaAtual((pagina) => Math.min(totalPaginas, pagina + 1))}
            className="px-3 py-1.5"
          >
            Proxima
          </Button>
        </div>
      </div>
    </div>
  );
}
