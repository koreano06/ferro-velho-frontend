import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";

export default function Materiais() {
  const [materiais, setMateriais] = useState([]);
  const [nome, setNome] = useState("");
  const [precoKg, setPrecoKg] = useState("");
  const [editando, setEditando] = useState(null);

  const carregarMateriais = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/materiais");
      if (!res.ok) throw new Error("Erro ao buscar dados");
      const data = await res.json();
      setMateriais(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setMateriais([]);
    }
  };

  useEffect(() => {
    carregarMateriais();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dados = { nome, preco_kg: parseFloat(precoKg) };
    const url = editando 
      ? `http://localhost:3000/api/materiais/${editando.id_material}` 
      : "http://localhost:3000/api/materiais";
    
    try {
      const res = await fetch(url, {
        method: editando ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
      });

      if (res.ok) {
        setNome("");
        setPrecoKg("");
        setEditando(null);
        carregarMateriais();
      }
    } catch (err) {
      alert("Erro ao salvar");
    }
  };

  const apagarMaterial = async (id) => {
    if (!confirm("Excluir material?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/materiais/${id}`, { method: "DELETE" });
      if (res.ok) carregarMateriais();
    } catch (err) {
      alert("Erro ao excluir");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Adicionar Materiais</h1>
      </header>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border mb-8 flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-semibold text-gray-700">Coloque o Nome do Material</label>
          <input 
            className="w-full p-2 border rounded-lg mt-1" 
            value={nome} 
            onChange={(e) => setNome(e.target.value)} 
            required 
          />
        </div>
        <div className="w-48">
          <label className="text-sm font-semibold text-gray-700">Preço/KG</label>
          <input 
            type="number" step="0.01" 
            className="w-full p-2 border rounded-lg mt-1" 
            value={precoKg} 
            onChange={(e) => setPrecoKg(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-white ${editando ? 'bg-amber-600' : 'bg-green-600'}`}>
          {editando ? <Pencil size={18} /> : <Plus size={18} />}
          {editando ? "Atualizar" : "Cadastrar"}
        </button>
        {editando && (
          <button type="button" onClick={() => { setEditando(null); setNome(""); setPrecoKg(""); }} className="bg-gray-100 p-2 rounded-lg">
            <X size={20} />
          </button>
        )}
      </form>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-bold">Material</th>
              <th className="p-4 font-bold">Preço/KG</th>
              <th className="p-4 font-bold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {materiais.length > 0 ? (
              materiais.map((m) => (
                <tr key={m.id_material} className="hover:bg-gray-50">
                  <td className="p-4">{m.nome}</td>
                  <td className="p-4 font-bold text-green-700">R$ {Number(m.preco_kg).toFixed(2)}</td>
                  <td className="p-4 text-right space-x-4">
                    <button 
                      onClick={() => { setEditando(m); setNome(m.nome); setPrecoKg(m.preco_kg); }}
                      className="text-amber-600 inline-flex items-center gap-1 font-bold"
                    >
                      <Pencil size={16} /> Editar
                    </button>
                    <button 
                      onClick={() => apagarMaterial(m.id_material)}
                      className="text-red-500 inline-flex items-center gap-1 font-bold"
                    >
                      <Trash2 size={16} /> Excluir
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-10 text-center text-gray-400">Nenhum material cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}