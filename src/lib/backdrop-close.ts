import { useRef, type MouseEvent } from "react";

// A dialog should close on a click that starts and ends on the backdrop. Plain
// onClick also fires when a text selection drag starts inside the panel and the
// mouse is released outside it, which closed the dialog mid-selection.
export function useBackdropClose(close: () => void) {
  const pressedOnBackdrop = useRef(false);

  return {
    onMouseDown(event: MouseEvent<HTMLDialogElement>) {
      pressedOnBackdrop.current = event.target === event.currentTarget;
    },
    onClick(event: MouseEvent<HTMLDialogElement>) {
      const clean = pressedOnBackdrop.current && event.target === event.currentTarget;
      pressedOnBackdrop.current = false;
      if (clean) close();
    },
  };
}
