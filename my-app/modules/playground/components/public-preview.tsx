"use client";

import WebContainerPreview from "./webcontainer-preview";

interface PublicPreviewProps {
  projectTitle: string;

  files: {
    id: string;
    name: string;
    path: string;
    content: string;
    language: string | null;
    isFolder: boolean;
  }[];
}

const PublicPreview = ({ projectTitle, files }: PublicPreviewProps) => {
  const previewFiles = files.map((file) => ({
    path: file.path,
    content: file.content,
    isFolder: file.isFolder,
  }));

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-12 shrink-0 items-center border-b px-4">
        <span className="text-sm font-semibold">{projectTitle}</span>

        <span className="ml-3 text-xs text-muted-foreground">
          CodeSync Preview
        </span>
      </header>

      <div className="min-h-0 flex-1">
        <WebContainerPreview files={previewFiles} enabled={true} />
      </div>
    </div>
  );
};

export default PublicPreview;
