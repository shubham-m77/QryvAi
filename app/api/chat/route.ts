import { NextResponse } from "next/server";
import { generateChat } from "@/lib/chatbot";

export async function POST(req: Request) {
	try {
		const { message, chatId } = await req.json();

		if (!message) {
			return NextResponse.json({ error: "Message is required" }, { status: 400 });
		}

		// fallback chatId if not provided
		const result = await generateChat(message, chatId ?? "default-chat");

		return NextResponse.json({ message: result }, { status: 200 });
	} catch (error) {
		console.error("Chatbot Error:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
