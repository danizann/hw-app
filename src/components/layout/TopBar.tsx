"use client";

import { signOut, useSession } from "next-auth/react";
import { Bell, Search, Sun, Moon, LogOut, User } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function TopBar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  const notifications = [
    { id: 1, title: "Invoice baru", description: "INV-2026-071 baru dibuat", time: "2m", read: false },
    { id: 2, title: "Stok menipis", description: "Kabel NYM 2x1.5 tinggal 8 pcs", time: "15m", read: false },
    { id: 3, title: "Order diproses", description: "Order #ORD-1182 sedang dipacking", time: "1h", read: true },
  ];
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b bg-background px-6">
      <div className="max-w-md flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}> 
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="relative">
              <Button variant="ghost" size="icon" aria-label="Buka notifikasi">
                <Bell className="h-5 w-5" />
              </Button>
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                  {unreadCount}
                </span>
              ) : null}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifikasi Masuk</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="items-start gap-3 py-3">
                <span
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notification.read ? "bg-muted" : "bg-red-500"}`}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{notification.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{notification.description}</p>
                </div>
                <span className="text-xs text-muted-foreground">{notification.time}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-600 text-sm text-white">{session?.user?.name?.charAt(0) ?? "U"}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium">{session?.user?.name ?? "User"}</p>
                <p className="text-xs text-muted-foreground">{session?.user?.role ?? "STAFF"}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
