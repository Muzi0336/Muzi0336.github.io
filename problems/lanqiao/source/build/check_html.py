import re, subprocess, pathlib, tempfile, sys

f = sys.argv[1] if len(sys.argv) > 1 else r'C:\Users\21371\Documents\PYTTON\Muzi0336.github.io\problems\lanqiao\problem.html'
s = pathlib.Path(f).read_text(encoding='utf-8')
for i, b in enumerate(re.findall(r'<script(?![^>]*src)[^>]*>(.*?)</script>', s, re.S)):
    p = pathlib.Path(tempfile.gettempdir()) / ('chk_html_%d.js' % i)
    p.write_text(b, encoding='utf-8')
    r = subprocess.run(['node', '--check', str(p)], capture_output=True, text=True)
    print(f, 'script', i, 'OK' if r.returncode == 0 else r.stderr[:500])
    p.unlink(missing_ok=True)
