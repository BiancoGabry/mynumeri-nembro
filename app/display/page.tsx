"use client";

import { Header } from "@/app/display/_components/header";
import OrdersGrid from "@/components/ui/orders-grid";
import { useState } from "react";

export default function Display() {
    const [orders, setOrders] = useState<Order[]>([{ id: '1', ticketNumber: 123, displayCode: 'A1' }]);

    return (
        <>
            <Header />
            <main className="h-screen w-full bg-gray-100 flex items-center justify-center pt-20 px-5">
                <OrdersGrid
                    className="col-span-1"
                    orders={orders}
                    actualSetter={setOrders}
                />
            </main>
        </>
    )
}