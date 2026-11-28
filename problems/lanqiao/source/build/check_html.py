import re, subprocess, pathlib, sys

REPO_ROOT = pathlib.Path(__file__).resolve().parents[4]
TMP = REPO_ROOT / '.cache' / 'lanqiao' / 'tmp'
f = sys.argv[1] if len(sys.argv) > 1 else str(REPO_ROOT / 'problems' / 'lanqiao' / 'problem.html')
s = pathlib.Path(f).read_text(encoding='utf-8')
TMP.mkdir(parents=True, exist_ok=True)
for i, b in enumerate(re.findall(r'<script(?![^>]*src)[^>]*>(.*?)</script>', s, re.S)):
    p = TMP / ('chk_html_%d.js' % i)
    p.write_text(b, encoding='utf-8')
    r = subprocess.run(['node', '--check', str(p)], capture_output=True, text=True)
    print(f, 'script', i, 'OK' if r.returncode == 0 else r.stderr[:500])
    p.unlink(missing_ok=True)
