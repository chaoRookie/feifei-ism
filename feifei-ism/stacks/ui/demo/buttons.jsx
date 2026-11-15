import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../registry/feifei/styles/feifei-buttons.css';
import './buttons.css';
import { Button, buttonSets } from '../registry/feifei/ui/button.tsx';

const names = { k1: '甲 刮字块', k2: '乙 一笔托字', k3: '丙 颜料字', k4: '丁 点线', k5: '戊 彩铅圈', k6: '己 印头' };

function Row({ set }) {
  const [pick, setPick] = useState(0);
  const [title] = names[set].split(' ').slice(-1);
  return (
    <div className="row">
      <p className="set">
        <b>{names[set].split(' ')[0]}</b>
        {set} · {title}
      </p>
      <div className="cells">
        {['一档', '二档'].map((label, i) => (
          <Button key={label} variant={set} pressed={pick === i} onClick={() => setPick(i)}>
            {label}
          </Button>
        ))}
        {set === 'k6' ? (
          <Button variant="k6" seal="存">保存</Button>
        ) : (
          <Button variant={set} toggle>开合</Button>
        )}
        <Button variant={set} disabled>禁用</Button>
      </div>
    </div>
  );
}

function Gallery() {
  return (
    <main>
      <p className="t">第乙签 · shadcn registry · button.tsx</p>
      <h1>两类六套</h1>
      <div className="lead">
        <Button variant="k1" primary>下一页</Button>
        <span className="t">一屏只放一个主要按钮，它拿走这一屏的主色</span>
      </div>
      {buttonSets.map((set) => (
        <Row key={set} set={set} />
      ))}
    </main>
  );
}

createRoot(document.getElementById('app')).render(
  <StrictMode>
    <Gallery />
  </StrictMode>
);
