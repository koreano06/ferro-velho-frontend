import { KeyRound, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import Button from "../components/ui/Button";
import { ROLE_LABELS } from "../config/authUsers";
import { useAuth } from "../hooks/useAuth";

const quickUsers = [
  { username: "gomes", pin: "1234", role: "owner" },
  { username: "joao", pin: "2222", role: "employee" },
  { username: "consulta", pin: "0000", role: "viewer" },
];

export default function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setEntrando(true);
      setErro("");
      const nextPath = login(username, pin);
      setLocation(nextPath);
    } catch (error) {
      setErro(error.message);
    } finally {
      setEntrando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 md:p-6">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex flex-col justify-between rounded-[32px] border border-slate-800/80 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(15,23,42,0.74))] p-8 shadow-[0_22px_46px_-28px_rgba(0,0,0,0.55)] md:p-10">
          <div>
            <div className="brand-shell inline-flex rounded-[28px] border border-white/10 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="brand-mark flex h-12 w-12 items-center justify-center rounded-2xl">
                  <span className="brand-mark__label">FV</span>
                </div>
                <div>
                  <p className="brand-kicker">Ferro Velho</p>
                  <h1 className="brand-title">Gomes</h1>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-4">
            <div className="surface-panel rounded-3xl p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-300">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-base font-semibold tracking-[-0.03em] text-slate-100">Acesso por perfil</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    O dono acompanha a gestao completa, o funcionario opera o sistema e o modo consulta mostra apenas o necessario.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {quickUsers.map((item) => (
                <button
                  key={item.username}
                  type="button"
                  onClick={() => {
                    setUsername(item.username);
                    setPin(item.pin);
                    setErro("");
                  }}
                  className="rounded-2xl border border-slate-700/80 bg-slate-900/60 px-4 py-4 text-left transition-colors hover:border-blue-500/30 hover:bg-slate-800/70"
                >
                  <p className="text-sm font-semibold text-slate-100">{item.username}</p>
                  <p className="mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {ROLE_LABELS[item.role]}
                  </p>
                  <p className="mt-3 text-sm text-slate-400">PIN {item.pin}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="surface-panel-strong rounded-[32px] p-8 md:p-10">
          <div className="mx-auto max-w-md">
            <p className="muted-label">Entrar</p>
            <h3 className="panel-title mt-3">Acesse sua conta</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Use seu usuario e PIN de 4 digitos para entrar no sistema.
            </p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              {erro && (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/12 px-4 py-3 text-sm text-rose-100">
                  {erro}
                </div>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">Usuario</span>
                <div className="surface-soft flex items-center gap-3 rounded-2xl px-4 py-3.5">
                  <UserRound size={18} className="text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
                    placeholder="gomes"
                    autoComplete="username"
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">PIN de acesso</span>
                <div className="surface-soft flex items-center gap-3 rounded-2xl px-4 py-3.5">
                  <KeyRound size={18} className="text-slate-400" />
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
                    placeholder="1234"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </label>

              <Button type="submit" disabled={entrando} className="w-full justify-center py-3.5 text-base">
                {entrando ? "Entrando..." : "Entrar no sistema"}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
