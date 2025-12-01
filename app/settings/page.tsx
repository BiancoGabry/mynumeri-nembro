"use client";

import { SettingsHeader } from "@/components/settings/header";
import { AppearanceSettingsCard } from "@/components/settings/AppearanceSettingsCard";
import { AboutSettingsCard } from "@/components/settings/AboutSettingsCard";
import { useTheme } from "next-themes";
import { GeneralSettingsCard } from "@/components/settings/GeneralSettingsCard";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();

    return (
        <>
            <SettingsHeader />
            <main className="min-h-screen w-full bg-background">
                <div className="max-w-4xl mx-auto p-6 pt-24 space-y-6">
                    <GeneralSettingsCard />
                    <AppearanceSettingsCard
                        theme={theme}
                        setTheme={setTheme}
                    />
                    <AboutSettingsCard />
                </div>
            </main>
        </>
    );
}
