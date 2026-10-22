'use client';

import {LogIn} from 'lucide-react';
import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {authClient} from '@/lib/auth-client';

type SignInCardProps = {
  /** Error code Better Auth appends to the error callback URL, e.g. when the account isn't on the allowlist */
  error: string | null;
};

export function SignInCard({error}: SignInCardProps) {
  const [pending, setPending] = useState(false);

  const signIn = async () => {
    setPending(true);
    await authClient.signIn.social({provider: 'github', callbackURL: '/admin', errorCallbackURL: '/admin/sign-in'});
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Cgdiomampo.dev admin</CardTitle>
        <CardDescription>Sign in with the GitHub account on the admin allowlist.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error ? (
          <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            That account isn&apos;t allowed to sign in here. Use the GitHub account whose email is on the admin allowlist.
          </p>
        ) : null}
        <Button size="lg" onClick={signIn} disabled={pending}>
          <LogIn />
          {pending ? 'Redirecting to GitHub…' : 'Sign in with GitHub'}
        </Button>
      </CardContent>
    </Card>
  );
}
