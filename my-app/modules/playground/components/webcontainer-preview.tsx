"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { WebContainer } from "@webcontainer/api";

interface PreviewFile {
  path: string;
  content: string;
  isFolder?: boolean;
}

interface WebContainerPreviewProps {
  files: PreviewFile[];
  enabled: boolean;
  onContainerReady?: (container: WebContainer) => void;
}

let webContainerInstance: WebContainer | null = null;

const buildFileSystem = (files: PreviewFile[]) => {
  const fileSystem: Record<string, any> = {};

  for (const file of files) {
    if (file.isFolder) {
      continue;
    }

    const parts = file.path.split("/");

    let current = fileSystem;

    for (let index = 0; index < parts.length - 1; index++) {
      const part = parts[index];

      if (!current[part]) {
        current[part] = {
          directory: {},
        };
      }

      current = current[part].directory;
    }

    current[parts[parts.length - 1]] = {
      file: {
        contents: file.content,
      },
    };
  }

  return fileSystem;
};

const WebContainerPreview = ({
  files,
  enabled,
  onContainerReady,
}: WebContainerPreviewProps) => {
  const [url, setUrl] = useState<string | null>(null);

  const [status, setStatus] = useState("Preview stopped");

  const [error, setError] = useState<string | null>(null);

  const startPreview = async () => {
    if (!enabled) {
      return;
    }

    try {
      setError(null);
      setUrl(null);
      setStatus("Booting WebContainer...");

      if (!webContainerInstance) {
        webContainerInstance = await WebContainer.boot({
          coep: "require-corp",
        });
      }

      const container = webContainerInstance;

      onContainerReady?.(container);

      setStatus("Loading project files...");

      await container.mount(buildFileSystem(files));

      setStatus("Installing dependencies...");

      const installProcess = await container.spawn("npm", ["install"]);

      const installExit = await installProcess.exit;

      if (installExit !== 0) {
        throw new Error(`npm install failed with exit code ${installExit}`);
      }

      setStatus("Starting development server...");

      const removeServerListener = container.on(
        "server-ready",
        (_port, serverUrl) => {
          setUrl(serverUrl);
          setStatus("Running");
        },
      );

      await container.spawn("npm", ["run", "dev"]);

      return () => {
        removeServerListener();
      };
    } catch (err) {
      console.error("WebContainer error:", err);

      setError(err instanceof Error ? err.message : "Failed to start preview");

      setStatus("Failed");
    }
  };

  useEffect(() => {
    if (!enabled) {
      setStatus("Preview stopped");
      return;
    }

    startPreview();
  }, [enabled]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex h-10 shrink-0 items-center justify-between border-b px-3">
        <div className="flex items-center gap-2 text-xs">
          {status === "Running" ? (
            <span className="h-2 w-2 rounded-full bg-green-500" />
          ) : (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          )}

          <span>{status}</span>
        </div>

        <button
          type="button"
          onClick={startPreview}
          disabled={!enabled}
          className="inline-flex h-7 items-center gap-1 rounded-md border px-2 text-xs hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reload
        </button>
      </div>

      <div className="min-h-0 flex-1 bg-white">
        {url ? (
          <iframe
            src={url}
            title="CodeSync Preview"
            className="h-full w-full border-0"
          />
        ) : error ? (
          <div className="flex h-full items-center justify-center p-6 text-center">
            <div>
              <p className="text-sm font-medium text-destructive">
                Preview failed
              </p>

              <p className="mt-2 max-w-md text-xs text-muted-foreground">
                {error}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {status}
          </div>
        )}
      </div>
    </div>
  );
};

export default WebContainerPreview;
