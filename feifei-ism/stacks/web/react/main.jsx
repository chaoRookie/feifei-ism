import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@ff/templates/tokens.css';
import '@ff/templates/motion.css';
import '@ff/templates/buttons.css';
import '../shared/base.css';
import './page.css';
import * as tokens from '@ff/tokens/out/tokens.mjs';
import { Button } from '../../ui/registry/feifei/ui/button.tsx';

const names = { Jia: '甲', Yi: '乙', Bing: '丙', Ding: '丁', Wu: '戊', Ji: '己', Geng: '庚', Xin: '辛', Ren: '壬', Gui: '癸', Zi: '子', Chou: '丑' };
const signs = Object.entries(tokens)
  .filter(([k]) => k.startsWith('Sign'))
  .map(([k, hex]) => ({ zi: names[k.slice(4)], hex }));
const first = signs.find((s) => s.hex === tokens.C) ?? signs[0];

function Page() {
  const [sign, setSign] = useState(first);
  const [count, setCount] = useState(0);
  const draw = () => {
    const rest = signs.filter((s) => s.zi !== sign.zi);
    const next = rest[Math.floor(Math.random() * rest.length)];
    document.documentElement.style.setProperty('--c', next.hex);
    setSign(next);
    setCount((n) => n + 1);
  };
  return (
    <main className="w">
      <p className="t">第{sign.zi}签 · React 单页 · Vite 单文件</p>
      <h1>抽一支签</h1>
      <div className="pp">
        <div>
          <p>每件作品只有一个主色加墨。主色从十二支签里抽，和内容无关，和上一件不同。</p>
          <p><b>这一屏的主色只给下面这一个按钮。</b>按下去，它压进纸里，换一支签。</p>
          <div className="cap">
            <Button variant="k1" primary onClick={draw}>抽签</Button>
            <span className="t">已抽 <span className="n">{count}</span> 次</span>
          </div>
        </div>
        <div>
          <p className="zi" aria-live="polite">{sign.zi}</p>
          <p className="pi">{sign.hex}</p>
        </div>
      </div>
    </main>
  );
}

createRoot(document.getElementById('app')).render(
  <StrictMode>
    <Page />
  </StrictMode>
);
