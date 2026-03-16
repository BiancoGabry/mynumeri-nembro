import { getAnnouncement, setAnnouncement } from "@/lib/announcement-store";

export async function GET() {
    return Response.json({ announcement: getAnnouncement() });
}

export async function POST(request: Request) {
    const body = await request.json();
    const text = typeof body.announcement === "string" ? body.announcement : "";
    setAnnouncement(text);
    return Response.json({ ok: true });
}
