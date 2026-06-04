# 集合（Set）

**创建集合**
 ```python
 s1 = {1, 2, 3, 4}
 s2 = {3, 4, 5, 6}
 
 print("原始集合 s1:", s1)
 print("原始集合 s2:", s2)
 
 ```
 ---
 **添加**
 ```python
s1.add(5)
 print("添加 5 后 s1:", s1)
 ```

 ---
 **移除指定元素**
  ```python
s1.remove(1)
  print("移除 1 后 s1:", s1)
  ```

---
**随机移除并返回**
 ```python
pop_item = s1.pop()
 print("随机删除的元素:", pop_item)
 print("pop 后 s1:", s1)
 ```
 
---
**清空**
 ```python
 s1.clear()
 print("清空后 s1:", s1)
 ```
例：
```python
a = {1,2,3}
b = {3,4,5}
```
**集合运算**

**差集**
 ```python
print("差集:", a.difference(b)) # {1,2} 
xx = a - b 
print("简写 -:", xx)
 ```
**并集**
 ```python
print("并集:", a.union(b)) # {1,2,3,4,5} 
xx = a | b 
print("简写 |:", xx)
 ```
**交集**
 ```python
print("交集:", a.intersection(b)) # {3} 
xx = a & b 
print("简写 &:", xx)

 ```
**集合推导式**
```python
集合 = { 要放的数据 for 变量 in 可迭代对象 if 条件 }
```

**常用：not in（去重/筛选不存在的）**
```python
# 例子：从列表筛选出不在 s2 里的数，生成集合
a = {1,2,3}
b = {3,4,5}

new_set = {x for x in a if x not in b}
print(new_set)   # {1,2}
```