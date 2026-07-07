"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Package,
  ShoppingCart,
  FileText,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Warehouse,
  BarChart3,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuGroups = [
  {
    title: "Main",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Master Data",
    items: [
      { href: "/suppliers", label: "Suppliers", icon: Users, subtitle: "Maintain Suppliers" },
      { href: "/sellers", label: "Sellers", icon: UserCheck, subtitle: "Maintain Sellers" },
      { href: "/products", label: "Products", icon: Package, subtitle: "Maintain Products" },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/orders", label: "Orders", icon: ShoppingCart, subtitle: "Order Information" },
      {
        label: "Invoices",
        icon: FileText,
        subtitle: "Invoicing",
        children: [
          { href: "/invoices", label: "Invoice List" },
          { href: "/invoices/generate/for-seller", label: "For Seller" },
          { href: "/invoices/generate/order-letter", label: "Order Letter" },
          { href: "/invoices/generate/for-supplier", label: "For Supplier" },
          { href: "/invoices/bulk-print", label: "Bulk Print" },
        ],
      },
    ],
  },
  {
    title: "Reports",
    items: [
      { href: "/stock", label: "Stock History", icon: History },
      { href: "/reports", label: "Reports", icon: BarChart3 },
    ],
  },
] as const;

export default function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Invoices"]);

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) => (prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]));
  };

  return (
    <aside className={cn("fixed left-0 top-0 z-40 h-full bg-slate-900 text-white transition-all duration-300", collapsed ? "w-16" : "w-64")}>
      <div className="flex h-16 items-center justify-between border-b border-slate-700 px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Warehouse className="h-7 w-7 text-blue-400" />
            <span className="text-xl font-bold text-white">Hoodwood</span>
          </div>
        )}
        {collapsed && <Warehouse className="mx-auto h-7 w-7 text-blue-400" />}
        <button onClick={onToggle} className={cn("text-slate-400 transition-colors hover:text-white", collapsed && "mx-auto")}>
          {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {menuGroups.map((group) => (
          <div key={group.title} className="mb-4">
            {!collapsed && <p className="mb-1 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{group.title}</p>}
            {group.items.map((item) => {
              if ("children" in item && item.children) {
                const isExpanded = expandedItems.includes(item.label);
                const isActive = item.children.some((child) => pathname.startsWith(child.href));
                return (
                  <div key={item.label}>
                    <button
                      onClick={() => toggleExpanded(item.label)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                        isActive ? "bg-slate-800 text-blue-400" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      )}
                    >
                      <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-blue-400")} />
                      {!collapsed && (
                        <>
                          <div className="flex-1 text-left">
                            <span>{item.label}</span>
                            {"subtitle" in item && item.subtitle ? <p className="text-xs text-slate-500">{item.subtitle}</p> : null}
                          </div>
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </>
                      )}
                    </button>
                    {!collapsed && isExpanded && (
                      <div className="ml-4 border-l border-slate-700 pl-4">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "block rounded-md px-4 py-2 text-sm transition-colors",
                              pathname === child.href ? "bg-slate-800 text-blue-400" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              if (!("href" in item)) return null;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                    isActive ? "border-r-2 border-blue-400 bg-slate-800 text-blue-400" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-blue-400")} />
                  {!collapsed && (
                    <div>
                      <span>{item.label}</span>
                      {"subtitle" in item && item.subtitle ? <p className="text-xs text-slate-500">{item.subtitle}</p> : null}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
