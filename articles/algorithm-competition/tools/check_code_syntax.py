# -*- coding: utf-8 -*-
"""对笔记里的代码块做语法体检：括号配平 + g++ -fsyntax-only 语法类错误过滤。"""
import os
import re
import subprocess
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO_ROOT = os.path.dirname(os.path.dirname(ROOT))
NOTES = os.path.join(ROOT, "笔记")
TMP = os.path.join(REPO_ROOT, ".cache", "algorithm-competition", "tmp")
SYNTAX_KEYS = ("expected", "stray", "unterminated", "mismatched", "extraneous",
               "missing terminating", "expected unqualified-id", "invalid preprocessing")


def blocks(md):
    txt = open(md, encoding="utf-8").read()
    for m in re.finditer(r"(?m)^## (.+)$", txt):
        title = m.group(1).strip()
        start = m.end()
        nxt = re.search(r"(?m)^## ", txt[start:])
        body = txt[start:start + (nxt.start() if nxt else len(txt))]
        for cb in re.finditer(r"```(?:cpp|c\+\+|c)?\n(.*?)```", body, re.S):
            yield title, cb.group(1)


def balanced(code):
    pairs = {"(": ")", "[": "]", "{": "}"}
    stack = []
    for ch in code:
        if ch in pairs:
            stack.append(ch)
        elif ch in pairs.values():
            if not stack or pairs[stack.pop()] != ch:
                return False
    return not stack


def main():
    os.makedirs(TMP, exist_ok=True)
    total = 0
    syntax_bad = []
    unbal = []
    for fn in sorted(os.listdir(NOTES)):
        if not fn.startswith("第"):
            continue
        for title, code in blocks(os.path.join(NOTES, fn)):
            total += 1
            if not balanced(code):
                unbal.append((fn, title, code[:160]))
            src = "#include <bits/stdc++.h>\nusing namespace std;\n" + code
            with tempfile.NamedTemporaryFile("w", suffix=".cpp", delete=False, encoding="utf-8", dir=TMP) as f:
                f.write(src)
                path = f.name
            try:
                r = subprocess.run(["g++", "-std=c++17", "-fsyntax-only", path],
                                   capture_output=True, text=True, timeout=30)
                errs = [ln for ln in r.stderr.split("\n") if "error:" in ln]
                hard = [e for e in errs if any(k in e for k in SYNTAX_KEYS)]
                if hard:
                    syntax_bad.append((fn, title, hard[0][:160]))
            except Exception as exc:  # noqa: BLE001
                print("编译失败:", exc)
            finally:
                os.unlink(path)
    print(f"代码块总数 {total}")
    print(f"括号不配平 {len(unbal)}")
    for u in unbal:
        print("  ", u[0], u[1])
    print(f"疑似语法错误 {len(syntax_bad)}")
    for s in syntax_bad:
        print("  ", s[0], s[1], "|", s[2])


if __name__ == "__main__":
    main()
