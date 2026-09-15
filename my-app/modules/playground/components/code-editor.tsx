"use client";

import Editor, { OnMount } from "@monaco-editor/react";
import { useRef } from "react";
import type * as Monaco from "monaco-editor";

interface CodeEditorProps {
  value: string;
  language?: string;
  onChange: (value: string) => void;
}

const CodeEditor = ({
  value,
  language = "javascript",
  onChange,
}: CodeEditorProps) => {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        width="100%"
        language={language}
        value={value}
        theme="vs-dark"
        onMount={handleMount}
        onChange={(nextValue) => onChange(nextValue ?? "")}
        options={{
          automaticLayout: true,
          minimap: {
            enabled: false,
          },
          fontSize: 14,
          tabSize: 2,
          wordWrap: "on",
          padding: {
            top: 12,
          },
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
};

export default CodeEditor;
