---
cssclasses:
  - inline-list
---

> 作者：zyyc-0336
> 日期：2026-04-09
> 说明：教学 + 复习笔记，从易到难排列

---

# FastAPI 学习笔记

---

**目录**

- **一、快速入门** → [1.1 第一个项目](#11-第一个-fastapi-项目) · [1.2 路径参数](#12-路径参数) · [1.3 查询参数](#13-查询参数) · [1.4 请求体](#14-请求体参数) · [1.5 响应类型](#15-响应类型)
- **二、核心概念** → [2.1 HTTP 方法](#21-http-方法crud) · [2.2 APIRouter](#22-apirouter-模块化路由) · [2.3 异常处理](#23-异常处理) · [2.4 中间件](#24-中间件) · [2.5 依赖注入](#25-依赖注入)
- **三、数据模型** → [3.1 Pydantic](#31-pydantic-模型) · [3.2 SQLAlchemy](#32-sqlalchemy-模型orm-表结构) · [3.3 Enum](#33-枚举类型enum) · [3.4 v2语法](#34-pydantic-v2-类型语法) · [3.5 验证器](#35-pydantic-字段验证器field_validator)
- **四、数据库操作** → [4.1 ORM基础](#41-orm-基础) · [4.2 异步会话](#42-异步数据库会话) · [4.3 关联查询](#43-数据库关联查询selectinload) · [4.4 事务](#44-事务管理commit--rollback) · [4.5 批量](#45-批量操作) · [4.6 分页](#46-分页查询模式) · [4.7 自动建表](#47-数据库自动建表--补列)
- **五、认证与安全** → [5.1 JWT认证](#51-jwt-认证登录鉴权) · [5.2 权限层级](#52-依赖注入嵌套权限层级)
- **六、文件与上传** → [6.1 文件上传](#61-文件上传) · [6.2 静态文件](#62-静态文件服务)
- **七、项目工程化** → [7.1 配置管理](#71-配置管理pydantic-settings) · [7.2 统一响应](#72-统一响应格式) · [7.3 自定义异常](#73-自定义异常类bizerror) · [7.4 Lifespan](#74-lifespan-生命周期事件) · [7.5 CORS](#75-cors-跨域配置) · [7.6 后台任务](#76-后台任务) · [7.7 调度器](#77-后台调度器asynciocreate_task) · [7.8 日志](#78-日志配置logging) · [7.9 Request](#79-request-对象获取请求元信息) · [7.10 async with](#710-async-with-上下文管理器)
- **附录** → [完整项目结构](#附录完整项目结构)

---

**一、快速入门** `先跑起来，再理解原理`

---

**1.1 第一个 FastAPI 项目**

```python
from fastapi import FastAPI

# 创建 FastAPI 实例
app = FastAPI()

# 根目录
@app.get("/")
async def root():
    return {"message": "Hello World"}

# hello 页面
@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}
```

> `app` → 实例名　　`get` → 请求方法　　`"/"` → 请求路径
> `async` → 异步　　`def` → 函数　　`root` → 函数名

启动命令：

```bash
uvicorn main:app --reload
```

---

**1.2 路径参数**

> 让同一个接口根据不同的输入返回不同的输出，实现动态交互

```python
@app.get("/book/{id}")
async def get_book(id: int):
    return {"id": id, "title": f"这是第{id}本书"}
```

> `/book/{id}` = 路径参数，`id: int` 强制类型为 int（只能传数字）

**Path：路径参数校验**

```python
from fastapi import Path

@app.get("/book/{id}")
async def get_book(
    id: int = Path(default=..., gt=0, lt=101, description="书籍id，取值范围1-100")
):
    return {"id": id, "title": f"这是第{id}本书"}

@app.get("/author/{name}")
async def get_name(name: str = Path(default=..., min_length=2, max_length=10)):
    return {"msg": f"这是{name}的信息"}
```

> `default=...` → 必填项　　`gt=0` → 大于 0　　`lt=101` → 小于 101
> `min_length=2` → 最少 2 个字符　　`max_length=10` → 最多 10 个字符

**速记口诀：**

- `Path()` = 路径参数校验
- `gt` / `lt` = 大于 / 小于
- `min_length` / `max_length` = 最短 / 最长长度

---

**1.3 查询参数**

> 位置：URL `?` 之后，`k1=v1&k2=v2` 格式
> 作用：对资源集合进行过滤、排序、分页

```python
@app.get("/news/news_list")
async def get_news_list(
    skip: int = Query(default=0, description="跳过的记录数", lt=100),
    limit: int = Query(default=10, description="返回的记录数")
):
    return {"skip": skip, "limit": limit}
```

> `Query()` → 查询参数校验工具，专门处理 URL 中的查询参数
> `skip` → 对应 URL 里的 `?skip=xxx`，默认跳过 0 条
> `lt=100` → `less than`，传 ≥100 会报错

---

**1.4 请求体参数**

> 位置：HTTP 请求的消息体（body）中
> 作用：创建、更新资源时携带大量数据（如 JSON）

HTTP 请求三部分：

1. **请求行**：方法、URL、协议版本
2. **请求头**：元数据（Content-Type、Authorization 等）
3. **请求体**：实际要发送的数据

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# 1. 定义 Pydantic 数据模型
class User(BaseModel):
    username: str
    password: str

# 2. 定义注册接口
@app.post("/register")
async def register(user: User):
    return {"msg": "注册成功", "username": user.username}
```

> `from pydantic import BaseModel` → 专门用来定义请求/响应数据结构
> `class User(BaseModel):` → 用户数据模型
> `POST` → 专门用来提交数据（注册、登录等）
> `user: User` → 类型注解，把 Pydantic 模型作为参数

**流程：**

1. 定义 Pydantic 数据模型
2. 写 FastAPI POST 接口
3. 前端发 JSON 请求
4. FastAPI 自动做：参数校验 → 类型转换 → JSON 解析 → 传给接口函数 → 返回结果

**curl 测试：**

```bash
curl -X 'POST' \
  'http://127.0.0.1:8000/register' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "username": "daqiu",
  "password": "123456"
}'
```

> `-d` 是 `data` 的缩写，代表请求体

**实际项目优化：**

1. 密码安全：绝对不能明文返回密码，实际会做哈希加密后再存库
2. 字段校验：可以加 `username: str = Field(min_length=3, max_length=20)` 限制长度

**Field：请求体字段校验**

```python
from pydantic import BaseModel, Field

class User(BaseModel):
    username: str = Field(default="张三", min_length=2, max_length=10, description="用户名，长度要求2-10个字")
    password: str = Field(min_length=3, max_length=20)
```

> `default="xxx"` → 默认值
> `min_length=xxx` → 最少 xxx 个字符
> `max_length=xxx` → 最多 xxx 个字符
> `description="xxx"` → 文档说明，会在 `/docs` 页面显示

---

**1.5 响应类型**

> 默认返回 JSON，也可以返回 HTML、文件、流式数据等

| 响应类型 | 用途 | 通俗解释 |
| --- | --- | --- |
| `JSONResponse` | 默认响应，返回 JSON | 默认就是它 |
| `HTMLResponse` | 返回 HTML 内容 | 返回网页 |
| `PlainTextResponse` | 返回纯文本 | 返回纯字符串 |
| `FileResponse` | 返回文件下载 | 让前端下载文件 |
| `StreamingResponse` | 流式响应 | 大文件/实时数据 |
| `RedirectResponse` | 重定向 | 跳转到其他地址 |

**JSONResponse（默认，不用导入）**

```python
from fastapi import FastAPI
app = FastAPI()

@app.get("/json")
async def get_json():
    return {"name": "张三", "age": 20}
```

**HTMLResponse（返回网页）**

```python
from fastapi.responses import HTMLResponse

@app.get("/html")
async def get_html():
    html_content = """
    <html>
        <head><title>FastAPI HTML</title></head>
        <body><h1>Hello FastAPI 网页！</h1></body>
    </html>
    """
    return HTMLResponse(content=html_content)
```

**PlainTextResponse（返回纯文本）**

```python
from fastapi.responses import PlainTextResponse

@app.get("/text")
async def get_text():
    return PlainTextResponse("这是纯文本内容，不会转成JSON")
```

**FileResponse（文件下载）**

```python
from fastapi.responses import FileResponse

@app.get("/download")
async def download_file():
    return FileResponse(
        path="./test.txt",
        filename="下载后的文件名.txt"
    )
```

**StreamingResponse（流式响应）**

```python
from fastapi.responses import StreamingResponse

async def stream_data():
    for i in range(5):
        yield f"第{i+1}条数据\n"

@app.get("/stream")
async def stream():
    return StreamingResponse(stream_data(), media_type="text/plain")
```

**RedirectResponse（重定向）**

```python
from fastapi.responses import RedirectResponse

@app.get("/redirect")
async def redirect():
    return RedirectResponse(url="https://www.baidu.com")
```

**自定义响应格式（response_model）**

```python
from pydantic import BaseModel

class News(BaseModel):
    id: int
    title: str
    content: str

@app.get("/news/{id}", response_model=News)
async def get_news(id: int):
    return {"id": id, "title": f"这是第{id}条新闻", "content": "详细内容"}
```

> `response_model` → 强制响应格式符合指定模型
> `response_model_include={"id", "title"}` → 只返回指定字段
> `response_model_exclude={"content"}` → 排除指定字段

---

**二、核心概念** `理解 FastAPI 的运行机制`

---

**2.1 HTTP 方法（CRUD）**

> RESTful 风格：用不同的 HTTP 方法对同一个资源进行增删改查

| 方法 | 作用 | 对应操作 | 示例 |
| --- | --- | --- | --- |
| `GET` | 查询 | 获取列表/详情 | `GET /activities` 查活动列表 |
| `POST` | 创建 | 新增资源 | `POST /activities` 创建活动 |
| `PUT` | 全量更新 | 替换整个资源 | `PUT /activities/1` 更新全部字段 |
| `PATCH` | 局部更新 | 只改部分字段 | `PATCH /activities/1` 只改标题 |
| `DELETE` | 删除 | 删除资源 | `DELETE /activities/1` 删除活动 |

**GET — 查询列表 + 详情**

```python
# 列表查询（带分页 + 筛选）
@router.get("")
async def list_activities(
    page: int = 1,
    size: int = 10,
    activity_type: str = None,
    status: str = None,
    db: AsyncSession = Depends(get_db),
):
    items, total = await activity_service.get_activities(db, page, size, activity_type, status)
    return success_response(results, total=total)

# 详情获取（路径参数）
@router.get("/{activity_id}")
async def get_activity(
    activity_id: int,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    activity = await activity_service.get_activity(db, activity_id)
    return success_response(activity)
```

**POST — 创建资源**

```python
@router.post("")
async def create_activity(
    data: ActivityCreate,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    activity = await activity_service.create_activity(db, data, user.id)
    return success_response(activity)
```

**PUT — 全量更新**

```python
@router.put("/{activity_id}")
async def update_activity(
    activity_id: int,
    data: ActivityUpdate,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    activity = await activity_service.update_activity(db, activity_id, data)
    return success_response(activity)
```

**PATCH — 局部更新（兼容路由）**

```python
# PATCH 和 PUT 逻辑一样，前端发哪个都行
@router.patch("/{activity_id}")
async def patch_activity(
    activity_id: int,
    data: ActivityUpdate,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    activity = await activity_service.update_activity(db, activity_id, data)
    return success_response(activity)
```

**DELETE — 删除资源**

```python
@router.delete("/{activity_id}")
async def delete_activity(
    activity_id: int,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await activity_service.delete_activity(db, activity_id)
    return success_response(None, message="删除成功")
```

**POST — 状态操作（认领/签到/报名等）**

```python
# 不是所有 POST 都是创建，有些是"执行某个动作"
@router.post("/{activity_id}/join")
async def join_activity(
    activity_id: int,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await activity_service.join_activity(db, activity_id, user.id)
    return success_response(None, message="报名成功")
```

---

**2.2 APIRouter 模块化路由**

> 把不同功能的路由拆分到不同文件，避免 main.py 膨胀

```python
# api/activity.py — 活动模块的路由
from fastapi import APIRouter

router = APIRouter(prefix="/activities", tags=["活动"])

@router.get("")
async def list_activities():
    ...

@router.get("/{activity_id}")
async def get_activity(activity_id: int):
    ...
```

```python
# main.py — 主文件中注册所有路由
from fastapi import FastAPI
from api.activity import router as activity_router
from api.auth import router as auth_router

app = FastAPI()

# 注册路由
app.include_router(activity_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
```

> `APIRouter()` → 路由分组工具
> `prefix="/activities"` → 路由前缀
> `tags=["活动"]` → Swagger 文档分组
> `app.include_router()` → 把路由注册到主应用

**路由拼接规则：**

| 文件前缀 | 路由前缀 | 最终 URL |
| --- | --- | --- |
| `/api/v1` | `/activities` | `/api/v1/activities` |
| `/api/v1` | `/activities/{id}` | `/api/v1/activities/1` |
| `/api/v1` | `/auth/login` | `/api/v1/auth/login` |

---

**2.3 异常处理**

> 统一处理错误，返回标准格式

```python
from fastapi import HTTPException

@app.get("/news/{news_id}")
async def get_news(news_id: int):
    if news_id not in news_db:
        raise HTTPException(status_code=404, detail="新闻ID不存在")
    return news_db[news_id]
```

> `HTTPException` → FastAPI 标准异常类
> `raise` → 主动抛出异常
> `status_code=404` → HTTP 状态码
> `detail="xxx"` → 错误详情，前端会收到

**常用状态码：**

| 状态码 | 含义 | 使用场景 |
| --- | --- | --- |
| 400 | Bad Request | 参数错误 |
| 401 | Unauthorized | 未登录 |
| 403 | Forbidden | 权限不足 |
| 404 | Not Found | 资源不存在 |
| 500 | Internal Server Error | 服务器内部错误 |

---

**2.4 中间件**

> 为每个请求添加统一的处理逻辑（日志、认证、跨域等）
> 执行顺序：自下而上

```python
@app.middleware("http")
async def middleware1(request, call_next):
    print("中间件1 start")
    response = await call_next(request)  # ← 分界线：之前是请求前，之后是响应后
    print("中间件1 end")
    return response

@app.middleware("http")
async def middleware2(request, call_next):
    print("中间件2 start")
    response = await call_next(request)
    print("中间件2 end")
    return response
```

> `call_next(request)` → 传递给下一个环节
> `await` → 异步等待，等接口处理完
> 这一行是「请求前」和「响应后」的分界线

**中间件常用场景：**

1. 日志记录：统一记录请求 URL、耗时、状态码
2. 跨域处理（CORS）：FastAPI 自带的 `CORSMiddleware`
3. 权限校验：统一验证 token
4. 接口耗时统计：性能监控
5. 请求限流：防止恶意刷接口

**BaseHTTPMiddleware（进阶写法）**

```python
from starlette.middleware.base import BaseHTTPMiddleware

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 跳过 OPTIONS 预检请求
        if request.method == "OPTIONS":
            return await call_next(request)

        # 限流逻辑
        ip = request.client.host
        # ...

        response = await call_next(request)

        # 添加自定义响应头
        response.headers["X-RateLimit-Limit"] = "100"
        return response
```

```python
# main.py — 注册中间件（顺序重要：后添加的先执行）
app.add_middleware(RateLimitMiddleware)   # 2. 限流（后添加，先执行）
app.add_middleware(CSPMiddleware)         # 3. CSP 安全头
app.add_middleware(CORSMiddleware, ...)   # 4. CORS（最外层，最先执行）
```

> `BaseHTTPMiddleware` → 基类，继承后重写 `dispatch` 方法
> 中间件执行顺序：**后添加的先执行**（栈结构）

---

**2.5 依赖注入**

> 共享通用逻辑，避免代码重复
> 依赖项：可重用的组件（函数/类），负责提供某种功能或数据

**优点：**

- 代码复用：一次编写，多处使用
- 解耦：业务逻辑与基础设施代码分离
- 易于测试：轻松替换真实依赖进行测试

**应用场景：**

- 处理请求参数
- 共享业务逻辑
- 共享数据库连接
- 安全和认证

```python
from fastapi import Depends

# 1. 定义公共依赖函数
async def common_parameters(
    skip: int = Query(default=0, ge=0, description="跳过的记录数"),
    limit: int = Query(default=10, le=60, description="每页返回的记录数")
):
    return {"skip": skip, "limit": limit}

# 2. 新闻列表接口：复用分页依赖
@app.get("/news/news_list")
async def get_news_list(commons=Depends(common_parameters)):
    return commons

# 3. 用户列表接口：复用同一个分页依赖
@app.get("/user/user_list")
async def get_user_list(commons=Depends(common_parameters)):
    return commons
```

> `Depends(common_parameters)` → 告诉 FastAPI 这个参数要通过执行函数来获取

| 概念 | 作用 |
| --- | --- |
| `Depends()` | 依赖注入工具，复用公共逻辑 |
| `common_parameters` | 公共依赖函数，封装共用的参数校验 |
| 复用性 | 多个接口共用一套参数规则 |
| 可维护性 | 修改参数规则时，所有接口同步生效 |

**其他用途：**

- 权限校验：写 `get_current_user` 依赖，所有需要登录的接口直接用
- 数据库连接：写 `get_db` 依赖，自动创建/关闭连接
- 日志记录：在依赖里统一记录请求日志

---

**三、数据模型** `定义数据结构`

---

**3.1 Pydantic 模型**

> 用类来定义接口的请求/响应数据结构，自动做类型校验

```python
from pydantic import BaseModel

# 请求体模型 — 定义前端发过来的数据结构
class ActivityCreate(BaseModel):
    title: str
    content: str
    activity_type: str
    start_time: datetime
    end_time: datetime

# 响应体模型 — 定义返回给前端的数据结构
class ActivityResponse(BaseModel):
    id: int
    title: str
    content: str
    status: str
    created_at: datetime

# 使用方式
@router.post("")
async def create_activity(data: ActivityCreate):
    # data.title, data.content 等自动可用
    ...

@router.get("/{id}", response_model=ActivityResponse)
async def get_activity(id: int):
    # 返回值自动按 ActivityResponse 格式序列化
    ...
```

> `BaseModel` → Pydantic 基类，所有数据模型都继承它
> `ActivityCreate` → 请求体模型，定义前端发什么
> `ActivityResponse` → 响应体模型，定义后端返回什么
> `response_model=ActivityResponse` → 强制返回格式

---

**3.2 SQLAlchemy 模型（ORM 表结构）**

> 每个 Python 类 = 数据库的一张表，每个类属性 = 表的一列

```python
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.orm import relationship
from core.database import Base

class User(Base):
    __tablename__ = "users"  # 数据库表名

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    phone = Column(String(20), unique=True, nullable=True)
    email = Column(String(100), unique=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="student", nullable=False)
    nickname = Column(String(50), nullable=True)
    avatar = Column(String(255), nullable=True)
    school = Column(String(100), nullable=True)
    student_id = Column(String(50), nullable=False)
    credit_score = Column(Integer, default=100, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    # 关联关系：一个用户有多个发布的活动
    published_activities = relationship("Activity", back_populates="publisher", lazy="selectin")
```

> `__tablename__` → 数据库中的实际表名
> `Column(类型, ...)` → 定义列
> `primary_key=True` → 主键
> `autoincrement=True` → 自增
> `unique=True` → 唯一约束
> `nullable=False` → 不能为空
> `index=True` → 建索引，查询更快
> `default=xxx` → 默认值
> `onupdate=xxx` → 更新时自动设置
> `relationship()` → 定义表之间的关联关系

**常用列类型：**

| SQLAlchemy 类型 | Python 类型 | 说明 |
| --- | --- | --- |
| `Integer` | `int` | 整数 |
| `String(50)` | `str` | 定长字符串 |
| `Text` | `str` | 长文本 |
| `Boolean` | `bool` | 布尔值 |
| `Float` | `float` | 浮点数 |
| `DateTime` | `datetime` | 日期时间 |
| `Date` | `date` | 日期 |

---

**3.3 枚举类型（Enum）**

> 用 `(str, Enum)` 双继承定义固定选项，值可直接存入数据库字符串列

```python
import enum

class ReportStatus(str, enum.Enum):
    PENDING = "pending"       # 待处理
    RESOLVED = "resolved"     # 已解决
    DISMISSED = "dismissed"   # 已驳回

class IntentStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    EXPIRED = "expired"
    CLOSED = "closed"
```

```python
# 在模型中使用
class MessageReport(Base):
    __tablename__ = "message_reports"
    status = Column(String(20), default=ReportStatus.PENDING.value)  # 存字符串

# 在路由中使用
@router.put("/{report_id}/resolve")
async def resolve_report(report_id: int, status: ReportStatus = ReportStatus.RESOLVED):
    # FastAPI 自动校验：只接受 "pending"/"resolved"/"dismissed"
    report.status = status.value
```

> `(str, Enum)` → 双继承：既是字符串又是枚举，可直接存入数据库
> `.value` → 取枚举的实际字符串值
> FastAPI 自动在 Swagger 文档中显示可选值下拉框

---

**3.4 Pydantic v2 类型语法**

> Python 3.10+ 的新语法，比 Optional 更简洁

```python
# 旧写法（Python 3.9 以前）
from typing import Optional
class User(BaseModel):
    nickname: Optional[str] = None
    phone: Optional[str] = None

# 新写法（Python 3.10+）
class User(BaseModel):
    nickname: str | None = None      # str 或 None
    phone: str | None = None

# 联合类型
class SearchRequest(BaseModel):
    query: str | int                 # 可以是字符串或整数
    filters: list[str] | None = None # 可以是字符串列表或 None
```

> `str | None` → 等价于 `Optional[str]`，更简洁
> `list[int]` → 等价于 `List[int]`，Python 3.9+ 原生支持
> `dict[str, Any]` → 等价于 `Dict[str, Any]`

---

**3.5 Pydantic 字段验证器（field_validator）**

> 在序列化前对字段做自定义转换（如 ORM 对象 → 字典）

```python
from pydantic import BaseModel, ConfigDict, field_validator

class ActivityResponse(BaseModel):
    id: int
    title: str
    publisher: dict | None = None

    @field_validator("publisher", mode="before")   # mode="before" → 在其他校验之前执行
    @classmethod
    def convert_publisher(cls, v):
        if v is None:
            return None
        if isinstance(v, dict):
            return v
        # ORM 对象 → 手动转为字典
        return {
            "id": v.id,
            "nickname": getattr(v, "nickname", None),
            "avatar": getattr(v, "avatar", None),
            "school": getattr(v, "school", None),
        }

    model_config = ConfigDict(from_attributes=True)  # 允许从 ORM 对象创建
```

> `@field_validator("字段名", mode="before")` → 在字段赋值前执行转换
> `@classmethod` → 必须加，Pydantic v2 要求
> `ConfigDict(from_attributes=True)` → 允许直接传 ORM 对象
> 替代旧写法：`class Config: orm_mode = True`

---

**四、数据库操作** `ORM 全流程`

---

**4.1 ORM 基础**

> ORM（Object-Relational Mapping）= 对象关系映射
> 用操作对象的方式与数据库交互，不用写 SQL

**优势：**

- 减少重复的 SQL 代码
- 代码更简洁易读
- 自动处理数据库连接和事务
- 自动防止 SQL 注入攻击

**建立数据库引擎：**

```python
from sqlalchemy.ext.asyncio import create_async_engine

ASYNC_DATABASE_URL = "mysql+aiomysql://root:your-password@localhost:3306/fastapi_test?charset=utf8"

async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=True,
    pool_size=10,
    max_overflow=20
)
```

**数据库 URL 格式：**

| 部分 | 含义 |
| --- | --- |
| `mysql+aiomysql` | 协议：用 MySQL 的异步驱动 |
| `root` | MySQL 用户名 |
| `your-password` | MySQL 密码（替换为自己的） |
| `localhost` | 数据库地址 |
| `3306` | 端口 |
| `fastapi_test` | 数据库名 |
| `charset=utf8` | 字符集（推荐 `utf8mb4` 支持 emoji） |

---

**4.2 异步数据库会话**

> 核心：用 `async/await` 操作数据库，不阻塞主线程

```python
# core/database.py — 数据库配置
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

# 1. 创建异步引擎
engine = create_async_engine(
    "sqlite+aiosqlite:///knowcamp.db",  # SQLite 异步驱动
    echo=False,
    pool_size=3,
)

# 2. 创建异步会话工厂
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# 3. 声明基类（所有模型继承它）
class Base(DeclarativeBase):
    pass

# 4. 依赖注入：每次请求自动创建/关闭会话
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session
```

```python
# 使用方式 — 在路由中注入
@router.get("")
async def list_items(db: AsyncSession = Depends(get_db)):
    # db 自动注入，用完自动关闭
    result = await db.execute(select(Item))
    items = result.scalars().all()
    return items
```

> `create_async_engine()` → 创建异步数据库引擎
> `async_sessionmaker()` → 创建异步会话工厂
> `yield session` → 依赖注入，请求期间使用，请求结束自动关闭

---

**4.3 数据库关联查询（selectinload）**

> 查询时预加载关联数据，避免 N+1 查询问题

```python
from sqlalchemy.orm import selectinload

# 方式一：在模型中声明（全局生效）
class Activity(Base):
    __tablename__ = "activities"
    publisher_id = Column(Integer, ForeignKey("users.id"))

    # lazy="selectin" → 查询活动时自动预加载 publisher
    publisher = relationship("User", back_populates="published_activities", lazy="selectin")

# 方式二：在查询时指定（按需加载）
query = (
    select(Activity)
    .options(selectinload(Activity.publisher))   # 预加载 publisher
    .where(Activity.status == "active")
)
result = await db.execute(query)
activities = result.scalars().all()

# 现在可以直接访问关联对象，不会触发额外查询
for act in activities:
    print(act.publisher.nickname)  # ✅ 已预加载，不会 N+1
```

> `lazy="selectin"` → 模型声明时设置，查询时自动用子查询预加载
> `selectinload(Activity.publisher)` → 查询时手动指定，更灵活
> 不预加载时：访问 `act.publisher` 会触发额外 SQL 查询（N+1 问题）

---

**4.4 事务管理（commit / rollback）**

> 数据库操作要么全部成功，要么全部回滚

```python
# 方式一：手动事务管理
@router.post("")
async def create_item(data: ItemCreate, db: AsyncSession = Depends(get_db)):
    item = Item(**data.model_dump())
    db.add(item)
    try:
        await db.commit()           # 提交事务
        await db.refresh(item)      # 刷新对象（获取自增 ID 等）
    except Exception:
        await db.rollback()         # 回滚事务
        raise HTTPException(400, "创建失败")
    return success_response(item)

# 方式二：用 yield 依赖自动管理（推荐）
async def get_db():
    async with async_session() as session:
        try:
            yield session           # 请求期间使用 session
            await session.commit()  # 请求正常结束 → 自动提交
        except Exception:
            await session.rollback()  # 请求异常 → 自动回滚
            raise
```

> `await db.commit()` → 提交所有待写入的变更
> `await db.rollback()` → 撤销所有未提交的变更
> `await db.refresh(obj)` → 从数据库重新加载对象（获取默认值、自增 ID 等）

---

**4.5 批量操作**

> 一次请求处理多条数据（批量更新、批量删除等）

```python
from pydantic import BaseModel

# 请求体定义
class BatchResolve(BaseModel):
    report_ids: list[int]        # 接收 ID 列表
    resolution: str
    resolution_note: str | None = None

# 批量处理接口
@router.put("/admin/batch-resolve")
async def batch_resolve_reports(
    body: BatchResolve,
    user=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    # 用 IN 查询批量获取
    result = await db.execute(
        select(Report).where(Report.id.in_(body.report_ids))
    )
    reports = result.scalars().all()

    # 逐条修改
    for r in reports:
        r.status = "resolved"
        r.resolution = body.resolution

    await db.commit()
    return success_response({"updated": len(reports)})
```

> `list[int]` → Pydantic 自动校验：必须是整数列表
> `.where(Model.id.in_(id_list))` → SQL 的 `IN` 查询，一次查多条
> 批量操作比逐条请求快得多，减少网络往返

---

**4.6 分页查询模式**

> 几乎所有列表接口都用这个模式

```python
@router.get("")
async def list_items(
    page: int = Query(1, ge=1),           # 页码，从 1 开始
    size: int = Query(20, ge=1, le=100),  # 每页条数，最大 100
    keyword: str = Query(""),             # 搜索关键词
    category: str = Query(""),            # 分类筛选
    db: AsyncSession = Depends(get_db),
):
    # 1. 构建查询（带筛选条件）
    query = select(Model).where(Model.status == "active")
    if keyword:
        query = query.where(Model.title.contains(keyword))

    # 2. 计算总数
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    # 3. 分页查询（offset + limit）
    items_query = query.order_by(Model.created_at.desc()).offset((page - 1) * size).limit(size)
    result = await db.execute(items_query)
    items = result.scalars().all()

    # 4. 返回（带 total）
    return success_response(items, total=total)
```

> `offset((page - 1) * size)` → 跳过前面的记录
> `.limit(size)` → 只取 size 条
> `func.count()` → SQL 的 COUNT 函数
> `total` → 前端用来计算总页数

**前端分页公式：**

```
总页数 = Math.ceil(total / size)
当前页数据 = 第 (page-1)*size+1 条 到 第 page*size 条
```

---

**4.7 数据库自动建表 + 补列**

> SQLite 的 `CREATE TABLE IF NOT EXISTS` 不会修改已有表结构，需要手动补列

```python
from sqlalchemy import inspect as sa_inspect, text

def _sync_ensure_columns(bind) -> None:
    """检查并补全缺失的列"""
    inspector = sa_inspect(bind)
    for table_name, columns in TABLE_COLUMNS.items():
        existing = {c["name"] for c in inspector.get_columns(table_name)}
        with bind.begin() as conn:
            for col_name, col_def in columns.items():
                if col_name not in existing:
                    conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {col_name} {col_def}"))
                    print(f"[DB] 补列: {table_name}.{col_name}")

# 在 lifespan 中调用
@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)  # 建表
        await conn.run_sync(_sync_ensure_columns)       # 补列
    yield
```

> `Base.metadata.create_all` → 自动创建所有表（已存在的跳过）
> `ALTER TABLE ... ADD COLUMN` → 给已有表添加新列
> 生产环境建议用 Alembic 迁移工具

---

**五、认证与安全** `保护你的 API`

---

**5.1 JWT 认证（登录鉴权）**

> 流程：登录 → 生成 JWT Token → 前端携带 Token → 后端验证 Token → 获取当前用户

```python
# core/security.py
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from passlib.context import CryptContext

# 密码哈希（bcrypt 加密）
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 Token 提取器（从 Header 中提取 Bearer Token）
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# 生成 JWT Token
def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=30))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")

# 依赖注入：验证 Token → 返回当前用户
async def get_current_user(
    token: str = Depends(oauth2_scheme),  # 自动从 Header 提取 Token
    db: AsyncSession = Depends(get_db),
):
    credentials_exception = HTTPException(
        status_code=401,
        detail="无效的认证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await db.get(User, user_id)
    if user is None:
        raise credentials_exception
    return user
```

```python
# 登录接口 — 生成 Token
@router.post("/login")
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(db, data.username, data.password)
    token = create_access_token(data={"sub": user.id})
    return success_response({"token": token, "user": user})

# 需要登录的接口 — 用 Depends 注入
@router.get("/profile")
async def get_profile(user=Depends(get_current_user)):
    return success_response(user)
```

> `OAuth2PasswordBearer` → 从 Header 中提取 `Bearer xxx` Token
> `jwt.encode()` → 生成 Token
> `jwt.decode()` → 解析 Token
> `Depends(get_current_user)` → 自动验证 Token，失败返回 401

---

**5.2 依赖注入嵌套（权限层级）**

> 依赖函数内部再依赖其他依赖，形成认证 → 授权的链路

```python
# 第一层：获取当前用户（所有需要登录的接口用）
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    # 验证 Token → 查询用户 → 返回
    ...

# 第二层：获取当前管理员（需要管理员权限的接口用）
async def get_current_admin(
    current_user = Depends(get_current_user),  # 先走第一层认证
):
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(status_code=403, detail="需要管理员权限")
    return current_user
```

```python
# 使用方式
@router.get("/profile")
async def get_profile(user=Depends(get_current_user)):    # 普通用户
    ...

@router.get("/admin/users")
async def admin_list_users(user=Depends(get_current_admin)):  # 管理员
    ...
```

> `Depends(get_current_admin)` → FastAPI 自动先执行 `get_current_user`，再执行 `get_current_admin`
> 形成链路：`oauth2_scheme → get_db → get_current_user → get_current_admin`
> 每层只关心自己的逻辑，职责清晰

---

**六、文件与上传** `处理文件上传和访问`

---

**6.1 文件上传**

> FastAPI 使用 `UploadFile` 接收上传的文件

```python
from fastapi import UploadFile, File

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    user=Depends(get_current_user),
):
    # 读取文件内容
    content = await file.read()

    # 保存文件
    file_path = f"uploads/{file.filename}"
    with open(file_path, "wb") as f:
        f.write(content)

    return success_response({"url": file_path})
```

> `UploadFile` → FastAPI 文件上传类型
> `File(...)` → 标记为必填文件参数
> `await file.read()` → 异步读取文件内容
> `file.filename` → 原始文件名
> `file.content_type` → MIME 类型

**带日期目录的上传：**

```python
import os
from datetime import datetime

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # 按日期创建目录：uploads/2026/06/04/
    date_dir = datetime.now().strftime("%Y/%m/%d")
    upload_dir = f"uploads/{date_dir}"
    os.makedirs(upload_dir, exist_ok=True)

    # 生成唯一文件名
    import uuid
    ext = os.path.splitext(file.filename)[1]
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(upload_dir, unique_name)

    # 保存
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    return success_response({"url": file_path})
```

---

**6.2 静态文件服务**

> 把本地目录映射为 URL，前端可以通过 URL 直接访问文件

```python
from fastapi.staticfiles import StaticFiles

# 把 uploads/ 目录映射为 /uploads/ URL
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
```

```python
# 前端访问方式
# 文件保存在：uploads/2026/06/04/abc123.jpg
# 前端通过 URL 访问：http://localhost:8000/uploads/2026/06/04/abc123.jpg
```

> `app.mount()` → 挂载静态文件目录
> `directory="uploads"` → 本地目录路径
> `name="uploads"` → 挂载名称（唯一标识）

---

**七、项目工程化** `让项目更规范、更易维护`

---

**7.1 配置管理（pydantic-settings）**

> 用类来管理项目配置，自动从 `.env` 文件加载环境变量，类型安全

```python
# core/config.py
from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    # 项目信息
    PROJECT_NAME: str = "校知道 - KnowCamp"
    VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api/v1"

    # 数据库
    DATABASE_URL: str = "sqlite+aiosqlite:///./knowcamp.db?journal_mode=WAL"

    # JWT
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7天

    # 文件上传
    UPLOAD_DIR: Path = Path("uploads")
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB

    class Config:
        env_file = ".env"           # 自动读取 .env 文件
        env_file_encoding = "utf-8"

# 全局单例
settings = Settings()
```

```bash
# .env 文件（项目根目录）
SECRET_KEY=your-random-secret-key-here
DATABASE_URL=mysql+aiomysql://root:123456@localhost:3306/knowcamp
```

```python
# 使用方式 — 在任何地方导入 settings
from core.config import settings

print(settings.SECRET_KEY)        # 读取配置
print(settings.API_V1_PREFIX)     # "/api/v1"
```

> `BaseSettings` → 继承自 Pydantic BaseModel，自动做类型校验
> `env_file = ".env"` → 自动从 `.env` 文件加载环境变量
> 环境变量优先级 > `.env` 文件 > 默认值

---

**7.2 统一响应格式**

> 所有接口返回统一格式，前端处理更方便

```python
# core/response.py
from typing import Any

def success_response(data: Any = None, message: str = "success", total: int = None):
    """成功响应"""
    resp = {"code": 0, "message": message, "data": data}
    if total is not None:
        resp["total"] = total
    return resp

def error_response(code: int = 400, message: str = "error"):
    """错误响应"""
    return {"code": code, "message": message, "data": None}
```

```python
# 使用方式
@router.get("")
async def list_items():
    items = await service.get_all()
    return success_response(items, total=len(items))

@router.get("/{item_id}")
async def get_item(item_id: int):
    item = await service.get(db, item_id)
    if not item:
        raise BizError(404, "不存在")
    return success_response(item)
```

**统一响应格式：**

```json
{
    "code": 0,
    "message": "success",
    "data": { ... },
    "total": 10
}
```

> `code: 0` → 成功
> `code: 400/404/500` → 失败
> `total` → 列表查询时返回总数（可选）

---

**7.3 自定义异常类（BizError）**

> 比 `HTTPException` 更好用，统一错误格式

```python
# core/exceptions.py
class BizError(Exception):
    def __init__(self, status_code: int = 400, detail: str = "业务错误"):
        self.status_code = status_code
        self.detail = detail

# 注册异常处理器
def register_exception_handlers(app: FastAPI):
    @app.exception_handler(BizError)
    async def biz_error_handler(request, exc):
        return JSONResponse(
            status_code=exc.status_code,
            content={"code": exc.status_code, "message": exc.detail}
        )

    @app.exception_handler(ValidationError)
    async def validation_error_handler(request, exc):
        # Pydantic 校验失败时，返回字段级错误详情
        errors = []
        for err in exc.errors():
            loc = " → ".join(str(x) for x in err["loc"])
            errors.append({"field": loc, "message": err["msg"]})
        return JSONResponse(
            status_code=422,
            content={"code": 422, "message": "数据校验失败", "errors": errors},
        )

    @app.exception_handler(Exception)
    async def general_error_handler(request, exc):
        # 兜底：未捕获的异常返回 500
        return JSONResponse(status_code=500, content={"code": 500, "message": "服务器内部错误"})
```

```python
# 使用方式
@router.get("/{item_id}")
async def get_item(item_id: int, ...):
    item = await service.get(db, item_id)
    if not item:
        raise BizError(404, "活动不存在")  # 自动返回 {"code": 404, "message": "活动不存在"}
    return success_response(item)
```

> `BizError` → 自定义业务异常，比 `HTTPException` 更灵活
> `ValidationError` → Pydantic 校验失败时自动触发
> `Exception` → 兜底，防止未捕获异常泄露到前端

---

**7.4 Lifespan 生命周期事件**

> 应用启动时初始化资源，关闭时释放资源

```python
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ===== 启动时执行 =====
    # 创建数据库表
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[OK] 数据库表已创建")

    # 启动后台调度器
    await start_scheduler()
    print("[OK] 调度器已启动")

    yield  # ← 这里是分界线，上面是启动，下面是关闭

    # ===== 关闭时执行 =====
    await engine.dispose()
    print("[OK] 数据库连接已关闭")

app = FastAPI(title="校知道", version="0.1.0", lifespan=lifespan)
```

> `@asynccontextmanager` → 异步上下文管理器
> `yield` 之前 → 应用启动时执行
> `yield` 之后 → 应用关闭时执行
> 替代旧写法：`@app.on_event("startup")` 和 `@app.on_event("shutdown")`

---

**7.5 CORS 跨域配置**

> 前后端分离时，前端和后端不在同一个端口/域名，浏览器会拦截请求
> CORS 中间件允许跨域

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",       # 正则匹配所有来源（开发环境用）
    allow_credentials=True,        # 允许携带 Cookie/Token
    allow_methods=["*"],           # 允许所有 HTTP 方法
    allow_headers=["*"],           # 允许所有请求头
    expose_headers=["*"],          # 暴露所有响应头
)
```

> `allow_origin_regex=".*"` → 允许所有域名（生产环境应限制具体域名）
> `allow_credentials=True` → 前端可以带 Cookie/Authorization 头
> `allow_methods=["*"]` → 允许 GET/POST/PUT/DELETE 等所有方法

---

**7.6 后台任务**

> 不需要等待结果的操作（发邮件、写日志等）可以放到后台执行

```python
from fastapi import BackgroundTasks

def write_log(message: str):
    """后台执行的任务函数"""
    with open("log.txt", "a") as f:
        f.write(message + "\n")

@router.post("/action")
async def do_action(data: ActionRequest, background_tasks: BackgroundTasks):
    # 先返回响应
    background_tasks.add_task(write_log, f"用户执行了操作: {data}")
    return {"message": "操作成功"}
```

> `BackgroundTasks` → FastAPI 内置的后台任务工具
> `background_tasks.add_task(func, *args)` → 请求结束后异步执行
> 适合：日志记录、发送通知、数据同步等不需要立即返回结果的操作

---

**7.7 后台调度器（asyncio.create_task）**

> 不依赖第三方库，用原生 asyncio 实现定时任务

```python
import asyncio
from datetime import datetime, timezone

CHECK_INTERVAL = 60  # 每 60 秒检查一次

async def auto_update_activity_status():
    """根据时间自动切换活动状态"""
    try:
        async with async_session() as db:
            now = datetime.now(timezone.utc)
            # draft → active：到了开始时间自动上线
            await db.execute(
                update(Activity)
                .where(Activity.status == "draft", Activity.start_time <= now)
                .values(status="active")
            )
            await db.commit()
    except Exception as e:
        print(f"[Scheduler] 失败: {e}")

async def scheduler_loop():
    """主循环：每隔一段时间执行一次"""
    print(f"[Scheduler] 启动，每 {CHECK_INTERVAL} 秒检查一次")
    while True:
        await asyncio.sleep(CHECK_INTERVAL)   # 非阻塞等待
        await auto_update_activity_status()

async def start_scheduler():
    """启动后台任务（非阻塞）"""
    asyncio.create_task(scheduler_loop())       # 创建后台任务
    asyncio.create_task(auto_update_activity_status())  # 立即执行一次
```

```python
# 在 lifespan 中启动
@asynccontextmanager
async def lifespan(app: FastAPI):
    # ... 初始化 ...
    await start_scheduler()    # 启动调度器
    yield
```

> `asyncio.create_task()` → 创建后台异步任务，不阻塞主流程
> `await asyncio.sleep()` → 非阻塞等待，不会卡住整个服务器
> `while True` → 无限循环，持续运行
> 适合：状态轮询、过期清理、定时同步等

---

**7.8 日志配置（logging）**

> 标准库 logging，不用额外安装

```python
import logging

# 创建 logger（模块级）
logger = logging.getLogger(__name__)

# 使用方式
@router.get("/{item_id}")
async def get_item(item_id: int, ...):
    try:
        item = await service.get(db, item_id)
        logger.info("查询成功: item_id=%d", item_id)        # 普通日志
        return success_response(item)
    except Exception as e:
        logger.exception("查询失败: item_id=%d", item_id)   # 异常日志（自动打印堆栈）
        raise
```

> `logging.getLogger(__name__)` → 按模块名创建 logger
> `logger.info()` → 普通信息
> `logger.warning()` → 警告
> `logger.exception()` → 异常信息（自动包含堆栈跟踪）
> `logger.error()` → 错误信息

---

**7.9 Request 对象（获取请求元信息）**

> 有时候需要获取请求本身的元信息（IP、User-Agent 等）

```python
from fastapi import Request

@router.post("/login")
async def login(req: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    # 获取客户端 IP
    ip = request.client.host
    # 获取 User-Agent
    ua = request.headers.get("user-agent", "")
    # 获取完整 URL
    url = str(request.url)

    user = await authenticate_user(db, req.username, req.password)
    ...
```

> `request.client.host` → 客户端 IP 地址
> `request.headers` → 请求头字典
> `request.url` → 完整请求 URL
> `request.method` → HTTP 方法

---

**7.10 async with 上下文管理器**

> 异步资源的自动获取和释放（数据库连接、文件句柄等）

```python
# 数据库会话 — 最常见的用法
async def get_db():
    async with async_session() as session:   # 自动创建会话
        yield session                        # 使用会话
        # with 块结束时自动关闭会话

# 手动使用
async with async_session() as db:
    result = await db.execute(select(User))
    users = result.scalars().all()
# 离开 with 块后，db 自动关闭

# 文件操作
async with aiofiles.open("file.txt", "r") as f:
    content = await f.read()
# 自动关闭文件
```

> `async with` → 异步上下文管理器，自动调用 `__aenter__` 和 `__aexit__`
> 比手动 `try/finally` 更简洁
> 确保资源一定被释放（即使发生异常）

---

**附录：完整项目结构**

```
knowcamp_app/backend/
├── main.py                 # 应用入口（lifespan、中间件、路由注册）
├── core/
│   ├── config.py           # 配置（数据库 URL、密钥等）
│   ├── database.py         # 数据库引擎 + 会话 + Base
│   ├── security.py         # JWT + 密码哈希 + 认证依赖
│   ├── response.py         # 统一响应格式
│   ├── exceptions.py       # 自定义异常类
│   ├── api_rate_limit.py   # 限流中间件
│   └── csp.py              # CSP 安全中间件
├── models/
│   ├── user.py             # 用户表模型
│   ├── activity.py         # 活动表模型
│   └── ...
├── api/
│   ├── auth.py             # 认证路由（注册/登录/登出）
│   ├── activity.py         # 活动路由（CRUD）
│   ├── upload.py           # 文件上传路由
│   └── ...
├── services/
│   ├── activity_service.py # 活动业务逻辑
│   └── ...
└── uploads/                # 上传文件存储目录
```

> **分层架构：**
> - `api/` → 路由层（接收请求、调用服务、返回响应）
> - `services/` → 业务逻辑层（处理具体业务）
> - `models/` → 数据层（定义表结构）
> - `core/` → 基础设施层（配置、数据库、认证、中间件）
