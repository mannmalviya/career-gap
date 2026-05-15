"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/profile", label: "Profile" },
];

export function HeaderNav() {
  const pathname = usePathname();

  return (
    <>
      {links.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={
              active
                ? "text-sm font-medium text-foreground"
                : "text-sm text-foreground/70 hover:text-foreground"
            }
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}
