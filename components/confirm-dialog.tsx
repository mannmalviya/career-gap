"use client";

import { useRef, type ReactNode } from "react";

type Props = {
  title: string;
  body: string;
  confirmLabel: string;
  triggerClassName?: string;
  triggerAriaLabel?: string;
  children: ReactNode;
};

export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  triggerClassName,
  triggerAriaLabel,
  children,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className={triggerClassName}
        aria-label={triggerAriaLabel}
      >
        {children}
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="m-auto bg-background text-foreground rounded-2xl border border-foreground/10 p-0 shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
      >
        <div
          className="p-6 flex flex-col gap-3 w-[min(92vw,420px)]"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="font-serif text-2xl tracking-tight">{title}</h3>
          <p className="text-sm text-foreground/70 leading-relaxed">{body}</p>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="rounded-full border border-foreground/15 px-4 h-9 text-sm font-medium hover:bg-foreground/5"
              autoFocus
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-red-500 text-white px-4 h-9 text-sm font-medium hover:opacity-90"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
