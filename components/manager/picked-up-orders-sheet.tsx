"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import OrdersGrid from "@/components/manager/orders-grid";

interface PickedUpOrdersSheetProps {
    pickedUpOrders: Order[];
    setReadyOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    setPickedUpOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

export function PickedUpOrdersSheet({ pickedUpOrders, setReadyOrders, setPickedUpOrders }: PickedUpOrdersSheetProps) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">Ordini ritirati</Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle className="text-2xl font-bold">Ordini ritirati</SheetTitle>
                    <SheetDescription>Elenco degli ordini già ritirati dai clienti</SheetDescription>
                </SheetHeader>
                <OrdersGrid
                    status="PICKED_UP"
                    className="rounded-none bg-background shadow-none outline-0"
                    orders={pickedUpOrders}
                    prevSetter={setReadyOrders}
                    actualSetter={setPickedUpOrders}
                />
            </SheetContent>
        </Sheet>
    );
}
