'use client'
import { useRef, useState } from 'react';

const ChatBot = () => {
    const [userQuery, setUserQuery] = useState("");
    const chatId = useRef(Date.now().toString(36) + Math.random().toString(36).substring(2));
    const chatContainerRef = useRef<HTMLDivElement | null>(null);

    const callServer = async (inputText: string) => {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: {
                'content-type': "application/json"
            },
            body: JSON.stringify({ chatId: chatId.current, message: inputText })
        });
        if (!res.ok) {
            throw new Error("Error generating the response")
        }
        const result = await res.json();
        return result.message as string;
    }

    const generateChat = async (text: string) => {
        const container = chatContainerRef.current;
        if (!container) return;

        const msg = document.createElement("div");
        msg.className = "my-6 bg-neutral-800 rounded-b-2xl rounded-l-2xl max-w-fit ml-auto px-3 py-2";
        msg.textContent = text;
        container.appendChild(msg);
        setUserQuery("");

        const loading = document.createElement("div");
        loading.className = "my-6 animate-pulse text-gray-300";
        loading.textContent = "Thinking...";
        container.appendChild(loading);

        const assistantMsg = await callServer(text);
        const assistMsg = document.createElement("div");
        assistMsg.className = "max-w-fit px-3 py-2";
        assistMsg.textContent = assistantMsg;
        loading.remove();
        container.appendChild(assistMsg);
    }

    const handleEnter = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const text = userQuery.trim();
            if (!text) return;
            await generateChat(text);
        }
    }

    return (
        <div className="text-white w-full  ">
            <div className="container max-w-4xl mx-auto pb-44 px-2" ref={chatContainerRef} id="chatContainer">
                <div className="flex items-center justify-center inset-x-0 bottom-0 ">
                    <div className="fixed w-full max-w-4xl rounded-4xl bg-neutral-800 mx-auto bottom-2 mb-6">
                        <textarea
                            name="query"
                            value={userQuery}
                            onChange={(e) => setUserQuery(e.target.value)}
                            onKeyUp={handleEnter}
                            className="outline-none w-full p-6 resize-none bg-transparent text-white"
                            rows={1}
                            id="userQuery"
                            placeholder="Ask your question..."
                        />
                        <div className="flex item-center justify-end p-4">
                            <button
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    e.preventDefault();
                                    const text = userQuery.trim();
                                    if (!text) return;
                                    generateChat(text);
                                }}
                                className="py-2 px-4 bg-gray-50 text-black cursor-pointer rounded-xl hover:bg-gray-300"
                            >
                                Ask
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatBot