import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { CheckCircle } from "lucide-react";
import { getMateriais } from "../services/materialService";
import { createCompra } from "../services/compraService";

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
        setMaterials(Array.isArray(data) ? data : []);
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    loadMateriais();
  }, []);

  const handleMaterialChange = (id) => {
    setSelecionado(id);
    const m = materiais.find((item) => item.id_material == id);
    setPrecoKg(m ? Number(m.preco_kg) : 0);
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
      <div className="p-10 text-center space-y-6 max-w-2xl mx-auto mt-20 bg-white rounded-xl shadow-lg border">
        <CheckCircle className="w-20 h-20 text-green-600 mx-auto" />
        <h2 className="text-3xl font-bold text-gray-800">Compra Registrada!</h2>
        <p className="text-sm text-gray-500">A operacao foi concluida e o estoque ja pode ser atualizado.</p>
        <div className="flex justify-center gap-4 mt-8">
          <button
            type="button"
            onClick={() => {
              setFinished(false);
              setSelecionado("");
              setValorDigitado("");
              setUnidadeEntrada("kg");
              setPrecoKg(0);
            }}
            className="px-6 py-3 bg-blue-700 text-white rounded-lg font-bold"
          >
            Nova Compra
          </button>
          <button type="button" onClick={() => setLocation("/")} className="px-6 py-3 border rounded-lg font-bold text-gray-700">
            Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold mb-6">Nova Compra</h1>
      <div className="bg-white p-6 rounded-xl shadow-lg border space-y-6">
        {erro && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">1. Selecione o Material</label>
          <select
            className="w-full p-3 border rounded"
            value={selecionado}
            onChange={(e) => handleMaterialChange(e.target.value)}
            disabled={carregando || salvando}
          >
            <option value="">Escolha...</option>
            {materiais.map(m => <option key={m.id_material} value={m.id_material}>{m.nome}</option>)}
          </select>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">2. Quantidade</label>
            <input type="number" className="w-full p-3 border rounded" value={valorDigitado} onChange={(e) => setValorDigitado(e.target.value)} placeholder="0.00" disabled={salvando} />
          </div>
          <div className="w-32">
            <label className="block text-sm font-bold text-gray-700 mb-1">Unidade</label>
            <select className="w-full p-3 border rounded bg-gray-50 font-bold" value={unidadeEntrada} onChange={(e) => setUnidadeEntrada(e.target.value)} disabled={salvando}>
              <option value="kg">kg</option>
              <option value="t">t</option>
              <option value="g">g</option>
            </select>
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex justify-between text-xl font-black text-blue-900">
            <span>TOTAL A PAGAR:</span>
            <span>R$ {totalFinanceiro.toFixed(2)}</span>
          </div>
        </div>
        {carregando && <p className="text-sm text-gray-500">Carregando materiais...</p>}
        <button
          className="w-full bg-blue-700 text-white py-4 rounded-lg font-bold hover:bg-blue-800 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
          onClick={handleFinalizarCompra}
          disabled={carregando || salvando}
        >
          {salvando ? "Salvando..." : "FINALIZAR COMPRA"}
        </button>
      </div>
    </div>
  );
}
