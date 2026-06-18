"use client";

import React, { useState, useRef, useEffect } from "react";

interface TerminalLine {
  text: string;
  type: "input" | "system" | "success" | "error" | "code";
}

export default function CyberTerminal() {
  const [history, setHistory] = useState<TerminalLine[]>([
    { text: "System security interface loaded.", type: "system" },
    { text: "Type 'help' to see available protocols.", type: "system" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [history, isScanning]);

  const handleTerminalClick = () => {
    if (inputRef.current && !isScanning) {
      inputRef.current.focus();
    }
  };

  const executeCommand = async (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const newHistory = [...history, { text: `abrar@nust-mcs:~$ ${cmd}`, type: "input" as const }];

    if (trimmed === "") {
      setHistory(newHistory);
      return;
    }

    switch (trimmed) {
      case "help":
        setHistory([
          ...newHistory,
          { text: "Available commands:", type: "system" },
          { text: "  about    - Reveal bio & operational data", type: "code" },
          { text: "  skills   - Load technical arsenal breakdown", type: "code" },
          { text: "  hack     - Execute mock security scanning protocol", type: "code" },
          { text: "  clear    - Flush terminal buffer", type: "code" },
        ]);
        break;

      case "about":
        setHistory([
          ...newHistory,
          { text: "RESOURCE IDENTITY: Muhammad Abrar Ahmad", type: "success" },
          { text: "STATUS: Active Cyber Security & Full Stack Specialist", type: "system" },
          { text: "LOCATION: NUST MCS, Rawalpindi, Pakistan", type: "system" },
          { text: "BIO: Engineering secure backend architectures and crafting fluid frontends. Specializing in high-throughput database design, modular web systems, and server deployment.", type: "system" },
        ]);
        break;

      case "skills":
        setHistory([
          ...newHistory,
          { text: "PARSING SKILLS DEPLOYMENT GRAPH...", type: "system" },
          { text: "├── frontend.dll  -> React, NextJS, TypeScript, TailwindCSS", type: "code" },
          { text: "├── backend.bin   -> Django, NestJS, Node.js, Express, REST/GraphQL", type: "code" },
          { text: "├── database.db   -> PostgreSQL, MongoDB, MySQL, TypeORM, Mongoose", type: "code" },
          { text: "└── secOps.sh     -> Docker, AWS Cloud, Git, CI/CD pipelines", type: "code" },
        ]);
        break;

      case "clear":
        setHistory([]);
        break;

      case "hack":
        setIsScanning(true);
        setHistory(newHistory);

        const logs = [
          "CONNECTING TO MCS SECURITY HUB...",
          "CONNECTION STABLE. IP EXPOSED: 192.168.43.109",
          "PORT SCANNING IN PROGRESS...",
          "PORT 80 (HTTP)       - OPEN (NGINX/1.18.0)",
          "PORT 443 (HTTPS)     - OPEN (SSL CERTIFICATE VERIFIED)",
          "PORT 22 (SSH)        - FILTERED (KEY EXCHANGE INITIATED)",
          "INJECTING EXPLOIT PAYLOAD [CVE-2026-NUST]...",
          "BUFFER OVERFLOW SUCCESSFUL. BYPASSING FIREWALL...",
          "ESCALATING PRIVILEGES TO ROOT...",
          "ROOT ACCESS CONFIRMED.",
        ];

        for (let i = 0; i < logs.length; i++) {
          await new Promise((r) => setTimeout(r, 300));
          setHistory((prev) => [...prev, { text: logs[i], type: "code" }]);
        }

        await new Promise((r) => setTimeout(r, 400));
        setHistory((prev) => [
          ...prev,
          { text: "HACK COMPLETED SUCCESSFULLY!", type: "success" },
          { text: "ACCESS GRANTED: Muhammad Abrar Ahmad is available for hiring! 🚀", type: "success" },
        ]);
        setIsScanning(false);
        break;

      default:
        setHistory([
          ...newHistory,
          { text: `bash: command not found: '${cmd}'. Type 'help' to see valid operations.`, type: "error" },
        ]);
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isScanning) {
      executeCommand(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="terminal-window" onClick={handleTerminalClick}>
      <div className="terminal-header">
        <div className="terminal-dot red" />
        <div className="terminal-dot yellow" />
        <div className="terminal-dot green" />
        <div className="terminal-title">SecOps Console v2.0</div>
      </div>
      <div className="terminal-body" ref={bodyRef}>
        {history.map((line, i) => {
          let colorClass = "text-indigo-300";
          if (line.type === "input") colorClass = "text-white font-semibold";
          else if (line.type === "success") colorClass = "text-green-400 font-bold";
          else if (line.type === "error") colorClass = "text-rose-500";
          else if (line.type === "code") colorClass = "text-cyan-400 font-mono";

          return (
            <div key={i} className={`terminal-line ${colorClass}`}>
              {line.text}
            </div>
          );
        })}

        {isScanning && (
          <div className="terminal-line text-cyan-400 font-mono flex items-center">
            <span>Executing background exploit</span>
            <span className="terminal-cursor" />
          </div>
        )}

        {!isScanning && (
          <div className="terminal-input-row">
            <span className="terminal-input-prefix">abrar@nust-mcs:~$</span>
            <input
              ref={inputRef}
              type="text"
              className="terminal-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isScanning}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
            />
            {inputValue === "" && <span className="terminal-cursor" />}
          </div>
        )}
      </div>
    </div>
  );
}
