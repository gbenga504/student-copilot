import classNames from "classnames";
import { Ellipsis, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";

import { Button } from "~/components/button/button";
import { Modal } from "~/components/modal/modal";

type NoteActionsProps = {
  noteId: string;
  noteTitle: string;
};

export function NoteActions({ noteId, noteTitle }: NoteActionsProps) {
  const fetcher = useFetcher();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const isDeleting = fetcher.state !== "idle";

  useEffect(function closeMenuOnOutsideClick() {
    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const openConfirmation = () => {
    setIsMenuOpen(false);
    setIsConfirmationOpen(true);
  };

  const renderMenu = () => {
    if (!isMenuOpen) {
      return null;
    }

    return (
      <div className="absolute right-0 top-full z-10 mt-1 min-w-32 rounded-lg border border-app-gray-150 bg-app-gray-300 p-1 shadow-lg">
        <Button
          element="button"
          type="button"
          variant="text"
          colorTheme="gray"
          size="small"
          className="w-full justify-start text-red-400 hover:bg-app-gray-150"
          onClick={openConfirmation}
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      </div>
    );
  };

  const renderConfirmation = () => {
    return (
      <Modal
        open={isConfirmationOpen}
        title="Delete note?"
        onClose={() => setIsConfirmationOpen(false)}
      >
        <p className="text-sm">
          “{noteTitle}” will be permanently deleted. This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            element="button"
            type="button"
            variant="text"
            colorTheme="gray"
            onClick={() => setIsConfirmationOpen(false)}
          >
            Cancel
          </Button>
          <fetcher.Form method="post">
            <input type="hidden" name="intent" value="delete" />
            <input type="hidden" name="noteId" value={noteId} />
            <Button
              element="button"
              type="submit"
              variant="contained"
              colorTheme="gray"
              loading={isDeleting}
              loadingText="Deleting"
              className="bg-red-600 text-white"
            >
              Delete
            </Button>
          </fetcher.Form>
        </div>
      </Modal>
    );
  };

  return (
    <div
      ref={menuRef}
      className={classNames(
        "absolute top-1/2 right-2 z-10 -translate-y-1/2 opacity-0",
        "pointer-events-none transition-opacity",
        "group-hover:pointer-events-auto group-hover:opacity-100",
        "group-focus-within:pointer-events-auto group-focus-within:opacity-100"
      )}
    >
      <Button
        element="button"
        type="button"
        variant="text"
        colorTheme="gray"
        shape="circle"
        size="small"
        className="bg-app-gray-200"
        aria-label={`Actions for ${noteTitle}`}
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        <Ellipsis className="size-4" />
      </Button>
      {renderMenu()}
      {renderConfirmation()}
    </div>
  );
}
