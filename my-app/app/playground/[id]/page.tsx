import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/actions";
import { getPlaygroundFiles } from "@/modules/playground/actions";
import { redirect } from "next/navigation";

import PlaygroundWorkspace from "@/modules/playground/components/playground-workspace";

interface PlaygroundPageProps {
  params: Promise<{
    id: string;
  }>;
}

const PlaygroundPage = async ({ params }: PlaygroundPageProps) => {
  const { id } = await params;

  const user = await currentUser();

  if (!user?.id) {
    redirect("/auth/sign-in");
  }

  const playground = await db.playground.findUnique({
    where: {
      id,
    },
  });

  if (!playground) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Project not found</h1>

          <p className="mt-2 text-muted-foreground">
            This playground does not exist.
          </p>
        </div>
      </div>
    );
  }

  if (playground.userId !== user.id) {
    redirect("/dashboard");
  }

  const playgroundFiles = await getPlaygroundFiles(id);

  return (
    <main className="h-screen overflow-hidden bg-background">
      <PlaygroundWorkspace
        projectTitle={playground.title}
        projectTemplate={playground.template}
        playgroundId={playground.id}
        initialFiles={playgroundFiles}
      />
    </main>
  );
};

export default PlaygroundPage;
