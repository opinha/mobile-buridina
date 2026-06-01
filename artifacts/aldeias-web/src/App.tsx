import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { AppProvider } from "./context/AppContext";
import { Layout } from "./components/Layout";

// Stubs for the pages
import Home from "./pages/Home";
import Scanner from "./pages/Scanner";
import AldeiaDetail from "./pages/AldeiaDetail";
import MembroDetail from "./pages/MembroDetail";
import Login from "./pages/Login";
import CadastroMembro from "./pages/CadastroMembro";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Layout>
          <Switch>
            <Route path="/" component={Login} />
            <Route path="/aldeias" component={Home} />
            <Route path="/scanner" component={Scanner} />
            <Route path="/aldeia/:id/cadastrar" component={CadastroMembro} />
            <Route path="/aldeia/:id" component={AldeiaDetail} />
            <Route path="/membro/:id" component={MembroDetail} />
            <Route>
              <div className="flex h-full items-center justify-center">
                <span className="text-gray-500">Página não encontrada</span>
              </div>
            </Route>
          </Switch>
        </Layout>
      </AppProvider>
    </QueryClientProvider>
  );
}
