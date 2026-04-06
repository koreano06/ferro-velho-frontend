import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { CheckCircle, Printer, Receipt, Scale, ShoppingCart, Wallet } from "lucide-react";
import Button from "../components/ui/Button";
import { getMateriais } from "../services/materialService";
import { createVenda } from "../services/vendaService";
import { formatCurrencyBRL, formatWeight } from "../utils/formatters";
import { normalizeMaterial } from "../utils/materials";

function SaleMetric({ label, value, tone = "neutral" }) {
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

function SaleField({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-200">{label}</span>
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
      <div className="mt-3">{children}</div>
    </label>
  );
}

export default function Vendas() {
  const [, setLocation] = useLocation();
  const [materials, setMaterials] = useState([]);
  const [materialId, setMaterialId] = useState("");
  const [valorDigitado, setValorDigitado] = useState("");
  const [unidadeEntrada, setUnidadeEntrada] = useState("kg");
  const [pricePerKg, setPricePerKg] = useState("");
  const [finished, setFinished] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function loadMateriais() {
      try {
        setErro("");
        const data = await getMateriais();
        setMaterials(Array.isArray(data) ? data.map(normalizeMaterial) : []);
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    loadMateriais();
  }, []);

  const selectedMaterial = materials.find((m) => m.id?.toString() === materialId);

  const handleMaterialChange = (id) => {
    setMaterialId(id);
    const material = materials.find((item) => item.id?.toString() === id);
    setPricePerKg(material ? String(material.precoVendaKg) : "");
  };

  const obterPesoEmKg = () => {
    const valor = parseFloat(valorDigitado || 0);
    if (unidadeEntrada === "t") return valor * 1000;
    if (unidadeEntrada === "g") return valor / 1000;
    return valor;
  };

  const pesoFinalKg = obterPesoEmKg();
  const total = pesoFinalKg * (parseFloat(pricePerKg) || 0);

  const handleFinalizar = async () => {
    if (!materialId || !valorDigitado) {
      setErro("Preencha o material e o peso para concluir a venda.");
      return;
    }

    try {
      setSalvando(true);
      setErro("");
      await createVenda({
        materialId: parseInt(materialId, 10),
        weightKg: pesoFinalKg,
        pricePerKg: parseFloat(pricePerKg),
      });
      setFinished(true);
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  const printStyles = `
    @media print {
      body * { visibility: hidden; }
      #thermal-receipt, #thermal-receipt * { visibility: visible; }
      #thermal-receipt {
        position: absolute;
        left: 0;
        top: 0;
        width: 80mm;
        padding: 5mm;
        font-family: 'Courier New', Courier, monospace;
        color: black;
        border: none !important;
      }
      @page { margin: 0; }
    }
  `;

  if (finished) {
    return (
      <div className="mx-auto mt-16 max-w-3xl">
        <style>{printStyles}</style>

        <div className="surface-panel-strong rounded-[30px] p-10 text-center print:hidden">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/12">
            <CheckCircle className="h-10 w-10 text-emerald-400" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-slate-50">Venda concluida</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">
            A saida foi registrada e o recibo pode ser impresso agora mesmo para fechar o atendimento.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <SaleMetric label="Material" value={selectedMaterial?.nome ?? "--"} />
            <SaleMetric label="Peso vendido" value={formatWeight(pesoFinalKg)} tone="info" />
            <SaleMetric label="Total da venda" value={formatCurrencyBRL(total)} tone="positive" />
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button type="button" variant="secondary" onClick={() => window.print()} className="px-6 py-3">
              <Printer size={18} />
              Imprimir recibo
            </Button>
            <Button
              type="button"
              onClick={() => {
                setFinished(false);
                setMaterialId("");
                setValorDigitado("");
                setUnidadeEntrada("kg");
                setPricePerKg("");
              }}
              className="px-6 py-3"
            >
              Nova venda
            </Button>
          </div>
        </div>

        <div id="thermal-receipt" className="hidden bg-white text-left text-black print:block">
          <div className="mb-4 text-center">
            <h2 className="text-lg font-bold">FERRO VELHO DO GOMES</h2>
            <p className="text-sm">Sistema de Gestao</p>
            <p className="text-xs">{new Date().toLocaleString("pt-BR")}</p>
            <p>--------------------------------</p>
            <h3 className="font-bold">RECIBO DE VENDA</h3>
            <p>--------------------------------</p>
          </div>

          <div className="space-y-1 text-sm">
            <p><strong>MATERIAL:</strong> {selectedMaterial?.nome}</p>
            <p><strong>PESO:</strong> {pesoFinalKg.toFixed(2)} kg</p>
            <p><strong>PRECO/KG:</strong> R$ {parseFloat(pricePerKg).toFixed(2)}</p>
            <p>--------------------------------</p>
            <div className="text-right text-lg font-bold">
              TOTAL: R$ {total.toFixed(2)}
            </div>
            <p>--------------------------------</p>
          </div>

          <div className="mt-6 text-center text-xs italic">
            <p>Obrigado pela preferencia!</p>
            <p>v1.0.0</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-300">Saida operacional</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-50">Vendas</h1>
          <p className="page-intro mt-3">
            Monte a saida com peso convertido, preco sugerido do material e fechamento pronto para impressao.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SaleMetric label="Materiais ativos" value={String(materials.length)} />
          <SaleMetric label="Preco aplicado" value={pricePerKg ? formatCurrencyBRL(pricePerKg) : "--"} tone="info" />
          <SaleMetric label="Peso calculado" value={formatWeight(pesoFinalKg)} />
          <SaleMetric label="Total da venda" value={formatCurrencyBRL(total)} tone="positive" />
        </div>
      </header>

      {erro && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/12 px-4 py-3 text-sm text-rose-100">
          {erro}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="surface-panel-strong rounded-[28px] p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Lancamento da venda</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-50">Saida montada para atendimento rapido</h2>
          </div>

          <div className="mt-8 space-y-5">
            <SaleField label="Material" hint="Selecione o item que vai sair do patio.">
              <select
                className="surface-soft w-full rounded-2xl px-4 py-3 text-slate-100 outline-none focus:border-blue-400"
                value={materialId}
                onChange={(e) => handleMaterialChange(e.target.value)}
                disabled={carregando || salvando}
              >
                <option value="">Selecione o material...</option>
                {materials.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.nome}
                  </option>
                ))}
              </select>
            </SaleField>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_160px]">
              <SaleField label="Peso ou quantidade" hint="Aceita kg, gramas ou toneladas com conversao interna.">
                <input
                  type="number"
                  value={valorDigitado}
                  onChange={(e) => setValorDigitado(e.target.value)}
                  className="surface-soft w-full rounded-2xl px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-400"
                  placeholder="0,00"
                  disabled={salvando}
                />
              </SaleField>

              <SaleField label="Unidade" hint="Convertida para kg.">
                <select
                  className="surface-soft w-full rounded-2xl px-4 py-3 text-slate-100 outline-none focus:border-blue-400"
                  value={unidadeEntrada}
                  onChange={(e) => setUnidadeEntrada(e.target.value)}
                  disabled={salvando}
                >
                  <option value="kg">kg</option>
                  <option value="t">t</option>
                  <option value="g">g</option>
                </select>
              </SaleField>
            </div>

            <SaleField label="Preco de venda / kg" hint="Preenchido automaticamente a partir do cadastro do material.">
              <input
                type="number"
                value={pricePerKg}
                onChange={(e) => setPricePerKg(e.target.value)}
                className="surface-soft w-full rounded-2xl px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-400"
                disabled={salvando}
              />
            </SaleField>

            <Button
              className="w-full justify-center px-6 py-3 text-base"
              onClick={handleFinalizar}
              disabled={carregando || salvando}
            >
              {salvando ? "Registrando venda..." : "Confirmar venda"}
            </Button>
          </div>
        </div>

        <div className="surface-panel-strong rounded-[28px] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Resumo da saida</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-50">Conferencia e recibo</h2>

          <div className="mt-8 space-y-4">
            <div className="surface-panel rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5 text-blue-300" />
                <div>
                  <p className="text-sm font-semibold text-slate-200">Material selecionado</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {selectedMaterial ? selectedMaterial.nome : "Selecione um material para iniciar"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="surface-panel rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <Scale className="h-5 w-5 text-slate-300" />
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Peso final</p>
                </div>
                <p className="mt-4 text-2xl font-bold text-slate-100">{formatWeight(pesoFinalKg)}</p>
              </div>
              <div className="surface-panel rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-blue-300" />
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Preco / kg</p>
                </div>
                <p className="mt-4 text-2xl font-bold text-blue-300">
                  {pricePerKg ? formatCurrencyBRL(pricePerKg) : "--"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700/80 bg-[linear-gradient(180deg,rgba(17,24,39,0.92)_0%,rgba(30,41,59,0.94)_100%)] p-5">
              <div className="flex items-center gap-3">
                <Receipt className="h-5 w-5 text-emerald-400" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Total do atendimento</p>
              </div>
              <p className="mt-4 text-4xl font-bold text-slate-50">{formatCurrencyBRL(total)}</p>
              <p className="mt-3 text-sm text-slate-400">
                Quando concluir, o sistema deixa o recibo pronto para impressao termica.
              </p>
            </div>

            <Button type="button" variant="secondary" onClick={() => setLocation("/")} className="w-full justify-center px-6 py-3">
              Voltar ao painel
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
