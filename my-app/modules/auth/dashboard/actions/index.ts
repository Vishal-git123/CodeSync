"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/actions";
import { revalidatePath } from "next/cache";
import { getTemplateFiles } from "@/lib/template-files";

// ==========================================
// GET ALL PLAYGROUNDS
// ==========================================

export const getAllPlaygroundForUser = async () => {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error("Authentication required");
  }

  try {
    const playgrounds = await db.playground.findMany({
      where: {
        userId: user.id,
      },

      include: {
        user: true,

        starMarks: {
          where: {
            userId: user.id,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return playgrounds;
  } catch (error) {
    console.error("Failed to fetch playgrounds:", error);

    throw new Error("Failed to fetch playgrounds");
  }
};

// ==========================================
// CREATE PLAYGROUND
// ==========================================

export const createPlayground = async (data: {
  title: string;
  template: "REACT" | "NEXTJS" | "EXPRESS" | "VUE" | "HONO" | "ANGULAR";
  description?: string;
}) => {
  const user = await currentUser();

  const { template, title, description } = data;

  try {
    if (!user?.id) {
      throw new Error("Authentication required to create playground");
    }

    const playground = await db.playground.create({
      data: {
        title,
        description,
        template,
        userId: user.id,
      },
    });

    const templateFiles = getTemplateFiles(template);

    console.log("TEMPLATE:", template);

    console.log("FILES TO CREATE:", templateFiles);

    if (templateFiles.length > 0) {
      await db.playgroundFile.createMany({
        data: templateFiles.map((file) => ({
          name: file.name,
          path: file.path,
          content: file.content,
          language: file.language,
          isFolder: file.isFolder ?? false,
          playgroundId: playground.id,
        })),
      });
    }

    const savedFiles = await db.playgroundFile.findMany({
      where: {
        playgroundId: playground.id,
      },
    });

    console.log("SAVED FILES:", savedFiles);

    revalidatePath("/dashboard");
    revalidatePath("/playgrounds");
    revalidatePath("/playground", "layout");

    return playground;
  } catch (error) {
    console.error("Create playground error:", error);

    throw new Error("Failed to create playground");
  }
};

// ==========================================
// DELETE PLAYGROUND
// ==========================================

export const deleteProjectById = async (id: string) => {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error("Authentication required");
  }

  try {
    await db.playground.delete({
      where: {
        id,
        userId: user.id,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/playgrounds");
    revalidatePath("/playground", "layout");
  } catch (error) {
    console.error("Delete project error:", error);

    throw new Error("Failed to delete project");
  }
};

// ==========================================
// EDIT PLAYGROUND
// ==========================================

export const editProjectById = async (
  id: string,
  data: {
    title: string;
    description: string;
  },
) => {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error("Authentication required");
  }

  try {
    await db.playground.update({
      where: {
        id,
        userId: user.id,
      },
      data,
    });

    revalidatePath("/dashboard");
    revalidatePath("/playgrounds");
    revalidatePath("/playground", "layout");
  } catch (error) {
    console.error("Update project error:", error);

    throw new Error("Failed to update project");
  }
};

// ==========================================
// DUPLICATE PLAYGROUND
// ==========================================

export const duplicateProjectById = async (id: string): Promise<void> => {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error("Authentication required");
  }

  try {
    const originalPlayground = await db.playground.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!originalPlayground) {
      throw new Error("Project not found");
    }

    const duplicatedPlayground = await db.playground.create({
      data: {
        title: `${originalPlayground.title} copy`,
        description: originalPlayground.description,
        template: originalPlayground.template,
        userId: user.id,
      },
    });

    // Duplicate all files/folders
    const originalFiles = await db.playgroundFile.findMany({
      where: {
        playgroundId: originalPlayground.id,
      },
    });

    if (originalFiles.length > 0) {
      await db.playgroundFile.createMany({
        data: originalFiles.map((file) => ({
          name: file.name,
          path: file.path,
          content: file.content,
          language: file.language,
          isFolder: file.isFolder,
          playgroundId: duplicatedPlayground.id,
        })),
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/playgrounds");
    revalidatePath("/playground", "layout");

    return;
  } catch (error) {
    console.error("Duplicate project error:", error);

    throw new Error("Failed to duplicate project");
  }
};
