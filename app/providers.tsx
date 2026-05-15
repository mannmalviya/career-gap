"use client";

import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <ToasterWithTheme />
    </ThemeProvider>
  );
}

function ToasterWithTheme() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton={false}
      theme={resolvedTheme === "dark" ? "dark" : "light"}
    />
  );
}
