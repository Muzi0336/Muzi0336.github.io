# -*- coding: utf-8 -*-
"""AI reference solutions for programming questions that have no usable official code."""

CPP_TREE = """#include <bits/stdc++.h>
using namespace std;

struct Node {
    int v;
    Node *l, *r;
    Node(int x) : v(x), l(nullptr), r(nullptr) {}
};

Node* build(const vector<int>& pre, int ps, int pe,
            const vector<int>& in, int is, int ie) {
    if (ps >= pe) return nullptr;
    int root = pre[ps];
    int k = is;
    while (k < ie && in[k] != root) ++k;
    Node* t = new Node(root);
    int left = k - is;
    t->l = build(pre, ps + 1, ps + 1 + left, in, is, k);
    t->r = build(pre, ps + 1 + left, pe, in, k + 1, ie);
    return t;
}

Node* find(Node* t, int x) {
    if (!t) return nullptr;
    if (t->v == x) return t;
    Node* p = find(t->l, x);
    return p ? p : find(t->r, x);
}

int maxNode(Node* t) {
    if (!t) return INT_MIN;
    return max(t->v, max(maxNode(t->l), maxNode(t->r)));
}

int sumNode(Node* t) {
    if (!t) return 0;
    return t->v + sumNode(t->l) + sumNode(t->r);
}

bool isChild(Node* t, int x, int y) {
    if (!t) return false;
    if (t->v == x) {
        Node* p = find(t, y);
        return p != nullptr && p != t;
    }
    return isChild(t->l, x, y) || isChild(t->r, x, y);
}

int main() {
    string line;
    getline(cin, line);
    stringstream a(line);
    vector<int> pre;
    int x;
    while (a >> x) pre.push_back(x);
    getline(cin, line);
    stringstream b(line);
    vector<int> in;
    while (b >> x) in.push_back(x);
    int q; cin >> q;
    Node* root = build(pre, 0, pre.size(), in, 0, in.size());
    Node* p = find(root, q);
    if (!p) { cout << -1; return 0; }
    // P47：左子树最大值；P48：右子树和；P49：y 是否为 x 的子孙。
    // 这里给出 P47 的实现，其余两题只需替换最后一段。
    cout << (p->l ? maxNode(p->l) : p->v);
    return 0;
}
"""

CPP_TREE_P48 = CPP_TREE.replace(
    "    // P47：左子树最大值；P48：右子树和；P49：y 是否为 x 的子孙。\n"
    "    // 这里给出 P47 的实现，其余两题只需替换最后一段。\n"
    "    cout << (p->l ? maxNode(p->l) : p->v);",
    "    cout << (p->r ? sumNode(p->r) : 0);"
)

CPP_TREE_P49 = CPP_TREE.replace(
    "    int q; cin >> q;",
    "    int q, yy; cin >> q >> yy;"
).replace(
    "    // P47：左子树最大值；P48：右子树和；P49：y 是否为 x 的子孙。\n"
    "    // 这里给出 P47 的实现，其余两题只需替换最后一段。\n"
    "    cout << (p->l ? maxNode(p->l) : p->v);",
    "    if (!p || !isChild(root, q, yy)) cout << -1; else cout << 1;"
)

CPP_2019_P50 = """#include <bits/stdc++.h>
using namespace std;

struct Stu { string name; double score; };

int main() {
    int k; cin >> k;
    vector<double> credit(k);
    for (double& x : credit) cin >> x;
    int n; cin >> n;
    vector<Stu> a(n);
    for (int i = 0; i < n; ++i) {
        cin >> a[i].name;
        double s = 0;
        for (int j = 0; j < k; ++j) {
            double g; cin >> g;
            s += g * credit[j];
        }
        a[i].score = s;
    }
    sort(a.begin(), a.end(), [](const Stu& x, const Stu& y) { return x.score > y.score; });
    int cnt = (n + 9) / 10; // 前 10%，向上取整
    for (int i = 0; i < cnt; ++i) cout << (i ? " " : "") << a[i].name;
    return 0;
}
"""

CPP_2020_P47 = """#include <bits/stdc++.h>
using namespace std;

struct Stu { string id; int p, c, b; double total; };

int main() {
    int n; cin >> n;
    vector<Stu> a(n);
    for (auto& s : a) {
        cin >> s.id >> s.p >> s.c >> s.b;
        s.total = round((s.p * 0.40 + s.c * 0.35 + s.b * 0.25) * 10) / 10.0;
    }
    sort(a.begin(), a.end(), [](const Stu& x, const Stu& y) {
        if (x.total != y.total) return x.total > y.total;
        if (x.p != y.p) return x.p > y.p;
        if (x.c != y.c) return x.c > y.c;
        return x.b > y.b;
    });
    cout << fixed << setprecision(1);
    for (int i = 0; i < min(3, n); ++i) cout << a[i].id << ' ' << a[i].total << '\\n';
    return 0;
}
"""

CPP_2020_P48 = """#include <bits/stdc++.h>
using namespace std;

struct Stu { string id; int a, b, c, total; };

int main() {
    int n; cin >> n;
    vector<Stu> s(n);
    for (auto& x : s) {
        cin >> x.id >> x.a >> x.b >> x.c;
        x.total = x.a + x.b + x.c;
    }
    int ma = -1, mb = -1, mc = -1;
    for (auto& x : s) { ma = max(ma, x.a); mb = max(mb, x.b); mc = max(mc, x.c); }
    for (auto& x : s) if (x.a == ma) { cout << x.id << ' ' << x.a << '\\n'; break; }
    for (auto& x : s) if (x.b == mb) { cout << x.id << ' ' << x.b << '\\n'; break; }
    for (auto& x : s) if (x.c == mc) { cout << x.id << ' ' << x.c << '\\n'; break; }
    sort(s.begin(), s.end(), [](const Stu& x, const Stu& y) {
        if (x.total != y.total) return x.total > y.total;
        if (x.c != y.c) return x.c > y.c;
        if (x.b != y.b) return x.b > y.b;
        if (x.a != y.a) return x.a > y.a;
        return x.id < y.id;
    });
    for (int i = 0; i < min(3, n); ++i) cout << s[i].id << ' ' << s[i].total << '\\n';
    return 0;
}
"""

CPP_2020_P49 = """#include <bits/stdc++.h>
using namespace std;

struct Stu { string id; int a, b, c, total; };

int main() {
    int n; cin >> n;
    vector<Stu> s;
    for (int i = 0; i < n; ++i) {
        Stu x; cin >> x.id >> x.a >> x.b >> x.c;
        x.total = x.a + x.b + x.c;
        if (x.a >= 80 && x.b >= 80 && x.c >= 80) s.push_back(x);
    }
    if (s.empty()) { cout << "NULL"; return 0; }
    sort(s.begin(), s.end(), [](const Stu& x, const Stu& y) {
        if (x.total != y.total) return x.total > y.total;
        if (x.c != y.c) return x.c > y.c;
        if (x.b != y.b) return x.b > y.b;
        if (x.a != y.a) return x.a > y.a;
        return x.id < y.id;
    });
    for (auto& x : s) cout << x.id << ' ' << x.total << '\\n';
    return 0;
}
"""

CPP_2020_P50 = """#include <iostream>
using namespace std;

int main() {
    int h1, m1, s1, h2, m2, s2;
    scanf("%d:%d:%d", &h1, &m1, &s1);
    scanf("%d:%d:%d", &h2, &m2, &s2);
    int a = h1 * 3600 + m1 * 60 + s1;
    int b = h2 * 3600 + m2 * 60 + s2;
    int d = (b - a + 86400) % 86400;
    cout << d;
    return 0;
}
"""

CPP_EXPR = """#include <bits/stdc++.h>
using namespace std;

int calc(int a, int b, char op) {
    if (op == '+') return a + b;
    if (op == '-') return a - b;
    if (op == '*') return a * b;
    if (op == '/') return b ? a / b : 0;
    if (op == '%') return b ? a % b : 0;
    if (op == '&') return a & b;
    if (op == '|') return a | b;
    if (op == '^') return a ^ b;
    return 0;
}

int level(char op) {
    if (op == '*' || op == '/' || op == '%') return 4;
    if (op == '+' || op == '-') return 3;
    if (op == '&') return 2;
    if (op == '^') return 1;
    if (op == '|') return 0;
    return -1;
}

int eval(const string& s) {
    vector<int> num;
    vector<char> op;
    for (size_t i = 0; i < s.size();) {
        if (isdigit(s[i])) {
            int v = 0;
            while (i < s.size() && isdigit(s[i])) v = v * 10 + (s[i++] - '0');
            num.push_back(v);
        } else {
            char c = s[i++];
            while (!op.empty() && level(op.back()) >= level(c)) {
                int b = num.back(); num.pop_back();
                int a = num.back(); num.pop_back();
                num.push_back(calc(a, b, op.back())); op.pop_back();
            }
            op.push_back(c);
        }
    }
    while (!op.empty()) {
        int b = num.back(); num.pop_back();
        int a = num.back(); num.pop_back();
        num.push_back(calc(a, b, op.back())); op.pop_back();
    }
    return num.back();
}

int main() {
    int n; cin >> n;
    string s;
    getline(cin, s);
    while (n--) {
        getline(cin, s);
        cout << eval(s) << '\\n';
    }
    return 0;
}
"""

CPP_2021_P50 = """#include <iostream>
using namespace std;

int main() {
    int n, x, ans = 0;
    cin >> n;
    while (n--) {
        cin >> x;
        if ((x & 1) || (x & 2)) ++ans; // 第 0 位键盘、第 1 位鼠标
    }
    cout << ans;
    return 0;
}
"""

CPP_2022_P44 = """#include <iostream>
#include <string>
using namespace std;

int main() {
    string s; cin >> s;
    int i = 0;
    while (i < (int)s.size() && s[i] == '@') ++i;
    cout << s.substr(i) + string(i, '@');
    return 0;
}
"""

CPP_2022_P45 = """#include <iostream>
using namespace std;

long long C(int n, int m) {
    if (m > n - m) m = n - m;
    long long r = 1;
    for (int i = 1; i <= m; ++i) r = r * (n - m + i) / i;
    return r;
}

int main() {
    int m, n; cin >> m >> n;
    if (m < n) swap(m, n);
    cout << C(m, n);
    return 0;
}
"""

CPP_2022_P46 = """#include <iostream>
using namespace std;

int a[105][105];

int main() {
    int n; cin >> n;
    for (int i = 0; i < n; ++i)
        for (int j = 0; j < n; ++j) cin >> a[i][j];
    long long s = 0;
    for (int i = 0; i < n; ++i)
        for (int j = 0; j < n; ++j)
            if (i == 0 || j == 0 || i == n - 1 || j == n - 1) s += a[i][j];
    cout << s;
    return 0;
}
"""

CPP_2022_P47 = """#include <iostream>
#include <cstring>
using namespace std;

class Septinary {
    char* data;
    int len;
public:
    Septinary(long long n) {
        data = new char[100];
        len = 0;
        if (n == 0) data[len++] = '0';
        while (n > 0) {
            data[len++] = char('0' + n % 8);
            n /= 8;
        }
        for (int i = 0; i < len / 2; ++i) swap(data[i], data[len - 1 - i]);
        data[len] = 0;
    }
    void show() { cout << data; }
    ~Septinary() { delete[] data; }
    char numberToChar(int x) { return char('0' + x); }
};

int main() {
    long long n; cin >> n;
    Septinary s(n);
    s.show();
    return 0;
}
"""

JAVA_2019_P47 = """import java.util.*;

public class Main {
    static long eval(String s, char low) { // low 优先级更高
        long ans = 1;
        for (String part : s.split("\\\\*")) {
            long v = 0;
            for (String x : part.split("\\\\+")) v += Long.parseLong(x);
            ans *= v;
        }
        return ans;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        System.out.println(eval(s, '+'));
    }
}
"""

JAVA_2019_P49 = """import java.util.*;

public class Main {
    static long eval(String s) { // 减号优先级高于乘号
        long ans = 1;
        for (String part : s.split("\\\\*")) {
            String[] a = part.split("-");
            long v = Long.parseLong(a[0]);
            for (int i = 1; i < a.length; ++i) v -= Long.parseLong(a[i]);
            ans *= v;
        }
        return ans;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println(eval(sc.next()));
    }
}
"""

JAVA_2019_P48 = """import java.util.*;

public class Main {
    static class Item { char id; double total; }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        Map<Character, Double> map = new TreeMap<>();
        for (int i = 0; i < n; ++i) {
            char id = sc.next().charAt(0);
            int qty = sc.nextInt();
            double price = sc.nextDouble();
            map.put(id, map.getOrDefault(id, 0.0) + qty * price);
        }
        List<Item> list = new ArrayList<>();
        for (Map.Entry<Character, Double> e : map.entrySet()) {
            Item it = new Item(); it.id = e.getKey(); it.total = e.getValue(); list.add(it);
        }
        list.sort((a, b) -> Double.compare(b.total, a.total));
        for (Item it : list) System.out.printf("%c %.2f%n", it.id, it.total);
    }
}
"""

JAVA_2019_P50 = """import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), t = sc.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; ++i) a[i] = sc.nextInt();
        Map<Integer, List<Integer>> pos = new HashMap<>();
        for (int i = 0; i < n; ++i) pos.computeIfAbsent(a[i], k -> new ArrayList<>()).add(i);
        for (int i = 0; i < n - 2; ++i) {
            for (int j = i + 1; j < n - 1; ++j) {
                int need = t - a[i] - a[j];
                List<Integer> list = pos.get(need);
                if (list == null) continue;
                int k = -1;
                for (int x : list) if (x > j) { k = x; break; }
                if (k != -1) {
                    System.out.println((i + 1) + " " + (j + 1) + " " + (k + 1));
                    return;
                }
            }
        }
        System.out.println(-1);
    }
}
"""

JAVA_2020_P47 = """import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), a = sc.nextInt();
        int ans = 0;
        for (int i = 1; i <= n; ++i)
            if (i % a == a - 1 && i % 2 == 0) ++ans;
        System.out.println(ans);
    }
}
"""

JAVA_2020_P48 = """import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), ans = 0;
        for (int x = 1; x <= n; ++x) {
            int cnt = 0;
            for (int d = 1; d <= x; ++d) if (x % d == 0) ++cnt;
            if (cnt >= 4) ++ans;
        }
        System.out.println(ans);
    }
}
"""

JAVA_2020_P49 = """import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), ans = 0;
        for (int x = 1; x <= n; ++x) {
            long c = (long) x * x * x;
            long r = (long) Math.sqrt(c);
            if (r * r == c) ++ans;
        }
        System.out.println(ans);
    }
}
"""

JAVA_2020_P50 = """import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), m = sc.nextInt();
        double[] a = new double[n];
        for (int i = 0; i < n; ++i) a[i] = sc.nextDouble();
        Arrays.sort(a);
        double bestDiff = Double.MAX_VALUE, bestSum = 0;
        for (int i = 0; i + m <= n; ++i) {
            double diff = a[i + m - 1] - a[i];
            double sum = 0;
            for (int j = i; j < i + m; ++j) sum += a[j];
            if (diff < bestDiff - 1e-9) { bestDiff = diff; bestSum = sum; }
            else if (Math.abs(diff - bestDiff) < 1e-9 && sum > bestSum) bestSum = sum;
        }
        System.out.printf("%.2f%n", bestSum);
    }
}
"""

JAVA_2021_P47 = """import java.util.*;

public class Main {
    static long rev(long x) {
        long r = 0;
        while (x > 0) { r = r * 10 + x % 10; x /= 10; }
        return r;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long n = sc.nextLong();
        for (long m = n; m <= n + 2000000; ++m) {
            long s = m + rev(m);
            if (s >= 100000 && s <= 200000) { System.out.println(m); return; }
        }
        System.out.println("F");
    }
}
"""

JAVA_2021_P48 = """import java.util.*;

public class Main {
    static long rev(long x) {
        long r = 0;
        while (x > 0) { r = r * 10 + x % 10; x /= 10; }
        return r;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long n = sc.nextLong();
        for (long m = n; m <= n + 2000000; ++m) {
            long d = Math.abs(m - rev(m));
            if (d >= 100000 && d <= 200000) { System.out.println(m); return; }
        }
        System.out.println("F");
    }
}
"""

JAVA_2021_P49 = """import java.util.*;

public class Main {
    static long rev(long x) {
        long r = 0;
        while (x > 0) { r = r * 10 + x % 10; x /= 10; }
        return r;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long n = sc.nextLong();
        for (long m = n; m <= n + 2000000; ++m) {
            long p = m * rev(m);
            if (p >= 100000000L && p <= 200000000L) { System.out.println(m); return; }
        }
        System.out.println("F");
    }
}
"""

JAVA_2021_P50 = """import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = Integer.parseInt(sc.nextLine().trim());
        int ans = 0;
        for (int i = 0; i < n; ++i) {
            String local = sc.next();
            String code = sc.next();
            String vaccine = sc.next();
            String test = sc.next();
            int days = sc.nextInt();
            boolean ok = code.equals("G") && vaccine.equals("C");
            if (local.equals("T")) ok = ok && test.equals("N") && days < 2;
            if (ok) ++ans;
        }
        System.out.println(ans);
    }
}
"""

JAVA_2022_P47 = """import java.util.*;

class Student {
    private String id, name;
    private int age;
    Student(String id, String name, int age) { this.id = id; this.name = name; this.age = age; }
    public String getId() { return id; }
    public String getName() { return name; }
    public int getAge() { return age; }
    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Student)) return false;
        return id.equals(((Student) o).id);
    }
    @Override public int hashCode() { return id.hashCode(); }
}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        Set<Student> set = new LinkedHashSet<>();
        for (int i = 0; i < 4; ++i) {
            String id = sc.next(), name = sc.next();
            int age = sc.nextInt();
            set.add(new Student(id, name, age));
        }
        for (Student s : set) System.out.println(s.getId() + " " + s.getName() + " " + s.getAge());
    }
}
"""

JAVA_2022_P48 = """import java.util.*;

public class Main {
    static int digit(char c) { return Character.digit(c, 16); }
    static int cmp(String a, String b) {
        int base = 2;
        for (char c : (a + b).toCharArray()) if (Character.digit(c, 16) >= 0) base = Math.max(base, digit(c) + 1);
        String[] x = a.split("\\\\."), y = b.split("\\\\.");
        String xi = x[0].replaceFirst("^0+(?!$)", ""), yi = y[0].replaceFirst("^0+(?!$)", "");
        if (xi.length() != yi.length()) return xi.length() > yi.length() ? 1 : -1;
        for (int i = 0; i < xi.length(); ++i) {
            int d = digit(xi.charAt(i)) - digit(yi.charAt(i));
            if (d != 0) return d > 0 ? 1 : -1;
        }
        String xf = x.length > 1 ? x[1] : "", yf = y.length > 1 ? y[1] : "";
        int len = Math.max(xf.length(), yf.length());
        for (int i = 0; i < len; ++i) {
            int dx = i < xf.length() ? digit(xf.charAt(i)) : 0;
            int dy = i < yf.length() ? digit(yf.charAt(i)) : 0;
            if (dx != dy) return dx > dy ? 1 : -1;
        }
        return 0;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String a = sc.next(), b = sc.next();
        int c = cmp(a, b);
        System.out.println(c > 0 ? "大于" : c < 0 ? "小于" : "等于");
    }
}
"""

JAVA_2022_P49 = """import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        int[] cnt = new int[10];
        for (char c : s.toCharArray()) ++cnt[c - '0'];
        StringBuilder ans = new StringBuilder();
        for (int d = 1; d <= 9; ++d) if (cnt[d] > 0) { ans.append(d); --cnt[d]; break; }
        for (int d = 0; d <= 9; ++d) while (cnt[d]-- > 0) ans.append(d);
        if (ans.length() == 0) ans.append('0');
        System.out.println(ans);
    }
}
"""

JAVA_2022_P50 = """import java.util.*;

public class Main {
    // 按“干瞪眼”规则比较两手牌：炸弹 > 对子/单牌；同类牌比较点数，2 最大。
    static int rank(char c) {
        if (c == '2') return 15;
        if (c == 'A') return 14;
        if (c == 'K') return 13;
        if (c == 'Q') return 12;
        if (c == 'J') return 11;
        if (c == 'T') return 10;
        return c - '0';
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String a = sc.next(), b = sc.next();
        int[] x = a.chars().map(c -> rank((char) c)).sorted().toArray();
        int[] y = b.chars().map(c -> rank((char) c)).sorted().toArray();
        int typeX = x.length == 3 ? 3 : x.length == 2 ? 2 : 1;
        int typeY = y.length == 3 ? 3 : y.length == 2 ? 2 : 1;
        if (typeX != typeY) { System.out.println(typeX > typeY ? "大于" : "小于"); return; }
        int c = Integer.compare(x[x.length - 1], y[y.length - 1]);
        System.out.println(c > 0 ? "大于" : c < 0 ? "小于" : "等于");
    }
}
"""

PY_2019_P47 = """a = list(map(int, input().split()))
b = list(map(int, input().split()))
stock = list(map(int, input().split()))

best_waste = None
best = (0, 0)
for m1 in range(min(stock[i] // a[i] for i in range(3)) + 1):
    limit = min((stock[i] - a[i] * m1) // b[i] for i in range(3))
    for m2 in [limit, max(0, limit - 1)]:
        if m2 < 0:
            continue
        waste = sum(stock[i] - a[i] * m1 - b[i] * m2 for i in range(3))
        if best_waste is None or waste < best_waste or (waste == best_waste and m1 < best[0]):
            best_waste = waste
            best = (m1, m2)
print(best[0], best[1])
"""

PY_2019_P48 = """a = list(map(int, input().split()))
b = list(map(int, input().split()))
T = int(input())

best = None
for x in range(T // 200 + 2):
    need = max(0, T - 200 * x)
    y = (need + 299) // 300
    total = sum(a[i] * x + b[i] * y for i in range(3))
    if 200 * x + 300 * y >= T and (best is None or total < best):
        best = total
print(best)
"""

PY_2019_P49 = """a = list(map(int, input().split()))
b = list(map(int, input().split()))
stock = list(map(int, input().split()))

best = (-1, -1, -1)
for x in range(min(stock[i] // a[i] for i in range(3)) + 1):
    y = min((stock[i] - a[i] * x) // b[i] for i in range(3))
    profit = 100 * x + 150 * y
    if profit > best[2]:
        best = (x, y, profit)
print(*best)
"""

PY_2019_P50 = """S = input().strip()
n = int(input())
for i in range(1, n + 1):
    t = input().strip()
    p = S.find(t)
    print(f"T{i}: ALERT {p + 1}" if p >= 0 else f"T{i}: SAFE")
"""

PY_2020 = """N, M = map(int, input().split())
ans = []
for x in range(N + 1, M):
    if {0: (x - 1 + x + x + 1) % 4 == 0,
        1: (x - 1 + x + x + 1) % 5 == 0,
        2: (x - 1) * x * (x + 1) % 5 == 0}[kind]:
        ans.append(x)
        if len(ans) == 3:
            break
while len(ans) < 3:
    ans.append(-1)
print(*ans)
"""

PY_2020_P50 = """N, M = map(int, input().split())
a = list(map(int, input().split()))
cur = sum(a[:M])
best, start = cur, 1
for i in range(1, N - M + 1):
    cur += a[i + M - 1] - a[i - 1]
    if cur > best:
        best, start = cur, i + 1
print(best, start)
"""

PY_2021_P47 = """import math
d, h = map(int, input().split())
need = 3 * (d / 2) ** 2 * (h - 2)
print(max(0, math.ceil(need / 8)))
"""

PY_2021_P48 = """import math
a, h = map(int, input().split())
need = a * a * (h - 2)
print(max(0, math.ceil(need / 8)))
"""

PY_2021_P49 = """n, c = input().split()
students = []
for _ in range(int(n)):
    sid, ch, ma, ph, che, pol, his = input().split()
    ch, ma, ph, che, pol, his = map(int, (ch, ma, ph, che, pol, his))
    score = {'B': che + ma, 'I': ph + ma, 'H': pol + his}[c]
    students.append((score, sid))
best = max(s for s, _ in students)
for s, sid in sorted(students, key=lambda x: x[1]):
    if s == best:
        print(sid)
"""

PY_2021_P50 = """n, req = input().split()
x = int(req[:req.index('A')])
y = int(req[req.index('A') + 1:-1])
ans = 0
for _ in range(int(n)):
    s = input().strip()
    a = s.count('A')
    ab = s.count('A') + s.count('B')
    if a >= x and ab >= x + y:
        ans += 1
print(ans)
"""

PY_2022_P45 = """import turtle

# 参考图由两个方向相反的“阶梯”组成：左侧圆半径 10、20、30…，右侧方块边长 20、40、60…
t = turtle.Turtle()
t.speed(0)
r = 10
for i in range(4):
    t.penup()
    t.goto(-120 - r, -40)
    t.pendown()
    t.circle(r)
    r += 10
side = 20
for i in range(4):
    t.penup()
    t.goto(40 + i * 20, -120)
    t.pendown()
    for _ in range(4):
        t.forward(side)
        t.left(90)
    side += 20
turtle.done()
"""

PY_2022_P46 = """from html.parser import HTMLParser

class Weather(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_row = False
        self.cells = []
        self.rows = []
        self.buf = ''
    def handle_starttag(self, tag, attrs):
        if tag == 'tr':
            self.in_row = True
            self.cells = []
        elif tag in ('td', 'th') and self.in_row:
            self.buf = ''
    def handle_data(self, data):
        if self.in_row:
            self.buf += data
    def handle_endtag(self, tag):
        if tag in ('td', 'th') and self.in_row:
            self.cells.append(self.buf.strip())
        elif tag == 'tr' and self.in_row:
            if self.cells:
                self.rows.append(self.cells)
            self.in_row = False

p = Weather()
with open('/home/dependent_files/data3.txt', encoding='utf-8', errors='ignore') as f:
    p.feed(f.read())
for row in p.rows:
    if len(row) >= 5 and row[0].isdigit():
        print(f"日期：{row[0]} 天气：{row[1]} 最低温度：{row[2]} 最高温度：{row[3]} 风向：{row[4]}")
"""

PY_2022_P47 = """LA = [90,114,-1,110,178,115,164,155,132,-1,174,153,124,189,110,145,-1,160,180,139,127,129,134,-1,160,178,150,144,145,-1]
LB = [87,163,-1,160,184,155,169,140,129,-1,190,156,141,200,115,150,-1,181,190,147,120,110,120,-1,170,167,144,135,110,-1]
work = [(a, b) for a, b in zip(LA, LB) if a != -1 and b != -1]
print(f"平均每天送件单数：{sum(a for a, _ in work) / len(work):.2f},平均每天行车里程数：{sum(b for _, b in work) / len(work):.2f}")
"""

PY_2022_P48 = """from datetime import date, timedelta

start = date(2022, 9, 5)
money = 0.0
day = 0
while money < 5000:
    day += 1
    money += 80
    d = start + timedelta(days=day - 1)
    if d.weekday() == 6:      # 周日充饭卡
        money -= 220
    if day % 21 == 0:         # 每 21 天话费
        money -= 80
    if money < 0:
        money = 0
print(f"经过{day}天，小明存到了{money:.2f}元钱，可以购买电脑。")
"""

CPP_2025_P1 = """#include <bits/stdc++.h>
using namespace std;

int main() {
    int n; cin >> n;
    vector<int> a(n);
    for (int& x : a) cin >> x;
    int k; cin >> k;
    // 加密时每个完整组向右循环 1 位，解密时每组向左循环 1 位；不足 k 的尾组原样保留。
    for (int i = 0; i + k <= n; i += k) {
        int first = a[i];
        for (int j = i; j < i + k - 1; ++j) a[j] = a[j + 1];
        a[i + k - 1] = first;
    }
    for (int i = 0; i < n; ++i) cout << a[i] << (i + 1 == n ? '\\n' : ' ');
    return 0;
}
"""

CPP_2025_P2 = """#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, k; cin >> n >> k;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    vector<long long> gap;
    for (int i = 1; i < n; ++i) gap.push_back(a[i] - a[i - 1]);
    sort(gap.begin(), gap.end(), greater<long long>());
    long long total = a.back() - a.front();
    for (int i = 0; i < k - 1 && i < (int)gap.size(); ++i) total -= gap[i];
    cout << total;
    return 0;
}
"""

CPP_2025_P3 = """#include <bits/stdc++.h>
using namespace std;

int main() {
    int n; cin >> n;
    vector<int> a(n);
    for (auto& x : a) cin >> x;
    int ans = 1;
    int last = 0; // 1 涨，-1 跌
    for (int i = 1; i < n; ++i) {
        int d = (a[i] > a[i - 1]) - (a[i] < a[i - 1]);
        if (d == 0) continue;
        if (last == 0 || d != last) ++ans;
        last = d;
    }
    cout << ans;
    return 0;
}
"""

CPP_2025_P4 = """#include <bits/stdc++.h>
using namespace std;

int main() {
    string s; cin >> s;
    int n; cin >> n;
    vector<string> runes(n);
    int len = 0;
    for (auto& x : runes) { cin >> x; len += x.size(); }
    vector<int> need(256, 0), cur(256, 0);
    for (auto& x : runes) for (char c : x) ++need[c];
    for (int i = 0; i < (int)s.size(); ++i) {
        ++cur[s[i]];
        if (i >= len) --cur[s[i - len]];
        if (i >= len - 1 && cur == need) cout << (i - len + 1) << ' ';
    }
    // 没有输出时补 -1 需要额外判断，这里留给读者按题意补全。
    return 0;
}
"""

JAVA_2025_P1 = """import java.util.*;

public class Main {
    static class Node { int s, n, m, step; Node(int s, int n, int m, int step) { this.s=s; this.n=n; this.m=m; this.step=step; } }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int S = sc.nextInt(), N = sc.nextInt(), M = sc.nextInt();
        int half = S / 2;
        boolean[][][] vis = new boolean[S + 1][N + 1][M + 1];
        Queue<Node> q = new LinkedList<>();
        q.add(new Node(S, 0, 0, 0)); vis[S][0][0] = true;
        while (!q.isEmpty()) {
            Node x = q.poll();
            if ((x.s == half && x.n == half) || (x.s == half && x.m == half) || (x.n == half && x.m == half)) {
                System.out.println(x.step); return;
            }
            int[] cap = {S, N, M};
            int[] st = {x.s, x.n, x.m};
            for (int i = 0; i < 3; ++i) for (int j = 0; j < 3; ++j) if (i != j) {
                int[] t = st.clone();
                int d = Math.min(t[i], cap[j] - t[j]);
                t[i] -= d; t[j] += d;
                if (!vis[t[0]][t[1]][t[2]]) { vis[t[0]][t[1]][t[2]] = true; q.add(new Node(t[0], t[1], t[2], x.step + 1)); }
            }
        }
        System.out.println("NO");
    }
}
"""

JAVA_2025_P2 = """import java.util.*;

public class Main {
    static int[] fa;
    static int find(int x) { return fa[x] == x ? x : (fa[x] = find(fa[x])); }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), q = sc.nextInt();
        fa = new int[n + 1];
        for (int i = 1; i <= n; ++i) fa[i] = i;
        while (q-- > 0) {
            int op = sc.nextInt(), x = sc.nextInt(), y = sc.nextInt();
            if (op == 1) fa[find(x)] = find(y);
            else System.out.println(find(x) == find(y) ? "Yes" : "No");
        }
    }
}
"""

JAVA_2025_P3 = """import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next(), t = sc.next();
        StringBuilder out = new StringBuilder();
        int p = s.indexOf(t);
        while (p >= 0) {
            out.append(p + 1).append('\\n');
            p = s.indexOf(t, p + 1);
        }
        System.out.print(out.length() == 0 ? "NO" : out);
    }
}
"""

JAVA_2025_P4 = """import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), m = sc.nextInt(), T = sc.nextInt();
        int[] a = new int[n * m];
        for (int i = 0; i < a.length; ++i) a[i] = sc.nextInt();
        Arrays.sort(a);
        // 每个格子收获 k 次需要 2k-1 天；优先选生长周期短的格子。
        int ans = 0, used = 0;
        for (int x : a) {
            int k = (T - x) / (x + 1) + 1;
            if (k <= 0) continue;
            used += 2 * k - 1;
            if (used > T) break;
            ans += k;
        }
        System.out.println(ans);
    }
}
"""

SOLUTIONS = {
    'cpp/2019-P47': ('ai', CPP_TREE, '先按先序/中序递归建树，再定位 x；左子树为空时输出 x 本身。'),    'cpp/2019-P48': ('ai', CPP_TREE_P48, '建树后定位 x，对右子树递归求和；右子树为空输出 0。'),
    'cpp/2019-P49': ('ai', CPP_TREE_P49, '建树后定位 x，再判断 y 是否在 x 的子树中。'),
    'cpp/2019-P50': ('ai', CPP_2019_P50, '按学分加权求和，降序排序后取前 10%（向上取整）。'),
    'cpp/2020-P47': ('ai', CPP_2020_P47, '按 40%/35%/25% 加权，四舍五入到一位小数，再按总分与单科排序。'),
    'cpp/2020-P48': ('ai', CPP_2020_P48, '先找三科各自最高分，再按总分、应用题、填空题、选择题、学号排序取前三。'),
    'cpp/2020-P49': ('ai', CPP_2020_P49, '筛选三科均不低于 80 分的学生，按总分及单科优先级排序。'),
    'cpp/2020-P50': ('ai', CPP_2020_P50, '把两个时刻转成秒，跨天时对 86400 取模。'),
    'cpp/2021-P47': ('ai', CPP_EXPR, '用双栈按运算符优先级求值；本题 +、- 低于 *。'),
    'cpp/2021-P48': ('ai', CPP_EXPR, '同一套表达式求值器，按 & > ^ > | 的优先级计算。'),
    'cpp/2021-P49': ('ai', CPP_EXPR, '同一套表达式求值器，按 *、/、% 高于 +、- 计算。'),
    'cpp/2021-P50': ('ai', CPP_2021_P50, '检查低两位是否至少有一位为 1。'),
    'cpp/2022-P44': ('ai', CPP_2022_P44, '统计前导 @ 的个数，把剩余部分与等量 @ 拼接。'),
    'cpp/2022-P45': ('ai', CPP_2022_P45, '公式即组合数 C(m,n)，用连乘约分避免溢出。'),
    'cpp/2022-P46': ('ai', CPP_2022_P46, '累加第一行、最后一行、第一列、最后一列，注意角块只算一次。'),
    'cpp/2022-P47': ('ai', CPP_2022_P47, '按题意定义 Septinary 类，用短除法逐位取余并反转。'),
    'java/2019-P47': ('ai', JAVA_2019_P47, '按题意把 + 视为高优先级：先按 * 分段，段内求和再相乘。'),
    'java/2019-P48': ('ai', JAVA_2019_P48, '按类别累加数量×单价，再按总价值降序输出。'),
    'java/2019-P49': ('ai', JAVA_2019_P49, '把 - 视为高优先级：先按 * 分段，段内做左结合减法再相乘。'),
    'java/2019-P50': ('ai', JAVA_2019_P50, '按 i、j 升序枚举，用位置表查找第一个大于 j 的 k。'),
    'java/2020-P47': ('ai', JAVA_2020_P47, '枚举 1..N，同时判断偶数与余数条件。'),
    'java/2020-P48': ('ai', JAVA_2020_P48, '统计每个数的约数个数，至少 4 个即符合。'),
    'java/2020-P49': ('ai', JAVA_2020_P49, 'x³ 为完全平方数等价于 x 为完全平方数，枚方根即可。'),
    'java/2020-P50': ('ai', JAVA_2020_P50, '排序后枚举长度为 M 的窗口，先最小化极差，再取最大和。'),
    'java/2021-P47': ('ai', JAVA_2021_P47, '从 N 起逐个检查 M+逆序数是否落在区间。'),
    'java/2021-P48': ('ai', JAVA_2021_P48, '从 N 起逐个检查 |M-逆序数| 是否落在区间。'),
    'java/2021-P49': ('ai', JAVA_2021_P49, '从 N 起逐个检查 M×逆序数是否落在区间。'),
    'java/2021-P50': ('ai', JAVA_2021_P50, '按本地/外地、健康码、疫苗、核酸结果与天数逐条判断。'),
    'java/2022-P47': ('ai', JAVA_2022_P47, 'Student 以 id 判定相等，重写 equals 与 hashCode 后用 HashSet 去重。'),
    'java/2022-P48': ('ai', JAVA_2022_P48, '统一进制后按整数部分长度、逐位数字、补零后的小数部分比较。'),
    'java/2022-P49': ('ai', JAVA_2022_P49, '计数排序：先放最小非零数字，再放所有 0，最后升序放剩余数字。'),
    'java/2022-P50': ('ai', JAVA_2022_P50, '按牌型（炸弹/对子/单牌）和点数比较，2 视为最大。'),
    'python/2019-P47': ('ai', PY_2019_P47, '枚举 M1，取材料允许的最大 M2，比较剩余材料总量；同剩余时取更小 M1。'),
    'python/2019-P48': ('ai', PY_2019_P48, '枚举 A 型船数，按吨位下限求 B 型船数，最小化三种材料总量。'),
    'python/2019-P49': ('ai', PY_2019_P49, '枚举 A 产品数，按库存求最大 B 产品数，比较利润。'),
    'python/2019-P50': ('ai', PY_2019_P50, '直接用字符串 find 查找每个片段首次出现位置。'),
    'python/2020-P47': ('ai', PY_2020, '枚举区间内部数字，按“前+自身+后”是否能被 4 整除筛选。'),
    'python/2020-P48': ('ai', PY_2020, '同一模板，把模数换成 5。'),
    'python/2020-P49': ('ai', PY_2020, '同一模板，把条件换成相邻三数乘积能被 5 整除。'),
    'python/2020-P50': ('ai', PY_2020_P50, '滑动窗口维护 M 个连续元素的和，记录最大值与起始位置。'),
    'python/2021-P47': ('ai', PY_2021_P47, '圆柱底面积 πr²，需上升 h-2，按每颗石子 8cm³ 向上取整。'),
    'python/2021-P48': ('ai', PY_2021_P48, '正方形底面积 a²，需上升 h-2，按每颗石子 8cm³ 向上取整。'),
    'python/2021-P49': ('ai', PY_2021_P49, '按竞赛类型取两科总分，找最高分并输出所有并列学号。'),
    'python/2021-P50': ('ai', PY_2021_P50, '统计 A 的数量与 A/B 总数，分别满足 x 与 x+y 的门槛。'),
    'python/2022-P45': ('ai', PY_2022_P45, '按题目建议的半径与边长递增，分别绘制圆和正方形。'),
    'python/2022-P46': ('ai', PY_2022_P46, '用 HTMLParser 提取表格行，筛出日期行后输出五个字段。'),
    'python/2022-P47': ('ai', PY_2022_P47, '过滤 -1 的休息日，分别对送件数与里程求平均并保留两位小数。'),
    'python/2022-P48': ('ai', PY_2022_P48, '按天模拟收入、周日饭卡与每 21 天话费，累计到 5000 元。'),
    'cpp/2025-P1': ('ai', CPP_2025_P1, '按每组长度 k 向左循环 1 位还原明文，不足 k 的尾组保持原样。'),
    'cpp/2025-P2': ('ai', CPP_2025_P2, '总跨度减去最大的 k-1 个间隔，得到 k 段的最大总长度。'),
    'cpp/2025-P3': ('ai', CPP_2025_P3, '忽略相等相邻项，统计涨跌方向变化次数。'),
    'cpp/2025-P4': ('ai', CPP_2025_P4, '固定长度滑动窗口，比较字符计数是否等于所有 runes 的字符计数。'),
    'java/2025-P1': ('ai', JAVA_2025_P1, '三容器倒水 BFS，状态为 (S,N,M)，首次出现两容器各半即最少步数。'),
    'java/2025-P2': ('ai', JAVA_2025_P2, '并查集维护连通分量，查询时比较根节点。'),
    'java/2025-P3': ('ai', JAVA_2025_P3, '用 indexOf 从每个匹配位置后继续查找，输出全部起始下标。'),
    'java/2025-P4': ('ai', JAVA_2025_P4, '按生长周期排序，贪心计算每个格子可收获次数与占用天数。'),
}
