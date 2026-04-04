# ferro-velho-frontend

Interface web do sistema de gestão do Ferro Velho Gomes, desenvolvida em React como parte do TCC na PUC/GO. Consome a API REST do [tcc-f-velhogomes](https://github.com/koreano06/tcc-f-velhogomes).

---

## 📋 Sobre o projeto

Sistema completo de gestão para ferro-velho com dashboard interativo, controle de estoque, registro de compras e vendas, e geração de relatórios. A interface se conecta ao backend Node.js/PostgreSQL via API REST.

### Funcionalidades

- **Dashboard** — visão geral com cards de compras, vendas, lucro do mês e estoque total, além de gráfico de barras por material
- **Materiais** — cadastro, edição e exclusão de materiais com preço por kg
- **Nova Venda** — registro de saída com suporte a kg, gramas e toneladas, cálculo automático do total e impressão de recibo térmico
- **Nova Compra** — registro de entrada de materiais
- **Relatórios** — total por material

---

## 🛠️ Tecnologias utilizadas

- **React** — biblioteca para construção da interface
- **Vite** — bundler e servidor de desenvolvimento
- **Tailwind CSS** — estilização utilitária
- **Recharts** — gráficos interativos no dashboard
- **Wouter** — roteamento entre páginas
- **Lucide React** — ícones

---

## 📁 Estrutura do projeto
ferro-velho-frontend/
├── src/
│   ├── components/
│   │   └── Sidebar.jsx        # Menu lateral de navegação
│   ├── layouts/
│   │   └── AppLayout.jsx      # Layout base com sidebar
│   ├── pages/
│   │   ├── Dashboard.jsx      # Painel com cards e gráfico
│   │   ├── Materiais.jsx      # CRUD de materiais
│   │   ├── NewSale.jsx        # Registro de vendas + recibo térmico
│   │   ├── RegistroCompra.jsx # Registro de compras
│   │   ├── RelatorioMaterial.jsx # Relatório por material
│   │   └── NotFound.jsx       # Página 404
│   ├── App.jsx                # Roteamento principal
│   └── main.jsx               # Ponto de entrada
├── index.html
└── vite.config.js

---

## 🚀 Como rodar localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) instalado
- Backend [tcc-f-velhogomes](https://github.com/koreano06/tcc-f-velhogomes) rodando em `http://localhost:3000`

### Passo a passo

**1. Clone o repositório**
```bash
git clone https://github.com/koreano06/ferro-velho-frontend.git
cd ferro-velho-frontend
```

**2. Instale as dependências**
```bash
npm install
```

**3. Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

Acesse em `http://localhost:5173`

---

## 👨‍💻 Autor

**Gustavo Ramos** — [@koreano06](https://github.com/koreano06)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/gustavo-ramos-843543397)
