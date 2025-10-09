"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "@/components/UserMenu";

function NavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const base = "px-3 py-2 rounded-[var(--radius)] text-sm";
  const active = "bg-[color:var(--accent)] text-[color:var(--accent-foreground)]";
  const inactive = "border border-[color:var(--border)] hover:bg-[color:var(--muted)]/60";
  return (
    <Link href={href} className={`${base} ${isActive ? active : inactive}`}>
      {label}
    </Link>
  );
}

export default function Navbar() {
  const router = useRouter();
  const { isAuthenticated, logout, isAdmin } = useAuth();

  return (
    <header className="w-full border-b border-[color:var(--border)] sticky top-0 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--surface)]/80">
      <div className="max-w-5xl mx-auto w-full px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link href="/home" className="font-semibold text-sm rounded-[var(--radius)] px-2 py-1 hover:bg-[color:var(--muted)]/60">Inventory</Link>
          <nav className="hidden sm:flex items-center gap-2 ml-2">
            <NavItem href="/home" label="Home" />
            <NavItem href="/products" label="Products" />
            <NavItem href="/orders" label="Orders" />
            <NavItem href="/inventory" label="Inventory" />
            <NavItem href="/customers" label="Customers" />
            <NavItem href="/suppliers" label="Suppliers" />
            <NavItem href="/warehouse" label="Warehouse" />
            <NavItem href="/users" label="Users" />
            <NavItem href="/notifications" label="Notifications" />
            <NavItem href="/reports" label="Reports" />
            {isAdmin && <NavItem href="/admin" label="Admin" />}
          </nav>
        </div>
        <div className="flex items-center gap-2">{isAuthenticated ? <UserMenu /> : null}</div>
      </div>
    </header>
  );
}


