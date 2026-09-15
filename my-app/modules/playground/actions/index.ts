"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/actions";

export const getPlaygroundFiles = async (playgroundId: string) => {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error("Authentication required");
  }

  const playground = await db.playground.findFirst({
    where: {
      id: playgroundId,
      userId: user.id,
    },
  });

  if (!playground) {
    throw new Error("Playground not found");
  }

  return db.playgroundFile.findMany({
    where: {
      playgroundId,
    },
    orderBy: {
      path: "asc",
    },
  });
};

export const savePlaygroundFile = async (
  playgroundId: string,
  fileId: string,
  content: string,
) => {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error("Authentication required");
  }

  const playground = await db.playground.findFirst({
    where: {
      id: playgroundId,
      userId: user.id,
    },
  });

  if (!playground) {
    throw new Error("Playground not found");
  }

  const file = await db.playgroundFile.findFirst({
    where: {
      id: fileId,
      playgroundId,
    },
  });

  if (!file) {
    throw new Error("File not found");
  }

  return db.playgroundFile.update({
    where: {
      id: fileId,
    },
    data: {
      content,
    },
  });
};

export const createPlaygroundFile = async (
  playgroundId: string,
  data: {
    name: string;
    path: string;
    content?: string;
    language?: string;
    isFolder?: boolean;
  },
) => {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error("Authentication required");
  }

  const playground = await db.playground.findFirst({
    where: {
      id: playgroundId,
      userId: user.id,
    },
  });

  if (!playground) {
    throw new Error("Playground not found");
  }

  return db.playgroundFile.create({
    data: {
      name: data.name,
      path: data.path,
      content: data.content ?? "",
      language: data.language ?? "plaintext",
      isFolder: data.isFolder ?? false,
      playgroundId,
    },
  });
};

export const createPlaygroundFolder = async (
  playgroundId: string,
  data: {
    name: string;
    path: string;
  },
) => {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error("Authentication required");
  }

  const playground = await db.playground.findFirst({
    where: {
      id: playgroundId,
      userId: user.id,
    },
  });

  if (!playground) {
    throw new Error("Playground not found");
  }

  const existing = await db.playgroundFile.findFirst({
    where: {
      playgroundId,
      path: data.path,
    },
  });

  if (existing) {
    throw new Error("A file or folder already exists at this path");
  }

  return db.playgroundFile.create({
    data: {
      name: data.name,
      path: data.path,
      content: "",
      language: "plaintext",
      isFolder: true,
      playgroundId,
    },
  });
};

export const createPlaygroundFileInFolder = async (
  playgroundId: string,
  data: {
    name: string;
    folderPath: string;
    content?: string;
    language?: string;
  },
) => {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error("Authentication required");
  }

  const playground = await db.playground.findFirst({
    where: {
      id: playgroundId,
      userId: user.id,
    },
  });

  if (!playground) {
    throw new Error("Playground not found");
  }

  const filePath = `${data.folderPath}/${data.name}`;

  const existing = await db.playgroundFile.findFirst({
    where: {
      playgroundId,
      path: filePath,
    },
  });

  if (existing) {
    throw new Error("A file or folder already exists at this path");
  }

  return db.playgroundFile.create({
    data: {
      name: data.name,
      path: filePath,
      content: data.content ?? "",
      language: data.language ?? "plaintext",
      isFolder: false,
      playgroundId,
    },
  });
};

export const renamePlaygroundFile = async (
  playgroundId: string,
  fileId: string,
  name: string,
  path: string,
) => {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error("Authentication required");
  }

  const playground = await db.playground.findFirst({
    where: {
      id: playgroundId,
      userId: user.id,
    },
  });

  if (!playground) {
    throw new Error("Playground not found");
  }

  const target = await db.playgroundFile.findFirst({
    where: {
      id: fileId,
      playgroundId,
    },
  });

  if (!target) {
    throw new Error("File or folder not found");
  }

  const existing = await db.playgroundFile.findFirst({
    where: {
      playgroundId,
      path,
      NOT: {
        id: fileId,
      },
    },
  });

  if (existing) {
    throw new Error("A file or folder already exists at this path");
  }

  // Normal file rename
  if (!target.isFolder) {
    return db.playgroundFile.update({
      where: {
        id: fileId,
      },
      data: {
        name,
        path,
      },
    });
  }

  // Folder rename
  const oldPath = target.path;

  const descendants = await db.playgroundFile.findMany({
    where: {
      playgroundId,
      path: {
        startsWith: `${oldPath}/`,
      },
    },
  });

  await db.playgroundFile.update({
    where: {
      id: fileId,
    },
    data: {
      name,
      path,
    },
  });

  for (const child of descendants) {
    const newChildPath = child.path.replace(`${oldPath}/`, `${path}/`);

    await db.playgroundFile.update({
      where: {
        id: child.id,
      },
      data: {
        path: newChildPath,
      },
    });
  }

  return {
    ...target,
    name,
    path,
  };
};

export const deletePlaygroundFile = async (
  playgroundId: string,
  fileId: string,
) => {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error("Authentication required");
  }

  const playground = await db.playground.findFirst({
    where: {
      id: playgroundId,
      userId: user.id,
    },
  });

  if (!playground) {
    throw new Error("Playground not found");
  }

  const target = await db.playgroundFile.findFirst({
    where: {
      id: fileId,
      playgroundId,
    },
  });

  if (!target) {
    throw new Error("File or folder not found");
  }

  if (target.isFolder) {
    await db.playgroundFile.deleteMany({
      where: {
        playgroundId,
        OR: [
          {
            id: fileId,
          },
          {
            path: {
              startsWith: `${target.path}/`,
            },
          },
        ],
      },
    });
  } else {
    await db.playgroundFile.delete({
      where: {
        id: fileId,
      },
    });
  }

  return {
    success: true,
  };
};

// ==========================================
// AI CHAT HISTORY ACTIONS
// ==========================================

export const createAIConversation = async (
  playgroundId: string,
  title = "New AI Chat",
) => {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error("Authentication required");
  }

  const playground = await db.playground.findFirst({
    where: {
      id: playgroundId,
      userId: user.id,
    },
  });

  if (!playground) {
    throw new Error("Playground not found");
  }

  return db.aIConversation.create({
    data: {
      title,
      userId: user.id,
      playgroundId,
    },
  });
};

export const getAIConversations = async (playgroundId: string) => {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error("Authentication required");
  }

  const playground = await db.playground.findFirst({
    where: {
      id: playgroundId,
      userId: user.id,
    },
  });

  if (!playground) {
    throw new Error("Playground not found");
  }

  return db.aIConversation.findMany({
    where: {
      playgroundId,
      userId: user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
};

export const getAIConversation = async (
  playgroundId: string,
  conversationId: string,
) => {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error("Authentication required");
  }

  return db.aIConversation.findFirst({
    where: {
      id: conversationId,
      playgroundId,
      userId: user.id,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
};

export const saveAIMessage = async (
  conversationId: string,
  role: string,
  content: string,
) => {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error("Authentication required");
  }

  const conversation = await db.aIConversation.findFirst({
    where: {
      id: conversationId,
      userId: user.id,
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const message = await db.aIMessage.create({
    data: {
      conversationId,
      role,
      content,
    },
  });

  await db.aIConversation.update({
    where: {
      id: conversationId,
    },
    data: {
      updatedAt: new Date(),
    },
  });

  return message;
};

export const deleteAIConversation = async (
  playgroundId: string,
  conversationId: string,
) => {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error("Authentication required");
  }

  const conversation = await db.aIConversation.findFirst({
    where: {
      id: conversationId,
      playgroundId,
      userId: user.id,
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  await db.aIConversation.delete({
    where: {
      id: conversationId,
    },
  });

  return {
    success: true,
  };
};

export const renameAIConversation = async (
  conversationId: string,
  title: string,
) => {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error("Authentication required");
  }

  const conversation = await db.aIConversation.findFirst({
    where: {
      id: conversationId,
      userId: user.id,
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  return db.aIConversation.update({
    where: {
      id: conversationId,
    },
    data: {
      title: title.trim() || "New AI Chat",
    },
  });
};
