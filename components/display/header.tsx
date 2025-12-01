import { UtensilsCrossed } from "lucide-react"

export function Header() {
    return (
        <header className="border-b fixed top-0 z-10 flex h-16 w-full items-center justify-between bg-primary px-4 shadow-sm">
            <div className="flex items-center gap-3">
                <img
                    src="/logo.svg"
                    alt="Logo"
                    className="mx-auto h-10 w-auto bg-white rounded select-none"
                />
                <h1 className="text-2xl text-black font-bold select-none">Ordini pronti - </h1>
            </div>
        </header>
    )
}