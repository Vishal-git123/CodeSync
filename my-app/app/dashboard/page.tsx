import React from 'react'
import  AddNewButton  from "@/modules/auth/dashboard/components/add-new";
import  AddRepo  from "@/modules/auth/dashboard/components/add-repo";
import  {getAllPlaygroundForUser} from '@/modules/auth/dashboard/actions';
import ProjectTable from '@/modules/auth/dashboard/components/project-table';
// page.tsx

import {
  
  deleteProject,
  updateProject,
  duplicateProject,
} from '@/modules/auth/dashboard/actions';

const Page = async () => {
  const playgrounds = await getAllPlaygroundForUser();

  return (
    <div className="flex flex-col justify-start items-center min-h-screen mx-auto max-w-7xl px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <AddNewButton />
        <AddRepo />
      </div>
      <div className="mt-10 flex flex-col justify-center items-center w-full">
        {playgrounds && playgrounds.length === 0 ? (
          <EmptyState />
        ) : (
          <ProjectTable
            projects={playgrounds || []}
            onDeleteProject={deleteProject}
            onUpdateProject={updateProject}
            onDuplicateProject={duplicateProject}
          />
        )}
      </div>
    </div>
  );
};

export default Page;