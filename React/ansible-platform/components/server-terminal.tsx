"use client";
import { useState, useEffect, useRef } from "react";

interface ServerTerminalProps {
  server: {
    id: string;
    name: string;
    ip_address: string;
    username: string;
    password: string;
  };
}

export function ServerTerminal({ server }: ServerTerminalProps) {
  const [output, setOutput] = useState("");
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ws = new WebSocket(
      `ws://localhost:8000/ws/terminal?server_ip=${server.ip_address}&username=${server.username}&password=${server.password}`
    );
    websocketRef.current = ws;

    ws.onmessage = (event) => {
      if (event.data.startsWith("__SUGGESTIONS__:")) {
        const suggestions = event.data.replace("__SUGGESTIONS__:", "").split("\n").filter(Boolean);
        if (suggestions.length === 1) {
          // Autocomplete inline
          setCommand((prev) => suggestions[0]);
        } else if (suggestions.length > 1) {
          // Show all possible completions in the terminal output
          setOutput((prev) => prev + "\n" + suggestions.join("\t") + "\n");
        }else if (suggestions.length === 1 && suggestions[0] !== "") {
          // Smart autocomplete
          const lastToken = inputValue.split(" ").pop();
          const base = inputValue.slice(0, inputValue.length - lastToken.length);
          setInputValue(base + suggestions[0] + " ");
        }
      } else {
        setOutput((prev) => prev + event.data);
      }
    };
    

    ws.onclose = () => {
      setOutput((prev) => prev + "\n[Disconnected]");
    };

    return () => {
      ws.close();
    };
  }, [server]);

  useEffect(() => {
    terminalRef.current?.scrollTo(0, terminalRef.current.scrollHeight);
  }, [output]);

  const sendCommand = () => {
    if (websocketRef.current && command.trim()) {
      websocketRef.current.send(command + "\n");
      setHistory((prev) => [...prev, command]);
      setHistoryIndex(null);
      setCommand("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendCommand();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
        setCommand(history[newIndex]);
        setHistoryIndex(newIndex);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== null) {
        const newIndex = historyIndex + 1;
        if (newIndex < history.length) {
          setCommand(history[newIndex]);
          setHistoryIndex(newIndex);
        } else {
          setCommand("");
          setHistoryIndex(null);
        }
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (e.key === "Tab") {
        e.preventDefault(); // prevent default focus switch
        websocketRef.current.send(`__COMPLETE__:${inputValue}`);
      }
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div
        ref={terminalRef}
        className="bg-black text-white font-mono text-sm p-4 rounded h-[500px] overflow-y-auto border border-gray-700 shadow-inner"
      >
        <pre className="whitespace-pre-wrap">{output}</pre>
      </div>

      <div className="flex items-center border border-gray-600 rounded overflow-hidden bg-zinc-900">
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-4 py-2 bg-transparent text-white placeholder-gray-400 focus:outline-none"
          placeholder="Type a command and press Enter..."
        />
        <button
          onClick={sendCommand}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
