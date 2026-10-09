import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Captura errores de renderizado para que una vista rota no tumbe la app. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Error de renderizado:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="grid min-h-[50vh] place-items-center p-6">
        <div className="card max-w-md text-center">
          <h2 className="font-sans text-lg font-semibold text-neutral-900">
            Algo salió mal al mostrar esta vista
          </h2>
          <p className="mt-2 text-sm text-neutral-500">{this.state.error.message}</p>
          <button
            type="button"
            className="btn-secondary mt-5"
            onClick={() => this.setState({ error: null })}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }
}
