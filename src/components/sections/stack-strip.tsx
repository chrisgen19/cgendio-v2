import {Eyebrow} from '@/components/ui-site/eyebrow';
import {Section} from '@/components/ui-site/section';
import {Tag} from '@/components/ui-site/tag';
import {getPageCopy, getStack} from '@/server/content';

export async function StackStrip() {
  const [stack, copy] = await Promise.all([getStack(), getPageCopy()]);
  return (
    <Section padding="strip" className="border-b border-line bg-white" innerClassName="flex flex-wrap items-center justify-between gap-x-8 gap-y-5">
      <Eyebrow>{copy['stack.eyebrow']}</Eyebrow>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {stack.map((item) => (
          <li key={item.name}>
            <Tag size="lg">{item.name}</Tag>
          </li>
        ))}
      </ul>
    </Section>
  );
}
