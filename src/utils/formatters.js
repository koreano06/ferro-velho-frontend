export function formatWeight(value) {
  return `${Number(value).toFixed(2)} kg`;
}

export function formatCurrencyBRL(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}
