function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizeMaterial(material) {
  const precoCompraKg = toNumber(
    material.preco_compra_kg ?? material.precoCompraKg ?? material.preco_base ?? material.preco_kg
  );
  const precoVendaKg = toNumber(
    material.preco_venda_kg ?? material.precoVendaKg ?? material.preco_venda ?? material.preco_kg
  );
  const quantidadeKg = toNumber(material.quantidade_kg ?? material.quantidadeKg);
  const estoqueMinimoKg = toNumber(
    material.estoque_minimo_kg ?? material.estoqueMinimoKg ?? material.minimo_kg ?? material.estoque_minimo
  );

  return {
    id: material.id_material ?? material.id,
    nome: String(material.nome ?? "Sem nome"),
    quantidadeKg,
    precoCompraKg,
    precoVendaKg,
    estoqueMinimoKg,
    valorCustoEstoque: quantidadeKg * precoCompraKg,
    valorVendaEstoque: quantidadeKg * precoVendaKg,
    lucroPotencialEstoque: quantidadeKg * (precoVendaKg - precoCompraKg),
  };
}

export function getMaterialStatus(material) {
  if (material.quantidadeKg <= 0) {
    return "zerado";
  }

  if (material.estoqueMinimoKg > 0 && material.quantidadeKg <= material.estoqueMinimoKg) {
    return "baixo";
  }

  return "ok";
}

export function getMaterialStatusLabel(status) {
  if (status === "zerado") return "Sem estoque";
  if (status === "baixo") return "Abaixo do minimo";
  return "Disponivel";
}

export function getMaterialMargin(material) {
  return material.precoVendaKg - material.precoCompraKg;
}
