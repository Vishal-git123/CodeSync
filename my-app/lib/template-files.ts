export type PlaygroundTemplate =
  | "REACT"
  | "NEXTJS"
  | "EXPRESS"
  | "VUE"
  | "HONO"
  | "ANGULAR";

export interface TemplateFile {
  name: string;
  path: string;
  language: string;
  content: string;
  isFolder?: boolean;
}

const reactFiles: TemplateFile[] = [
  {
    name: "package.json",
    path: "package.json",
    language: "json",
    content: JSON.stringify(
      {
        name: "codesync-react-project",
        version: "1.0.0",
        private: true,
        scripts: {
          start: "vite",
          build: "vite build",
          dev: "vite",
        },
        dependencies: {
          react: "^19.0.0",
          "react-dom": "^19.0.0",
        },
        devDependencies: {
          "@vitejs/plugin-react": "latest",
          vite: "latest",
        },
      },
      null,
      2,
    ),
  },
  {
    name: "App.jsx",
    path: "src/App.jsx",
    language: "javascript",
    content: `export default function App() {
  return (
    <div>
      <h1>Hello from CodeSync!</h1>
    </div>
  );
}
`,
  },
  {
    name: "main.jsx",
    path: "src/main.jsx",
    language: "javascript",
    content: `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
`,
  },
  {
    name: "index.html",
    path: "index.html",
    language: "html",
    content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CodeSync Project</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
  },
];

const expressFiles: TemplateFile[] = [
  {
    name: "package.json",
    path: "package.json",
    language: "json",
    content: JSON.stringify(
      {
        name: "codesync-express-project",
        version: "1.0.0",
        private: true,
        scripts: {
          start: "node src/index.js",
          dev: "node --watch src/index.js",
        },
        dependencies: {
          express: "latest",
        },
      },
      null,
      2,
    ),
  },
  {
    name: "index.js",
    path: "src/index.js",
    language: "javascript",
    content: `const express = require("express");

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.json({
    message: "Hello from CodeSync + Express!",
  });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`,
  },
];

export const getTemplateFiles = (
  template: PlaygroundTemplate,
): TemplateFile[] => {
  switch (template) {
    case "REACT":
      return reactFiles;

    case "EXPRESS":
      return expressFiles;

    case "NEXTJS":
    case "VUE":
    case "HONO":
    case "ANGULAR":
      return [];

    default:
      return [];
  }
};
