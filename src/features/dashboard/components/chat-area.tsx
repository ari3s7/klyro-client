export default function ChatArea() {
  return (
    <section className="flex flex-1 flex-col bg-zinc-950">
      {/* Header */}
      <header className="flex h-16 items-center border-b border-zinc-800 px-6">
        <h2 className="font-semibold">Welcome to Klyro</h2>
      </header>

      {/* Messages */}
      <div className="flex flex-1 items-center justify-center text-zinc-500">
        <p className="text-zinc-400">
          Select a channel to start chatting.
        </p>
      </div>

      {/* Input */}
      <div className="border-t border-zinc-800 p-4">
        <input
          disabled
    placeholder="Message #general"
    className="
        w-full
        rounded-lg
        bg-zinc-800
        px-4
        py-3
        text-sm
        placeholder:text-zinc-500"
        />
      </div>
    </section>
  );
}