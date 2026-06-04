---
cssclasses:
  - inline-list
  - purpleRed
---

---
作者：zyyc-0336
日期： 2026-04-11
版本说明：python 3.13

---
# 1.变量分类

| int | float | bool | str        | NoneType（空值） |
| --- | ----- | ---- | ---------- | ------------ |
| 整数  | 小数    | 布尔值  | 字符串        | None         |
|     |       | True/False |  |              |
## 1.1变量
变量名=变量值
变量可以储存不同的类型，变量也可以后期修改
```python
py=10
py="python"
print(f"{py}")
```
输出结果为`python`。
同时。输出语句还可以是：
`print("xxx",xxx+xxx);`
```python
py1=10
py2=20
print("数字和",py1+py2)
```
输出结果为：30
###### 定义
xxx，xxx=xxx，xxx（前后一一对应）
例如：
```python
py1,py2=10,20
print("数字和",py1+py2);
```
输出结果为：30
##### 标识符
- 不以数字开头
- 不用关键词
- 区分大小写
- 可以使用0~9，A~Z，a~z。
==规范：多个部分用下划线链接，y英文小写，名字以实用为主。==

---
###### 数据类型
`print(type(xxx))` 查看数据类型
`print(isinstance(num,int))` 查看变量是否是制定类型，返回布尔值。

---
###### 字符串自定义
```python
# 正确定义字符串（英文引号）
xxx = "xxx"
xxx = 'xxx'
xxx = """
1234565
"""
# 转义符正确示例
print('He said: \'Hello!\'')  # 单引号转义
print("She said: \"Hi!\"")    # 双引号转义
```
---
###### 转义符号
\'单引号\"双引号 \n 换行\t 制表符
字符串的拼接 xxx=“xxx”+“xxx”或xxx=“xxx”“xxx”“xxx”
属性（变量）`int（xxx）` 转换。
```python
print("xxx%s, xxx%s"%(xx, xx))
print（f“xxx｛xxx｝xxx｛xxx｝”）
```
###### 输入信息
`input（“xxx”）` xxx 为提示信息，不录入。（字符串类型）

|     +     | -    | *   | /   | //  | %   | **  |
| :------- | ----- | --- | --- | --- | --- | --- |
|     加     | 减     |     乘   | 除   | 整除  | 取余  | 幂   |
| ==先幂函数，== | ==在乘除，后加减。== |     |     |     |     |     |     |
`·float(int(input("xxx"))) ` 或 ` float(input("xxx")) ` 或 ` int(input("xxx")) `录入信息转换为数字

###### if 语句
`if 条件: `
例如 
```python
if xxx:
	代码 
elif xxx:
	代码 
else:
	代码
```
`#xxx` 注释
`pass` 跳过语句
###### match 语句
```python
match xxx:
    case xxx if 条件:
    case xxx|xxx:  # |是或者的意思
    case _:  # 其他情况
```
算数运算：
```python
print(f"xxx{xxx}xxx{xxx}")
case "/": print(f"{num}/{num2}={num/num2}")
```
###### while 语句
```python
while 条件表达式:
    循环体语句
else:
    循环正常结束后执行的语句
```
###### for 语句
`for 元素 in 待处理数据集: 循环体` 也可以有 else
for 可以遍历数据集，生成数据集
###### range 语句
`range（end）` 限定结束 `range(start,end)` 限定开始与结束 `range(start,end,step)` 限定开始与结束，并且限定步长。

> 全都是左闭右开



例如
```python
range(4)        结果：0-3
range(0, 4)     结果：0-3
range(0, 5, 2)  结果：0 2 4
```
###### 嵌套循环
```python
#组装拿取到的元素
for xxx in 数据集：
	for xxx in 数据集：	
```
`print（）` 换行
`print("x", end=" ")` 以空格结束，不换行，
`split()`：按指定分隔符拆分字符串，返回列表；默认按任意空白符（空格 / 制表符 / 换行）拆分，忽略首尾空白
` for xxx in xxx ` 遍历数据集
`int()` / `float（）` 转换
`random.randint（a，b）` 取随机数，返回 `[a, b]` 闭区间整数（包含 a 和 b）

###### split 剪切
`str.split(sep=None, maxsplit=-1)`：
- `sep`：分隔符（默认 None，按任意空白符拆分，**连续空白符视为一个**）；
- `maxsplit`：拆分次数（默认 -1，无限制）；
- 示例：`" a b c ".split()` → `['a', 'b', 'c']`（自动忽略首尾空白）。

 ---
## Python 数据存储格式

| *英文名称 | list | str | tuple | set |dict|
| --- | --- | --- | --- | --- |---|
| *中文名称 |列表 | 字符串 | 元组 | 集合 | 字典|
| *详细举例 |[[list列表]] | [[str字符串]] | [[tuple元组]] | [[set集合]] |[[dict字典]] |
| *补充说明 |[[列表推导式]] |  点击查看详情  | [[集合推导式]] | [[字典推导式]] |
### 1.1 列表（List）

```python
# 创建列表
fruits = ["apple", "banana", "cherry"]
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", 3.14, True, None]

# 常用操作
fruits.append("orange")      # 添加元素
fruits.insert(1, "grape")    # 指定位置插入
fruits.remove("banana")      # 删除元素
fruits.pop()                 # 删除并返回最后一个元素
fruits.sort()                # 排序
fruits.reverse()             # 反转
fruits.extend([6, 7])        # 扩展列表

# 切片操作
fruits[0:2]                  # 取前两个
fruits[::-1]                 # 反转
fruits[1::2]                 # 隔一个取一个

# 列表推导式
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]
```

**特点**：有序、可变、可重复

---
### 1.2字符串（String）

```python
# 创建字符串
s1 = '单引号'
s2 = "双引号"
s3 = '''多行
字符串'''
s4 = f"格式化：{1+1}"       # f-string

# 常用操作
s = "Hello, World!"
s.upper()                    # 转大写
s.lower()                    # 转小写
s.split(", ")                # 剪切
"-".join(["a", "b", "c"])   # 连接
s.strip()                    # 去除空白
s.replace("World", "Python")# 替换
s.find("World")              # 查找索引
s.startswith("Hello")       # 判断开头
s.endswith("!")              # 判断结尾
s.count("apple")			#统计次数

# 格式化
name = "小明"
age = 18
print(f"{name}今年{age}岁")           # f-string
print("{}今年{}岁".format(name, age)) # format方法
```

**特点**：有序、不可变、不可重复

---
### 1.3 元组（Tuple）

```python
# 创建元组
point = (3, 4)
single = (42,)               # 单元素元组需要逗号
coords = (1, 2, 3, 4, 5)
嵌套=((1, 2),(3, 4),(5, 6))	#嵌套

# 常用操作
x, y = point                 # 解包
first, *rest = coords        # 扩展解包
coords.index(3)              # 查找索引
coords.count(4)              # 计数

# 元组不可变，但可以转换
temp = list(coords)          # 转换为列表
temp.append(6)
coords = tuple(temp)         # 转换回元组
```

**特点**：有序、不可变、可重复（适合存储固定数据）

---
### 1.4 集合（Set）
```python
# 创建集合
fruits = {"apple", "banana", "cherry"}
unique_nums = {1, 2, 3, 2, 1}  # 自动去重：{1, 2, 3}

# 常用操作
fruits.add("orange")        # 添加
fruits.remove("banana")     # 删除（不存在会报错）
fruits.discard("grape")     # 删除（不存在不报错）

# 集合运算
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

a | b       # 并集：{1, 2, 3, 4, 5, 6}
a & b       # 交集：{3, 4}
a - b       # 差集：{1, 2}
a ^ b       # 对称差集：{1, 2, 5, 6}

# 集合推导式
evens = {x for x in range(10) if x % 2 == 0}
```

**特点**：无序、可变、不可重复（用于去重、集合运算）

---
### 1.5 字典（Dictionary）

```python
# 创建字典
student = {
    "name": "小明",
    "age": 18,
    "scores": [90, 85, 92]
}

# 常用操作
student["name"]              # 访问值
student.get("email", "无")   # 安全访问（带默认值）
student["email"] = "x@y.com" # 添加/修改
del student["age"]           # 删除
student.pop("email")         # 删除并返回

# 遍历字典
for key in student:
    print(key)

for key, value in student.items():
    print(f"{key}: {value}")

for value in student.values():
    print(value)

# 字典推导式
squares = {x: x**2 for x in range(5)}
```

**特点**：无序（Python 3.7+有序）、可变、键不可重复

---
### 1.6 数据格式对比
| 类型 |符号| 有序 | 可变 | 可重复 | 使用场景 |
|:---|:---|:---|:---|:---|:---|
| **列表** | `[]` | ✅ | ✅ | ✅ | 存储有序、可变的数据集合 |
| **字符串** | `""` `''` | ✅ | ❌ | ✅ | 文本处理 |
| **元组** | `()` | ✅ | ❌ | ✅ | 存储不变的数据（坐标、配置） |
| **字典** | `{}` | ✅* | ✅ | ❌<br><br>值可重复 | 键值对存储（JSON、配置） |
| **集合** | `{}` | ❌ | ✅ | ❌ | 自动去重、集合运算 |

---

#### 全局变量
`global 变量名`
传参方式：
##### 1. 位置参数
调用时顺序必须和定义时完全一致
```python
def func(a, b):
    print(a, b)

func(10, 20)   # 10给a，20给b
```
##### 2. 关键字参数
指定 `参数名=值`，顺序可以乱
```python
func(b=20, a=10)  # 照样正确
```
##### 3. 缺省参数
###### 定义
在定义函数时，为参数指定**默认值**。调用时如果**不传该参数**，就自动使用默认值。
###### 语法
```python
def 函数名(参数1=默认值1, 参数2=默认值2):
    函数体
```
###### 示例
```python
# 定义：age 有默认值 18
def user_info(name, age=18):
    print(f"姓名：{name}，年龄：{age}")

# 调用：传 name，不传 age → 用默认值
user_info("小明")  
# 输出：姓名：小明，年龄：18

# 调用：传 name 和 age → 覆盖默认值
user_info("小红", 20)  
# 输出：姓名：小红，年龄：20
```

---
#### 不定长参数
###### 作用
当函数**参数个数不确定**时，使用不定长参数接收**任意数量**的参数。
##### 1. `*args`（接收位置参数，打包成元组）

###### 语法
```python
def 函数名(*args):
    函数体
```
###### 示例
```python
# *args 接收任意多个位置参数，存成元组
def add_all(*nums):
    total = 0
    for n in nums:
        total += n
    return total

# 传 2 个参数
print(add_all(1, 2))  # 3

# 传 5 个参数
print(add_all(1, 2, 3, 4, 5))  # 15
```

---
###### 2. `**kwargs `（接收关键字参数，打包成字典）

###### 语法
```python
def 函数名(**kwargs):
    函数体
```
###### 示例
```python
# **kwargs 接收任意多个关键字参数，存成字典
def print_info(**info):
    for k, v in info.items():
        print(f"{k}：{v}")

# 传多个关键字参数
print_info(name="小李", age=22, city="北京")
# 输出：
# name：小李
# age：22
# city：北京
```

#### 参数组合
```python
def func(a, b=10, *args, **kwargs):
    print("a：", a)
    print("b：", b)
    print("*args：", args)
    print("**kwargs：", kwargs)
# 调用 func(1, 2, 3, 4, x=5, y=6) 
# 输出： 
# a： 1 
# b： 2 
# *args： (3, 4) 
# **kwargs： {'x': 5, 'y': 6}
```
#### 全体系总结
|参数类型|符号|作用|存储类型|
|---|---|---|---|
|位置参数|无|按顺序传参|普通变量|
|关键字参数|参数名 = 值|按名字传参，顺序可乱|普通变量|
|缺省参数|参数 = 默认值|不传参时用默认值|普通变量|
|不定长位置参数|*args|接收任意多个位置参数|元组 tuple|
|不定长关键字参数|**kwargs|接收任意多个关键字参数|字典 dict|


### python常用内置模块
- `math`：数学计算（如 `math.sqrt ()` 开方、`math.log ()` 对数、`math.sin ()` 三角函数、`math.pi` 圆周率、`math.e` 自然常数）
- `os`：操作系统（文件、文件夹、路径、执行命令）
- `datetime`：日期时间（获取当前时间、计算时间差）
- `re`：正则表达式（查找、替换、匹配字符串）
- `random`：随机数（随机整数、随机选择、打乱顺序）
- `sys`：系统参数（获取命令行参数、退出程序）
- `time`：时间戳、延时、计时
- `csv`：读写 CSV 表格文件

##### 例子
###### json - JSON 处理
```python
import json

# 编码
data = {"name": "小明", "age": 18}
json_str = json.dumps(data, ensure_ascii=False)

# 解码
data = json.loads('{"name": "小明", "age": 18}')

# 文件操作
with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

with open("data.json", "r", encoding="utf-8") as f:
    data = json.load(f)
```
---
###### math
```python
import math
print(math.pi)
print(math.sqrt(16))
```
###### os - 操作系统接口
```python
import os

os.getcwd()              # 当前工作目录
os.listdir(".")          # 列出目录内容
os.path.join("a", "b")   # 路径拼接
os.path.exists("file")   # 判断文件是否存在
os.makedirs("dir/sub")   # 创建目录
os.remove("file")        # 删除文件
```
---
 ###### datetime - 日期时间
```python
from datetime import datetime, timedelta

now = datetime.now()                    # 当前时间
print(now.strftime("%Y-%m-%d %H:%M:%S"))  # 格式化

tomorrow = now + timedelta(days=1)      # 明天
print(tomorrow)

# 解析字符串
dt = datetime.strptime("2026-04-20", "%Y-%m-%d")
```
---
###### re
```python
import re
re.findall(r'\d+', 'abc123def')
```
###### random
```python
import random
print(random.randint(1, 10))
```
###### sys
```python
import sys
print(sys.argv)
```
###### time
```python
import time
time.sleep(1)
```
###### csv
```python
import csv
# 写入 CSV 文件（encoding指定编码避免中文乱码）
with open("a.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["姓名", "年龄"])  # 表头
    writer.writerow(["小明", 18])     # 数据行
    # 补充写入行示例
```
###### collections - 高级容器
```python
from collections import Counter, defaultdict, deque, namedtuple

# Counter - 计数器
words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
count = Counter(words)
print(count)  # Counter({'apple': 3, 'banana': 2, 'cherry': 1})

# defaultdict - 带默认值的字典
dd = defaultdict(list)
dd["fruits"].append("apple")
dd["fruits"].append("banana")
print(dd)  # {'fruits': ['apple', 'banana']}

# deque - 双端队列
d = deque([1, 2, 3])
d.appendleft(0)
d.append(4)
print(d)  # deque([0, 1, 2, 3, 4])

# namedtuple - 命名元组
Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
print(p.x, p.y)  # 3 4
```
---
######  functools - 函数工具
```python
from functools import lru_cache, partial, reduce

# lru_cache - 缓存
@lru_cache(maxsize=128)
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# partial - 偏函数
def power(base, exponent):
    return base ** exponent

square = partial(power, exponent=2)
cube = partial(power, exponent=3)

print(square(5))  # 25
print(cube(5))    # 125
```
---
#### python模块

###### 导入整个模块
```python
import 模块名
```
使用：
```python
模块名.功能()
```

###### 导入并起别名
```python
import 模块名 as 别名
```
使用：
```python
别名.功能()
```
###### 导入模块里某个功能
```python
from 模块名 import 功能名
```
使用：
```python
功能名()
```
###### 导入功能并起别名
```python
from 模块名 import 功能名 as 别名
```
使用：
```python
别名()
```
###### 导入模块所有功能
```python
from 模块名 import *
```
使用：
```python
功能名()
```
---

#### 特殊变量

###### `__name__`
- 直接运行当前文件时：`__name__ == "__main__"`
- 被别的文件导入时：`__name__ == "模块名"`

常用写法：
```python
def func():
    pass
if __name__ == "__main__":
    # 只有直接运行时才执行
    func()
```
###### `__all__`
控制 `from 模块 import *` 能导入哪些功能
```python
__all__ = ["func1", "func2"]
```
######  `__init__`
是类的构造方法，创建对象时自动执行，用于初始化对象属性 
```python
class Student:
    # 初始化：创建对象时自动执行
    def __init__(self, name, age):
        self.name = name   # 给对象赋值姓名
        self.age = age     # 给对象赋值年龄

# 创建对象，自动走 __init__
s1 = Student("小明", 18)

# 访问属性
print(s1.name)  # 小明
print(s1.age)   # 18
```
---
### class 基础

#### 1. 定义类
```python
class 类名:
    代码块
```
命名规范：**大驼峰命名法**
例： `PersonInfo`

---
#### 2. 创建对象
```python
对象名 = 类名()
```
---
#### 3. 动态添加实例属性
```python
对象名.属性名 = 属性值
对象名.属性名 = 属性值
```
实例：
```python
class Student:
    pass

stu = Student()
stu.name = "小明"
stu.age = 18
```
---
#### 4. 初始化方法 `__init__`（最常用）
```python
class 类名:
    def __init__(self, 参数1, 参数2):
        self.属性1 = 参数1
        self.属性2 = 参数2
```
示例：
```python
class Student:
    def __init__(self, name, age):
        self.name = name
        self.age = age

# 创建对象时直接传参
stu = Student("小明", 18)
print(stu.name)
print(stu.age)
```
---
#### 5. 类属性 vs 实例属性

###### 类属性
属于类，所有对象共享
```python
class Student:
    school = "北京大学"  # 类属性
print(Student.school)
```
###### 实例属性
属于单个对象，互不影响
```python
stu = Student()
stu.name = "小明"      # 实例属性
```
---
- `class 类名:` 定义类
- `对象名 = 类名()` 创建对象
- `__init__(self,...)` 初始化属性
- `self.属性` = 实例属性
- `类名.属性` = 类属性

### 三、类基础（OOP）

#### 3.1 基本类定义
```python
class Student:
    """学生类"""
    
    # 类属性（所有实例共享）
    school = "Python大学"
    count = 0
    
    def __init__(self, name, age):
        """构造方法"""
        self.name = name      # 实例属性
        self.age = age
        Student.count += 1    # 修改类属性
    
    def introduce(self):
        """实例方法"""
        return f"我是{self.name}，今年{self.age}岁"
    
    @classmethod
    def get_count(cls):
        """类方法"""
        return f"共有{cls.count}个学生"
    
    @staticmethod
    def is_adult(age):
        """静态方法"""
        return age >= 18

# 使用
stu = Student("小明", 18)
print(stu.introduce())        # 我是小明，今年18岁
print(Student.get_count())    # 共有1个学生
print(Student.is_adult(20))   # True
```

---

#### 3.2 属性访问控制
```python
class BankAccount:
    def __init__(self, balance=0):
        self.__balance = balance    # 私有属性（双下划线）
    
    @property
    def balance(self):
        """getter"""
        return self.__balance
    
    @balance.setter
    def balance(self, value):
        """setter"""
        if value < 0:
            raise ValueError("余额不能为负")
        self.__balance = value
    
    @balance.deleter
    def balance(self):
        """deleter"""
        del self.__balance

# 使用
account = BankAccount(1000)
print(account.balance)        # 1000（通过property访问）
account.balance = 2000        # 通过setter修改
# account.balance = -100      # 报错：ValueError
```

---
#### 3.3 继承
```python
class Animal:
    def __init__(self, name):
        self.name = name
    
    def speak(self):
        raise NotImplementedError

class Dog(Animal):
    def speak(self):
        return f"{self.name}：汪汪汪！"

class Cat(Animal):
    def speak(self):
        return f"{self.name}：喵喵喵！"

# 多继承
class Flyable:
    def fly(self):
        return "我能飞！"

class Bird(Animal, Flyable):
    def speak(self):
        return f"{self.name}：叽叽喳喳！"

# 使用
dog = Dog("旺财")
print(dog.speak())       # 旺财：汪汪汪！

bird = Bird("小鸟")
print(bird.speak())      # 小鸟：叽叽喳喳！
print(bird.fly())        # 我能飞！
```

---
#### 3.4 super()使用
```python
class Shape:
    def __init__(self, color="白色"):
        self.color = color
        print(f"Shape初始化：{color}")

class Circle(Shape):
    def __init__(self, radius, color="红色"):
        super().__init__(color)  # 调用父类初始化
        self.radius = radius
        print(f"Circle初始化：半径{radius}")
    
    def area(self):
        return 3.14 * self.radius ** 2

# 使用
c = Circle(5)
# 输出：
# Shape初始化：红色
# Circle初始化：半径5
```

---
#### 3.5 魔术方法
```python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def __str__(self):
        """print()时调用"""
        return f"Vector({self.x}, {self.y})"
    
    def __repr__(self):
        """调试时调用"""
        return f"Vector(x={self.x}, y={self.y})"
    
    def __add__(self, other):
        """+ 运算符"""
        return Vector(self.x + other.x, self.y + other.y)
    
    def __len__(self):
        """len()函数"""
        return int((self.x**2 + self.y**2)**0.5)
    
    def __eq__(self, other):
        """== 运算符"""
        return self.x == other.x and self.y == other.y
    
    def __getitem__(self, index):
        """[]索引"""
        if index == 0:
            return self.x
        elif index == 1:
            return self.y
        raise IndexError("索引超出范围")

# 使用
v1 = Vector(3, 4)
v2 = Vector(1, 2)
print(v1)              # Vector(3, 4)
print(v1 + v2)         # Vector(4, 6)
print(len(v1))         # 5
print(v1 == v2)        # False
print(v1[0])           # 3
```

---
#### 3.6 常用魔术方法速查表
| 方法 | 触发时机 | 示例 |
|:---|:---|:---|
| `__init__` | 创建实例时 | `obj = Class()` |
| `__str__` | print() | `print(obj)` |
| `__repr__` | 调试时 | `repr(obj)` |
| `__len__` | len() | `len(obj)` |
| `__getitem__` | []索引 | `obj[0]` |
| `__setitem__` | []赋值 | `obj[0] = 1` |
| `__add__` | + | `a + b` |
| `__sub__` | - | `a - b` |
| `__mul__` | * | `a * b` |
| `__eq__` | == | `a == b` |
| `__lt__` | < | `a < b` |
| `__call__` | ()调用 | `obj()` |
| `__enter__` | with 进入 | `with obj:` |
| `__exit__` | with 退出 | `with obj:` |
| `__iter__` | for 迭代 | `for i in obj` |
| `__next__` | next() | `next(obj)` |

---
### python 基础函数

#### 基础函数
 - 1.1 [[数学相关]]
 - 1.2 [[类型转换]]
 - 1.3 [[类型检查]]
 - 1.4 [[输入输出]]
 - 1.5 [[迭代相关]]
 - 1.6 [[其他]]

###### 匿名函数
单行表达式，只在一个地方使用
```python
# 定义
func = lambda a, b: a + b
# 使用
print(func(2, 3))
```
---
###### 普通函数 def 实例
```python
def add(a, b):
    return a + b
print(add(2, 3))
```
---
## Python 高阶函数

###### 1. map（映射）
对列表里**每个元素做相同操作**
```python
# 将函数应用于每个元素
numbers = [1, 2, 3, 4, 5]
squares = list(map(lambda x: x**2, numbers))
print(squares)  # [1, 4, 9, 16, 25]

# 多个可迭代对象
a = [1, 2, 3]
b = [10, 20, 30]
result = list(map(lambda x, y: x + y, a, b))
print(result)  # [11, 22, 33]
```

---
###### 2. filter（过滤）
按条件**筛选元素**
```python
# 过滤符合条件的元素
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens = list(filter(lambda x: x % 2 == 0, numbers))
print(evens)  # [2, 4, 6, 8, 10]

# 过滤掉假值
values = [0, 1, "", "hello", None, True, False]
truthy = list(filter(None, values))
print(truthy)  # [1, 'hello', True]
```

---
###### 3. sorted（排序）
指定规则排序
```python
# 基本排序
numbers = [3, 1, 4, 1, 5, 9, 2, 6]
print(sorted(numbers))           # [1, 1, 2, 3, 4, 5, 6, 9]
print(sorted(numbers, reverse=True))  # [9, 6, 5, 4, 3, 2, 1, 1]

# 自定义排序（按key）
students = [
    {"name": "小明", "age": 18, "score": 85},
    {"name": "小红", "age": 19, "score": 92},
    {"name": "小刚", "age": 17, "score": 78}
]

by_score = sorted(students, key=lambda s: s["score"], reverse=True)
print(by_score)  # 按分数降序排列

# 多条件排序
by_age_then_score = sorted(students, key=lambda s: (s["age"], s["score"]))
```

---
###### 4. reduce （累积计算）
对序列**反复累积操作**。
```python
from functools import reduce

# 累积计算
numbers = [1, 2, 3, 4, 5]
product = reduce(lambda x, y: x * y, numbers)
print(product)  # 120 (1*2*3*4*5)

# 带初始值
total = reduce(lambda x, y: x + y, numbers, 100)
print(total)  # 115 (100+1+2+3+4+5)
```

---
###### 5. max  /min （带 key 的高阶函数）
可以传 `key` 函数自定义比较规则。
```python
max([1,2,3], key=lambda x: -x)
```

---
###### 6. any / all 
接收可调用对象，判断真假。
```python
# any()：任意一个为True则返回True
print(any([False, False, True]))   # True
print(any([0, 0, 0]))              # False

# all()：所有为True才返回True
print(all([True, True, True]))     # True
print(all([True, False, True]))    # False

# 实用示例
numbers = [2, 4, 6, 8, 10]
print(all(n % 2 == 0 for n in numbers))  # True（全是偶数）
```

---
###### 7.zip()-打包
```python
# 基本用法
names = ["小明", "小红", "小刚"]
ages = [18, 19, 17]
scores = [85, 92, 78]

for name, age, score in zip(names, ages, scores):
    print(f"{name} {age}岁 {score}分")

# 转换为字典
student_dict = dict(zip(names, ages))
print(student_dict)  # {'小明': 18, '小红': 19, '小刚': 17}

# 长度不等时使用zip_longest
from itertools import zip_longest
a = [1, 2, 3]
b = ["a", "b"]
print(list(zip_longest(a, b, fillvalue="?")))
# [(1, 'a'), (2, 'b'), (3, '?')]
```

---
###### 8. enumerate() - 带索引迭代

```python
fruits = ["apple", "banana", "cherry"]

for index, fruit in enumerate(fruits):
    print(f"{index}: {fruit}")

# 自定义起始索引
for index, fruit in enumerate(fruits, start=1):
    print(f"{index}. {fruit}")
```

---
###### 9. iter() / next()
部分用法也属于高阶函数，但一般不重点考

---
## python 高级特性

### 文件操作
[[文件操作]]

---
### 装饰器
[[装饰器]]

---
### 生成器
[[生成器]]

---
### 迭代器
[[迭代器]]

---
### 上下文管理器
[[上下文管理器]]

---
### 5.5 闭包（Closure）

```python
# 基本闭包
def outer(x):
    def inner(y):
        return x + y
    return inner

add_5 = outer(5)
print(add_5(3))  # 8
print(add_5(10)) # 15

# 计数器闭包
def make_counter():
    count = 0
    def counter():
        nonlocal count
        count += 1
        return count
    return counter

counter = make_counter()
print(counter())  # 1
print(counter())  # 2
```

---


---

### 5.7 海象运算符（:=）Python 3.8+

```python
# 赋值表达式
if (n := len([1, 2, 3, 4])) > 3:
    print(f"列表长度{n}大于3")

# while循环
while (line := input("输入：")) != "quit":
    print(f"你输入了：{line}")

# 列表推导式
data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
results = [y for x in data if (y := x**2) > 20]
print(results)  # [25, 36, 49, 64, 81, 100]
```

---

### 5.8 类型提示（Type Hints）Python 3.5+

```python
from typing import List, Dict, Tuple, Optional, Union, Callable

# 基本类型提示
def greet(name: str) -> str:
    return f"Hello, {name}"

# 容器类型
def process_items(items: List[int]) -> List[str]:
    return [str(item) for item in items]

# 字典类型
def get_user() -> Dict[str, Union[str, int]]:
    return {"name": "小明", "age": 18}

# 可选类型
def find_user(user_id: int) -> Optional[str]:
    if user_id == 1:
        return "小明"
    return None

# 函数类型
def apply(func: Callable[[int, int], int], a: int, b: int) -> int:
    return func(a, b)

# 类型别名
Vector = List[float]
def scale(scalar: float, vector: Vector) -> Vector:
    return [scalar * num for num in vector]
```

---

### 5.9 协程（Coroutine）Python 3.5+

```python
import asyncio

# 基本协程
async def hello():
    print("Hello")
    await asyncio.sleep(1)
    print("World")

# 异步函数
async def fetch_data(url: str) -> str:
    print(f"获取{url}...")
    await asyncio.sleep(1)  # 模拟网络请求
    return f"来自{url}的数据"

# 并发执行
async def main():
    # 同时执行多个协程
    results = await asyncio.gather(
        fetch_data("api/users"),
        fetch_data("api/posts"),
        fetch_data("api/comments")
    )
    for result in results:
        print(result)

# 运行
# asyncio.run(main())

# 异步生成器
async def async_range(start, end):
    for i in range(start, end):
        await asyncio.sleep(0.1)
        yield i

# 异步上下文管理器
class AsyncConnection:
    async def __aenter__(self):
        print("连接数据库")
        await asyncio.sleep(0.1)
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        print("关闭连接")
        await asyncio.sleep(0.1)
```

---

### 5.10 协议类（Protocol）

```python
from typing import Protocol

# 定义协议
class Drawable(Protocol):
    def draw(self) -> None:
        ...

# 实现协议（不需要显式继承）
class Circle:
    def draw(self) -> None:
        print("绘制圆形")

class Square:
    def draw(self) -> None:
        print("绘制正方形")

# 使用协议类型
def render(shape: Drawable) -> None:
    shape.draw()

render(Circle())  # 绘制圆形
render(Square())  # 绘制正方形
```