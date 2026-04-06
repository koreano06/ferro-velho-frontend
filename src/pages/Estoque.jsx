import { useEffect, useMemo, useState } from "react";
import { getEstoque } from "../services/estoqueService";
import { formatCurrencyBRL, formatWeight } from "../utils/formatters";

const LOW_STOCK_THRESHOLD = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 20];

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getStatus(quantidadeKg) {
  return quantidadeKg > LOW_STOCK_THRESHOLD ? "ok" : "baixo";
}

function downloadCsv(rows) {
  const header = ["Material", "QuantidadeKg", "PrecoBase", "ValorEstoque", "Situacao"];
  const content = rows.map((item) => {
    const valorEstoque = item.quantidadeKg * item.precoBase;
    const situacao = getStatus(item.quantidadeKg) === "ok" ? "DISPONIVEL" : "ESTOQUE BAIXO";
    return [item.nome, item.quantidadeKg.toFixed(2), item.precoBase.toFixed(2), valorEstoque.toFixed(2), situacao];
  });

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
      setMateriais(Array.isArray(data) ? data : []);
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

  const listaNormalizada = useMemo(
    () =>
      materiais.map((m) => ({
        id: m.id_material,
        nome: String(m.nome ?? "Sem nome"),
        quantidadeKg: toNumber(m.quantidade_kg),
        precoBase: toNumber(m.preco_base),
      })),
    [materiais]
  );

  const listaFiltradaOrdenada = useMemo(() => {
    const texto = filtro.trim().toLowerCase();
    const filtrada = listaNormalizada.filter((m) => {
      const nomeOk = m.nome.toLowerCase().includes(texto);
      const statusOk = filtroStatus === "todos" ? true : getStatus(m.quantidadeKg) === filtroStatus;
      return nomeOk && statusOk;
    });

    const sorted = [...filtrada].sort((a, b) => {
      const mult = direcaoOrdem === "asc" ? 1 : -1;
      if (ordenarPor === "nome") return a.nome.localeCompare(b.nome) * mult;
      if (ordenarPor === "quantidadeKg") return (a.quantidadeKg - b.quantidadeKg) * mult;
      if (ordenarPor === "precoBase") return (a.precoBase - b.precoBase) * mult;
      if (ordenarPor === "valorEstoque") {
        return (a.quantidadeKg * a.precoBase - b.quantidadeKg * b.precoBase) * mult;
      }
      return 0;
    });

    return sorted;
  }, [listaNormalizada, filtro, filtroStatus, ordenarPor, direcaoOrdem]);

  const resumo = useMemo(() => {
    const totalKg = listaNormalizada.reduce((acc, item) => acc + item.quantidadeKg, 0);
    const valorTotal = listaNormalizada.reduce((acc, item) => acc + item.quantidadeKg * item.precoBase, 0);
    const estoqueBaixo = listaNormalizada.filter((item) => getStatus(item.quantidadeKg) === "baixo").length;
    return { totalKg, valorTotal, estoqueBaixo };
  }, [listaNormalizada]);

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
    <div className="bg-gray-50 min-h-screen">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estoque de Materiais</h1>
          <p className="text-gray-500">Controle de peso, disponibilidade e valor armazenado</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadEstoque}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Atualizar
          </button>
          <button
            type="button"
            onClick={() => downloadCsv(listaFiltradaOrdenada)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Itens Cadastrados</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{listaNormalizada.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Peso Total</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">{formatWeight(resumo.totalKg)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Valor em Estoque</p>
          <p className="mt-2 text-2xl font-bold text-green-700">{formatCurrencyBRL(resumo.valorTotal)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Estoque Baixo</p>
          <p className="mt-2 text-2xl font-bold text-orange-600">{resumo.estoqueBaixo}</p>
        </div>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <input
          type="text"
          value={filtro}
          placeholder="Pesquisar material..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setFiltro(e.target.value)}
        />
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700"
        >
          <option value="todos">Todos</option>
          <option value="ok">Disponivel</option>
          <option value="baixo">Estoque Baixo</option>
        </select>
        <select
          value={itensPorPagina}
          onChange={(e) => setItensPorPagina(Number(e.target.value))}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size} por pagina
            </option>
          ))}
        </select>
      </div>

      {erro && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      <div className="grid gap-6">
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-sm uppercase text-gray-600">
                <th className="px-6 py-4 font-semibold">
                  <button type="button" onClick={() => alterarOrdenacao("nome")} className="hover:text-gray-900">
                    Material{labelOrdem("nome")}
                  </button>
                </th>
                <th className="px-6 py-4 text-center font-semibold">
                  <button
                    type="button"
                    onClick={() => alterarOrdenacao("quantidadeKg")}
                    className="hover:text-gray-900"
                  >
                    Quantidade Atual{labelOrdem("quantidadeKg")}
                  </button>
                </th>
                <th className="px-6 py-4 text-center font-semibold">
                  <button
                    type="button"
                    onClick={() => alterarOrdenacao("precoBase")}
                    className="hover:text-gray-900"
                  >
                    Preco/Kg Base{labelOrdem("precoBase")}
                  </button>
                </th>
                <th className="px-6 py-4 text-center font-semibold">
                  <button
                    type="button"
                    onClick={() => alterarOrdenacao("valorEstoque")}
                    className="hover:text-gray-900"
                  >
                    Valor em Estoque{labelOrdem("valorEstoque")}
                  </button>
                </th>
                <th className="px-6 py-4 text-center font-semibold">Situacao</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!carregando &&
                itensPagina.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800">{m.nome}</td>
                  <td className="px-6 py-4 text-center text-blue-600 font-semibold">
                    {formatWeight(m.quantidadeKg)}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">
                    {formatCurrencyBRL(m.precoBase)}
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-gray-700">
                    {formatCurrencyBRL(m.quantidadeKg * m.precoBase)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatus(m.quantidadeKg) === "ok" ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                        DISPONIVEL
                      </span>
                    ) : (
                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                        ESTOQUE BAIXO
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {carregando && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Carregando dados de estoque...
                  </td>
                </tr>
              )}
              {!carregando && listaFiltradaOrdenada.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Nenhum material encontrado para o filtro informado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
        <p>
          Mostrando {itensPagina.length} de {listaFiltradaOrdenada.length} resultados
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={paginaSegura <= 1}
            onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
            className="rounded border border-gray-300 bg-white px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anterior
          </button>
          <span>
            Pagina {paginaSegura} de {totalPaginas}
          </span>
          <button
            type="button"
            disabled={paginaSegura >= totalPaginas}
            onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
            className="rounded border border-gray-300 bg-white px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Proxima
          </button>
        </div>
      </div>
    </div>
  );
}
