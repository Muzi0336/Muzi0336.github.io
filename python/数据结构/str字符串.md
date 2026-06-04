# 字符串（String）

（与列表相同）字符串单个不可改变

**查找子串**
 ```python
s = "Hello, World!"
 # 查找 "World" 开始的位置
 result = s.find("World")
 print(result)  # 输出：7（索引从0开始数，第7个字符是W）
 # 查找一个不存在的子串
 result2 = s.find("Python")
 print(result2)  # 输出：-1
 ```

---
**统计字符串出现次数**
 ```python
 s = "apple apple banana apple"
 # 统计 "apple" 出现了几次
 result = s.count("apple")
 print(result)  # 输出：3
 ```

---
**大写**
```python
s = "hello world"
 result = s.upper()
 print(result)  # 输出：HELLO WORLD
```

---
**小写**
```python
s = "HELLO World"
 result = s.lower()
 print(result)  # 输出：hello world
```

---
**剪切**
```python
s = "2026-04-11"
 # 按 "-" 切割
 result = s.split("-")
 print(result)  # 输出：['2026', '04', '11']
 
 # 不指定分隔符，默认按空格切
 s2 = "a b c"
 print(s2.split())  # 输出：['a', 'b', 'c']
```

---
**去除字符**
```python
s = "  Python  "
 # 去除首尾空格
 result = s.strip()
 print(result)  # 输出：Python
 
 s2 = "***Hello***"
 # 去除首尾的 "*"
 print(s2.strip("*"))  # 输出：Hello
```

---
**指定字符串替换**
```python
s = "I like Java"
 # 把 "Java" 替换成 "Python"
 result = s.replace("Java", "Python")
 print(result)  # 输出：I like Python
```

---
**是否以指定方式开头与结尾**
```python
s = "Hello, World!"
 
 # 判断是否以 "He" 开头
 result1 = s.startswith("He")
 print(result1)  # 输出：True
 
 # 判断是否以 "!" 结尾
 result2 = s.endswith("!")
 print(result2)  # 输出：True
 
 # 判断错误的情况
 result3 = s.startswith("hello")
 print(result3)  # 输出：False
```
---