"use client"

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";
import { FileText, Settings, Monitor, LogOut, Undo2, CheckCircle } from "lucide-react";
import Head from "next/head";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Header } from "@/app/manager/_components/header";
import { set } from "zod";
import OrdersGrid from "@/components/ui/orders-grid";

export default function Manager() {
    const [confirmedOrders, setConfirmedOrders] = useState<Order[]>([{ id: '1', ticketNumber: 123, displayCode: 'A1' }]);
    const [readyOrders, setReadyOrders] = useState<Order[]>([]);
    const [pickedUpOrders, setPickedUpOrders] = useState<Order[]>([]);


    return (
        <>
            <Header />
            <main className="h-screen w-full">
                <div className="h-full w-full grid grid-cols-3 gap-4 p-3 pt-20">
                    <OrdersGrid
                        status="CONFIRMED"
                        className="col-span-2"
                        orders={confirmedOrders}
                        title="Ordini in preparazione"
                        actualSetter={setConfirmedOrders}
                        nextSetter={setReadyOrders} />
                    <OrdersGrid
                        status="COMPLETED"
                        className="col-span-1"
                        orders={readyOrders}
                        title="Ordini pronti"
                        prevSetter={setConfirmedOrders}
                        actualSetter={setReadyOrders}
                        nextSetter={setPickedUpOrders}
                    >
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
                                    className="rounded-none shadow-none outline-0"
                                    orders={pickedUpOrders}
                                    prevSetter={setReadyOrders}
                                    actualSetter={setPickedUpOrders}
                                ></OrdersGrid>
                            </SheetContent>
                        </Sheet>
                    </OrdersGrid>
                </div>
            </main>
        </>
    )
}


