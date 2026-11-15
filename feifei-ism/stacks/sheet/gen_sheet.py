import argparse
import json
import re
from pathlib import Path

from openpyxl import Workbook, load_workbook
from openpyxl.styles import Alignment, Border, Font, NamedStyle, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.utils.indexed_list import IndexedList
from openpyxl.workbook.properties import CalcProperties
from openpyxl.writer.theme import theme_xml

HERE = Path(__file__).resolve().parent
SKILL = HERE.parents[1]
TOKENS = SKILL / "tokens" / "out" / "tokens.flat.json"
OUT = HERE / "out"

SIGNS = {"Jia": "甲", "Yi": "乙", "Bing": "丙", "Ding": "丁", "Wu": "戊", "Ji": "己",
         "Geng": "庚", "Xin": "辛", "Ren": "壬", "Gui": "癸", "Zi": "子", "Chou": "丑"}

ROOT_PX = 16
PAPER_COLS = 26
PAPER_ROWS = 120


def load(sign=None):
    t = json.loads(TOKENS.read_text())
    if sign:
        t["C"] = t["Sign" + sign]
    t["_sign"] = next((v for k, v in SIGNS.items() if t["Sign" + k].lower() == t["C"].lower()), "")
    return t


def px(v):
    v = str(v)
    if v.endswith("rem"):
        return float(v[:-3]) * ROOT_PX
    if v.endswith("px"):
        return float(v[:-2])
    return float(v)


def body(t):
    v = str(t["DocBody"])
    if not v.endswith("pt"):
        raise ValueError(f"{v} is not in pt")
    return float(v[:-2])


def seal_side(t):
    return px(t["SealSize"]) / px(t["FsBody"]) * body(t)


def pt(t, key):
    return round(px(t[key]) / px(t["FsBody"]) * body(t) * 2) / 2


def argb(h):
    return "FF" + h.lstrip("#")[:6].upper()


def hexu(h):
    return h.lstrip("#")[:6].upper()


def fill(h):
    return PatternFill("solid", fgColor=argb(h), bgColor=argb(h))


def font(t, fam, color, size):
    return Font(name=t[fam][0], size=size, color=argb(t[color]), bold=False, italic=False)


def styles(t):
    b = body(t)
    paper = fill(t["Paper"])
    sunken = fill(t["SSunken"])
    line = Side(style="thin", color=argb(t["Line"]))
    key = Side(style="medium", color=argb(t["C"]))
    left = Alignment(horizontal="left", vertical="center", wrap_text=False)
    right = Alignment(horizontal="right", vertical="center")
    spec = {
        "ff_title": dict(font=font(t, "FT", "Ink", pt(t, "FsH1")), fill=paper,
                         alignment=Alignment(horizontal="left", vertical="bottom")),
        "ff_subtitle": dict(font=font(t, "FB", "Ink3", b), fill=paper, alignment=left),
        "ff_tiji": dict(font=font(t, "FM", "Ink3", pt(t, "FsSmall")), fill=paper, alignment=left),
        "ff_h2": dict(font=font(t, "FT", "Ink", pt(t, "FsH2")), fill=paper,
                      alignment=Alignment(horizontal="left", vertical="bottom")),
        "ff_header": dict(font=font(t, "FB", "Ink3", pt(t, "FsH4")), fill=paper,
                          border=Border(bottom=line), alignment=Alignment(horizontal="left", vertical="bottom")),
        "ff_header_num": dict(font=font(t, "FB", "Ink3", pt(t, "FsH4")), fill=paper,
                              border=Border(bottom=line), alignment=Alignment(horizontal="right", vertical="bottom")),
        "ff_body": dict(font=font(t, "FB", "Ink2", b), fill=paper, alignment=left),
        "ff_body_key": dict(font=font(t, "FB", "Ink", b), fill=paper, alignment=left),
        "ff_number": dict(font=font(t, "FM", "Ink2", b), fill=paper, alignment=right, number_format="#,##0"),
        "ff_decimal": dict(font=font(t, "FM", "Ink2", b), fill=paper, alignment=right, number_format="#,##0.0"),
        "ff_percent": dict(font=font(t, "FM", "Ink2", b), fill=paper, alignment=right, number_format="0.0%"),
        "ff_date": dict(font=font(t, "FM", "Ink2", b), fill=paper, alignment=right, number_format="yyyy-mm-dd"),
        "ff_accent": dict(font=font(t, "FM", "C", b), fill=paper, alignment=right, border=Border(bottom=key),
                          number_format="#,##0"),
        "ff_group": dict(font=font(t, "FB", "Ink", b), fill=sunken, alignment=left),
        "ff_group_number": dict(font=font(t, "FM", "Ink", b), fill=sunken, alignment=right, number_format="#,##0"),
        "ff_group_percent": dict(font=font(t, "FM", "Ink", b), fill=sunken, alignment=right, number_format="0.0%"),
        "ff_note": dict(font=font(t, "FB", "Ink3", pt(t, "FsSmall")), fill=paper, alignment=left),
        "ff_ji": dict(font=font(t, "FB", "Ink", pt(t, "FsSmall")), fill=paper,
                      alignment=Alignment(horizontal="right", vertical="center")),
        "ff_seal": dict(font=font(t, "FT", "Paper", round(seal_side(t) * t["SealChar"] * 2) / 2), fill=fill(t["C"]),
                        alignment=Alignment(horizontal="center", vertical="center")),
        "ff_paper": dict(font=font(t, "FB", "Ink2", b), fill=paper),
    }
    out = []
    for name, kw in spec.items():
        s = NamedStyle(name=name)
        for k, v in kw.items():
            setattr(s, k, v)
        out.append(s)
    return out


def theme(t):
    x = theme_xml
    scheme = {"dk1": t["Ink"], "lt1": t["Paper"], "dk2": t["Ink2"], "lt2": t["SSunken"],
              "accent1": t["C"], "accent2": t["Ink2"], "accent3": t["Ink3"], "accent4": t["Line"],
              "accent5": t["SRaised"], "accent6": t["SSunken"], "hlink": t["Ink2"], "folHlink": t["Ink3"]}
    for slot, h in scheme.items():
        x = re.sub(rf"<a:{slot}>.*?</a:{slot}>",
                   f'<a:{slot}><a:srgbClr val="{hexu(h)}"/></a:{slot}>', x, flags=re.S)
    x = re.sub(r'(<a:clrScheme name=")[^"]*', r"\1feifei-ism", x)
    x = re.sub(r'(<a:fontScheme name=")[^"]*', r"\1feifei-ism", x)
    for tag, fam in (("majorFont", "FT"), ("minorFont", "FB")):
        def sub(m, fam=fam):
            body = re.sub(r'<a:latin typeface="[^"]*"', f'<a:latin typeface="{t[fam][0]}"', m.group(0))
            body = re.sub(r'<a:ea typeface="[^"]*"', f'<a:ea typeface="{t[fam][0]}"', body)
            body = re.sub(r'<a:font script="Hans" typeface="[^"]*"/>',
                          f'<a:font script="Hans" typeface="{t[fam][0]}"/>', body)
            return body
        x = re.sub(rf"<a:{tag}>.*?</a:{tag}>", sub, x, flags=re.S)
    return x


def workbook(t):
    wb = Workbook()
    wb._fonts = IndexedList([font(t, "FB", "Ink2", body(t))])
    wb.loaded_theme = theme(t).encode()
    for s in styles(t):
        wb.add_named_style(s)
    return wb


def paper_sheet(ws, t, widths):
    ws.sheet_view.showGridLines = False
    ws.sheet_properties.tabColor = hexu(t["Ink3"])
    for i in range(1, PAPER_COLS + 1):
        cd = ws.column_dimensions[get_column_letter(i)]
        cd.width = widths.get(i, 10)
        cd.fill = fill(t["Paper"])
        cd.font = font(t, "FB", "Ink2", body(t))
    for r in range(1, PAPER_ROWS + 1):
        for c in range(1, PAPER_COLS + 1):
            cell = ws.cell(r, c)
            if cell.style == "Normal":
                cell.style = "ff_paper"


def put(ws, ref, value, style):
    ws[ref] = value
    ws[ref].style = style


def seal(ws, t, row, col):
    side = seal_side(t)
    put(ws, f"{get_column_letter(col - 1)}{row}", "你的名字 记", "ff_ji")
    for i, ch in enumerate("肥肥主义"):
        ws.cell(row + i // 2, col + i % 2, ch).style = "ff_seal"
        ws.row_dimensions[row + i // 2].height = round(side / 2 + 2, 1)
    for c in (col, col + 1):
        ws.column_dimensions[get_column_letter(c)].width = round(side / 2 / 5.6 + .7, 1)


def head(ws, t, title, subtitle, tiji):
    put(ws, "B2", f"{tiji} · 第{t['_sign']}签", "ff_tiji")
    put(ws, "B3", title, "ff_title")
    ws.row_dimensions[3].height = round(pt(t, "FsH1") * 1.5, 1)
    put(ws, "B4", subtitle, "ff_subtitle")
    ws.row_dimensions[5].height = body(t) * 2
    ws.freeze_panes = None


def template(t, path):
    wb = workbook(t)
    ws = wb.active
    ws.title = "底板"
    paper_sheet(ws, t, {1: 3, 2: 18, 3: 12, 4: 12, 5: 12, 6: 12})
    head(ws, t, "标题", "一句话说这张表是干什么的", "题记")
    put(ws, "B6", "名目", "ff_header")
    for c in "CDE":
        put(ws, f"{c}6", "数", "ff_header_num")
    put(ws, "F6", "占比", "ff_header_num")
    for r in range(7, 12):
        ws[f"B{r}"].style = "ff_body"
        for c in "CDE":
            ws[f"{c}{r}"].style = "ff_number"
        ws[f"F{r}"].style = "ff_percent"
    put(ws, "B12", "合计", "ff_group")
    for c in "CDE":
        put(ws, f"{c}12", f"=SUM({c}7:{c}11)", "ff_group_number")
    ws["F12"].style = "ff_group_percent"
    put(ws, "B14", "最要紧的一个数用 ff_accent，一张表只用一次", "ff_note")
    seal(ws, t, 16, 8)
    wb.save(path)
    wb.template = True
    wb.save(path.with_suffix(".xltx"))


def sample(t, src, path):
    wb = load_workbook(src)
    ws = wb["底板"]
    ws.title = "十一月"
    put(ws, "B2", f"图书角借阅 · 2026-11 · 第{t['_sign']}签", "ff_tiji")
    put(ws, "B3", "十一月借阅", "ff_title")
    put(ws, "B4", "借出 312 本，童书架最紧", "ff_subtitle")
    for c, h in zip("BCDEF", ("类别", "借出", "归还", "在架", "归还率")):
        ws[f"{c}6"] = h
    rows = [("童书", 146, 121, 9), ("小说", 88, 80, 63), ("历史", 41, 39, 52), ("生活", 37, 35, 70),
            ("期刊", 0, 0, 24)]
    for i, (name, lend, back, shelf) in enumerate(rows, start=7):
        ws[f"B{i}"] = name
        ws[f"C{i}"] = lend
        ws[f"D{i}"] = back
        ws[f"E{i}"] = shelf
        ws[f"F{i}"] = f"=IF(C{i}=0,\"\",D{i}/C{i})"
    ws["E7"].style = "ff_accent"
    ws["B7"].style = "ff_body_key"
    ws["F12"] = "=D12/C12"
    put(ws, "B14", "童书在架只剩 9 本，下个月先补这一格", "ff_note")
    put(ws, "B15", "数字来自借阅登记本，11 月 1 日到 30 日", "ff_note")
    wb.calculation = CalcProperties(fullCalcOnLoad=True)
    wb.save(path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sign", choices=list(SIGNS))
    a = ap.parse_args()
    t = load(a.sign)
    OUT.mkdir(exist_ok=True)
    tpl = OUT / "feifei-template.xlsx"
    template(t, tpl)
    sample(t, tpl, OUT / "sample.xlsx")
    print("sign", t["_sign"], t["C"], "->", OUT)


if __name__ == "__main__":
    main()
