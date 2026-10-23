import {Button} from '@/components/ui-site/button';
import {Container} from '@/components/ui-site/container';
import {Eyebrow} from '@/components/ui-site/eyebrow';
import {Logo} from '@/components/ui-site/logo';
import {MarkedText} from '@/components/ui-site/marked-text';

/**
 * The "Something went wrong" page for error.tsx and global-error.tsx. Error boundaries are client components and may
 * replace the root layout, so this only uses plain primitives (no data, no async header).
 */
export function ErrorPanel({onRetry}: {onRetry: () => void}) {
  return (
    <div className="flex min-h-svh flex-col">
      <Container>
        <div className="py-[22px] max-md:py-4">
          <Logo />
        </div>
      </Container>
      <main className="flex flex-1 items-center px-14 py-20 max-md:px-5">
        <div className="mx-auto flex w-full max-w-site flex-col gap-[18px]">
          <Eyebrow>Error</Eyebrow>
          <h1 className="m-0 font-display text-[clamp(40px,5vw,72px)] leading-[0.98] font-bold tracking-[-0.04em]">
            <MarkedText text="Something went [[wrong.]]" />
          </h1>
          <p className="m-0 max-w-[560px] text-lg leading-[1.55] text-muted max-md:text-base">Try again, or head back home.</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Button type="button" onClick={onRetry}>
              Try again
            </Button>
            <Button href="/" variant="secondary">
              Back to home
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
