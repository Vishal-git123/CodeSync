"use client";

import { useMemo, useState } from "react";
import {
  Play,
  Save,
  X,
  Circle,
  PanelRight,
  Terminal as TerminalIcon,
  Bot,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import type { WebContainer } from "@webcontainer/api";

import CodeEditor from "./code-editor";
import FileExplorer, { type ProjectFile } from "./file-explorer";
import WebContainerPreview from "./webcontainer-preview";
import Terminal from "./terminal";
import AIAssistant from "./ai-assistant";

import {
  createPlaygroundFile,
  createPlaygroundFileInFolder,
  createPlaygroundFolder,
  deletePlaygroundFile,
  renamePlaygroundFile,
  savePlaygroundFile,
  togglePlaygroundPublic,
} from "../actions";

interface PlaygroundWorkspaceProps {
  projectTitle: string;
  projectTemplate: string;
  playgroundId: string;
  initialFiles: ProjectFile[];
}

const getLanguageFromFileName = (fileName: string) => {
  if (fileName.endsWith(".json")) return "json";
  if (fileName.endsWith(".html")) return "html";
  if (fileName.endsWith(".css")) return "css";
  if (fileName.endsWith(".tsx")) return "typescript";
  if (fileName.endsWith(".ts")) return "typescript";
  if (fileName.endsWith(".jsx")) return "javascript";
  if (fileName.endsWith(".js")) return "javascript";
  if (fileName.endsWith(".md")) return "markdown";

  return "plaintext";
};

const PlaygroundWorkspace = ({
  projectTitle,
  projectTemplate,
  playgroundId,
  initialFiles,
}: PlaygroundWorkspaceProps) => {
  const [files, setFiles] = useState<ProjectFile[]>(initialFiles);

  const [activeFileId, setActiveFileId] = useState(
    initialFiles.find((file) => !file.isFolder)?.id ?? "",
  );

  const [openFileIds, setOpenFileIds] = useState<string[]>(
    initialFiles.find((file) => !file.isFolder)?.id
      ? [initialFiles.find((file) => !file.isFolder)!.id]
      : [],
  );

  const [dirtyFileIds, setDirtyFileIds] = useState<Set<string>>(new Set());

  const [isSaving, setIsSaving] = useState(false);

  const [isCreating, setIsCreating] = useState(false);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  const [isAIOpen, setIsAIOpen] = useState(false);

  const [isPublic, setIsPublic] = useState(false);

  const [isSharing, setIsSharing] = useState(false);

  const [webContainer, setWebContainer] = useState<WebContainer | null>(null);

  const activeFile = useMemo(
    () =>
      files.find((file) => file.id === activeFileId) ??
      files.find((file) => !file.isFolder),
    [files, activeFileId],
  );

  const openFiles = useMemo(
    () =>
      openFileIds
        .map((id) => files.find((file) => file.id === id))
        .filter((file): file is ProjectFile => Boolean(file && !file.isFolder)),
    [files, openFileIds],
  );

  const syncFileToContainer = async (filePath: string, content: string) => {
    if (!webContainer) return;

    const normalizedPath = filePath.startsWith("/") ? filePath : `/${filePath}`;

    try {
      await webContainer.fs.writeFile(normalizedPath, content);
    } catch (error) {
      console.error("WebContainer file sync error:", error);
    }
  };

  const syncFolderToContainer = async (folderPath: string) => {
    if (!webContainer) return;

    const normalizedPath = folderPath.startsWith("/")
      ? folderPath
      : `/${folderPath}`;

    try {
      await webContainer.fs.mkdir(normalizedPath, {
        recursive: true,
      });
    } catch (error) {
      console.error("WebContainer folder sync error:", error);
    }
  };

  const handleSelectFile = (fileId: string) => {
    const file = files.find((item) => item.id === fileId);

    if (!file || file.isFolder) return;

    setActiveFileId(fileId);

    setOpenFileIds((current) =>
      current.includes(fileId) ? current : [...current, fileId],
    );
  };

  const handleCloseTab = (fileId: string) => {
    if (dirtyFileIds.has(fileId)) {
      const confirmed = window.confirm(
        "This file has unsaved changes. Close anyway?",
      );

      if (!confirmed) return;
    }

    const nextOpenFiles = openFileIds.filter((id) => id !== fileId);

    setOpenFileIds(nextOpenFiles);

    setDirtyFileIds((current) => {
      const next = new Set(current);
      next.delete(fileId);
      return next;
    });

    if (activeFileId === fileId) {
      const index = openFileIds.indexOf(fileId);

      const nextId =
        nextOpenFiles[index] ??
        nextOpenFiles[index - 1] ??
        nextOpenFiles[0] ??
        "";

      setActiveFileId(nextId);
    }
  };

  const handleCodeChange = async (content: string) => {
    if (!activeFileId) return;

    const currentFile = files.find((file) => file.id === activeFileId);

    if (!currentFile || currentFile.isFolder) {
      return;
    }

    setFiles((currentFiles) =>
      currentFiles.map((file) =>
        file.id === activeFileId
          ? {
              ...file,
              content,
            }
          : file,
      ),
    );

    setDirtyFileIds((current) => {
      const next = new Set(current);
      next.add(activeFileId);
      return next;
    });

    await syncFileToContainer(currentFile.path, content);
  };

  const handleSave = async () => {
    if (!activeFile) {
      toast.error("No file selected");
      return;
    }

    setIsSaving(true);

    try {
      await savePlaygroundFile(playgroundId, activeFile.id, activeFile.content);

      setDirtyFileIds((current) => {
        const next = new Set(current);
        next.delete(activeFile.id);
        return next;
      });

      await syncFileToContainer(activeFile.path, activeFile.content);

      toast.success(`${activeFile.name} saved successfully`);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save file");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateFile = async () => {
    if (isCreating) return;

    const fileName = window.prompt("Enter file name");

    if (!fileName?.trim()) return;

    const cleanName = fileName.trim();

    if (files.some((file) => file.path === cleanName)) {
      toast.error("A file or folder with this name already exists");
      return;
    }

    setIsCreating(true);

    try {
      const newFile = await createPlaygroundFile(playgroundId, {
        name: cleanName,
        path: cleanName,
        content: "",
        language: getLanguageFromFileName(cleanName),
        isFolder: false,
      });

      const projectFile: ProjectFile = {
        id: newFile.id,
        name: newFile.name,
        path: newFile.path,
        content: newFile.content,
        language: newFile.language ?? "plaintext",
        isFolder: newFile.isFolder,
      };

      setFiles((current) => [...current, projectFile]);

      setOpenFileIds((current) => [...current, projectFile.id]);

      setActiveFileId(projectFile.id);

      await syncFileToContainer(projectFile.path, projectFile.content);

      toast.success(`${cleanName} created`);
    } catch (error) {
      console.error("Create file error:", error);
      toast.error("Failed to create file");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateFolder = async () => {
    if (isCreating) return;

    const folderName = window.prompt("Enter folder name");

    if (!folderName?.trim()) return;

    const cleanName = folderName.trim();

    if (files.some((file) => file.path === cleanName)) {
      toast.error("A file or folder with this name already exists");
      return;
    }

    setIsCreating(true);

    try {
      const newFolder = await createPlaygroundFolder(playgroundId, {
        name: cleanName,
        path: cleanName,
      });

      const folder: ProjectFile = {
        id: newFolder.id,
        name: newFolder.name,
        path: newFolder.path,
        content: "",
        language: "plaintext",
        isFolder: true,
      };

      setFiles((current) => [...current, folder]);

      await syncFolderToContainer(folder.path);

      toast.success(`${cleanName} folder created`);
    } catch (error) {
      console.error("Create folder error:", error);
      toast.error("Failed to create folder");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateFileInFolder = async (folder: ProjectFile) => {
    if (isCreating) return;

    const fileName = window.prompt(`Enter file name inside "${folder.name}"`);

    if (!fileName?.trim()) return;

    const cleanName = fileName.trim();

    const path = `${folder.path}/${cleanName}`;

    if (files.some((file) => file.path === path)) {
      toast.error("A file or folder with this name already exists");
      return;
    }

    setIsCreating(true);

    try {
      const newFile = await createPlaygroundFileInFolder(playgroundId, {
        name: cleanName,
        folderPath: folder.path,
        content: "",
        language: getLanguageFromFileName(cleanName),
      });

      const projectFile: ProjectFile = {
        id: newFile.id,
        name: newFile.name,
        path: newFile.path,
        content: newFile.content,
        language: newFile.language ?? "plaintext",
        isFolder: newFile.isFolder,
      };

      setFiles((current) => [...current, projectFile]);

      setOpenFileIds((current) => [...current, projectFile.id]);

      setActiveFileId(projectFile.id);

      await syncFileToContainer(projectFile.path, projectFile.content);

      toast.success(`${cleanName} created`);
    } catch (error) {
      console.error("Create nested file error:", error);
      toast.error("Failed to create file");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateFolderInFolder = async (parentFolder: ProjectFile) => {
    if (isCreating) return;

    const folderName = window.prompt(
      `Enter folder name inside "${parentFolder.name}"`,
    );

    if (!folderName?.trim()) return;

    const cleanName = folderName.trim();

    const path = `${parentFolder.path}/${cleanName}`;

    if (files.some((file) => file.path === path)) {
      toast.error("A file or folder with this name already exists");
      return;
    }

    setIsCreating(true);

    try {
      const newFolder = await createPlaygroundFolder(playgroundId, {
        name: cleanName,
        path,
      });

      const folder: ProjectFile = {
        id: newFolder.id,
        name: newFolder.name,
        path: newFolder.path,
        content: "",
        language: "plaintext",
        isFolder: true,
      };

      setFiles((current) => [...current, folder]);

      await syncFolderToContainer(folder.path);

      toast.success(`${cleanName} folder created`);
    } catch (error) {
      console.error("Create nested folder error:", error);
      toast.error("Failed to create folder");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRename = async (file: ProjectFile) => {
    const newName = window.prompt("Enter new name", file.name);

    if (!newName?.trim()) return;

    const cleanName = newName.trim();

    const slashIndex = file.path.lastIndexOf("/");

    const parentPath =
      slashIndex === -1 ? "" : file.path.substring(0, slashIndex);

    const newPath = parentPath ? `${parentPath}/${cleanName}` : cleanName;

    if (files.some((item) => item.id !== file.id && item.path === newPath)) {
      toast.error("A file or folder with this name already exists");
      return;
    }

    try {
      const updated = await renamePlaygroundFile(
        playgroundId,
        file.id,
        cleanName,
        newPath,
      );

      const oldPath = file.path;

      setFiles((current) =>
        current.map((item) => {
          if (item.id === file.id) {
            return {
              ...item,
              name: updated.name,
              path: updated.path,
            };
          }

          if (file.isFolder && item.path.startsWith(`${oldPath}/`)) {
            return {
              ...item,
              path: item.path.replace(`${oldPath}/`, `${newPath}/`),
            };
          }

          return item;
        }),
      );

      if (webContainer) {
        try {
          await webContainer.fs.rename(`/${oldPath}`, `/${newPath}`);
        } catch (error) {
          console.error("WebContainer rename error:", error);
        }
      }

      toast.success("Renamed successfully");
    } catch (error) {
      console.error("Rename error:", error);
      toast.error("Failed to rename");
    }
  };

  const handleDelete = async (file: ProjectFile) => {
    const confirmed = window.confirm(`Delete "${file.name}"?`);

    if (!confirmed) return;

    try {
      await deletePlaygroundFile(playgroundId, file.id);

      const deletedPath = file.path;

      setFiles((current) =>
        current.filter((item) => {
          if (item.id === file.id) {
            return false;
          }

          if (file.isFolder && item.path.startsWith(`${deletedPath}/`)) {
            return false;
          }

          return true;
        }),
      );

      if (file.isFolder) {
        const deletedOpenIds = openFiles
          .filter((openFile) => openFile.path.startsWith(`${deletedPath}/`))
          .map((openFile) => openFile.id);

        setOpenFileIds((current) =>
          current.filter((id) => !deletedOpenIds.includes(id)),
        );

        if (activeFile?.path.startsWith(`${deletedPath}/`)) {
          setActiveFileId("");
        }
      } else {
        if (webContainer) {
          try {
            await webContainer.fs.rm(`/${file.path}`);
          } catch (error) {
            console.error("WebContainer delete error:", error);
          }
        }

        handleCloseTab(file.id);
      }

      if (file.isFolder && webContainer) {
        try {
          await webContainer.fs.rm(`/${file.path}`, {
            recursive: true,
          });
        } catch (error) {
          console.error("WebContainer folder delete error:", error);
        }
      }

      toast.success(`${file.name} deleted`);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete");
    }
  };

  const handleRun = () => {
    setIsPreviewOpen(true);
    setIsTerminalOpen(true);
  };

  /*
   * AI generated code
   */
  const handleApplyAICode = async (newCode: string) => {
    if (!activeFile) {
      toast.error("No file selected");
      return;
    }

    await handleCodeChange(newCode);

    toast.success("AI code applied to editor");
  };

  /*
   * Share / Unshare Preview
   */
  const handleSharePreview = async () => {
    if (isSharing) return;

    try {
      setIsSharing(true);

      const nextPublic = !isPublic;

      await togglePlaygroundPublic(playgroundId, nextPublic);

      setIsPublic(nextPublic);

      if (nextPublic) {
        const previewUrl = `${window.location.origin}/preview/${playgroundId}`;

        await navigator.clipboard.writeText(previewUrl);

        toast.success("Preview link copied to clipboard");
      } else {
        toast.success("Preview sharing disabled");
      }
    } catch (error) {
      console.error("Share preview error:", error);

      toast.error("Failed to update preview sharing");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Top Bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold">{projectTitle}</h1>

          <p className="text-xs text-muted-foreground">{projectTemplate}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Save */}
          <button
            type="button"
            onClick={handleSave}
            disabled={!activeFile || isSaving}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />

            {isSaving ? "Saving..." : "Save"}
          </button>

          {/* Run */}
          <button
            type="button"
            onClick={handleRun}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            <Play className="h-4 w-4" />
            Run
          </button>

          {/* Share Preview */}
          <button
            type="button"
            onClick={handleSharePreview}
            disabled={isSharing}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Share2 className="h-4 w-4" />

            {isSharing ? "Sharing..." : isPublic ? "Unshare" : "Share Preview"}
          </button>

          {/* Preview */}
          {isPreviewOpen && (
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
            >
              <PanelRight className="h-4 w-4" />
              Preview
            </button>
          )}

          {/* Terminal */}
          {isTerminalOpen && (
            <button
              type="button"
              onClick={() => setIsTerminalOpen(false)}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
            >
              <TerminalIcon className="h-4 w-4" />
              Terminal
            </button>
          )}

          {/* AI */}
          <button
            type="button"
            onClick={() => setIsAIOpen((current) => !current)}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted ${
              isAIOpen ? "bg-muted" : ""
            }`}
          >
            <Bot className="h-4 w-4" />
            AI
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex min-h-0 flex-1">
        {/* Explorer */}
        <FileExplorer
          files={files}
          activeFileId={activeFileId}
          onSelectFile={handleSelectFile}
          onCreateFile={handleCreateFile}
          onCreateFolder={handleCreateFolder}
          onCreateFileInFolder={handleCreateFileInFolder}
          onCreateFolderInFolder={handleCreateFolderInFolder}
          onRename={handleRename}
          onDelete={handleDelete}
        />

        {/* Editor */}
        <section
          className={
            isPreviewOpen
              ? "flex min-w-0 w-1/2 flex-col border-r"
              : "flex min-w-0 flex-1 flex-col"
          }
        >
          {/* Tabs */}
          <div className="flex h-10 shrink-0 overflow-x-auto border-b bg-muted/30">
            {openFiles.map((file) => {
              const isActive = file.id === activeFileId;

              const isDirty = dirtyFileIds.has(file.id);

              return (
                <div
                  key={file.id}
                  className={`group flex min-w-[140px] max-w-[220px] items-center border-r ${
                    isActive ? "bg-background" : "bg-muted/20"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectFile(file.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left text-sm"
                  >
                    <span className="truncate">{file.name}</span>

                    {isDirty && (
                      <Circle className="h-2 w-2 shrink-0 fill-current" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCloseTab(file.id)}
                    className="mr-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-muted"
                    aria-label={`Close ${file.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}

            {openFiles.length === 0 && (
              <div className="flex items-center px-4 text-xs text-muted-foreground">
                No files open
              </div>
            )}
          </div>

          {/* Monaco */}
          <div className="min-h-0 flex-1">
            {activeFile ? (
              <CodeEditor
                value={activeFile.content}
                language={activeFile.language}
                onChange={handleCodeChange}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Select a file
              </div>
            )}
          </div>

          {/* Terminal */}
          {isTerminalOpen && webContainer && (
            <div className="h-64 shrink-0 border-t">
              <Terminal webContainer={webContainer} />
            </div>
          )}
        </section>

        {/* Preview */}
        {isPreviewOpen && (
          <section className="flex min-w-0 w-1/2">
            <WebContainerPreview
              files={files}
              enabled={isPreviewOpen}
              onContainerReady={setWebContainer}
            />
          </section>
        )}

        {/* AI Assistant */}
        {isAIOpen && activeFile && (
          <AIAssistant
            code={activeFile.content}
            language={activeFile.language}
            playgroundId={playgroundId}
            onApplyCode={handleApplyAICode}
          />
        )}
      </div>
    </div>
  );
};

export default PlaygroundWorkspace;
