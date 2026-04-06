import { useMemo, useState } from "react";
import { BarChart3, CalendarRange, CircleDollarSign, PackageSearch } from "lucide-react";
import Button from "../components/ui/Button";
import { getFinancialReport, getProfitByMaterialReport } from "../services/relatorioService";
import { formatCurrencyBRL } from "../utils/formatters";

function ReportMetric({ label, value, tone = "neutral" }) {
  const toneClass = {
    positive: "text-emerald-400",
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

export default function Relatorios() {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [financeiro, setFinanceiro] = useState([]);
  const [lucroMateriais, setLucroMateriais] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function consultarRelatorio() {
    if (!dataInicio || !dataFim) {
      setErro("Selecione as duas datas para consultar os relatórios.");
      return;
    }

    setCarregando(true);
    try {
      setErro("");
      const [financeiroData, lucroData] = await Promise.all([
        getFinancialReport({ startDate: dataInicio, endDate: dataFim }).catch(() => []),
        getProfitByMaterialReport({ startDate: dataInicio, endDate: dataFim }).catch(() => []),
      ]);

      setFinanceiro(Array.isArray(financeiroData) ? financeiroData : []);
      setLucroMateriais(Array.isArray(lucroData) ? lucroData : []);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  const totalFinanceiro = useMemo(
    () => financeiro.reduce((acc, curr) => acc + Number(curr.total_vendido ?? 0), 0),
    [financeiro]
  );

  const totalLucro = useMemo(
    () => lucroMateriais.reduce((acc, curr) => acc + Number(curr.lucro_total ?? curr.lucro ?? 0), 0),
    [lucroMateriais]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-300">Analise do negocio</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-50">Relatorios</h1>
          <p className="page-intro mt-3">
            Consulte faturamento por periodo e acompanhe a base para lucro por material em uma leitura mais clara.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ReportMetric label="Periodo filtrado" value={dataInicio && dataFim ? `${dataInicio} ate ${dataFim}` : "--"} />
          <ReportMetric label="Registros financeiros" value={String(financeiro.length)} tone="info" />
          <ReportMetric label="Faturamento total" value={formatCurrencyBRL(totalFinanceiro)} />
          <ReportMetric label="Lucro apurado" value={formatCurrencyBRL(totalLucro)} tone="positive" />
        </div>
      </header>

      {erro && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/12 px-4 py-3 text-sm text-rose-100">
          {erro}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[0.9fr_2.1fr]">
        <div className="surface-panel-strong rounded-[28px] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Filtro de consulta</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-50">Escolha o periodo</h2>

          <div className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-semibold text-slate-200">Data de inicio</span>
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/70 px-4 py-3">
                <CalendarRange className="h-4 w-4 text-slate-500" />
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full bg-transparent text-slate-100 outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-200">Data final</span>
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/70 px-4 py-3">
                <CalendarRange className="h-4 w-4 text-slate-500" />
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full bg-transparent text-slate-100 outline-none"
                />
              </div>
            </label>

            <Button onClick={consultarRelatorio} disabled={carregando} className="w-full justify-center px-6 py-3 text-base">
              {carregando ? "Buscando relatorios..." : "Consultar relatorios"}
            </Button>

            <div className="rounded-2xl border border-slate-700/80 bg-slate-950/20 p-5">
              <p className="text-sm font-semibold text-slate-200">Leitura rapida</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-400">
                <li>{financeiro.length > 0 ? `${financeiro.length} linhas no financeiro.` : "Nenhum financeiro carregado ainda."}</li>
                <li>{lucroMateriais.length > 0 ? `${lucroMateriais.length} materiais com lucro calculado.` : "Lucro por material ainda sem retorno no periodo."}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="surface-panel-strong overflow-hidden rounded-[28px]">
            <div className="border-b border-slate-700/80 px-6 py-5">
              <div className="flex items-center gap-3">
                <CircleDollarSign className="h-5 w-5 text-blue-300" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Financeiro</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-50">Faturamento por periodo</h2>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left">
                <thead className="table-header-row border-b border-slate-700/70">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Data da venda</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.18em]">Total vendido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {financeiro.length > 0 ? (
                    financeiro.map((item, index) => (
                      <tr key={`${item.data_venda}-${index}`} className="table-row-hover">
                        <td className="px-6 py-4 font-medium text-slate-300">{item.data_venda}</td>
                        <td className="px-6 py-4 text-right font-semibold text-blue-300">
                          {formatCurrencyBRL(item.total_vendido)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-6 py-16 text-center text-slate-400">
                        {carregando ? "Carregando dados..." : "Nenhum dado financeiro encontrado para o periodo."}
                      </td>
                    </tr>
                  )}
                </tbody>
                {financeiro.length > 0 && (
                  <tfoot className="border-t border-slate-700/80 bg-slate-950/20">
                    <tr>
                      <td className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Total do periodo
                      </td>
                      <td className="px-6 py-4 text-right text-xl font-bold text-slate-50">
                        {formatCurrencyBRL(totalFinanceiro)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          <div className="surface-panel-strong overflow-hidden rounded-[28px]">
            <div className="border-b border-slate-700/80 px-6 py-5">
              <div className="flex items-center gap-3">
                <PackageSearch className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Lucro por material</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-50">Margem apurada no periodo</h2>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left">
                <thead className="table-header-row border-b border-slate-700/70">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Material</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.18em]">Lucro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {lucroMateriais.length > 0 ? (
                    lucroMateriais.map((item, index) => (
                      <tr key={`${item.nome}-${index}`} className="table-row-hover">
                        <td className="px-6 py-4 font-medium text-slate-300">{item.nome}</td>
                        <td className="px-6 py-4 text-right font-semibold text-emerald-400">
                          {formatCurrencyBRL(item.lucro_total ?? item.lucro)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-6 py-16 text-center text-slate-400">
                        {carregando ? "Carregando dados..." : "Relatorio de lucro por material ainda sem dados disponiveis."}
                      </td>
                    </tr>
                  )}
                </tbody>
                {lucroMateriais.length > 0 && (
                  <tfoot className="border-t border-slate-700/80 bg-slate-950/20">
                    <tr>
                      <td className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Lucro total
                      </td>
                      <td className="px-6 py-4 text-right text-xl font-bold text-slate-50">
                        {formatCurrencyBRL(totalLucro)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </section>

      <div className="surface-panel rounded-[28px] p-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-blue-300" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Contexto do sistema</p>
            <p className="mt-2 text-sm text-slate-400">
              O relatorio de lucro por material fica ainda mais forte quando o backend expuser todas as compras e vendas por item.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
