"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { logout as logoutAction } from "@/actions/auth";
import { toast } from "sonner";

export function LogoutButton() {
    const handleLogout = async () => {
        try {
            // Call backend logout to revoke refresh token
            await logoutAction();

            // Then sign out from NextAuth
            await signOut({ redirect: true, callbackUrl: "/" });

            toast.success("Logout effettuato con successo");
        } catch (error) {
            console.error("Logout error:", error);
            // Still try to sign out even if backend logout fails
            await signOut({ redirect: true, callbackUrl: "/" });
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
        >
            <LogOut className="h-4 w-4" />
            Logout
        </Button>
    );
}
