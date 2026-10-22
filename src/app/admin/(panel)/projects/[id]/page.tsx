import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {PageHeader} from '@/components/admin/page-header';
import {PreviewButton} from '@/components/admin/preview-button';
import {ProjectForm} from '@/components/admin/project-form';
import {getProjectForEdit} from '@/server/admin/data';

export const metadata: Metadata = {title: 'Edit project'};

/** /admin/projects/new creates; /admin/projects/<id> edits. */
export default async function ProjectEditPage({params}: PageProps<'/admin/projects/[id]'>) {
  const {id} = await params;
  if (id === 'new') {
    return (
      <>
        <PageHeader title="New project" description="Saved as a draft unless you switch Published on." />
        <ProjectForm project={null} />
      </>
    );
  }
  const project = await getProjectForEdit(id);
  if (!project) notFound();
  return (
    <>
      <PageHeader
        title={project.title}
        description={`Last saved ${new Date(project.updatedAt ?? '').toLocaleString('en-AU')}`}
        actions={<PreviewButton type="project" id={project.id} />}
      />
      <ProjectForm project={project} />
    </>
  );
}
