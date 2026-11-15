import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GraphTimeline } from '@/registry/default/graph-timeline/graph-timeline';
import { Callout } from '@/registry/default/callout/callout';

const events = [
  { date: '11-12', label: '调研四路', state: 'done', note: '设计师资源网站、各家设计系统、动效文章、技术栈' },
  { date: '11-14', label: '三样通过', state: 'done' },
  { date: '11-15', label: '出口落地', state: 'now', note: 'stacks/web 与 stacks/ui' },
  { date: '11-16', label: '宣纸实测', state: 'next' },
];

function App({ label }) {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-14 px-6 py-16">
      <p className="font-mono text-sm text-muted-foreground">mdxcn · {label}</p>
      <GraphTimeline title="出口进度" events={events} />
      <Callout type="tip">mdxcn 的源码一行没改，换皮只靠一份覆盖变量和字体的 CSS。</Callout>
    </main>
  );
}

export function mount(label) {
  createRoot(document.getElementById('app')).render(
    <StrictMode>
      <App label={label} />
    </StrictMode>
  );
}
