import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import "./modal.css";

interface ModalProps {
  title: ReactNode;
  subtitle?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}

/** Fenêtre de détail : fermeture par Échap, clic sur le fond ou bouton. */
export function Modal({ title, subtitle, onClose, children }: ModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return createPortal(
    <div className="md-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="md-panel" role="dialog" aria-modal="true">
        <header className="md-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button ref={closeRef} className="md-close" onClick={onClose} aria-label="Fermer">
            <X size={18} />
          </button>
        </header>
        <div className="md-body scrollbar-thin">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
