'use client'
import { useRef, useState, useEffect, useCallback } from 'react'

type Role = 'user' | 'assistant'

interface Message {
  id: string
  role: Role
  content: string
  time: string
}

const uid = () => Math.random().toString(36).slice(2, 9)
const getTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

function TypingDots() {
  return (
    <div className="flex gap-1 items-center px-1 py-0.5">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
        />
      ))}
    </div>
  )
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatId = useRef(Date.now().toString(36) + Math.random().toString(36).slice(2))

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const resizeTextarea = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  const callServer = async (text: string) => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chatId: chatId.current, message: text }),
    })
    if (!res.ok) throw new Error('Failed')
    const data = await res.json()
    return data.message as string
  }

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setLoading(true)
    setMessages(prev => [...prev, { id: uid(), role: 'user', content: text, time: getTime() }])

    try {
      const reply = await callServer(text)
      setMessages(prev => [...prev, { id: uid(), role: 'assistant', content: reply, time: getTime() }])
    } catch {
      setMessages(prev => [...prev, { id: uid(), role: 'assistant', content: 'Something went wrong. Try again.', time: getTime() }])
    } finally {
      setLoading(false)
    }
  }, [input, loading])

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const canSend = input.trim().length > 0 && !loading

  return (
    <div className="flex flex-col max-h-screen mt-16">

      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-zinc-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="2" fill="white" />
              <path d="M7 1v2M7 11v2M1 7h2M11 7h2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-sm font-medium">Assistant</span>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
          Online
        </span>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6 [scrollbar-width:none]">
        <div className="max-w-2xl mx-auto flex flex-col gap-5">

          {/* Empty state */}
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-32 text-zinc-600 select-none">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4.5A1.5 1.5 0 0 1 3.5 3h9A1.5 1.5 0 0 1 14 4.5v7A1.5 1.5 0 0 1 12.5 13H9l-3 2v-2H3.5A1.5 1.5 0 0 1 2 11.5v-7z" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>
              <p className="text-sm">Ask me anything</p>
            </div>
          )}

          {/* Message list */}
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-lg shrink-0 mt-0.5 flex items-center justify-center text-xs font-semibold
                ${msg.role === 'user' ? 'bg-zinc-800 border border-zinc-700 text-zinc-400' : 'bg-indigo-500 text-white'}`}
              >
                {msg.role === 'user' ? 'U' : 'AI'}
              </div>

              <div className={`flex flex-col gap-1 max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-white text-zinc-900 rounded-tr-sm'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-zinc-600 px-1">{msg.time}</span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-500 shrink-0 mt-0.5 flex items-center justify-center text-xs font-semibold text-white">
                AI
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3">
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input bar */}
      <div className="shrink-0 px-4 pb-6 pt-2 relative">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end gap-3  bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 focus-within:border-zinc-700 transition-colors">
            <textarea
              ref={textareaRef}
              rows={2}
              value={input}
              placeholder="Message…"
              onChange={e => { setInput(e.target.value); resizeTextarea() }}
              onKeyDown={onKeyDown}
              className="flex-1 bg-transparent  outline-none resize-none text-sm text-zinc-100 placeholder:text-zinc-600 leading-relaxed max-h-28 [scrollbar-width:none]"
            />
            <button
              onClick={send}
              disabled={!canSend}
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all
                ${canSend ? 'bg-indigo-500 text-white hover:bg-indigo-400 active:scale-95' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 12V2M2 7l5-5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <p className="text-center text-[10px] text-zinc-700 mt-2">
            Enter to send · Shift + Enter for new line
          </p>
        </div>
      </div>

    </div>
  )
}