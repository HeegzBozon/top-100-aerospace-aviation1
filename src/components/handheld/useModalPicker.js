import { useEffect, useRef } from "react";
import { registerPicker } from "@/components/handheld/handheldPicker";

const getStage = () => document.querySelector("[data-handheld-screen]");

// A sheet laid over the glass takes the hardware while it is up.
//
// A modal is drawn over a surface, but that surface's own picker is still registered
// underneath it — so without this the ring goes on walking the keys behind the sheet and
// the confirm key opens one of them. A modal picker outranks whatever is registered after
// it: a turn spends itself reading the sheet down, and the way back closes it, which is
// the one thing a sheet standing over a Fellow's work must answer for itself.
//
// The confirm key is the caller's to name. A sheet that is a read — a briefing, an
// orientation — closes on it. A sheet carrying fields does not: a form is typed into, and
// the press is taken rather than spent on cancelling the work halfway through.
export default function useModalPicker({ open = true, onClose, bodyRef, confirm = true }) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const confirmRef = useRef(confirm);
  confirmRef.current = confirm;
  const body = useRef(bodyRef);
  body.current = bodyRef;

  const api = useRef(null);
  if (!api.current) {
    const scroll = (step) => {
      const node = body.current?.current;
      const target = node || getStage();
      target?.scrollBy({ top: step * 60, behavior: "smooth" });
      return true;
    };

    api.current = {
      modal: true,
      labels: () => [],
      index: () => 0,
      step: scroll,
      // The ring's back and forward zones have nothing of their own in a sheet: they
      // read it, and name it, rather than leaving the surface underneath.
      page: (direction) => {
        scroll(direction * 2);
        return "Reading";
      },
      goTo: () => null,
      enter: () => {
        if (confirmRef.current) closeRef.current?.();
        return true;
      },
      back: () => {
        closeRef.current?.();
        return true;
      },
    };
  }

  useEffect(() => {
    if (!open) return undefined;
    return registerPicker(api.current);
  }, [open]);
}