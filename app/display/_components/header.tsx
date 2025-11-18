import { UtensilsCrossed } from "lucide-react"

export function Header() {
    return (
        <header className="border-b fixed top-0 z-10 flex h-16 w-full items-center justify-between bg-primary px-4 shadow-sm">
            <div className="w-full flex items-center gap-2 px-4 py-4 text=bold text-black">
                <UtensilsCrossed className="h-8 w-8" />
                <h1 className="text-2xl font-bold">MyNumeri - Display</h1>
            </div>
        </header>
    )
}