"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import type React from "react";

export type LogoutButtonProps = React.ComponentProps<typeof Button>;

export function LogoutButton({ children = "Logout", ...props }: LogoutButtonProps) {
  const handleLogout = () => signOut({ redirectTo: "/login", callbackUrl: "/login" } as any);

  return (
    <Button type="button" onClick={handleLogout} {...props}>
      {children}
    </Button>
  );
}
