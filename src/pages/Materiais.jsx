import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import {
  createMaterial,
  deleteMaterial,
  getMateriais,
  updateMaterial,
} from "../services/materialService";

export default function Materiais() {
  const [materiais, setMateriais] = useState([]);
  const [nome, setNome] = useState("");
  const [precoKg, setPrecoKg] = useState("");
  const [editando, setEditando] = useState(null);
  const [erro, setErro] = useState("");
  const [feedback, setFeedback] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [removendoId, setRemovendoId] = useState(null);

  const carregarMateriais = async () => {
    try {
      setErro("");
      const data = await getMateriais();
      setMateriais(Array.isArray(data) ? data : []);
    } catch (error) {
      setErro(error.message);
      setMateriais([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarMateriais();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dados = { nome, preco_kg: parseFloat(precoKg) };

    try {
      setSalvando(true);
      setErro("");
      setFeedback("");

      if (editando) {
        await updateMaterial(editando.id_material, dados);
        setFeedback("Material atualizado com sucesso.");
      } else {
        await createMaterial(dados);
        setFeedback("Material cadastrado com sucesso.");
      }

      setNome("");
      setPrecoKg("");
      setEditando(null);
      await carregarMateriais();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  const apagarMaterial = async (id) => {
    try {
      setRemovendoId(id);
      setErro("");
      setFeedback("");
      await deleteMaterial(id);
      setFeedback("Material removido com sucesso.");
      await carregarMateriais();
    } catch (error) {
      setErro(error.message);
    } finally {
      setRemovendoId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Adicionar Materiais</h1>
      </header>

      {erro && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      {feedback && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {feedback}
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="mb-8 flex flex-col gap-4 rounded-xl border bg-white p-6 shadow-sm md:flex-row md:items-end">
        <div className="flex-1">
          <label className="text-sm font-semibold text-gray-700">Coloque o Nome do Material</label>
          <input 
            className="w-full p-2 border rounded-lg mt-1" 
            value={nome} 
            onChange={(e) => setNome(e.target.value)} 
            disabled={salvando}
            required 
          />
        </div>
        <div className="md:w-48">
          <label className="text-sm font-semibold text-gray-700">Preço/KG</label>
          <input 
            type="number" step="0.01" 
            className="w-full p-2 border rounded-lg mt-1" 
            value={precoKg} 
            onChange={(e) => setPrecoKg(e.target.value)} 
            disabled={salvando}
            required 
          />
        </div>
        <button type="submit" disabled={salvando} className={`flex items-center justify-center gap-2 rounded-lg px-6 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-70 ${editando ? 'bg-amber-600' : 'bg-green-600'}`}>
          {editando ? <Pencil size={18} /> : <Plus size={18} />}
          {salvando ? "Salvando..." : editando ? "Atualizar" : "Cadastrar"}
        </button>
        {editando && (
          <button type="button" onClick={() => { setEditando(null); setNome(""); setPrecoKg(""); setFeedback(""); }} className="bg-gray-100 p-2 rounded-lg" disabled={salvando}>
            <X size={20} />
          </button>
        )}
      </form>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-bold">Material</th>
              <th className="p-4 font-bold">Preço/KG</th>
              <th className="p-4 font-bold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!carregando && materiais.length > 0 ? (
              materiais.map((m) => (
                <tr key={m.id_material} className="hover:bg-gray-50">
                  <td className="p-4">{m.nome}</td>
                  <td className="p-4 font-bold text-green-700">R$ {Number(m.preco_kg).toFixed(2)}</td>
                  <td className="p-4 text-right space-x-4">
                    <button 
                      onClick={() => { setEditando(m); setNome(m.nome); setPrecoKg(m.preco_kg); }}
                      className="text-amber-600 inline-flex items-center gap-1 font-bold disabled:opacity-50"
                      disabled={salvando || removendoId === m.id_material}
                    >
                      <Pencil size={16} /> Editar
                    </button>
                    <button 
                      onClick={() => apagarMaterial(m.id_material)}
                      className="text-red-500 inline-flex items-center gap-1 font-bold disabled:opacity-50"
                      disabled={salvando || removendoId === m.id_material}
                    >
                      <Trash2 size={16} /> {removendoId === m.id_material ? "Excluindo..." : "Excluir"}
                    </button>
                  </td>
                </tr>
              ))
            ) : carregando ? (
              <tr>
                <td colSpan="3" className="p-10 text-center text-gray-400">Carregando materiais...</td>
              </tr>
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
