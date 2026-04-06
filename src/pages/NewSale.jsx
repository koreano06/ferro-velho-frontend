import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Printer, CheckCircle, ArrowLeft, Scale } from "lucide-react";
import { getMateriais } from "../services/materialService";
import { createSale } from "../services/transactionService";

export default function NewSale() {
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
        setMaterials(Array.isArray(data) ? data : []);
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    loadMateriais();
  }, []);

  const selectedMaterial = materials.find(m => m.id_material?.toString() === materialId);

  const handleMaterialChange = (id) => {
    setMaterialId(id);
    const material = materials.find((item) => item.id_material?.toString() === id);
    setPricePerKg(material ? String(material.preco_kg) : "");
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

    const dadosParaEnviar = {
      materialId: parseInt(materialId, 10),
      weightKg: pesoFinalKg, 
      pricePerKg: parseFloat(pricePerKg) 
    };

    try {
      setSalvando(true);
      setErro("");
      await createSale(dadosParaEnviar);
      setFinished(true);
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  // CSS específico para impressão térmica - LIMPO
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
      <div className="p-10 text-center space-y-6">
        <style>{printStyles}</style>
        
        <div className="print:hidden">
          <CheckCircle className="w-20 h-20 text-blue-600 mx-auto" />
          <h2 className="text-3xl font-bold">Venda Finalizada!</h2>
          <p className="text-sm text-gray-500">O recibo esta pronto para impressao e a saida foi registrada.</p>
          <div className="flex justify-center gap-4 mt-6">
            <button 
              onClick={() => window.print()} 
              className="flex items-center px-4 py-2 border rounded hover:bg-gray-100"
            >
              <Printer className="mr-2"/> Imprimir Recibo
            </button>
            <button 
              onClick={() => {
                setFinished(false);
                setMaterialId("");
                setValorDigitado("");
                setUnidadeEntrada("kg");
                setPricePerKg("");
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Nova Venda
            </button>
          </div>
        </div>
        
        {/* RECIBO PARA IMPRESSORA TÉRMICA - SEM CITAÇÕES */}
        <div id="thermal-receipt" className="hidden print:block text-left text-black bg-white">
          <div className="text-center mb-4">
            <h2 className="font-bold text-lg">FERRO VELHO DO GOMES</h2>
            <p className="text-sm">Sistema de Gestão</p>
            <p className="text-xs">{new Date().toLocaleString('pt-BR')}</p>
            <p>--------------------------------</p>
            <h3 className="font-bold">RECIBO DE VENDA</h3>
            <p>--------------------------------</p>
          </div>

          <div className="space-y-1 text-sm">
            <p><strong>MATERIAL:</strong> {selectedMaterial?.nome}</p>
            <p><strong>PESO:</strong> {pesoFinalKg.toFixed(2)} kg</p>
            <p><strong>PREÇO/KG:</strong> R$ {parseFloat(pricePerKg).toFixed(2)}</p>
            <p>--------------------------------</p>
            <div className="text-right font-bold text-lg">
               TOTAL: R$ {total.toFixed(2)}
            </div>
            <p>--------------------------------</p>
          </div>

          <div className="text-center mt-6 text-xs italic">
            <p>Obrigado pela preferência!</p>
            <p>v1.0.0</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => setLocation("/")} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft />
        </button>
        <h1 className="text-3xl font-black">Nova Venda (Saída)</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border-t-4 border-t-blue-600 space-y-6">
          <h2 className="text-sm font-bold uppercase text-gray-500 flex items-center gap-2">
            <Scale size={16}/> Detalhes da Saída
          </h2>

          {erro && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {erro}
            </div>
          )}

          <div className="space-y-2">
            <label className="block font-bold">Material</label>
            <select 
              className="w-full h-12 border rounded-md px-3 bg-white"
              value={materialId}
              onChange={(e) => handleMaterialChange(e.target.value)}
              disabled={carregando || salvando}
            >
              <option value="">Selecione o material...</option>
              {materials.map(m => (
                <option key={m.id_material} value={m.id_material}>{m.nome}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block font-bold text-blue-700">Quantidade/Peso</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={valorDigitado} 
                  onChange={e => setValorDigitado(e.target.value)} 
                  className="w-full h-12 border rounded-md px-3 text-lg" 
                  placeholder="0.00"
                  disabled={salvando}
                />
                <select 
                  className="w-24 h-12 border rounded-md bg-gray-100 font-bold px-2"
                  value={unidadeEntrada}
                  onChange={e => setUnidadeEntrada(e.target.value)}
                  disabled={salvando}
                >
                  <option value="kg">kg</option>
                  <option value="t">t</option>
                  <option value="g">g</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block font-bold">Preço de Venda/KG</label>
              <input 
                type="number" 
                value={pricePerKg} 
                onChange={e => setPricePerKg(e.target.value)} 
                className="w-full h-12 border rounded-md px-3 text-lg"
                disabled={salvando}
              />
            </div>
          </div>

          {carregando && <p className="text-sm text-gray-500">Carregando materiais...</p>}
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-lg shadow-xl space-y-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xs text-slate-400 uppercase tracking-widest mb-4">Total da Venda</h2>
            <div className="text-4xl font-black text-blue-400 font-mono">
              R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <button 
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-70"
            onClick={handleFinalizar}
            disabled={carregando || salvando}
          >
            {salvando ? "Salvando..." : "Confirmar Venda"}
          </button>
        </div>
      </div>
    </div>
  );
}
