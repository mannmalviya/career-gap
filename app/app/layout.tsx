import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { HeaderNav } from "@/components/header-nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="border-b border-foreground/10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/app" className="font-serif text-xl tracking-tight">
            Career-Gap
          </Link>
          <div className="flex items-center gap-5">
            <HeaderNav />
            <UserButton />
          </div>
        </div>
      </header>
      <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        {children}
      </div>
    </div>
  );
}
