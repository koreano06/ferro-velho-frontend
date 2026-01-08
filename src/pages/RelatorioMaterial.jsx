import React, { useState } from "react";

export default function RelatorioMaterial() {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [resultados, setResultados] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const consultarRelatorio = async () => {
    if (!dataInicio || !dataFim) {
      alert("Por favor, selecione as duas datas para filtrar.");
      return;
    }

    setCarregando(true);
    try {
      // Chamada para a rota unificada no seu backend
      const response = await fetch(
        `http://localhost:3000/api/reports/financial?startDate=${dataInicio}&endDate=${dataFim}`
      );
      
      if (!response.ok) throw new Error("Erro na resposta do servidor");
      
      const dados = await response.json();
      setResultados(dados);
    } catch (error) {
      console.error("Erro ao buscar relatório:", error);
      alert("Erro ao conectar com o servidor.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Relatório Financeiro por Período (RF06)</h1>
        <p className="text-gray-500">Consulte o faturamento de vendas entre duas datas específicas.</p>
      </header>

      {/* Filtros de Data */}
      <div className="flex flex-wrap gap-4 items-end bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Data Início</label>
          <input 
            type="date" 
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Data Fim</label>
          <input 
            type="date" 
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <button 
          onClick={consultarRelatorio}
          disabled={carregando}
          className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-300"
        >
          {carregando ? "Buscando..." : "Filtrar Relatório"}
        </button>
      </div>

      {/* Tabela de Resultados */}
      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-bold text-gray-700">Data da Venda</th>
              <th className="p-4 font-bold text-gray-700 text-right">Total Vendido (R$)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {resultados.length > 0 ? (
              resultados.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-600 font-medium">
                    {/* Exibe a data formatada corretamente vinda do banco */}
                    {item.data_venda}
                  </td>
                  <td className="p-4 text-right font-bold text-green-700 text-lg">
                    R$ {Number(item.total_vendido).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="p-16 text-center text-gray-400 italic">
                  {carregando ? "Carregando dados..." : "Nenhum dado encontrado para o período selecionado."}
                </td>
              </tr>
            )}
          </tbody>
          {resultados.length > 0 && (
            <tfoot className="bg-gray-50 font-bold">
              <tr>
                <td className="p-4 text-gray-900 text-right">TOTAL GERAL NO PERÍODO:</td>
                <td className="p-4 text-right text-blue-700 text-xl">
                  R$ {resultados.reduce((acc, curr) => acc + Number(curr.total_vendido), 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}