"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { useState } from "react";
import {
  MoreHorizontal,
  Edit3,
  Trash2,
  ExternalLink,
  Copy,
  Link2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

import type { Project } from "../types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProjectTableProps {
  projects: Project[];

  onUpdateProject?: (
    id: string,
    data: {
      title: string;
      description: string;
    },
  ) => Promise<void>;

  onDeleteProject?: (id: string) => Promise<void>;

  onDuplicateProject?: (id: string) => Promise<void>;
}

interface EditProjectData {
  title: string;
  description: string;
}

export default function ProjectTable({
  projects,
  onUpdateProject,
  onDeleteProject,
  onDuplicateProject,
}: ProjectTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [editData, setEditData] = useState<EditProjectData>({
    title: "",
    description: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleEditClick = (project: Project) => {
    setSelectedProject(project);

    setEditData({
      title: project.title,
      description: project.description || "",
    });

    setEditDialogOpen(true);
  };

  const handleDeleteClick = (project: Project) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  const handleUpdateProject = async () => {
    if (!selectedProject || !onUpdateProject) {
      return;
    }

    setIsLoading(true);

    try {
      await onUpdateProject(selectedProject.id, editData);

      setEditDialogOpen(false);
      setSelectedProject(null);

      toast.success("Project updated successfully");
    } catch (error) {
      console.error("Error updating project:", error);

      toast.error("Failed to update project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject || !onDeleteProject) {
      return;
    }

    setIsLoading(true);

    try {
      await onDeleteProject(selectedProject.id);

      setDeleteDialogOpen(false);
      setSelectedProject(null);

      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);

      toast.error("Failed to delete project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicateProject = async (project: Project) => {
    if (!onDuplicateProject) {
      return;
    }

    setIsLoading(true);

    try {
      await onDuplicateProject(project.id);

      toast.success("Project duplicated successfully");
    } catch (error) {
      console.error("Error duplicating project:", error);

      toast.error("Failed to duplicate project");
    } finally {
      setIsLoading(false);
    }
  };

  const copyProjectUrl = async (projectId: string) => {
    const url = `${window.location.origin}/playground/${projectId}`;

    try {
      await navigator.clipboard.writeText(url);

      toast.success("Project URL copied to clipboard");
    } catch (error) {
      console.error("Failed to copy URL:", error);

      toast.error("Failed to copy project URL");
    }
  };

  return (
    <>
      <div className="w-full overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>

              <TableHead>Template</TableHead>

              <TableHead>Created</TableHead>

              <TableHead>User</TableHead>

              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                {/* Project */}
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <Link
                      href={`/playground/${project.id}`}
                      className="hover:underline"
                    >
                      <span className="font-semibold">{project.title}</span>
                    </Link>

                    <span className="line-clamp-1 text-sm text-muted-foreground">
                      {project.description || "No description"}
                    </span>
                  </div>
                </TableCell>

                {/* Template */}
                <TableCell>
                  <Badge
                    variant="outline"
                    className="border-[#E93F3F] bg-[#E93F3F15] text-[#E93F3F]"
                  >
                    {project.template}
                  </Badge>
                </TableCell>

                {/* Created */}
                <TableCell>
                  {format(new Date(project.createdAt), "MMM d, yyyy")}
                </TableCell>

                {/* User */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 overflow-hidden rounded-full">
                      <Image
                        src={project.user.image || "/placeholder.svg"}
                        alt={project.user.name || "User"}
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <span className="text-sm">
                      {project.user.name || "User"}
                    </span>
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                          aria-label={`Open actions for ${project.title}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open project actions</span>
                        </button>
                      }
                    />

                    <DropdownMenuContent align="end" className="w-52">
                      {/* Open Project */}
                      <DropdownMenuItem
                        render={
                          <Link
                            href={`/playground/${project.id}`}
                            className="flex items-center"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Open Project
                          </Link>
                        }
                      />

                      {/* Open in New Tab */}
                      <DropdownMenuItem
                        render={
                          <Link
                            href={`/playground/${project.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open in New Tab
                          </Link>
                        }
                      />

                      <DropdownMenuSeparator />

                      {/* Edit */}
                      <DropdownMenuItem
                        onClick={() => handleEditClick(project)}
                      >
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit Project
                      </DropdownMenuItem>

                      {/* Duplicate */}
                      <DropdownMenuItem
                        onClick={() => handleDuplicateProject(project)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>

                      {/* Copy URL */}
                      <DropdownMenuItem
                        onClick={() => copyProjectUrl(project.id)}
                      >
                        <Link2 className="mr-2 h-4 w-4" />
                        Copy URL
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {/* Delete */}
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(project)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Project Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>

            <DialogDescription>
              Update your project details and save your changes.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Project Title</Label>

              <Input
                id="title"
                value={editData.title}
                onChange={(event) =>
                  setEditData((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
                placeholder="Enter project title"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>

              <Textarea
                id="description"
                value={editData.description}
                onChange={(event) =>
                  setEditData((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Enter project description"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleUpdateProject}
              disabled={isLoading || !editData.title.trim()}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{selectedProject?.title}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
