import React, { useEffect, useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Componente de Card para os indicadores
function Card({ title, value, positive, suffix }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h4 className="text-sm text-gray-500">{title}</h4>
      <p
        className={`mt-2 text-2xl font-bold ${
          positive === true
            ? "text-green-600"
            : positive === false
            ? "text-red-600"
            : "text-gray-900"
        }`}
      >
        {value} {suffix || ""}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [dadosGrafico, setDadosGrafico] = useState([]); 
  const [erro, setErro] = useState("");

  useEffect(() => {
    // Busca unificada dos dados do Dashboard (Cards e Gráfico)
    fetch("http://localhost:3000/api/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar dados do servidor");
        return res.json();
      })
      .then((data) => {
        setStats(data);
        // O backend geralmente envia os dados do gráfico dentro de stats.detalhes ou similar
        // Ajustado para usar a propriedade correta enviada pelo seu controller de dashboard
        setDadosGrafico(Array.isArray(data.detalhes_materiais) ? data.detalhes_materiais : []);
      })
      .catch((err) => {
        console.error("Erro no dashboard:", err);
        setErro("Não foi possível carregar os dados. Verifique se o servidor está ligado.");
      });
  }, []);

  if (erro) {
    return <div className="p-6 text-red-600 font-semibold bg-red-50 rounded-lg m-6 border border-red-200">⚠️ {erro}</div>;
  }

  if (!stats) {
    return <div className="p-6 text-gray-500 italic animate-pulse">Carregando painel de controle...</div>;
  }

  // Tratamento de valores numéricos
  const comprasMes = Number(stats?.compras_mes) || 0;
  const vendasMes = Number(stats?.vendas_mes) || 0;
  const lucroMes = Number(stats?.lucro_mes) || 0;
  const estoqueTotal = Number(stats?.estoque_total) || 0;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Visão geral do Ferro Velho Gomes</p>
      </header>

      {/* Seção de Resumo (Cards) */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          title="Compras do mês"
          value={`R$ ${comprasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          positive={false}
        />
        <Card
          title="Vendas do mês"
          value={`R$ ${vendasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          positive={true}
        />
        <Card
          title="Lucro do mês"
          value={`R$ ${lucroMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          positive={lucroMes >= 0}
        />
        <Card
          title="Estoque total"
          value={estoqueTotal.toFixed(2)}
          suffix="kg"
        />
      </section>

      {/* Seção do Gráfico */}
      <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Estoque por Material (kg)</h3>
        
        <div className="w-full" style={{ height: '350px' }}>
          {dadosGrafico.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={dadosGrafico} 
                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="nome" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  formatter={(value) => [`${Number(value).toFixed(2)} kg`, "Peso em Estoque"]} 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                  }}
                />
                <Bar 
                  dataKey="estoque_kg" // Certifique-se que o SQL do dashboard retorna esta coluna
                  fill="#3b82f6" 
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p>Nenhum dado de material disponível para o gráfico.</p>
              <p className="text-xs mt-2">Cadastre compras para ver o estoque subir.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}