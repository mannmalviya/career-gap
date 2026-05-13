import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="border-b border-foreground/10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/app" className="font-semibold tracking-tight">
            Career-Gap
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>
      <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        {children}
      </div>
    </div>
  );
}
