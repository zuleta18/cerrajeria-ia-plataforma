import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
            <span className="text-red-500 text-3xl">!</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Algo salió mal</h2>
          <p className="text-zinc-400 mb-8 max-w-md">
            Ha ocurrido un error inesperado. Por favor, intenta de nuevo o regresa al inicio.
          </p>
          {this.state.error && (
            <div className="bg-zinc-900 p-4 rounded-xl text-left w-full max-w-md mb-8 overflow-auto border border-zinc-800">
              <p className="text-red-400 font-mono text-xs break-words">
                {this.state.error.message}
              </p>
            </div>
          )}
          <button
            onClick={() => {
              window.location.href = '/';
            }}
            className="bg-[#D4AF37] hover:bg-[#b5952f] text-black font-bold py-3 px-8 rounded-xl transition-all"
          >
            Volver al inicio
          </button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
