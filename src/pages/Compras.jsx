import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { CheckCircle, Landmark, Package, Scale, Wallet } from "lucide-react";
import Button from "../components/ui/Button";
import { getMateriais } from "../services/materialService";
import { createCompra } from "../services/compraService";
import { formatCurrencyBRL, formatWeight } from "../utils/formatters";
import { normalizeMaterial } from "../utils/materials";

function PurchaseMetric({ label, value, tone = "neutral" }) {
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

function PurchaseField({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-200">{label}</span>
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
      <div className="mt-3">{children}</div>
    </label>
  );
}

export default function Compras() {
  const [, setLocation] = useLocation();
  const [materiais, setMaterials] = useState([]);
  const [selecionado, setSelecionado] = useState("");
  const [valorDigitado, setValorDigitado] = useState("");
  const [unidadeEntrada, setUnidadeEntrada] = useState("kg");
  const [precoKg, setPrecoKg] = useState(0);
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

  const materialSelecionado = materiais.find((item) => String(item.id) === selecionado);

  const handleMaterialChange = (id) => {
    setSelecionado(id);
    const material = materiais.find((item) => String(item.id) === id);
    setPrecoKg(material ? Number(material.precoCompraKg) : 0);
  };

  const pesoFinalKg = (() => {
    const valor = parseFloat(valorDigitado || 0);
    if (unidadeEntrada === "t") return valor * 1000;
    if (unidadeEntrada === "g") return valor / 1000;
    return valor;
  })();

  const totalFinanceiro = pesoFinalKg * precoKg;

  const handleFinalizarCompra = async () => {
    if (!selecionado || !valorDigitado) {
      setErro("Preencha o material e a quantidade para registrar a compra.");
      return;
    }

    try {
      setSalvando(true);
      setErro("");
      await createCompra({
        materialId: parseInt(selecionado, 10),
        weightKg: pesoFinalKg,
        pricePerKg: precoKg,
      });
      setFinished(true);
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  if (finished) {
    return (
      <div className="mx-auto mt-16 max-w-3xl">
        <div className="surface-panel-strong rounded-[30px] p-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/12">
            <CheckCircle className="h-10 w-10 text-emerald-400" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-slate-50">Compra registrada</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">
            A entrada foi salva no sistema e o estoque operacional ja pode ser consultado no painel.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <PurchaseMetric label="Material" value={materialSelecionado?.nome ?? "--"} />
            <PurchaseMetric label="Peso recebido" value={formatWeight(pesoFinalKg)} tone="info" />
            <PurchaseMetric label="Total pago" value={formatCurrencyBRL(totalFinanceiro)} tone="positive" />
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              type="button"
              onClick={() => {
                setFinished(false);
                setSelecionado("");
                setValorDigitado("");
                setUnidadeEntrada("kg");
                setPrecoKg(0);
              }}
              className="px-6 py-3"
            >
              Nova compra
            </Button>
            <Button type="button" variant="secondary" onClick={() => setLocation("/")} className="px-6 py-3">
              Voltar ao painel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-300">Entrada operacional</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-50">Compras</h1>
          <p className="page-intro mt-3">
            Registre a entrada de material com peso convertido automaticamente e valor de compra aplicado na hora.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <PurchaseMetric label="Materiais ativos" value={String(materiais.length)} />
          <PurchaseMetric label="Preco usado" value={precoKg ? formatCurrencyBRL(precoKg) : "--"} tone="info" />
          <PurchaseMetric label="Peso calculado" value={formatWeight(pesoFinalKg)} />
          <PurchaseMetric label="Total desta compra" value={formatCurrencyBRL(totalFinanceiro)} tone="positive" />
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
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Lancamento da compra</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-50">Entrada pronta para balcao e patio</h2>
          </div>

          <div className="mt-8 space-y-5">
            <PurchaseField label="Material" hint="Escolha o item que entrou no patio.">
              <select
                className="surface-soft w-full rounded-2xl px-4 py-3 text-slate-100 outline-none focus:border-blue-400"
                value={selecionado}
                onChange={(e) => handleMaterialChange(e.target.value)}
                disabled={carregando || salvando}
              >
                <option value="">Selecione o material...</option>
                {materiais.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.nome}
                  </option>
                ))}
              </select>
            </PurchaseField>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_160px]">
              <PurchaseField label="Quantidade" hint="Digite o valor lido na balanca ou informado pelo funcionario.">
                <input
                  type="number"
                  className="surface-soft w-full rounded-2xl px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-400"
                  value={valorDigitado}
                  onChange={(e) => setValorDigitado(e.target.value)}
                  placeholder="0,00"
                  disabled={salvando}
                />
              </PurchaseField>

              <PurchaseField label="Unidade" hint="Convertemos para kg automaticamente.">
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
              </PurchaseField>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="surface-panel rounded-2xl p-4">
                <div className="flex items-center gap-3 text-slate-300">
                  <Wallet size={18} className="text-blue-300" />
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Compra / kg</p>
                </div>
                <p className="mt-4 text-2xl font-bold text-blue-300">
                  {precoKg ? formatCurrencyBRL(precoKg) : "--"}
                </p>
              </div>

              <div className="surface-panel rounded-2xl p-4">
                <div className="flex items-center gap-3 text-slate-300">
                  <Scale size={18} className="text-slate-300" />
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Peso final</p>
                </div>
                <p className="mt-4 text-2xl font-bold text-slate-100">{formatWeight(pesoFinalKg)}</p>
              </div>

              <div className="surface-panel rounded-2xl p-4">
                <div className="flex items-center gap-3 text-slate-300">
                  <Landmark size={18} className="text-emerald-400" />
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Total a pagar</p>
                </div>
                <p className="mt-4 text-2xl font-bold text-emerald-400">{formatCurrencyBRL(totalFinanceiro)}</p>
              </div>
            </div>

            <Button
              className="w-full justify-center px-6 py-3 text-base"
              onClick={handleFinalizarCompra}
              disabled={carregando || salvando}
            >
              {salvando ? "Salvando compra..." : "Finalizar compra"}
            </Button>
          </div>
        </div>

        <div className="surface-panel-strong rounded-[28px] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Resumo da operacao</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-50">Conferencia rapida</h2>

          <div className="mt-8 space-y-4">
            <div className="surface-panel rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-blue-300" />
                <div>
                  <p className="text-sm font-semibold text-slate-200">Material selecionado</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {materialSelecionado ? materialSelecionado.nome : "Escolha um material para seguir"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700/80 bg-[linear-gradient(180deg,rgba(17,24,39,0.92)_0%,rgba(30,41,59,0.94)_100%)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Valor projetado</p>
              <p className="mt-4 text-4xl font-bold text-slate-50">{formatCurrencyBRL(totalFinanceiro)}</p>
              <p className="mt-3 text-sm text-slate-400">
                Baseado no preco de compra atual do material e no peso convertido para kg.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700/80 bg-slate-950/20 p-5">
              <p className="text-sm font-semibold text-slate-200">Estado do formulario</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-400">
                <li>{carregando ? "Carregando materiais do cadastro..." : "Lista de materiais sincronizada."}</li>
                <li>{selecionado ? "Material definido para o lancamento." : "Falta escolher o material."}</li>
                <li>{valorDigitado ? "Quantidade informada e convertida." : "Falta preencher a quantidade."}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
