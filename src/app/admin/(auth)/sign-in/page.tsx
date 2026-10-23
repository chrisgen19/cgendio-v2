import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {Suspense} from 'react';
import {SignInCard} from '@/components/admin/sign-in-card';
import {getAdminSession} from '@/server/admin-session';

export const metadata: Metadata = {title: 'Sign in'};

export default function SignInPage({searchParams}: PageProps<'/admin/sign-in'>) {
  return (
    <div className="grid min-h-svh place-items-center bg-secondary p-4">
      <Suspense>
        <SignIn searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SignIn({searchParams}: Pick<PageProps<'/admin/sign-in'>, 'searchParams'>) {
  if (await getAdminSession()) redirect('/admin');
  const {error} = await searchParams;
  return <SignInCard error={typeof error === 'string' ? error : null} />;
}
