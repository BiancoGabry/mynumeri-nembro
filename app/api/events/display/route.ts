import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return new Response("Unauthorized", { status: 401 });
    }

    const backendUrl = process.env.API_URL || "http://localhost:3000";

    const response = await fetch(`${backendUrl}/events/display`, {
        headers: {
            "Authorization": `Bearer ${session.accessToken}`,
            "Accept": "text/event-stream",
        }
    });

    if (!response.ok) {
        return new Response("Error connecting to event stream", { status: response.status });
    }

    return new Response(response.body, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
        }
    });
}
