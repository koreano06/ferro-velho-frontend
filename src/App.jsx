import { Switch, Route } from "wouter";
import ProtectedRoute from "./components/auth/ProtectedRoute";
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
import Login from "./pages/Login";
import { useAuth } from "./hooks/useAuth";

const appRoutes = [
  { path: "/", component: Dashboard, roles: ["owner", "employee", "viewer"] },
  { path: "/compras", component: Compras, roles: ["owner", "employee"] },
  { path: "/vendas", component: Vendas, roles: ["owner", "employee"] },
  { path: "/materiais", component: Materiais, roles: ["owner"] },
  { path: "/estoque", component: Estoque, roles: ["owner", "employee", "viewer"] },
  { path: "/financeiro", component: GerenciamentoFinanceiro, roles: ["owner"] },
  { path: "/parceiros", component: Parceiros, roles: ["owner"] },
  { path: "/auditoria", component: Auditoria, roles: ["owner"] },
  { path: "/relatorios", component: Relatorios, roles: ["owner"] },
];

export default function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <AppLayout>
      <Switch>
        {appRoutes.map((route) => (
          <Route key={route.path} path={route.path}>
            <ProtectedRoute component={route.component} allowedRoles={route.roles} />
          </Route>
        ))}
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}
