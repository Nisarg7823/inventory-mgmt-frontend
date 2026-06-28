"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const NAV_ITEMS = [
  { href: "/home", label: "Home", icon: "🏠" },
  { href: "/products", label: "Products", icon: "📦" },
  { href: "/orders", label: "Orders", icon: "🛒" },
  { href: "/inventory", label: "Inventory", icon: "🗂️" },
  { href: "/customers", label: "Customers", icon: "👥" },
  { href: "/suppliers", label: "Suppliers", icon: "🏭" },
  { href: "/warehouse", label: "Warehouse", icon: "🏢" },
  { href: "/users", label: "Users", icon: "👤" },
  { href: "/notifications", label: "Notifications", icon: "🔔" },
  { href: "/reports", label: "Reports", icon: "📊" },
];

const ADMIN_ITEM = { href: "/admin", label: "Admin", icon: "⚙️" };

function NavItem({ href, label, icon }: { href: string; label: string; icon: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={[
        "sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 whitespace-nowrap",
        isActive
          ? "bg-[color:var(--accent)] text-[color:var(--accent-foreground)]"
          : "text-[color:var(--muted-foreground)] hover:bg-[color:var(--muted)] hover:text-[color:var(--foreground)]",
      ].join(" ")}
    >
      <span className="sidebar-icon text-base shrink-0 w-5 text-center leading-none">{icon}</span>
      <span className="sidebar-label">{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const { isAdmin } = useAuth();
  const items = isAdmin ? [...NAV_ITEMS, ADMIN_ITEM] : NAV_ITEMS;

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">I</div>
        <span className="sidebar-label sidebar-brand-text">Inventory</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>
    </aside>
  );
}
