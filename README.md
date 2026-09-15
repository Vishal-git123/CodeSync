# CodeSync 🚀

> A browser-based AI-powered coding playground for writing, running, debugging, and sharing web projects.

CodeSync is a full-stack browser IDE that brings together a **Monaco code editor, file explorer, terminal, WebContainer-based execution, live preview, and a local AI coding assistant powered by Ollama/Qwen**.

It also supports **persistent projects, AI chat history, AI-generated code application, and shareable live previews**.

---

## ✨ Features

### 🧑‍💻 Browser-Based Code Editor
- Monaco Editor integration
- Syntax highlighting
- Multiple open files and tabs
- Unsaved file indicators
- Create, rename, and delete files
- Create nested folders
- Persistent file contents

### ⚡ Run Projects in the Browser
- WebContainer-powered execution
- Run projects directly inside the browser
- Integrated terminal
- Live preview
- Automatic file synchronization between editor and runtime

### 🤖 AI Coding Assistant
Powered by **Ollama + Qwen 2.5 Coder**

- Explain code
- Find and fix bugs
- Refactor code
- Ask custom coding questions
- Apply AI-generated code directly to Monaco Editor
- Copy AI responses
- Persistent AI chat history
- Reopen previous conversations
- Delete conversations

### 🔗 Shareable Project Preview
- Make a playground public
- Generate a shareable preview URL
- Anyone with the URL can view the running project
- Preview project files directly through WebContainer

### 📁 Project Management
- Create playgrounds from predefined templates
- React
- Next.js
- Express
- Vue
- Hono
- Angular
- Dashboard for managing projects
- Starred and recent playgrounds
- Duplicate, edit, and delete projects

### 🔐 Authentication
- NextAuth-based authentication
- GitHub authentication
- Google authentication
- User-specific projects and AI conversations

### 💾 Persistent Storage
- MongoDB database
- Prisma ORM
- Project files stored persistently
- AI conversations and messages stored in MongoDB
- User/project relationships

---

## 🏗️ Architecture

```text
                         ┌───────────────────────┐
                         │       CodeSync        │
                         │      Next.js App      │
                         └───────────┬───────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
              ▼                      ▼                      ▼
      ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
      │ Monaco Editor │      │ WebContainer  │      │ AI Assistant  │
      │               │      │               │      │               │
      │ Code Editing  │      │ Runtime       │      │ Ollama/Qwen   │
      │ Tabs          │      │ Terminal      │      │ Explain       │
      │ Files         │      │ Live Preview  │      │ Fix           │
      └───────────────┘      └───────────────┘      │ Refactor      │
                                                      └───────┬───────┘
                                                              │
                                                              ▼
                                                       ┌──────────────┐
                                                       │   /api/ai    │
                                                       │ Next.js API  │
                                                       └──────┬───────┘
                                                              │
                                                              ▼
                                                       ┌──────────────┐
                                                       │ Ollama/Qwen  │
                                                       └──────────────┘

                         ┌────────────────────────────┐
                         │         MongoDB            │
                         │                            │
                         │ User                       │
                         │ Playground                 │
                         │ PlaygroundFile             │
                         │ AIConversation              │
                         │ AIMessage                  │
                         │ StarMark                   │
                         └────────────────────────────┘
my-app/
│
├── app/
│   ├── api/
│   │   └── ai/
│   │
│   ├── dashboard/
│   │
│   ├── playground/
│   │   └── [id]/
│   │
│   ├── playgrounds/
│   │
│   ├── preview/
│   │   └── [id]/
│   │
│   └── auth/
│
├── components/
│   └── ui/
│
├── modules/
│   ├── auth/
│   └── playground/
│       ├── actions/
│       └── components/
│
├── lib/
│   ├── db.ts
│   └── template-files.ts
│
├── prisma/
│   └── schema.prisma
│
├── public/
│
├── package.json
└── README.md
👨‍💻 Author

Vishal

GitHub:
https://github.com/Vishal-git123
⭐ Support

If you find CodeSync useful, consider giving the repository a ⭐ on GitHub.
