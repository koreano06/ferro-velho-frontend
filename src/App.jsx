import { Switch, Route } from "wouter";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Relatorios from "./pages/Relatorios";
import Materiais from "./pages/Materiais";
import NotFound from "./pages/NotFound";
import Compras from "./pages/Compras";
import Vendas from "./pages/Vendas";
import Estoque from "./pages/Estoque";
import GerenciamentoFinanceiro from "./pages/GerenciamentoFinanceiro";
import Parceiros from "./pages/Parceiros";
import Auditoria from "./pages/Auditoria";

const appRoutes = [
  { path: "/", component: Dashboard },
  { path: "/compras", component: Compras },
  { path: "/vendas", component: Vendas },
  { path: "/materiais", component: Materiais },
  { path: "/estoque", component: Estoque },
  { path: "/financeiro", component: GerenciamentoFinanceiro },
  { path: "/parceiros", component: Parceiros },
  { path: "/auditoria", component: Auditoria },
  { path: "/relatorios", component: Relatorios },
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
