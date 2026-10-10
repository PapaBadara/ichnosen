import { useEffect, useRef, useState, type PointerEvent, type WheelEvent } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, X } from "lucide-react";
import "./imageviewer.css";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 8;
const STEP = 1.4;

interface ImageViewerProps {
  src: string;
  alt: string;
  caption?: string;
  onClose: () => void;
}

/** Visionneuse plein écran : zoom (molette, boutons, +/-, double-clic) et déplacement à la souris ou au doigt. */
export function ImageViewer({ src, alt, caption, onClose }: ImageViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  function zoomTo(next: number) {
    const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    setZoom(z);
    if (z <= 1) setPan({ x: 0, y: 0 });
  }

  function reset() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  useEffect(() => {
    // Phase de capture : Échap ferme la visionneuse sans fermer la fenêtre de détail en dessous.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      } else if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(MAX_ZOOM, z * STEP));
      else if (e.key === "-") setZoom((z) => Math.max(MIN_ZOOM, z / STEP));
      else if (e.key === "0") {
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  function onWheel(e: WheelEvent) {
    zoomTo(zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15));
  }

  function onPointerDown(e: PointerEvent) {
    if (zoom <= 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    setDragging(true);
  }

  function onPointerMove(e: PointerEvent) {
    const d = drag.current;
    if (!d) return;
    setPan({ x: d.px + (e.clientX - d.x), y: d.py + (e.clientY - d.y) });
  }

  function endDrag() {
    drag.current = null;
    setDragging(false);
  }

  return createPortal(
    <div className="iv" role="dialog" aria-modal="true" aria-label={alt}>
      <div className="iv-bar">
        <p className="iv-caption">{caption ?? alt}</p>
        <div className="iv-controls">
          <button onClick={() => zoomTo(zoom / STEP)} disabled={zoom <= MIN_ZOOM} aria-label="Dézoomer">
            <Minus size={16} />
          </button>
          <button className="iv-level" onClick={reset} title="Taille d'origine">
            {Math.round(zoom * 100)} %
          </button>
          <button onClick={() => zoomTo(zoom * STEP)} disabled={zoom >= MAX_ZOOM} aria-label="Zoomer">
            <Plus size={16} />
          </button>
          <button onClick={onClose} aria-label="Fermer" className="iv-close">
            <X size={18} />
          </button>
        </div>
      </div>

      <div
        className={`iv-stage${zoom > 1 ? " is-zoomed" : ""}`}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={() => (zoom > 1 ? reset() : zoomTo(2.5))}
        onClick={(e) => e.target === e.currentTarget && zoom <= 1 && onClose()}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: dragging ? "none" : undefined,
          }}
        />
      </div>

      <p className="iv-hint">Molette ou boutons pour zoomer, glisser pour déplacer, double-clic pour basculer.</p>
    </div>,
    document.body,
  );
}
