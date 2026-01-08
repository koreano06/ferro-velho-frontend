import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";

export default function RegistroCompra() {
  const [materiais, setMaterials] = useState([]);
  const [selecionado, setSelecionado] = useState("");
  const [valorDigitado, setValorDigitado] = useState("");
  const [unidadeEntrada, setUnidadeEntrada] = useState("kg");
  const [precoKg, setPrecoKg] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3000/api/materiais")
      .then((res) => res.json())
      .then(setMaterials)
      .catch((err) => console.error("Erro ao carregar materiais:", err));
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
      alert("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialId: parseInt(selecionado),
          weightKg: pesoFinalKg,
          pricePerKg: precoKg,
        }),
      });

      if (response.ok) setFinished(true);
      else {
        const errorData = await response.json();
        alert("Erro: " + errorData.error);
      }
    } catch (error) {
      alert("Erro de conexão com o servidor.");
    }
  };

  if (finished) {
    return (
      <div className="p-10 text-center space-y-6 max-w-2xl mx-auto mt-20 bg-white rounded-xl shadow-lg border">
        <CheckCircle className="w-20 h-20 text-green-600 mx-auto" />
        <h2 className="text-3xl font-bold text-gray-800">Compra Registrada!</h2>
        <div className="flex justify-center gap-4 mt-8">
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-blue-700 text-white rounded-lg font-bold">Nova Compra</button>
          <button onClick={() => window.location.href = "/"} className="px-6 py-3 border rounded-lg font-bold text-gray-700">Início</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Nova Compra</h1>
      <div className="bg-white p-6 rounded-xl shadow-lg border space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">1. Selecione o Material</label>
          <select className="w-full p-3 border rounded" value={selecionado} onChange={(e) => handleMaterialChange(e.target.value)}>
            <option value="">Escolha...</option>
            {materiais.map(m => <option key={m.id_material} value={m.id_material}>{m.nome}</option>)}
          </select>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">2. Quantidade</label>
            <input type="number" className="w-full p-3 border rounded" value={valorDigitado} onChange={(e) => setValorDigitado(e.target.value)} placeholder="0.00" />
          </div>
          <div className="w-32">
            <label className="block text-sm font-bold text-gray-700 mb-1">Unidade</label>
            <select className="w-full p-3 border rounded bg-gray-50 font-bold" value={unidadeEntrada} onChange={(e) => setUnidadeEntrada(e.target.value)}>
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
        <button className="w-full bg-blue-700 text-white py-4 rounded-lg font-bold hover:bg-blue-800 transition-colors" onClick={handleFinalizarCompra}>
          FINALIZAR COMPRA
        </button>
      </div>
    </div>
  );
}