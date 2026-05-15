"use client";

import { useTransition } from "react";
import { toast } from "sonner";

type Props = {
  action: (formData: FormData) => Promise<void>;
  successMessage: string;
  className?: string;
  children: React.ReactNode;
};

export function ToastForm({
  action,
  successMessage,
  className,
  children,
}: Props) {
  const [, startTransition] = useTransition();

  return (
    <form
      className={className}
      action={(formData) => {
        startTransition(async () => {
          try {
            await action(formData);
            toast.success(successMessage);
          } catch (e) {
            toast.error(
              e instanceof Error ? e.message : "Something went wrong.",
            );
          }
        });
      }}
    >
      {children}
    </form>
  );
}
