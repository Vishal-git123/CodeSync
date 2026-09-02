"use server";
import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/actions";

export const getAllPlaygroundForUser = async () => {
  const user = await currentUser();
  try {
    const playground = await db.playground.findMany({
      where: {
        userId: user?.id,
      },
      include: {
        user: true,
      },
    });
    return playground;
  } catch (error) {
    console.log(error);
  }
};

export const deleteProject = async (id: string) => {
  try {
    const deletedProject = await db.playground.delete({
      where: { id },
    });
    return deletedProject;
  } catch (error) {
    console.log(error);
  }
};

export const updateProject = async (
  id: string,
  data: { title?: string; description?: string },
) => {
  try {
    const updatedProject = await db.playground.update({
      where: { id },
      data,
    });
    return updatedProject;
  } catch (error) {
    console.log(error);
  }
};

export const duplicateProject = async (id: string) => {
  try {
    const originalProject = await db.playground.findUnique({
      where: { id },
    });

    if (!originalProject) {
      throw new Error("Project not found");
    }

    const { id: _id, ...projectData } = originalProject;

    const duplicatedProject = await db.playground.create({
      data: {
        ...projectData,
        title: `${originalProject.title} (Copy)`,
      },
    });

    return duplicatedProject;
  } catch (error) {
    console.log(error);
  }
};
