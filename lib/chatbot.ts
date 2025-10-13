import Groq from "groq-sdk";
import { tavily } from "@tavily/core";
import NodeCache from 'node-cache';
// constants
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const cache = new NodeCache({ stdTTL: 60 * 60 * 24 }); // cache for 24 hours

export async function generateChat(userMsg: string, chatId: string) {
  const baseMsg = [
    {
      role: "system",
      content: `You are "Tech Assistant" — a highly capable and intelligent personal assistant.
Your job is to provide accurate, up-to-date, and well-explained answers on **any topic** (tech, news, science, lifestyle, education, etc.).

You have access to two reasoning sources:

1. internalKnowledge
   - Use this when:
     • The question involves logic, reasoning, explanations, creativity, writing, or opinion.
     • The answer is not time-sensitive or doesn’t depend on current data.
   - Examples:
     - “Explain quantum computing in simple words.”
     - “Why is the sky blue?”
     - “Write a short poem about friendship.”
     - “How does JavaScript handle async code?”

2. webSearch({query}:{string})
   - Use this when:
     • The user asks for *latest, current, recent, now, today, 2025, update, release, price, trend, live,* etc.
     • The answer depends on **real-time or changing data**.
   - Examples:
     - “Who won the 2025 Cricket World Cup?”
     - “Current gold price in India.”
     - “Latest React version and features.”
     - “Today’s weather in Delhi.”

### Decision Rules:
- If the question clearly needs real-time or current data → use webSearch first.
- If the question is logical, creative, or timeless → answer directly using internalKnowledge.
- If both real-time + reasoning are needed → search first, then reason.
- Never output raw function calls or code — always reply naturally as a human assistant.

### Current Date:
${new Date().toUTCString()}
`
    },
  ];
  const message = cache.get(chatId) ?? baseMsg;
  const tools = [
    {
      type: "function",
      function: {
        name: "webSearch",
        description:
          "Get the latest info and realtime precise data from the internet.",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query to perform search on."
            }
          },
          required: ["query"]
        }
      }
    }
  ];
  // Dynamic questioning
  message.push({
    role: "user",
    content: userMsg
  })
  const MAX_RETRIES = 10;
  let count = 0;
  while (true) {
    if (count++ > MAX_RETRIES) {
      return "Error: Maximum retries exceeded!";
    }
    const completion = await groq.chat.completions.create({
      temperature: 0,
      model: "llama-3.3-70b-versatile",
      messages: message,
      tools: tools,
      tool_choice: "auto"
    });

    const msg = completion.choices[0].message;
    const toolCalls = msg.tool_calls;

    if (!toolCalls) {
      // unwrap content properly
      let answer;
      if (Array.isArray(msg.content)) {
        answer = msg.content
          .filter((c: any) => c.type === "text")
          .map((c: any) => c.text)
          .join("\n");
      } else {
        answer = msg.content;
      }
      cache.set(chatId, [...message]);
      return answer;
    }

    // handle each tool call
    for (const tool of toolCalls) {
      const funcName = tool.function.name;
      const args = JSON.parse(tool.function.arguments || '{}');

      if (funcName === "webSearch") {
        const result = await webSearch(args);

        // push assistant message with tool_call info
        message.push({
          role: "assistant",
          tool_calls: [tool] // echo back the tool call
        });

        // push tool result
        message.push({
          role: "tool",
          tool_call_id: tool.id,
          content: result
        });
      }
    }
  }
}


async function webSearch({ query }: { query: string }) {
  const res = await tvly.search({ query });
  const finalRes = res.results.map((item: any) => item.content).join("\n\n");
  return finalRes;
}
