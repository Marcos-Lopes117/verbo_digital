import { useState, useEffect, useRef } from "react";

function App() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Bem-vindo ao Verbo Digital. Que a paz esteja com você. Como posso auxiliar sua jornada espiritual hoje?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://verbo-digital.vercel.app/api/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input }),
        }
      );
      const data = await response.json();
      setMessages((prev) => [...prev, { role: "ai", text: data.response }]);
    } catch (error) {
      console.error("Erro:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Perdoe-me, houve uma interrupção na nossa conexão. Poderia repetir?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 font-serif">
      {/* Cabeçalho Refinado */}
      <header className="text-center mb-10 max-w-lg">
        <div className="mb-4">
          <img
            src="public/logo.png"
            alt="Logo Verbo Digital"
            className="w-60 h-60 mx-auto object-contain drop-shadow-md"
          />
        </div>
        <h1 className="text-5xl font-extrabold text-[#3D2B1F] tracking-tight">
          Verbo Digital
        </h1>
        <p className="text-amber-800/70 mt-3 italic text-lg">
          Aconselhamento Bíblico e Acolhimento
        </p>
        <div className="h-1 w-20 bg-amber-800/20 mx-auto mt-6 rounded-full"></div>
      </header>

      {/* Container do Chat */}
      <main className="w-full max-w-3xl bg-white/80 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col h-[650px] border border-stone-200 overflow-hidden relative">
        {/* Marca d'água de fundo (Papel) */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>

        {/* Área de Mensagens */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 relative z-10">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`group relative max-w-[85%] px-6 py-4 rounded-3xl transition-all duration-300 ${
                  msg.role === "user"
                    ? "bg-[#3D2B1F] text-stone-100 rounded-br-none shadow-lg shadow-[#3D2B1F]/20"
                    : "bg-white text-stone-800 border border-stone-100 rounded-bl-none shadow-sm"
                }`}
              >
                <p className="text-[17px] leading-relaxed font-sans">
                  {msg.text}
                </p>
                <span
                  className={`text-[10px] uppercase tracking-widest mt-2 block opacity-40 ${
                    msg.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  {msg.role === "user" ? "Você" : "O Verbo"}
                </span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-stone-100 px-6 py-3 rounded-2xl text-stone-400 italic font-sans text-sm">
                Buscando discernimento...
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Campo de Entrada (Input) */}
        <div className="p-6 bg-white border-t border-stone-100 relative z-10">
          <div className="flex items-center gap-3 bg-stone-50 p-2 rounded-2xl border border-stone-200 focus-within:border-amber-700/50 focus-within:ring-4 focus-within:ring-amber-700/5 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Sobre o que seu coração deseja falar?"
              className="flex-1 bg-transparent p-3 outline-none font-sans text-stone-700 placeholder:text-stone-400"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-[#3D2B1F] text-white p-3 rounded-xl hover:bg-[#5A4031] disabled:opacity-30 transition-all shadow-md active:scale-95"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </main>

      <footer className="mt-10 text-stone-500 text-sm tracking-wide opacity-60 flex items-center gap-2 font-sans">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
        Conectado à sabedoria do Verbo Digital
      </footer>
    </div>
  );
}

export default App;
