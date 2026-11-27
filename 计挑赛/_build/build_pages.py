# -*- coding: utf-8 -*-
"""Generate cpp/java/python list & detail pages from the C templates."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / '计挑赛'

LANGS = {
    'cpp': {
        'name': 'C++',
        'slug': 'cpp',
        'global': 'CDATA_CPP',
        'badge': 'C++17',
        'suffix': 'CPP',
        'key': 'contest.ans.cpp.v1',
        'prefix': 'contest.code.cpp.',
        'placeholder': '// 在这里敲 C++ 代码：输入 int、vector、cin 等关键词会自动补全',
        'keywords': [
            ('int', '整型'), ('long', '长整型'), ('double', '双精度'), ('float', '单精度'),
            ('char', '字符'), ('bool', '布尔'), ('void', '无类型'), ('auto', '自动类型'),
            ('const', '只读'), ('static', '静态'), ('unsigned', '无符号'), ('signed', '有符号'),
            ('struct', '结构体'), ('class', '类'), ('public', '公有'), ('private', '私有'),
            ('protected', '保护'), ('virtual', '虚函数'), ('override', '重写'), ('template', '模板'),
            ('typename', '类型名'), ('namespace', '命名空间'), ('using', '使用'), ('std', '标准库'),
            ('vector', '动态数组'), ('string', '字符串'), ('map', '映射'), ('set', '集合'),
            ('unordered_map', '哈希映射'), ('queue', '队列'), ('stack', '栈'), ('priority_queue', '优先队列'),
            ('pair', '二元组'), ('sort', '排序'), ('cin', '标准输入'), ('cout', '标准输出'),
            ('endl', '换行'), ('ifstream', '读文件'), ('ofstream', '写文件'), ('getline', '读一行'),
            ('size', '长度'), ('push_back', '尾部插入'), ('begin', '起始迭代器'), ('end', '结束迭代器'),
            ('nullptr', '空指针'), ('new', '申请内存'), ('delete', '释放内存'), ('return', '返回'),
            ('if', '条件'), ('else', '否则'), ('for', '循环'), ('while', '循环'), ('do', '循环'),
            ('switch', '分支'), ('case', '分支'), ('break', '跳出'), ('continue', '继续'),
            ('include', '包含头文件'), ('define', '宏定义'), ('printf', '格式化输出'), ('scanf', '格式化输入')
        ],
    },
    'java': {
        'name': 'Java',
        'slug': 'java',
        'global': 'CDATA_JAVA',
        'badge': 'Java 17',
        'suffix': 'JAVA',
        'key': 'contest.ans.java.v1',
        'prefix': 'contest.code.java.',
        'placeholder': '// 在这里敲 Java 代码：输入 class、String、Scanner 等关键词会自动补全',
        'keywords': [
            ('public', '公有'), ('private', '私有'), ('protected', '保护'), ('class', '类'),
            ('interface', '接口'), ('extends', '继承'), ('implements', '实现'), ('static', '静态'),
            ('final', '最终'), ('void', '无返回值'), ('int', '整型'), ('long', '长整型'),
            ('double', '双精度'), ('boolean', '布尔'), ('char', '字符'), ('String', '字符串'),
            ('Integer', '整型包装类'), ('Double', '双精度包装类'), ('ArrayList', '动态数组'),
            ('HashMap', '哈希映射'), ('HashSet', '哈希集合'), ('Scanner', '输入扫描器'),
            ('System', '系统类'), ('out', '标准输出'), ('println', '换行打印'), ('print', '打印'),
            ('nextInt', '读整数'), ('nextLine', '读一行'), ('Math', '数学工具'), ('Arrays', '数组工具'),
            ('Collections', '集合工具'), ('sort', '排序'), ('add', '添加'), ('get', '获取'),
            ('size', '长度'), ('for', '循环'), ('while', '循环'), ('if', '条件'), ('else', '否则'),
            ('switch', '分支'), ('case', '分支'), ('break', '跳出'), ('continue', '继续'),
            ('return', '返回'), ('new', '新建对象'), ('null', '空引用'), ('true', '真'),
            ('false', '假'), ('import', '导入'), ('package', '包'), ('try', '尝试'),
            ('catch', '捕获异常'), ('throws', '声明异常'), ('StringBuilder', '可变字符串'), ('append', '追加')
        ],
    },
    'python': {
        'name': 'Python',
        'slug': 'python',
        'global': 'CDATA_PY',
        'badge': 'Python 3',
        'suffix': 'PY',
        'key': 'contest.ans.python.v1',
        'prefix': 'contest.code.python.',
        'placeholder': '# 在这里敲 Python 代码：输入 def、list、print 等关键词会自动补全',
        'keywords': [
            ('def', '定义函数'), ('class', '定义类'), ('return', '返回'), ('if', '条件'),
            ('elif', '否则如果'), ('else', '否则'), ('for', '循环'), ('while', '循环'),
            ('in', '成员判断'), ('not', '取反'), ('and', '并且'), ('or', '或者'),
            ('import', '导入模块'), ('from', '从模块导入'), ('as', '别名'), ('print', '输出'),
            ('input', '输入'), ('int', '整数'), ('float', '浮点数'), ('str', '字符串'),
            ('list', '列表'), ('dict', '字典'), ('set', '集合'), ('tuple', '元组'),
            ('range', '范围'), ('len', '长度'), ('append', '追加'), ('split', '拆分'),
            ('join', '拼接'), ('map', '映射'), ('filter', '过滤'), ('sum', '求和'),
            ('min', '最小值'), ('max', '最大值'), ('sorted', '排序'), ('open', '打开文件'),
            ('with', '上下文管理'), ('try', '尝试'), ('except', '捕获异常'), ('finally', '最终'),
            ('lambda', '匿名函数'), ('True', '真'), ('False', '假'), ('None', '空值'),
            ('self', '实例自身'), ('__init__', '构造方法'), ('enumerate', '带索引遍历'), ('zip', '并行遍历'),
            ('abs', '绝对值'), ('round', '四舍五入'), ('math', '数学模块')
        ],
    },
}


def kw_block(keywords):
    lines = ['            const KEYWORDS = [']
    for i in range(0, len(keywords), 4):
        chunk = keywords[i:i + 4]
        parts = [f"['{w}', '{h}']" for w, h in chunk]
        suffix = ',' if i + 4 < len(keywords) else ''
        lines.append('                ' + ', '.join(parts) + suffix)
    lines.append('            ];')
    return '\n'.join(lines)


def convert(text, cfg):
    name = cfg['name']
    # links one level deeper
    for target in ['frontend/index.html', 'boke/index.html', '算法/index.html',
                   '学习工具/错题本.html', 'index.html']:
        text = text.replace(f'href="../{target}"', f'href="../../{target}"')
    text = text.replace('href="assets/', 'href="../assets/')
    text = text.replace('href="../index.html#contest"', 'href="../../index.html#contest"')
    text = text.replace('href="../计挑赛/index.html"', 'href="../../计挑赛/index.html"')
    # language copy & storage keys
    text = text.replace('C 语言真题', f'{name} 真题').replace('C语言真题', f'{name} 真题')
    text = text.replace('C 语言', name).replace('C语言', name)
    text = text.replace('window.CDATA', 'window.' + cfg['global'])
    text = text.replace('cquiz.ans.v1', cfg['key'])
    text = text.replace('cquiz.code.', cfg['prefix'])
    text = text.replace('C11', cfg['badge']).replace('C / CODE', cfg['badge'])
    text = text.replace('2025-C-', f'2025-{cfg["suffix"]}-')
    text = text.replace('-C-${', f'-{cfg["suffix"]}-${{')
    text = text.replace('C++历年', 'C++ 历年').replace('Java历年', 'Java 历年').replace('Python历年', 'Python 历年')
    text = text.replace('${codeId} · C', f'${{codeId}} · {name}')
    # title line & counts
    text = text.replace('<title>真题 · C 语言', f'<title>真题 · {name}')
    text = text.replace('C 语言真题', f'{name}真题')
    # C-specific 2023 note / option
    text = text.replace('                        <option value="2023" disabled>2023（未收录）</option>\n', '')
    text = text.replace('2019–2025 · 6 个年份 · 缺 2023 年试卷，其余年份已收录。',
                        '2019–2025 · 历年试卷按年份与题型归档。')
    # static labels
    text = text.replace('<span>21 道重复题已折叠</span>', '<span id="statDup">重复题已折叠</span>')
    # keyword list
    text = re.sub(r"            const KEYWORDS = \[.*?\n            \];",
                  kw_block(cfg['keywords']), text, count=1, flags=re.S)
    # placeholder line
    text = re.sub(r'placeholder="// 在这里敲 C 代码[^"]*"',
                  'placeholder="' + cfg['placeholder'] + '&#10;// Tab 缩进 4 格，括号与引号自动配对，↑↓ 选择候选、Tab 或 Enter 接受"',
                  text)
    if cfg['slug'] == 'python':
        text = text.replace('&#10;// Tab 缩进 4 格', '&#10;# Tab 缩进 4 格')
    text = text.replace('C 代码', f'{name} 代码')
    return text


def main():
    index = (BASE / 'index.html').read_text(encoding='utf-8')
    detail = (BASE / 'q.html').read_text(encoding='utf-8')
    for folder, cfg in LANGS.items():
        outdir = BASE / folder
        outdir.mkdir(exist_ok=True)
        (outdir / 'index.html').write_text(convert(index, cfg), encoding='utf-8')
        (outdir / 'q.html').write_text(convert(detail, cfg), encoding='utf-8')
        print('wrote', outdir)


if __name__ == '__main__':
    main()
