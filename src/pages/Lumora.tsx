import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

// Message type for chat history
interface Message {
  sender: "user" | "ai";
  text: string;
}

export default function Lumora() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send user question to backend AI and update chat
  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: "user" as const, text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/api/recommend/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg.text }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text:
            (typeof data === "string" ? data : data.answer) ||
            "Sorry, I couldn't find an answer.",
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "There was an error connecting to the AI service.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key for sending
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col px-0 py-0">
        <Card className="w-full h-full flex flex-col flex-1 shadow-lg rounded-none border-none">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-base">
                Ask Lumora any homework question (K-College)!
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] text-base whitespace-pre-line ${
                    msg.sender === "user"
                      ? "bg-blue-100 text-blue-900"
                      : "bg-gray-100 text-gray-800"
                  }`}
                  style={msg.sender === "ai" ? { textAlign: "left" } : {}}
                >
                  {msg.sender === "ai" ? (
                    <AIFormattedAnswer text={msg.text} />
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form
            className="flex items-center gap-2 border-t px-4 py-3 bg-white"
            style={{ position: "sticky", bottom: 0 }}
            onSubmit={(e) => {
              e.preventDefault();
              if (!loading) sendMessage();
            }}
          >
            <Input
              className="flex-1"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              autoFocus
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              {loading ? "Sending..." : "Send"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

// Helper component to format AI answers with sections and bullet points
function AIFormattedAnswer({ text }: { text: string }) {
  const sections = text.split(/\n\s*\n/); // split into paragraphs
  return (
    <div>
      {sections.map((section, i) => {
        const lines = section.split(/\n/);
        const bullets = lines.filter((l) => /^[-*]\s+/.test(l));

        if (bullets.length > 0) {
          return (
            <ul key={i} style={{ margin: 0, paddingLeft: 20 }}>
              {bullets.map((b, j) => (
                <li key={j}>{b.replace(/^[-*]\s+/, "")}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i} style={{ margin: 0 }}>
            {section}
          </p>
        );
      })}
    </div>
  );
}
