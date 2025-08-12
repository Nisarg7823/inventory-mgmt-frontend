"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiGetProfile } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function UserMenu() {
  const { token, user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGetProfile(token ?? undefined);
        setProfile(data);
      } catch {
        // ignore; fall back to user from auth
      }
    })();
  }, [token]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const displayName = useMemo(() => {
    const src: any = profile ?? user ?? {};
    return src.name || src.username || src.email || "User";
  }, [profile, user]);

  const initials = useMemo(() => {
    const name: string = displayName || "User";
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "U";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  }, [displayName]);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="secondary"
        className="h-9 w-9 p-0 rounded-full"
        onClick={() => setOpen((v) => !v)}
        aria-label="User menu"
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--accent)] text-[color:var(--accent-foreground)] text-xs font-semibold">
          {initials}
        </span>
      </Button>
      {open ? (
        <div className="absolute right-0 mt-2 w-64 z-50">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[color:var(--muted)] grid place-items-center text-xs font-semibold">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{displayName}</p>
                  {profile?.email ? (
                    <p className="text-xs text-[color:var(--muted-foreground)] truncate">{String(profile.email)}</p>
                  ) : null}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => router.push("/users")}
                >
                  Manage users
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    logout();
                    router.replace("/login");
                  }}
                >
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}


