import { Switch, Route } from "wouter";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import RelatorioMaterial from "./pages/RelatorioMaterial";
import Materiais from "./pages/Materiais";
import NotFound from "./pages/NotFound";
import RegistroCompra from "./pages/RegistroCompra";
import NewSale from "./pages/NewSale";
import Estoque from "./pages/Estoque";
import GerenciamentoFinanceiro from "./pages/GerenciamentoFinanceiro";
import Parceiros from "./pages/Parceiros";
import Auditoria from "./pages/Auditoria";

const appRoutes = [
  { path: "/", component: Dashboard },
  { path: "/compras", component: RegistroCompra },
  { path: "/vendas", component: NewSale },
  { path: "/materiais", component: Materiais },
  { path: "/estoque", component: Estoque },
  { path: "/financeiro", component: GerenciamentoFinanceiro },
  { path: "/parceiros", component: Parceiros },
  { path: "/auditoria", component: Auditoria },
  { path: "/relatorios", component: RelatorioMaterial },
];

export default function App() {
  return (
    <AppLayout>
      <Switch>
        {appRoutes.map((route) => (
          <Route key={route.path} path={route.path} component={route.component} />
        ))}
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}
