"use client";

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  type ReactNode,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";

// ============ Context ============

interface ModalContextValue {
  onClose: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("Modal 컴포넌트는 Modal.Root 내부에서 사용해야 합니다.");
  }
  return context;
}

// ============ Root ============

interface RootProps {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
}

function Root({ children, open, onClose }: RootProps) {
  // ESC 키로 닫기
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <ModalContext.Provider value={{ onClose }}>
      {typeof window !== "undefined"
        ? createPortal(children, document.body)
        : null}
    </ModalContext.Provider>
  );
}

// ============ Overlay ============

interface OverlayProps {
  children: ReactNode;
  closeOnClick?: boolean;
  className?: string;
}

function Overlay({ children, closeOnClick = true, className = "" }: OverlayProps) {
  const { onClose } = useModalContext();

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (closeOnClick && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnClick, onClose]
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm ${className}`}
      onClick={handleClick}
    >
      {children}
    </div>
  );
}

// ============ Content ============

interface ContentProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-4xl",
};

function Content({ children, className = "", size = "md" }: ContentProps) {
  return (
    <div
      className={`bg-gray-800 rounded-lg shadow-xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col ${sizeClasses[size]} ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

// ============ Header ============

interface HeaderProps {
  children: ReactNode;
  className?: string;
  showClose?: boolean;
}

function Header({ children, className = "", showClose = true }: HeaderProps) {
  const { onClose } = useModalContext();

  return (
    <div
      className={`flex items-center justify-between p-4 border-b border-gray-700 ${className}`}
    >
      <h2 className="text-lg font-semibold text-white">{children}</h2>
      {showClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-1"
          aria-label="닫기"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

// ============ Body ============

interface BodyProps {
  children: ReactNode;
  className?: string;
}

function Body({ children, className = "" }: BodyProps) {
  return (
    <div className={`p-4 overflow-y-auto flex-1 ${className}`}>{children}</div>
  );
}

// ============ Footer ============

interface FooterProps {
  children: ReactNode;
  className?: string;
}

function Footer({ children, className = "" }: FooterProps) {
  return (
    <div
      className={`flex items-center justify-end gap-2 p-4 border-t border-gray-700 ${className}`}
    >
      {children}
    </div>
  );
}

// ============ Export ============

export const Modal = {
  Root,
  Overlay,
  Content,
  Header,
  Body,
  Footer,
};
