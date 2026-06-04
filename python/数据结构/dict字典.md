# 字典（Dictionary）

储存键值对（key：value）类型的数据
通过 key 可以找到 value
```python
# 1. 定义字典
stu = {"name": "小明", "age": 18, "sex": "男"}

# 2. 修改 / 添加
stu["age"] = 19       # 修改
stu["score"] = 90     # 添加

# 3. 删除
stu.pop("sex")        # pop 删除并返回
del stu["age"]        # del 删除

# 4. 取值
print(stu["name"])
print(stu.get("score"，0)) # get方法：键不存在时返回0，避免KeyError

# 5. 获取所有 key / value / 键值对
print(stu.keys())
print(stu.values())
print(stu.items())
```
---

**遍历字典**
```python
stu = {"name": "小明", "score": 90}
for k, v in stu.items():
    print(k, v)
```
---