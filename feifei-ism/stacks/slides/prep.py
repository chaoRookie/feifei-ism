import json
import sys
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
ISM = HERE.parent.parent
sys.path.insert(0, str(ISM / 'scripts'))
from sprite import tint


def main(out):
    tok = json.loads((ISM / 'tokens/out/tokens.flat.json').read_text())
    a = Path(out) / 'assets'
    a.mkdir(parents=True, exist_ok=True)
    Image.open(ISM / 'assets/paper/xuan_sheet.webp').convert('RGB').save(a / 'paper.jpg', quality=90)
    jobs = [('sign_turn', tok['C'], 'sign_turn'), ('sign_leave', tok['C'], 'sign_leave'), ('sign_turn', tok['Ink'], 'sign_turn_ink')]
    for src, color, name in jobs:
        w = a / f'{name}.webp'
        tint(str(ISM / 'assets/signs' / src), str(w), color)
        Image.open(w).save(a / f'{name}.png', optimize=True)
        w.unlink()


if __name__ == '__main__':
    main(sys.argv[1])
