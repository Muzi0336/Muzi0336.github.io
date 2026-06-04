# `yield` 的完整工作原理

`yield` 是 Python 中用于创建生成器的关键字。它的核心特点是：**函数可以暂停执行并返回中间结果，之后可以从暂停处继续执行**。

---

**1. 基础工作机制**

**普通函数 vs 生成器函数**

```python
# 普通函数：一次性执行完毕
def normal_func():
    return 1
    return 2  # 永远不会执行

# 生成器函数：包含 yield
def generator_func():
    yield 1
    yield 2
    yield 3
```

**执行流程**

```python
def my_generator():
    print("开始执行")
    yield 1
    print("恢复执行")
    yield 2
    print("再次恢复")
    yield 3
    print("结束")

gen = my_generator()  # 此时函数并未执行
print(next(gen))  # 打印"开始执行"，返回1
print(next(gen))  # 打印"恢复执行"，返回2
print(next(gen))  # 打印"再次恢复"，返回3
print(next(gen))  # 抛出 StopIteration
```

**输出：**
```
开始执行
1
恢复执行
2
再次恢复
3
结束
StopIteration
```

---

**2. 底层实现原理**

**生成器对象的结构**

当 Python 遇到包含 `yield` 的函数时：
1. 不会立即执行函数体
2. 而是创建一个**生成器对象**（generator object）
3. 该对象实现了迭代器协议（`__iter__()` 和 `__next__()`）

```python
def simple_gen():
    x = 1
    yield x
    x += 1
    yield x

gen = simple_gen()
print(type(gen))  # <class 'generator'>
print(dir(gen))   # 包含 __next__, send, throw, close 等方法
```

**帧（Frame）的保存**

```python
import inspect

def show_frame():
    gen = simple_gen()
    frame = inspect.currentframe()
    
    # 生成器保存了自己的执行帧
    print(gen.gi_frame)  # 生成器帧对象
    print(gen.gi_running)  # 是否正在执行
```

关键属性：
- `gi_frame`：保存函数执行状态的帧对象
- `gi_running`：生成器是否正在执行
- `gi_code`：生成器对应的代码对象

---

**3. 状态机模型**

生成器内部维护一个状态机：

```python
def state_machine_example():
    # 状态0：初始状态
    x = 0
    
    # 状态1：第一个 yield
    yield x
    x += 1
    
    # 状态2：第二个 yield
    yield x
    x += 1
    
    # 状态3：结束状态
    yield x
```

**等价的状态机实现：**

```python
class GeneratorStateMachine:
    def __init__(self):
        self.state = 0
        self.x = 0
    
    def __next__(self):
        if self.state == 0:
            self.state = 1
            return self.x
        elif self.state == 1:
            self.x += 1
            self.state = 2
            return self.x
        elif self.state == 2:
            self.x += 1
            self.state = 3
            return self.x
        else:
            raise StopIteration()
```

---

**4. 双向通信：send() 方法**

`yield` 不仅能返回值，还能接收外部传入的值：

```python
def echo():
    received = yield "准备接收"
    while True:
        received = yield f"收到: {received}"

gen = echo()
print(next(gen))        # "准备接收"
print(gen.send("Hello")) # "收到: Hello"
print(gen.send("World")) # "收到: World"
```

**send() 的工作原理**

```python
def bidirectional():
    x = yield 1          # yield 表达式的结果来自 send()
    print(f"收到: {x}")
    y = yield 2
    print(f"收到: {y}")

gen = bidirectional()
print(gen.send(None))  # 必须先启动，等价于 next(gen)
print(gen.send(100))   # 将100赋给x，然后执行到下一个yield
```

**执行步骤：**
1. `send(None)` 启动生成器，执行到第一个 `yield 1`
2. `send(100)` 将 100 赋值给 `x`，继续执行到第二个 `yield 2`

---

**5. 异常处理与关闭**

**throw() - 在 yield 处抛出异常**

```python
def catch_exception():
    try:
        yield 1
    except ValueError:
        print("捕获到 ValueError")
    yield 2

gen = catch_exception()
print(next(gen))        # 1
print(gen.throw(ValueError))  # 在 yield 1 处抛出异常
# 输出：捕获到 ValueError
#      2
```

**close() - 关闭生成器**

```python
def clean_up():
    try:
        yield 1
    finally:
        print("清理资源")

gen = clean_up()
print(next(gen))   # 1
gen.close()        # 触发 GeneratorExit，执行 finally
# 输出：清理资源
```

---

**6. yield from - 委托生成器**

`yield from` 可以将生成器工作委托给另一个生成器：

```python
def sub_generator():
    yield 1
    yield 2
    yield 3

def main_generator():
    yield "开始"
    yield from sub_generator()  # 委托
    yield "结束"

for value in main_generator():
    print(value)
# 输出：开始 1 2 3 结束
```

**yield from 的双向通道**

```python
def sub():
    x = yield "sub-等待"
    yield f"sub-收到: {x}"

def main():
    y = yield from sub()
    yield f"main-收到: {y}"

gen = main()
print(next(gen))      # "sub-等待"
print(gen.send(100))  # 100 直接传给 sub 的 yield 表达式
# 输出："sub-收到: 100"
#      "main-收到: None"
```

**`yield from` 自动处理：**
- 子生成器的 `next()` / `send()` / `throw()` / `close()`
- `StopIteration` 的值会作为表达式的结果

---

**7. 性能与内存优势**

```python
import sys

# 列表：一次性生成所有元素
list_comprehension = [x * 2 for x in range(1000000)]
print(sys.getsizeof(list_comprehension))  # ~8MB

# 生成器：惰性求值
generator_expr = (x * 2 for x in range(1000000))
print(sys.getsizeof(generator_expr))      # ~112 bytes
```

**内存节省：** 生成器只保存当前状态，而非所有数据

---

**8. 协程基础（简化版异步）**

```python
def simple_coroutine():
    total = 0
    while True:
        value = yield total
        if value is None:
            break
        total += value

coro = simple_coroutine()
next(coro)          # 启动到第一个 yield
print(coro.send(10))  # 10
print(coro.send(20))  # 30
coro.close()
```

---

**9. 常见应用场景**

**1. 无限序列**
```python
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b
```

**2. 流式处理大文件**
```python
def read_large_file(file_path):
    with open(file_path) as f:
        for line in f:
            yield line.strip()
```

**3. 异步编程（async/await 的基础）**
```python
# 简化示意
def async_task():
    yield "等待IO"
    yield "继续执行"
```

---

**总结**

| 特性 | 说明 |
|------|------|
| **惰性求值** | 需要时才计算，节省内存 |
| **状态保存** | 自动保存局部变量和执行位置 |
| **双向通信** | `send()` 可传入值给 `yield` |
| **异常传递** | `throw()` 可在暂停点抛异常 |
| **委托生成** | `yield from` 简化嵌套生成器 |
| **协程基础** | 可作为轻量级协程使用 |

理解 `yield` 的关键在于：**函数不再是一次性执行完毕的封闭单元，而是可以被暂停、恢复、通信的协作式任务**。