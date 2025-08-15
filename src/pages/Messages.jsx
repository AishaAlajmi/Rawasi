import React, { useEffect, useMemo, useState } from "react";
import { MessageSquare } from "lucide-react";
import { Section } from "../components/ui.jsx";
import { useLocation } from "react-router-dom";

export default function Messages({ onProceed }) {
  const location = useLocation();
  const initialProvider = useMemo(() => {
    return (
      location.state?.provider ||
      (() => { try { return JSON.parse(localStorage.getItem("lastChatProvider") || "null"); } catch { return null; } })() ||
      (() => { try { return JSON.parse(localStorage.getItem("selectedProvider") || "null"); } catch { return null; } })()
    );
  }, [location.state]);

  const [provider] = useState(initialProvider);
  const headerName = provider?.name || "Provider";

  const [messages, setMessages] = useState([
    { from: headerName, text: "Thanks for your interest! Could you share drawings?", time: "09:12" },
    { from: "You", text: "Uploading shortly. What is current lead time?", time: "09:14" },
  ]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (provider) localStorage.setItem("lastChatProvider", JSON.stringify(provider));
  }, [provider]);

  const send = () => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { from: "You", text: text.trim(), time: new Date().toLocaleTimeString().slice(0, 5) }]);
    setText("");
  };

  return (
    <Section id="messages" className="bg-indigo-50/50">
      <div className="mx-auto max-w-5xl px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-600 p-2 text-white"><MessageSquare className="h-4 w-4" /></div>
              <div className="text-sm">
                <div className="font-semibold">Chat with {headerName}</div>
                <div className="text-slate-600">Secure messaging</div>
              </div>
            </div>
            <button className="rounded-xl border px-3 py-2 text-sm">Attach</button>
          </div>

          <div className="h-72 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === "You" ? "justify-end" : "justify-start"}`}>
                  <div className={`${m.from === "You" ? "bg-indigo-600 text-white" : "bg-white text-slate-800"} max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow`}>
                    <div className="text-xs opacity-70">{m.from}</div>
                    <div>{m.text}</div>
                    <div className="text-[10px] opacity-60">{m.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type a message" className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
            <button onClick={send} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white">Send</button>
          </div>
          <div className="mt-4 flex justify-center">
            <button onClick={onProceed} className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow hover:bg-indigo-700">
              Mark as engaged → Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </Section>
  );
}
