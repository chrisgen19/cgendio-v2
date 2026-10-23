import type {Metadata} from 'next';
import Link from 'next/link';
import {PageHeader} from '@/components/admin/page-header';
import {SortableList} from '@/components/admin/sortable-list';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {listProjects} from '@/server/admin/data';

export const metadata: Metadata = {title: 'Projects'};

export default async function ProjectsPage() {
  const projects = await listProjects();
  return (
    <>
      <PageHeader
        title="Projects"
        description="The Work section shows published, featured projects in this order. Drag or use the arrows to reorder."
        actions={
          <Button asChild>
            <Link href="/admin/projects/new">New project</Link>
          </Button>
        }
      />
      <SortableList
        collection="projects"
        items={projects.map((p) => ({
          id: p.id,
          title: p.title,
          editHref: `/admin/projects/${p.id}`,
          meta: (
            <>
              <Badge variant={p.status === 'PUBLISHED' ? 'default' : 'secondary'}>{p.status === 'PUBLISHED' ? 'Published' : 'Draft'}</Badge>
              {p.featured ? <Badge variant="outline">Featured</Badge> : null}
              <span>{p.group === 'CLIENT' ? 'Client work' : 'Personal'}</span>
              <span>/{p.slug}</span>
            </>
          ),
        }))}
      />
    </>
  );
}
