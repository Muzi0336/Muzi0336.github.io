# 列表（List）

```python
# 列表切片规则：左闭右开，不包含结束位；列表索引是精准定位单个元素
# 正向索引：0 开始
# 反向索引：-1 开始
lst = [a, b, c, d, e, f]
# 索引：0  1  2  3  4  5
# 反索：-6 -5 -4 -3 -2 -1
```
---

**合并列表**

```python
list1 = [1,2]
list2 = [3,4]
# 方法1：+ 号（最常用）
new_list = list1 + list2  #[1，2，3，4]
# 方法2：嵌套列表（不是合并）
new_list = [list1, list2] # [[1,2], [3,4]]
```
---

**列表推导式**

```python
new_list = [x for x in 原列表]
new_list = [x for x in 原列表 if 条件]

`del xxx[]` #删除元素

lst[索引] = 新值#替换

lst[开始:结束:步长]
# 左开右闭：包含开始，不包含结束

#追加
lst.append(元素)        # 尾部追加
lst.insert(索引, 元素)   # 指定位置插入
```
---

**删除列表**

```python
del lst[索引]           # 删除指定索引元素
lst.remove(元素值)       # 删除第一个匹配的值
lst.pop(索引)            # 删除并返回指定索引元素
lst.pop()                # 删除最后一个元素
lst.clear()              # 清空整个列表

len(lst)          # 列表长度（个数）
lst.count(元素)    # 统计某个元素出现次数
```
---

**排序**

**从小到大**

```python
lst = [3,1,2]
lst.sort()
print(lst)  # [1,2,3]
```
---

**从大到小**

```python
lst = [3,1,2]
lst.sort(reverse=True)
print(lst)  # [3,2,1]
```
---

**反转列表**

```python
lst = [1,2,3]
lst.reverse()
print(lst)  # [3,2,1]
```
---

**查询元素次数**

```python
lst = [1,2,2,3]
print(lst.count(2))  # 2
```
---

**按长度排序**

```python
lst = ["apple", "hi", "python"]
lst.sort(key=len)  # 按字符串长度从小到大排
print(lst)  # ['hi', 'apple', 'python']
```
---

**自定义排序规则**

```python
# key=xxx → 自定义排序规则（跟踪）
key=len 按长度
key=str.lower 不区分大小写
lambda 自定义
```

---