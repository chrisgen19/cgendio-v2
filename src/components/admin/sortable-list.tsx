'use client';

import {ArrowDown, ArrowUp, GripVertical, Pencil, Trash2} from 'lucide-react';
import Link from 'next/link';
import {type DragEvent, type ReactNode, useState, useTransition} from 'react';
import {toast} from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {Button} from '@/components/ui/button';
import {deleteItem, reorderItems} from '@/server/actions/collections';
import type {Collection} from '@/server/admin/form-schemas';

export type SortableItem = {id: string; title: string; meta?: ReactNode; editHref: string};

type SortableListProps = {
  collection: Collection;
  items: SortableItem[];
  /** Posts are ordered by date, so they get no reordering controls */
  sortable?: boolean;
};

/** A collection's rows: drag (or Move up/down) to reorder, edit, and delete with confirmation. */
export function SortableList({collection, items: initial, sortable = true}: SortableListProps) {
  const [items, setItems] = useState(initial);
  const [dragging, setDragging] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  const saveOrder = (next: SortableItem[]) => {
    const previous = items;
    setItems(next);
    if (collection === 'posts') return;
    startTransition(async () => {
      const result = await reorderItems(
        collection,
        next.map((item) => item.id),
      );
      if (result.ok) toast.success(result.message);
      else {
        setItems(previous);
        toast.error(result.error);
      }
    });
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    if (moved) next.splice(to, 0, moved);
    saveOrder(next);
  };

  const remove = (id: string) =>
    startTransition(async () => {
      const result = await deleteItem(collection, id);
      if (result.ok) {
        setItems((current) => current.filter((item) => item.id !== id));
        toast.success(result.message);
      } else toast.error(result.error);
    });

  if (items.length === 0) return <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">Nothing here yet.</p>;

  return (
    <ol className={`flex flex-col divide-y rounded-lg border ${pending ? 'opacity-70' : ''}`} aria-busy={pending}>
      {items.map((item, index) => (
        <li
          key={item.id}
          draggable={sortable}
          onDragStart={() => setDragging(index)}
          onDragOver={(event: DragEvent) => sortable && event.preventDefault()}
          onDrop={() => {
            if (dragging !== null) move(dragging, index);
            setDragging(null);
          }}
          onDragEnd={() => setDragging(null)}
          className={`flex items-center gap-3 bg-background p-3 ${dragging === index ? 'opacity-50' : ''}`}
        >
          {sortable ? <GripVertical aria-hidden="true" className="size-4 shrink-0 cursor-grab text-muted-foreground" /> : null}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <Link href={item.editHref} className="truncate font-medium hover:underline">
              {item.title}
            </Link>
            {item.meta ? <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">{item.meta}</div> : null}
          </div>
          {sortable ? (
            <>
              <Button variant="ghost" size="icon" disabled={index === 0} onClick={() => move(index, index - 1)} aria-label={`Move ${item.title} up`}>
                <ArrowUp />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={index === items.length - 1}
                onClick={() => move(index, index + 1)}
                aria-label={`Move ${item.title} down`}
              >
                <ArrowDown />
              </Button>
            </>
          ) : null}
          <Button variant="ghost" size="icon" asChild>
            <Link href={item.editHref} aria-label={`Edit ${item.title}`}>
              <Pencil />
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Delete ${item.title}`}>
                <Trash2 />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete “{item.title}”?</AlertDialogTitle>
                <AlertDialogDescription>It disappears from the site straight away. This can&apos;t be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={() => remove(item.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </li>
      ))}
    </ol>
  );
}
