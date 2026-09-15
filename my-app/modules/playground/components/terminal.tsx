"use client";

import { useEffect, useRef } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import type { WebContainer } from "@webcontainer/api";

import "@xterm/xterm/css/xterm.css";

interface TerminalProps {
  webContainer: WebContainer | null;
}

const Terminal = ({ webContainer }: TerminalProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || !webContainer) {
      return;
    }

    const terminal = new XTerm({
      cursorBlink: true,
      fontSize: 13,
      convertEol: true,
      scrollback: 2000,
      theme: {
        background: "#0d1117",
        foreground: "#e6edf3",
      },
    });

    const fitAddon = new FitAddon();

    terminal.loadAddon(fitAddon);
    terminal.open(containerRef.current);
    fitAddon.fit();

    let shellProcess: Awaited<ReturnType<WebContainer["spawn"]>> | null = null;

    let disposed = false;

    const startShell = async () => {
      try {
        terminal.writeln("CodeSync Terminal");
        terminal.writeln("");

        shellProcess = await webContainer.spawn("jsh", {
          terminal: {
            cols: terminal.cols,
            rows: terminal.rows,
          },
        });

        if (disposed) {
          return;
        }

        shellProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              terminal.write(data);
            },
          }),
        );

        const inputDisposable = terminal.onData((data) => {
          shellProcess?.input.getWriter().write(data);
        });

        const handleResize = () => {
          fitAddon.fit();

          shellProcess?.resize({
            cols: terminal.cols,
            rows: terminal.rows,
          });
        };

        window.addEventListener("resize", handleResize);

        return () => {
          inputDisposable.dispose();
          window.removeEventListener("resize", handleResize);
        };
      } catch (error) {
        console.error("Terminal error:", error);

        terminal.writeln("");
        terminal.writeln("Failed to start terminal.");
      }
    };

    let cleanupShell: (() => void) | undefined;

    startShell().then((cleanup) => {
      cleanupShell = cleanup;
    });

    return () => {
      disposed = true;
      cleanupShell?.();
      shellProcess?.kill();
      terminal.dispose();
    };
  }, [webContainer]);

  return (
    <div className="h-full w-full overflow-hidden bg-[#0d1117]">
      <div ref={containerRef} className="h-full w-full p-2" />
    </div>
  );
};

export default Terminal;
