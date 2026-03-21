"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import { toast } from "sonner";

export type DisplayMode = "ready" | "preparing" | "hybrid";

const MODES: { value: DisplayMode; label: string; description: string }[] = [
    {
        value: "ready",
        label: "Solo pronti",
        description: "Mostra solo gli ordini pronti per il ritiro",
    },
    {
        value: "preparing",
        label: "Solo in preparazione",
        description: "Mostra solo gli ordini attualmente in preparazione",
    },
    {
        value: "hybrid",
        label: "Vista ibrida",
        description: "¾ della pagina per gli ordini in preparazione e ¼ per gli ordini pronti",
    },
];

export const DISPLAY_MODE_KEY = "display-mode";

export function DisplayModeSettingsCard() {
    const [mode, setMode] = useState<DisplayMode>("ready");
    const [savedMode, setSavedMode] = useState<DisplayMode>("ready");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetch("/api/display-config")
            .then((res) => res.ok ? res.json() : null)
            .then((cfg) => {
                const m = cfg?.displayMode as DisplayMode | undefined;
                if (m && ["ready", "preparing", "hybrid"].includes(m)) {
                    setMode(m);
                    setSavedMode(m);
                    localStorage.setItem(DISPLAY_MODE_KEY, m);
                } else {
                    const stored = localStorage.getItem(DISPLAY_MODE_KEY) as DisplayMode | null;
                    if (stored && ["ready", "preparing", "hybrid"].includes(stored)) {
                        setMode(stored);
                        setSavedMode(stored);
                    }
                }
            })
            .catch(() => {
                const stored = localStorage.getItem(DISPLAY_MODE_KEY) as DisplayMode | null;
                if (stored && ["ready", "preparing", "hybrid"].includes(stored)) {
                    setMode(stored);
                    setSavedMode(stored);
                }
            })
            .finally(() => setIsLoading(false));
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await fetch("/api/display-config", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ displayMode: mode }),
            });
            setSavedMode(mode);
            localStorage.setItem(DISPLAY_MODE_KEY, mode);
            toast.success("Modalità display salvata");
        } catch {
            toast.error("Errore durante il salvataggio");
        } finally {
            setIsSaving(false);
        }
    };

    const hasChanges = mode !== savedMode;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2 select-none">
                    <Monitor className="h-5 w-5 text-amber-600" />
                    <CardTitle>Display</CardTitle>
                </div>
                <CardDescription className="select-none">
                    Modifica la pagina del display
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Label htmlFor="event-name">Modalità operativa</Label>
                <div className="text-sm text-muted-foreground select-none mb-2">
                    Seleziona cosa mostrare nella pagina display pubblica
                </div>
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Skeleton className="h-20 rounded-xl" />
                        <Skeleton className="h-20 rounded-xl" />
                        <Skeleton className="h-20 rounded-xl" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {MODES.map(({ value, label, description }) => (
                            <button
                                key={value}
                                onClick={() => setMode(value)}
                                className={cn(
                                    "flex flex-col gap-1.5 rounded-xl border-2 p-4 text-left transition-all cursor-pointer",
                                    mode === value
                                        ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30"
                                        : "border-border hover:border-amber-300 hover:bg-muted/50"
                                )}
                            >
                                <span
                                    className={cn(
                                        "font-semibold text-sm",
                                        mode === value ? "text-amber-700 dark:text-amber-400" : ""
                                    )}
                                >
                                    {label}
                                </span>
                                <span className="text-xs text-muted-foreground leading-snug">
                                    {description}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
                <div className="flex justify-end mt-4">
                    <Button onClick={handleSave} disabled={!hasChanges || isSaving || isLoading}>
                        {isSaving ? "Salvataggio..." : "Salva"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
