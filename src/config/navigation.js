export const NAV_SECTIONS = [
  {
    title: "Operacao",
    links: [
      { href: "/", label: "Dashboard", roles: ["owner", "employee", "viewer"] },
      { href: "/compras", label: "Nova Compra", roles: ["owner", "employee"] },
      { href: "/vendas", label: "Nova Venda", roles: ["owner", "employee"] },
      { href: "/materiais", label: "Materiais", roles: ["owner"] },
      { href: "/estoque", label: "Estoque", roles: ["owner", "employee", "viewer"] },
    ],
  },
  {
    title: "Gestao",
    links: [
      { href: "/financeiro", label: "Financeiro", roles: ["owner"] },
      { href: "/parceiros", label: "Parceiros", roles: ["owner"] },
      { href: "/auditoria", label: "Auditoria", roles: ["owner"] },
      { href: "/relatorios", label: "Relatorios", roles: ["owner"] },
    ],
  },
];
