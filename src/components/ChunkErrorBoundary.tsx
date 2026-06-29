import { Component, ReactNode } from "react";

/**
 * După un deploy nou, browserul poate avea index.html vechi în memorie
 * care referențiază chunk-uri JS cu hash-uri ce nu mai există pe server.
 * `React.lazy(() => import(...))` aruncă atunci „Failed to fetch dynamically
 * imported module" sau „ChunkLoadError" → ecran alb până la refresh manual.
 *
 * Acest boundary detectează exact acest caz și face un singur reload automat
 * (folosim sessionStorage ca să evităm bucle de reload pe erori persistente).
 */

const RELOAD_FLAG = "__chunk_reload_attempted__";

function isChunkLoadError(err: unknown): boolean {
  if (!err) return false;
  const msg =
    (err as any)?.message?.toString?.() ||
    (typeof err === "string" ? err : "");
  const name = (err as any)?.name?.toString?.() || "";
  return (
    name === "ChunkLoadError" ||
    /Loading chunk [\d]+ failed/i.test(msg) ||
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    /error loading dynamically imported module/i.test(msg)
  );
}

interface State {
  hasError: boolean;
  error: unknown;
}

export class ChunkErrorBoundary extends Component<
  { children: ReactNode },
  State
> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown) {
    if (isChunkLoadError(error)) {
      try {
        const already = sessionStorage.getItem(RELOAD_FLAG);
        if (!already) {
          sessionStorage.setItem(RELOAD_FLAG, "1");
          // Mic delay ca React să termine commit-ul current
          setTimeout(() => window.location.reload(), 50);
          return;
        }
      } catch {
        // sessionStorage indisponibil → încearcă reload oricum, o singură dată per session
        window.location.reload();
        return;
      }
    }
    // eslint-disable-next-line no-console
    console.error("ChunkErrorBoundary caught:", error);
  }

  componentDidMount() {
    // Dacă userul a navigat cu succes după reload, resetăm flag-ul.
    try {
      sessionStorage.removeItem(RELOAD_FLAG);
    } catch {}
  }

  render() {
    if (this.state.hasError) {
      if (isChunkLoadError(this.state.error)) {
        // Reîncărcăm — afișează nimic în timpul tranziției
        return null;
      }
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-xl font-semibold mb-2">A apărut o eroare.</h1>
          <p className="text-sm text-zinc-500 mb-4">
            Reîmprospătează pagina sau încearcă din nou peste câteva momente.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-zinc-900 text-white text-xs uppercase tracking-widest"
          >
            Reîncarcă
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
