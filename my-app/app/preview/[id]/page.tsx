import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import PublicPreview from "@/modules/playground/components/public-preview";

interface PreviewPageProps {
  params: Promise<{
    id: string;
  }>;
}

const PreviewPage = async ({ params }: PreviewPageProps) => {
  const { id } = await params;

  const playground = await db.playground.findFirst({
    where: {
      id,
      isPublic: true,
    },
    include: {
      files: {
        orderBy: {
          path: "asc",
        },
      },
    },
  });

  if (!playground) {
    notFound();
  }

  return (
    <div className="h-screen w-full">
      <PublicPreview projectTitle={playground.title} files={playground.files} />
    </div>
  );
};

export default PreviewPage;
