'use client'
import { useState } from 'react';
const ChatBot = () => {
	const [userQuery, setUserQuery] = useState("");
	const chatId = Date.now().toString(36) + Math.random().toString(36).substring(2);
	const chatContainer = document.querySelector("#chatContainer");
	const callServer = async (inputText: string) => {
		const res = await fetch("api/chat", {
			method: "POST",
			headers: {
				'content-type': "application/json"
			},
			body: JSON.stringify({ chatId, message: inputText })
		});
		if (!res.ok) {
			throw new Error("Error on  generating the response")
		}
		const result = await res.json();
		return result.message;
	}
	const generateChat = async (text: string) => {
		//  append message to ui 
		const msg = document.createElement("div");
		msg.className = `my-6 bg-neutral-800 rounded-b-2xl rounded-l-2xl max-w-fit ml-auto px-3 py-2`;
		msg.textContent = text;
		chatContainer?.appendChild(msg);
		setUserQuery("");

		// thinking/loading
		const loading = document.createElement("div");
		loading.className = `my-6 animate-pulse text-gray-300`;
		loading.textContent = "Thinking...";
		chatContainer?.appendChild(loading);

		// call server
		const assistantMsg = await callServer(text);
		// Append response to the ui
		const assistMsg = document.createElement("div");
		assistMsg.className = `max-w-fit ml-auto px-3 py-2`;
		assistMsg.textContent = assistantMsg;
		loading.remove();
		chatContainer?.appendChild(assistMsg);

	}
	const handleEnter = async (e: any) => {
		if (e.key === "Enter") {
			const text = userQuery?.trim();
			if (!text) return;
			await generateChat(text);
		}

	}
	return <div className="text-white w-full bg-gray-900">
		<div className="container max-w-4xl mx-auto pb-44 px-2" id="chatContainer ">
			{/*<div>
		{/*messages here*/}

			{/*User message */}
			{/*<h3 className="my-6 bg-neutral-800 rounded-b-2xl rounded-l-2xl max-w-fit ml-auto px-3 py-2">
		Hello.
		</h3>	*/}
			{/*Assistant Message*/}
			{/*<h3 className=" max-w-fit ml-auto px-3 py-2">
		Hey, How can i help you today!
		</h3>	*/}
			{/* </div> */}
			{/*user textarea here*/}
			<div className="flex items-center justify-center inset-x-0 button-0 bg-gray-900">
				<div className="fixed-top rounded-4xl bg-neutral-800 mx-auto max-w-4xl mb-6">
					<textarea name="query" value={userQuery} onChange={(e) => { setUserQuery(e.target.value) }} onKeyUp={(e) => handleEnter(e)} className=" outline-none w-full p-3 resize-none" rows={2} id="userQuery"></textarea>
					<div className="flex item-center justify-end p-4">
						<button onClick={(e: any) => {
							e.preventDefault();
							const text = userQuery?.trim();
							if (!text) return;
							generateChat(text);
						}} className="py-2 px-4 bg-gray-50 text-black cursor-pointer hover:bg-gray-300 ">Ask</button>
					</div>
				</div>
			</div>
		</div>
	</div>
}
export default ChatBot