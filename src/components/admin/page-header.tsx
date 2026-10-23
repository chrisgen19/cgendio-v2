import type {ReactNode} from 'react';

type PageHeaderProps = {
  title: string;
  description?: string;
  /** Buttons on the right, e.g. "New project" */
  actions?: ReactNode;
};

export function PageHeader({title, description, actions}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
