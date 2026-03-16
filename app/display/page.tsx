"use client";

import { Header } from "@/components/display/header";
import { useEffect, useState, useRef, useCallback } from "react";
import { getWorkdayBounds, sortByDate } from "@/utils/utils";

const COLS = 5;
const ROWS = 4;
const CARDS_PER_PAGE = COLS * ROWS; // 20
const PAGE_INTERVAL = 10000; // ms

interface ReadyOrder {
    id: string;
    status: "PENDING" | "CONFIRMED" | "COMPLETED" | "PICKED_UP";
    ticketNumber: number;
    displayCode: string;
}

// ---------------------------------------------------------------------------
// Footer — shown only when there is an announcement
// ---------------------------------------------------------------------------

function Footer({ announcement }: { announcement: string }) {
    const measureRef = useRef<HTMLSpanElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [shouldScroll, setShouldScroll] = useState(false);
    const [duration, setDuration] = useState(20);

    useEffect(() => {
        const measure = () => {
            if (!measureRef.current || !containerRef.current) return;
            const textW = measureRef.current.scrollWidth;
            const containerW = containerRef.current.clientWidth;
            const overflows = textW > containerW;
            setShouldScroll(overflows);
            if (overflows) {
                setDuration(Math.max(12, textW / 100));
            }
        };

        measure();
        const ro = new ResizeObserver(measure);
        if (containerRef.current) ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, [announcement]);

    if (!announcement) return null;

    return (
        <footer className="flex-shrink-0 bg-amber-400 border-t-2 border-amber-500 flex items-center overflow-hidden" style={{ height: "68px" }}>
            {/* Pill label */}
            <span className="flex-shrink-0 ml-12 mr-6 px-4 py-1 rounded-full bg-black text-amber-400 text-sm font-black uppercase tracking-widest select-none">
                Avviso
            </span>

            {/* Separator */}
            <span className="flex-shrink-0 w-px h-8 bg-black/20 mr-6" />

            {/* Text area */}
            <div ref={containerRef} className="flex-1 overflow-hidden">
                {/* Hidden span for measurement */}
                <span
                    ref={measureRef}
                    className="fixed invisible whitespace-nowrap pointer-events-none"
                    aria-hidden="true"
                    style={{ fontSize: "1.25rem" }}
                >
                    {announcement}
                </span>

                {shouldScroll ? (
                    <div
                        className="flex whitespace-nowrap"
                        style={{ animation: `marquee-scroll ${duration}s linear infinite` }}
                    >
                        <span className="text-xl font-semibold text-black pr-40">{announcement}</span>
                        <span className="text-xl font-semibold text-black pr-40">{announcement}</span>
                    </div>
                ) : (
                    <span className="text-xl font-semibold text-black whitespace-nowrap">{announcement}</span>
                )}
            </div>

            <span className="flex-shrink-0 w-12" />
        </footer>
    );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function Display() {
    const [latestOrders, setLatestOrders] = useState<ReadyOrder[]>([]);
    const [displayedOrders, setDisplayedOrders] = useState<ReadyOrder[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [announcement, setAnnouncement] = useState("");

    const latestOrdersRef = useRef<ReadyOrder[]>([]);
    useEffect(() => {
        latestOrdersRef.current = latestOrders;
    }, [latestOrders]);

    const totalPages = Math.max(1, Math.ceil(displayedOrders.length / CARDS_PER_PAGE));
    const pageOrders = displayedOrders.slice(
        currentPage * CARDS_PER_PAGE,
        (currentPage + 1) * CARDS_PER_PAGE
    );

    // ------------------------------------------------------------------
    // Fetch initial orders
    // ------------------------------------------------------------------
    const fetchOrders = useCallback(async () => {
        try {
            const { dateFrom, dateTo } = getWorkdayBounds();
            const dateParams = `&dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`;
            const res = await fetch(`/api/orders?status=COMPLETED&limit=100${dateParams}`);
            if (!res.ok) return;
            const json = await res.json();
            const orders: Order[] = json.data || json.orders || json || [];
            const projected: ReadyOrder[] = Array.isArray(orders)
                ? orders.sort(sortByDate).map(({ id, ticketNumber, displayCode, status }) => ({
                      id,
                      ticketNumber,
                      displayCode,
                      status,
                  }))
                : [];
            setLatestOrders(projected);
            setDisplayedOrders(projected);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
        }
    }, []);

    // ------------------------------------------------------------------
    // SSE — order updates
    // ------------------------------------------------------------------
    useEffect(() => {
        fetchOrders();
        const es = new EventSource("/api/events/display");
        es.onopen = () => fetchOrders();

        es.addEventListener("order-status-update", (event: MessageEvent) => {
            const data = JSON.parse(event.data) as ReadyOrder;
            if (data.status === "COMPLETED") {
                setLatestOrders((prev) => {
                    if (prev.find((o) => String(o.id) === String(data.id))) return prev;
                    return [...prev, data];
                });
                setDisplayedOrders((prev) => {
                    if (prev.find((o) => String(o.id) === String(data.id))) return prev;
                    return [...prev, data];
                });
            } else {
                setLatestOrders((prev) =>
                    prev.filter((o) => String(o.id) !== String(data.id))
                );
            }
        });

        return () => es.close();
    }, [fetchOrders]);

    // ------------------------------------------------------------------
    // SSE — announcement
    // ------------------------------------------------------------------
    useEffect(() => {
        const stored = localStorage.getItem("display-announcement");
        if (stored) setAnnouncement(stored);

        const es = new EventSource("/api/announcement/events");
        es.onmessage = (event) => {
            const { announcement: text } = JSON.parse(event.data);
            setAnnouncement(text);
            localStorage.setItem("display-announcement", text);
        };
        return () => es.close();
    }, []);

    // ------------------------------------------------------------------
    // Single-page sync: keep displayedOrders in sync when no pagination
    // ------------------------------------------------------------------
    useEffect(() => {
        if (totalPages <= 1) {
            setDisplayedOrders(latestOrders);
        }
    }, [latestOrders, totalPages]);

    // ------------------------------------------------------------------
    // Page cycling
    // ------------------------------------------------------------------
    useEffect(() => {
        if (totalPages <= 1) {
            setCurrentPage(0);
            return;
        }

        const timer = setTimeout(() => {
            setCurrentPage((prev) => {
                const next = prev + 1;
                if (next >= totalPages) {
                    setDisplayedOrders([...latestOrdersRef.current]);
                    return 0;
                }
                return next;
            });
        }, PAGE_INTERVAL);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, totalPages]);

    // ------------------------------------------------------------------
    // Render — force light mode on the whole page via explicit colors
    // ------------------------------------------------------------------
    return (
        <div className="h-screen flex flex-col overflow-hidden bg-gray-100 text-gray-900">
            <Header
                pageKey={currentPage}
                showProgress={totalPages > 1}
                currentPage={currentPage}
                totalPages={totalPages}
            />

            <main className="flex-1 overflow-hidden p-4">
                <div
                    className="h-full grid gap-3"
                    style={{
                        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                        gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                    }}
                >
                    {pageOrders.map((order) => (
                        <div
                            key={order.id}
                            className="order-card bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center shadow-sm"
                        >
                            <p
                                className="font-black text-black select-none leading-none"
                                style={{ fontSize: "clamp(2rem, 4vw, 5rem)" }}
                            >
                                {order.displayCode}
                            </p>
                        </div>
                    ))}
                </div>
            </main>

            <Footer announcement={announcement} />
        </div>
    );
}
