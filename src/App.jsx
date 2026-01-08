import { Switch, Route } from "wouter";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import RelatorioMaterial from "./pages/RelatorioMaterial";
import Materiais from "./pages/Materiais";
import NotFound from "./pages/NotFound";
import RegistroCompra from "./pages/RegistroCompra";
import NewSale from "./pages/NewSale";

export default function App() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/relatorios" component={RelatorioMaterial} />
        <Route path="/materiais" component={Materiais} />
        
        {/* MOVA A ROTA DE COMPRAS PARA CIMA DO NOTFOUND */}
        <Route path="/compras" component={RegistroCompra} />
        
        <Route path="/vendas" component={NewSale} />
        
        {/* O NotFound DEVE ser sempre o último da lista */}
        <Route component={NotFound} />
        
      </Switch>
    </AppLayout>
  );
}