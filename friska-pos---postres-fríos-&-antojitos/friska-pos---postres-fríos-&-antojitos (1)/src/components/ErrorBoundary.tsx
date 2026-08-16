import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  moduleName?: string;
  onReset?: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled Error captured by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public override render() {
    if (this.state.hasError) {
      const moduleTitle = this.props.moduleName || 'este módulo';

      return (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 min-h-[400px]">
          <div className="bg-white border border-slate-200 shadow-xl rounded-2xl p-6 sm:p-8 max-w-lg w-full text-center animate-in fade-in zoom-in-95 duration-200">
            {/* Warning Icon Badge */}
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4 text-rose-600 shadow-xs">
              <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
            </div>

            {/* Error Header */}
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
              Ocurrió un problema en {moduleTitle}
            </h2>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              La vista experimentó un error inesperado de renderizado. Los datos de tus turnos y ventas anteriores se encuentran protegidos en el almacenamiento local.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <button
                type="button"
                id="error-boundary-retry-btn"
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reintentar Módulo</span>
              </button>

              <button
                type="button"
                id="error-boundary-reload-btn"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer border border-slate-300"
              >
                <Home className="w-4 h-4" />
                <span>Recargar Aplicación</span>
              </button>
            </div>

            {/* Error Detail Accordion */}
            {this.state.error && (
              <div className="border-t border-slate-100 pt-4 text-left">
                <button
                  type="button"
                  onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                  className="flex items-center justify-between w-full text-xs font-semibold text-slate-500 hover:text-slate-700 py-1 transition cursor-pointer"
                >
                  <span>Detalles técnicos del error</span>
                  {this.state.showDetails ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {this.state.showDetails && (
                  <div className="mt-2 p-3 bg-slate-900 text-rose-300 text-xs font-mono rounded-xl overflow-x-auto max-h-48 whitespace-pre-wrap select-all">
                    <p className="font-bold text-rose-400 mb-1">{this.state.error.name}: {this.state.error.message}</p>
                    {this.state.errorInfo?.componentStack}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
