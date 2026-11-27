# -*- coding: utf-8 -*-
"""Build the C++ / Java / Python question banks from the source papers.

Raw xlsx/docx/pdf stay local (ignored by git); this script only writes the
derived data.js files used by the static site.
"""
import hashlib
import html
import json
import os
import re
import zipfile
from pathlib import Path

import openpyxl

from program_solutions import SOLUTIONS

TITLE_OVERRIDES = {
    'python/2022-P45': '用 turtle 绘制组合图形',
    'python/2022-P46': '从天气网页源码提取天气信息',
    'python/2022-P47': '快递员送件与里程统计',
    'python/2022-P48': '攒钱买电脑',
    'python/2021-P47': '投石饮水（圆柱瓶）',
    'python/2021-P48': '投石饮水（方瓶）',
}

ROOT = Path(__file__).resolve().parents[2]
LANGS = {
    'C++': ('cpp', 'C++', 'CDATA_CPP'),
    'Java': ('java', 'Java', 'CDATA_JAVA'),
    'Python': ('python', 'Python', 'CDATA_PY'),
}
YEAR_DIRS = [
    '2019年程序设计真题',
    '2020年程度设计真题',
    '2021年程序设计真题',
    '2022年程序设计真题',
    '2024年程序设计真题',
    '2025年程序设计真题',
]


def clean(value):
    if value is None:
        return ''
    text = str(value)
    text = re.sub(r'<br\s*/?>', '\n', text, flags=re.I)
    text = re.sub(r'<p[^>]*>', '\n', text, flags=re.I)
    text = re.sub(r'<[^>]+>', '', text)
    text = html.unescape(text)
    text = text.replace('\u00a0', ' ')
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def split_prompt(text):
    text = clean(text)
    labels = [
        ('题目描述', r'(?:问题描述|题目描述|题目要求)\s*[:：]?'),
        ('输入说明', r'(?:输入说明|输入要求|输入格式)\s*[:：]?'),
        ('输出说明', r'(?:输出说明|输出要求|输出格式)\s*[:：]?'),
        ('样例', r'(?:输入样例|样例输入|示例输入|输入样例\s*1)\s*[:：]?'),
    ]
    sections = []
    points = []
    for i, (h, pat) in enumerate(labels):
        m = re.search(pat, text)
        if m:
            points.append((m.start(), h))
    if not points:
        return [{'h': '题目描述', 'p': [text]}], ''
    points.sort()
    prefix = text[:points[0][0]].strip()
    if prefix and points[0][1] != '题目描述':
        sections.append({'h': '题目描述', 'p': [prefix]})
    for idx, (start, h) in enumerate(points):
        end = points[idx + 1][0] if idx + 1 < len(points) else len(text)
        body = text[start:end]
        body = re.sub(labels[0][1], '', body, count=1).strip() if h == '题目描述' else body
        body = re.sub(dict(labels)[h], '', body, count=1).strip() if h == '样例' else body
        # Remove the section label itself.
        body = re.sub(r'^(?:问题描述|题目描述|输入说明|输入要求|输入格式|输出说明|输出要求|输出格式|输入样例|样例输入|示例输入)\s*[:：]?\s*', '', body).strip()
        if body:
            sections.append({'h': h, 'p': [body]})
    desc = next((s['p'][0] for s in sections if s['h'] == '题目描述'), text)
    return sections, desc


def pair_sample_sections(sections):
    vals = [s['p'][0] for s in sections if s['h'] == '样例']
    samples = []
    for i in range(0, len(vals) - 1, 2):
        samples.append({'in': vals[i], 'out': vals[i + 1]})
    return samples


def has_desc(sections):
    return any(s['h'] in ('题目描述', '问题描述') for s in sections)


def ensure_desc(sections, title, fallback):
    if has_desc(sections):
        return sections
    return [{'h': '题目描述', 'p': [fallback or title]}] + sections


def make_snippet(text, n=150):
    text = re.sub(r'\s+', ' ', text).strip()
    return text[:n] + ('…' if len(text) > n else '')


def extract_samples(text):
    text = clean(text)
    pat = re.compile(
        r'(?:输入样例|样例输入|示例输入|输入样例\s*[0-9一二三四])\s*[0-9一二三四]?\s*[:：]\s*'
        r'(.*?)'
        r'(?:输出样例|样例输出|示例输出|输出样例\s*[0-9一二三四])\s*[0-9一二三四]?\s*[:：]\s*'
        r'(.*?)(?=(?:输入样例|样例输入|示例输入)\s*[0-9一二三四]|代码示例|$)', re.S)
    samples = []
    for m in pat.finditer(text):
        inp = m.group(1).strip().strip('：:')
        out = m.group(2).strip().strip('：:')
        # 遇到下一段说明时截掉，避免把数据范围写进样例。
        out = re.split(r'\n\s*(?:数据范围|说明|解释|注意)', out)[0].strip()
        out = re.split(r'\n\s*示例\s*[0-9一二三四]*\s*解释', out)[0].strip()
        if inp or out:
            samples.append({'in': inp, 'out': out})
    if not samples:
        # 有的 PDF 把“输入样例 1”剥成了孤立的“1：”，按样例段兜底。
        m = re.search(r'^\s*[0-9一二三四]?\s*[:：]\s*(.*?)(?:输出样例|样例输出|示例输出)\s*[0-9一二三四]?\s*[:：]\s*(.*)$', text, re.S)
        if m:
            out = re.split(r'\n\s*示例\s*[0-9一二三四]*\s*解释', m.group(2))[0].strip()
            samples.append({'in': m.group(1).strip(), 'out': out})
    return samples


def parse_answer(row):
    typ = clean(row[3])
    raw = clean(row[4])
    m = re.search(r'[（(]\s*([A-D])\s*[）)]', typ)
    if m:
        return m.group(1)
    if re.fullmatch(r'[A-Da-d]', raw):
        return raw.upper()
    # Some sheets put the correct option text in the answer column.
    opts = {k: clean(row[i] if i < len(row) else '') for i, k in zip(range(5, 9), 'ABCD')}
    for k, v in opts.items():
        if raw and raw == v:
            return k
    return raw[:1].upper() if raw[:1].upper() in 'ABCD' else ''


def xlsx_objective(path, lang, year):
    wb = openpyxl.load_workbook(path, data_only=True)
    ws = wb.worksheets[0]
    out = []
    for row in ws.iter_rows(min_row=3, values_only=True):
        if not row or row[0] in (None, '') or row[1] in (None, ''):
            continue
        typ = clean(row[3])
        if '实操' in typ or '操作' in typ or '编程' in typ:
            continue
        title = clean(row[1])
        if not title:
            continue
        answer = parse_answer(row)
        if not answer:
            continue
        no = int(re.sub(r'\D', '', str(row[0])) or len(out) + 1)
        opts = {k: clean(row[i] if i < len(row) else '') for i, k in zip(range(5, 9), 'ABCD')}
        if not any(opts.values()):
            continue
        out.append({
            'id': f'{year}-{no}',
            'year': year,
            'no': no,
            'kind': 'single',
            'options': opts,
            'answer': answer,
            'answerLabel': '单选题',
            'source': {'file': str(Path(path).relative_to(ROOT)), 'sha': sha(path), 'locator': f'单选题 {no}'},
            'dup': False,
            'title': title,
            'stem': [{'t': 'text', 'v': title}],
            'snippet': make_snippet(title),
            'label': '单选题',
            'expl': f'正确答案：{answer}。选项 {answer}：{opts.get(answer, "")}',
        })
    return out


def xlsx_programs(path, lang, year):
    wb = openpyxl.load_workbook(path, data_only=True)
    ws = wb.worksheets[0]
    out = []
    for row in ws.iter_rows(min_row=3, values_only=True):
        if not row or row[0] in (None, '') or row[1] in (None, ''):
            continue
        typ = clean(row[3])
        if not ('实操' in typ or '操作' in typ or '编程' in typ):
            continue
        prompt = clean(row[1])
        no = int(re.sub(r'\D', '', str(row[0])) or len(out) + 1)
        sections, desc = split_prompt(prompt)
        title = re.split(r'[。；;\n]', desc)[0].strip()[:48] or f'编程题 {no}'
        sections = ensure_desc(sections, title, prompt)
        out.append({
            'id': f'{year}-P{no}',
            'year': year,
            'no': no,
            'kind': 'program',
            'title': title,
            'sections': sections,
            'samples': extract_samples(prompt),
            'source': {'file': str(Path(path).relative_to(ROOT)), 'sha': sha(path), 'locator': f'编程题 {no}'},
            'dup': False,
            'snippet': make_snippet(desc),
            'codeBlocks': [],
            'label': '编程题',
            'expl': '',
        })
    return out


def docx_programs(path, lang, year):
    import docx
    doc = docx.Document(path)
    paras = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
    starts = [i for i, t in enumerate(paras) if re.match(r'编程题\s*\d+\s*[：:]', t)]
    out = []
    for n, start in enumerate(starts, 1):
        end = starts[n] if n < len(starts) else len(paras)
        block = paras[start:end]
        heading = re.sub(r'^编程题\s*\d+\s*[：:]', '', block[0]).strip()
        # Split around the code marker.
        code_at = next((i for i, t in enumerate(block) if t.startswith('参考代码')), None)
        body = block[1:code_at] if code_at is not None else block[1:]
        code = block[code_at + 1:] if code_at is not None else []
        sections = []
        bucket, buf = '', []
        for t in body:
            m = re.match(r'(问题描述|输入要求|输入说明|输出要求|输出说明|输入格式|输出格式|示例[一二三四]?|输入|输出)\s*[：:]', t)
            if m:
                if bucket and buf:
                    sections.append({'h': bucket, 'p': ['\n'.join(buf)]})
                label = m.group(1)
                if label in ('输入', '输出'):
                    label = '样例'
                bucket, buf = label, []
                rest = t[m.end():].strip()
                if rest:
                    buf.append(rest)
            else:
                buf.append(t)
        if bucket and buf:
            sections.append({'h': bucket, 'p': ['\n'.join(buf)]})
        if not sections:
            sections = [{'h': '题目描述', 'p': ['\n'.join(body)]}]
        desc = next((s['p'][0] for s in sections if s['h'] == '题目描述'), heading)
        sections = ensure_desc(sections, heading, heading)
        out.append({
            'id': f'{year}-P{n}',
            'year': year,
            'no': n,
            'kind': 'program',
            'title': heading or f'编程题 {n}',
            'sections': sections,
            'samples': pair_sample_sections(sections),
            'source': {'file': str(Path(path).relative_to(ROOT)), 'sha': sha(path), 'locator': f'编程题 {n}'},
            'dup': False,
            'snippet': make_snippet(desc),
            'codeBlocks': [{'t': 'code', 'v': '\n'.join(code)}] if code else [],
            'label': '编程题',
            'expl': '参考代码整理自试卷配套材料。',
        })
    return out


def pdf_lines(path):
    """Read PDF lines with their left edge, so code indentation survives extraction."""
    import pymupdf
    doc = pymupdf.open(path)
    lines = []
    footer = '全国高校计算机能力挑战赛组委会版权所有'
    for page in doc:
        for block in page.get_text('dict').get('blocks', []):
            for line in block.get('lines', []):
                text = ''.join(s.get('text', '') for s in line.get('spans', [])).strip()
                if not text or text == footer:
                    continue
                lines.append({'text': text, 'x': float(line['bbox'][0])})
    return lines


def pdf_programs(path, lang, year):
    lines = pdf_lines(path)
    head_re = re.compile(r'(?:编程题|题目)\s*(\d+)\s*[：:]')
    heads = [(i, head_re.match(l['text'])) for i, l in enumerate(lines) if head_re.match(l['text'])]
    out = []
    for n, (idx, m) in enumerate(heads, 1):
        end = heads[n][0] if n < len(heads) else len(lines)
        block = lines[idx:end]
        heading = head_re.sub('', block[0]['text'], count=1).strip()
        code_at = next((i for i, l in enumerate(block)
                        if l['text'].strip() == '参考代码' or l['text'].strip().startswith('参考代码：')), None)
        body_lines = block[:code_at] if code_at is not None else block
        body = '\n'.join(l['text'] for l in body_lines).strip()
        code = ''
        if code_at is not None:
            code_lines = block[code_at + 1:]
            if code_lines:
                base_x = min(l['x'] for l in code_lines)
                code = '\n'.join(
                    ' ' * (max(0, round((l['x'] - base_x) / 22.0)) * 4) + l['text']
                    for l in code_lines
                ).strip()
        sections, desc = split_prompt(body)
        title_line = heading
        sections = ensure_desc(sections, title_line, desc)
        out.append({
            'id': f'{year}-P{n}',
            'year': year,
            'no': n,
            'kind': 'program',
            'title': title_line[:48] or f'编程题 {n}',
            'sections': sections,
            'samples': extract_samples(body),
            'source': {'file': str(Path(path).relative_to(ROOT)), 'sha': sha(path), 'locator': f'编程题 {n}'},
            'dup': False,
            'snippet': make_snippet(desc),
            'codeBlocks': [{'t': 'code', 'v': code + '\n'}] if code else [],
            'label': '编程题',
            'expl': '参考代码整理自试卷配套材料。',
        })
    return out


def fingerprint(q):
    return re.sub(r'\s+', '', q['title']).lower()


def dedupe(questions):
    seen = set()
    for q in questions:
        fp = fingerprint(q)
        if fp in seen:
            q['dup'] = True
        else:
            seen.add(fp)


def apply_solutions(lang, folder, questions):
    for q in questions:
        q['codeSource'] = 'paper' if q.get('codeBlocks') else 'none'
        if q['kind'] != 'program':
            continue
        key = f'{folder}/{q["id"]}'
        if key in TITLE_OVERRIDES:
            q['title'] = TITLE_OVERRIDES[key]
        if key in SOLUTIONS:
            source, code, note = SOLUTIONS[key]
            q['codeBlocks'] = [{'t': 'code', 'v': code.strip() + '\n'}]
            q['codeSource'] = source
            q['expl'] = ('以下为 AI 参考代码（非官方），仅供对照思路，不保证评测通过。' + ('\n' + note if note else ''))
        elif q['codeSource'] == 'paper':
            q['expl'] = '参考代码整理自原卷配套材料，未经改写，仅供对照思路。'
        else:
            q['expl'] = '原始试卷未提供可读参考代码，可依据题干与样例自行实现。'


def build_lang(lang, folder):
    questions = []
    for year in range(2019, 2026):
        if year == 2023:
            continue
        # Locate the workbook for this language.
        candidates = list(ROOT.glob(f'计挑赛/{year}年*/*{lang}.xlsx'))
        candidates += list(ROOT.glob(f'计挑赛/{year}年*/{lang}/*{lang}客观题.xlsx'))
        if not candidates:
            continue
        path = candidates[0]
        questions += xlsx_objective(path, lang, year)
        questions += xlsx_programs(path, lang, year)
        # 2024 docx programming paper
        docx_path = next(iter(ROOT.glob(f'计挑赛/{year}年*/{lang}/*{lang}编程题.docx')), None)
        if docx_path:
            # Replace placeholder xlsx programs with the richer docx version.
            questions = [q for q in questions if not (q['year'] == year and q['kind'] == 'program')]
            questions += docx_programs(docx_path, lang, year)
        pdf_path = next(iter(ROOT.glob(f'计挑赛/{year}年*/{lang}/*{lang}编程题.pdf')), None)
        if pdf_path:
            questions = [q for q in questions if not (q['year'] == year and q['kind'] == 'program')]
            questions += pdf_programs(pdf_path, lang, year)
    questions.sort(key=lambda q: (-q['year'], 0 if q['kind'] == 'single' else 1, q['no']))
    dedupe(questions)
    apply_solutions(lang, folder, questions)
    years = sorted({q['year'] for q in questions}, reverse=True)
    return {'questions': questions, 'years': years}


def main():
    for lang, (folder, _, global_name) in LANGS.items():
        data = build_lang(lang, folder)
        outdir = ROOT / '计挑赛' / folder
        outdir.mkdir(parents=True, exist_ok=True)
        out = outdir / 'data.js'
        out.write_text(f'window.{global_name} = ' + json.dumps(data, ensure_ascii=False, separators=(',', ': ')) + ';\n', encoding='utf-8')
        print(lang, len(data['questions']), 'unique', sum(1 for q in data['questions'] if not q['dup']), '->', out)


if __name__ == '__main__':
    main()
