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
  const [output, setOutput] = useState<string>("");
  const [command, setCommand] = useState<string>("");
  const websocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket(
      `ws://localhost:8000/ws/terminal?server_ip=${server.ip_address}&username=${server.username}&password=${server.password}`
    );
    websocketRef.current = ws;

    ws.onmessage = (event) => {
      setOutput((prev) => prev + event.data); // Append server output
    };

    ws.onclose = () => {
      setOutput((prev) => prev + "\nConnection closed.");
    };

    return () => {
      ws.close();
    };
  }, [server]);

  const sendCommand = () => {
    if (websocketRef.current && command.trim()) {
      websocketRef.current.send(command + "\n"); // Send command to server
      setCommand(""); // Clear input
    }
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-md bg-black text-green-400 font-mono text-sm p-4 h-[400px] overflow-y-auto">
        <pre>{output}</pre>
      </div>
      <div className="flex items-center">
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendCommand()}
          className="flex-1 bg-transparent border-none text-green-400 focus:outline-none"
          placeholder="Type a command..."
        />
        <button onClick={sendCommand} className="ml-2 px-4 py-2 bg-green-600 text-white rounded">
          Send
        </button>
      </div>
    </div>
  );
}