"use client"

import { useState } from "react";
import { Header } from "@/components/manager/header";
import OrdersGrid from "@/components/manager/orders-grid";
import { PickedUpOrdersSheet } from "@/components/manager/picked-up-orders-sheet";

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
                        <PickedUpOrdersSheet
                            pickedUpOrders={pickedUpOrders}
                            setReadyOrders={setReadyOrders}
                            setPickedUpOrders={setPickedUpOrders}
                        />
                    </OrdersGrid>
                </div>
            </main>
        </>
    )
}


