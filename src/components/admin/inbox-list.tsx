'use client';

import {MailOpen, Trash2} from 'lucide-react';
import {useState, useTransition} from 'react';
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
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {projectTypeLabel} from '@/lib/contact';
import {deleteMessage, setMessageRead} from '@/server/actions/inbox';
import type {ContactMessageRow} from '@/server/admin/data';

const when = new Intl.DateTimeFormat('en-AU', {dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Manila'});

/** The contact messages, newest first, with read/unread and delete. */
export function InboxList({messages}: {messages: ContactMessageRow[]}) {
  const [items, setItems] = useState(messages);
  const [pending, startTransition] = useTransition();

  const toggleRead = (message: ContactMessageRow) =>
    startTransition(async () => {
      const read = message.readAt === null;
      const result = await setMessageRead(message.id, read);
      if (result.ok) {
        setItems((current) => current.map((item) => (item.id === message.id ? {...item, readAt: read ? new Date().toISOString() : null} : item)));
        toast.success(result.message);
      } else toast.error(result.error);
    });

  const remove = (id: string) =>
    startTransition(async () => {
      const result = await deleteMessage(id);
      if (result.ok) {
        setItems((current) => current.filter((item) => item.id !== id));
        toast.success(result.message);
      } else toast.error(result.error);
    });

  if (items.length === 0) return <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No messages yet.</p>;

  return (
    <ol className={`flex flex-col gap-3 ${pending ? 'opacity-70' : ''}`} aria-busy={pending}>
      {items.map((message) => {
        const unread = message.readAt === null;
        return (
          <li key={message.id} className={`flex flex-col gap-3 rounded-lg border p-4 ${unread ? 'bg-background' : 'bg-muted/40'}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-1">
                <p className={`m-0 ${unread ? 'font-semibold' : 'font-medium'}`}>
                  {message.name}
                  {message.company ? <span className="font-normal text-muted-foreground"> · {message.company}</span> : null}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {unread ? <Badge>Unread</Badge> : null}
                  <Badge variant="secondary">{projectTypeLabel(message.projectType)}</Badge>
                  <a href={`mailto:${message.email}`} className="underline">
                    {message.email}
                  </a>
                  <span>{when.format(new Date(message.createdAt))}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => toggleRead(message)}>
                  <MailOpen />
                  {unread ? 'Mark as read' : 'Mark as unread'}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={`Delete the message from ${message.name}`}>
                      <Trash2 />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete the message from {message.name}?</AlertDialogTitle>
                      <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction variant="destructive" onClick={() => remove(message.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <p className="m-0 text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
            {message.emailedAt === null ? (
              <p className="m-0 text-xs text-muted-foreground">Not emailed: check the Resend key and contact email in Settings, or the server log.</p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
