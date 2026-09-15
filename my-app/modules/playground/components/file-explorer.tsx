"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileCode2,
  FileJson,
  FilePlus2,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  language: string;
  content: string;
  isFolder?: boolean;
}

interface FileExplorerProps {
  files: ProjectFile[];
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onCreateFile: () => void;
  onCreateFolder: () => void;
  onCreateFileInFolder: (folder: ProjectFile) => void;
  onCreateFolderInFolder: (folder: ProjectFile) => void;
  onRename: (file: ProjectFile) => void;
  onDelete: (file: ProjectFile) => void;
}

const getFileIcon = (fileName: string) => {
  if (fileName.endsWith(".json")) {
    return <FileJson className="h-4 w-4 shrink-0" />;
  }

  if (fileName.endsWith(".md") || fileName.endsWith(".txt")) {
    return <FileText className="h-4 w-4 shrink-0" />;
  }

  return <FileCode2 className="h-4 w-4 shrink-0" />;
};

const getParentPath = (path: string) => {
  const lastSlash = path.lastIndexOf("/");

  if (lastSlash === -1) {
    return "";
  }

  return path.substring(0, lastSlash);
};

const getDepth = (path: string) => {
  if (!path) {
    return 0;
  }

  return path.split("/").length - 1;
};

const FileExplorer = ({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onCreateFolder,
  onCreateFileInFolder,
  onCreateFolderInFolder,
  onRename,
  onDelete,
}: FileExplorerProps) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((current) => {
      const next = new Set(current);

      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }

      return next;
    });
  };

  const sortedFiles = [...files].sort((a, b) => {
    // Folders first
    if (a.isFolder && !b.isFolder) {
      return -1;
    }

    if (!a.isFolder && b.isFolder) {
      return 1;
    }

    // Then alphabetical
    return a.name.localeCompare(b.name);
  });

  const isVisible = (file: ProjectFile) => {
    const parentPath = getParentPath(file.path);

    // Root item
    if (!parentPath) {
      return true;
    }

    const parts = parentPath.split("/");

    let currentPath = "";

    for (const part of parts) {
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      const parentFolder = files.find(
        (item) => item.isFolder && item.path === currentPath,
      );

      if (parentFolder && !expandedFolders.has(parentFolder.id)) {
        return false;
      }
    }

    return true;
  };

  const visibleFiles = sortedFiles.filter(isVisible);

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r bg-background">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b px-3">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4" />

          <span className="text-sm font-semibold">Explorer</span>
        </div>

        <div className="flex items-center gap-1">
          {/* New File */}
          <button
            type="button"
            onClick={onCreateFile}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted"
            title="New File"
            aria-label="New File"
          >
            <Plus className="h-4 w-4" />
          </button>

          {/* New Folder */}
          <button
            type="button"
            onClick={onCreateFolder}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted"
            title="New Folder"
            aria-label="New Folder"
          >
            <FolderPlus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="mb-2 px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">
          Project
        </div>

        <div className="space-y-0.5">
          {visibleFiles.map((item) => {
            const depth = getDepth(item.path);

            /*
             * =========================
             * FOLDER
             * =========================
             */
            if (item.isFolder) {
              const isExpanded = expandedFolders.has(item.id);

              return (
                <div key={item.id}>
                  <div
                    className="group flex items-center rounded-md hover:bg-muted/70"
                    style={{
                      paddingLeft: `${depth * 16}px`,
                    }}
                  >
                    {/* Expand / Collapse */}
                    <button
                      type="button"
                      onClick={() => toggleFolder(item.id)}
                      className="inline-flex h-7 w-6 shrink-0 items-center justify-center rounded hover:bg-background"
                      aria-label={
                        isExpanded
                          ? `Collapse ${item.name}`
                          : `Expand ${item.name}`
                      }
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {/* Folder name */}
                    <button
                      type="button"
                      onClick={() => toggleFolder(item.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 px-1 py-1.5 text-left"
                    >
                      {isExpanded ? (
                        <FolderOpen className="h-4 w-4 shrink-0" />
                      ) : (
                        <Folder className="h-4 w-4 shrink-0" />
                      )}

                      <span className="truncate text-sm">{item.name}</span>
                    </button>

                    {/* Folder actions */}
                    <div className="hidden shrink-0 items-center gap-0.5 pr-1 group-hover:flex">
                      {/* New file inside folder */}
                      <button
                        type="button"
                        onClick={() => onCreateFileInFolder(item)}
                        className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-background"
                        title="New File"
                        aria-label="New File"
                      >
                        <FilePlus2 className="h-3.5 w-3.5" />
                      </button>

                      {/* New folder inside folder */}
                      <button
                        type="button"
                        onClick={() => onCreateFolderInFolder(item)}
                        className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-background"
                        title="New Folder"
                        aria-label="New Folder"
                      >
                        <FolderPlus className="h-3.5 w-3.5" />
                      </button>

                      {/* Rename */}
                      <button
                        type="button"
                        onClick={() => onRename(item)}
                        className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-background"
                        title="Rename"
                        aria-label="Rename"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-background"
                        title="Delete"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            /*
             * =========================
             * FILE
             * =========================
             */

            const isActive = item.id === activeFileId;

            return (
              <div
                key={item.id}
                className={`group flex items-center rounded-md ${
                  isActive ? "bg-muted" : "hover:bg-muted/70"
                }`}
                style={{
                  paddingLeft: `${depth * 16 + 24}px`,
                }}
              >
                {/* File */}
                <button
                  type="button"
                  onClick={() => onSelectFile(item.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 px-1 py-1.5 text-left"
                >
                  {getFileIcon(item.name)}

                  <span className="truncate text-sm">{item.name}</span>
                </button>

                {/* File actions */}
                <div className="hidden shrink-0 items-center gap-0.5 pr-1 group-hover:flex">
                  {/* Rename */}
                  <button
                    type="button"
                    onClick={() => onRename(item)}
                    className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-background"
                    title="Rename"
                    aria-label="Rename"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-background"
                    title="Delete"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Empty state */}
          {files.length === 0 && (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">
              No files found
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default FileExplorer;
