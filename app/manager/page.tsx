"use client"

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { Header } from "@/components/manager/header";
import OrdersGrid from "@/components/manager/orders-grid";
import { PickedUpOrdersSheet } from "@/components/manager/picked-up-orders-sheet";

function getWorkdayBounds() {
    const now = new Date();
    const currentHour = now.getHours();

    const start = new Date(now);
    if (currentHour < 8) {
        // Before 8 AM, it belongs to the previous day's shift
        start.setDate(start.getDate() - 1);
    }
    start.setHours(8, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    end.setHours(7, 59, 59, 999);

    return {
        dateFrom: start.toISOString(),
        dateTo: end.toISOString()
    };
}

const sortByDate = (a: Order, b: Order) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : Date.now();
    return timeA - timeB;
};

export default function Manager() {
    const { data: session } = useSession();
    const [confirmedOrders, setConfirmedOrders] = useState<Order[]>([]);
    const [readyOrders, setReadyOrders] = useState<Order[]>([]);
    const [pickedUpOrders, setPickedUpOrders] = useState<Order[]>([]);

    useEffect(() => {
        if (session?.error === "RefreshAccessTokenError") {
            signOut({ callbackUrl: "/" });
        }
    }, [session]);

    const fetchOrders = useCallback(async () => {
        try {
            const { dateFrom, dateTo } = getWorkdayBounds();
            const dateParams = `&dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`;

            // Give Next.js enough time to mount before fetching
            // Fetch CONFIRMED
            const resConf = await fetch(`/api/orders?status=CONFIRMED&limit=100${dateParams}`);
            if (resConf.ok) {
                const json = await resConf.json();
                console.log("Confirmed Data:", json);
                const orders: Order[] = json.data || json.orders || json || [];
                setConfirmedOrders(Array.isArray(orders) ? orders.sort(sortByDate) : []);
            }

            // Fetch COMPLETED 
            const resComp = await fetch(`/api/orders?status=COMPLETED&limit=100${dateParams}`);
            if (resComp.ok) {
                const json = await resComp.json();
                console.log("Ready Data:", json)
                const orders: Order[] = json.data || json.orders || json || [];
                setReadyOrders(Array.isArray(orders) ? orders.sort(sortByDate) : []);
            }

            // Fetch PICKED_UP
            const resPick = await fetch(`/api/orders?status=PICKED_UP&limit=100${dateParams}`);
            if (resPick.ok) {
                const json = await resPick.json();
                console.log("Picked Data:", json)
                const orders: Order[] = json.data || json.orders || json || [];
                setPickedUpOrders(Array.isArray(orders) ? orders.sort(sortByDate) : []);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        }
    }, []);

    useEffect(() => {
        // Fetch initially when page loads
        fetchOrders();

        // Then setup SSE EventSource
        let isConnected = false;
        const eventSource = new EventSource('/api/events/display');

        eventSource.onopen = () => {
            console.log("SSE connected");
            isConnected = true;
            // Also fetch to sync state if we were disconnected
            fetchOrders();
        };

        const handleConfirmedOrder = (event: MessageEvent) => {
            try {
                const newOrder = JSON.parse(event.data);

                // Assign a createdAt if it doesn't have one, so sorting remains stable across renders
                if (!newOrder.createdAt) {
                    newOrder.createdAt = new Date().toISOString();
                }

                // Ensure we don't duplicate
                setConfirmedOrders(prev => {
                    if (prev.find(o => String(o.id) === String(newOrder.id))) return prev;
                    return [...prev, newOrder].sort(sortByDate);
                });
            } catch (err) {
                console.error("Error parsing confirmed-order event:", err);
            }
        };

        eventSource.addEventListener('confirmed-order', handleConfirmedOrder);
        // Fallback for standard message
        eventSource.onmessage = handleConfirmedOrder;

        eventSource.onerror = (error) => {
            console.error("SSE connection error:", error);
            // Auto reconnect via standard EventSource logic
        };

        return () => {
            eventSource.close();
        };
    }, [fetchOrders]); // ensure this doesn't run infinitely

    const updateOrderStatus = async (orderId: string, newStatus: Status) => {
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) {
                console.error("Failed to update status");
                fetchOrders();
            }
        } catch (error) {
            console.error(error);
            fetchOrders();
        }
    };

    const handleConfirmToComplete = (order: Order) => {
        setConfirmedOrders(prev => prev.filter(o => o.id !== order.id));
        setReadyOrders(prev => [...prev, order].sort(sortByDate));
        updateOrderStatus(order.id, 'COMPLETED');
    };

    const handleCompleteToConfirm = (order: Order) => {
        setReadyOrders(prev => prev.filter(o => o.id !== order.id));
        setConfirmedOrders(prev => [...prev, order].sort(sortByDate));
        updateOrderStatus(order.id, 'CONFIRMED');
    };

    const handleCompleteToPickup = (order: Order) => {
        setReadyOrders(prev => prev.filter(o => o.id !== order.id));
        setPickedUpOrders(prev => [...prev, order].sort(sortByDate));
        updateOrderStatus(order.id, 'PICKED_UP');
    };

    const handlePickupToComplete = (order: Order) => {
        setPickedUpOrders(prev => prev.filter(o => o.id !== order.id));
        setReadyOrders(prev => [...prev, order].sort(sortByDate));
        updateOrderStatus(order.id, 'COMPLETED');
    };

    return (
        <div className="h-screen w-full flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 w-full overflow-hidden">
                <div className="h-full w-full grid grid-cols-3 gap-4 p-3 pt-24 max-w-[1920px] mx-auto">
                    <OrdersGrid
                        status="CONFIRMED"
                        className="col-span-2 min-w-0"
                        orders={confirmedOrders}
                        title="Ordini in preparazione"
                        onNext={handleConfirmToComplete}
                    />
                    <OrdersGrid
                        status="COMPLETED"
                        className="col-span-1 min-w-0"
                        orders={readyOrders}
                        title="Ordini pronti"
                        onPrev={handleCompleteToConfirm}
                        onNext={handleCompleteToPickup}
                    >
                        <PickedUpOrdersSheet
                            pickedUpOrders={pickedUpOrders}
                            onPrev={handlePickupToComplete}
                        />
                    </OrdersGrid>
                </div>
            </main>
        </div>
    )
}
