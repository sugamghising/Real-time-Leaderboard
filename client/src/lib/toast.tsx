import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { UI } from "../config/constants";

type ToastType = "info" | "success" | "error";

interface Toast {
  id: string;
  message: string;
  type?: ToastType;
}

interface ToastContextValue {
  addToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration?: number) => {
      const id = String(Date.now()) + Math.random().toString(36).slice(2, 8);
      const toast: Toast = { id, message, type };
      setToasts((s) => [toast, ...s]);
      const ttl = duration ?? UI.TOAST_DURATION;
      setTimeout(() => {
        setToasts((s) => s.filter((t) => t.id !== id));
      }, ttl);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`max-w-sm w-full px-4 py-2 rounded shadow-md text-white flex items-center justify-between space-x-3 ${
              t.type === "success"
                ? "bg-green-600"
                : t.type === "error"
                ? "bg-red-600"
                : "bg-gray-800"
            }`}
          >
            <div className="flex-1 text-sm">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
};

export default ToastProvider;
