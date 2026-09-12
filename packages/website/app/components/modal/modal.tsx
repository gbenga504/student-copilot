import classNames from "classnames";
import { X } from "lucide-react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "~/components/button/button";

import "./modal.scss";

type ModalProps = {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  showCloseButton?: boolean;
  title: string;
};

export function Modal({
  open,
  onClose,
  children,
  showCloseButton = true,
  title,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const closeModal = useEffectEvent(() => onClose?.());

  useEffect(function trackMount() {
    setIsMounted(true);
  }, []);

  useEffect(
    function manageModal() {
      if (!open || !isMounted) {
        return;
      }

      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      const modal = modalRef.current;
      const focusableElement = modal?.querySelector<HTMLElement>(
        'input, button, [href], [tabindex]:not([tabindex="-1"])'
      );

      focusableElement?.focus();
      document.body.style.overflow = "hidden";

      function handleKeyDown(event: KeyboardEvent) {
        if (event.key === "Escape") {
          closeModal();
        }
      }

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
        previouslyFocusedElement.current?.focus();
      };
    },
    [isMounted, open]
  );

  if (!open || !isMounted) {
    return null;
  }

  return createPortal(
    <div
      className="modal-root"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        ref={modalRef}
        aria-labelledby="modal-title"
        aria-modal="true"
        className={classNames("modal-container", {
          "modal-container-open": open,
        })}
        role="dialog"
      >
        {showCloseButton && onClose && (
          <Button
            element="button"
            type="button"
            variant="text"
            colorTheme="gray"
            shape="circle"
            size="small"
            className="modal-close-button"
            aria-label="Close"
            onClick={onClose}
          >
            <X size={18} />
          </Button>
        )}

        <h2 id="modal-title" className="modal-title">
          {title}
        </h2>
        {children}
      </div>
    </div>,
    document.body
  );
}
