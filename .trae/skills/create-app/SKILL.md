---
name: "create-app"
description: "Guides developers through creating a new application in PIOC platform including frontend, backend, database registration, and permission setup. Invoke when user wants to create/add a new application to the system."
---

# 创建新应用指南

本Skill指导开发者在PIOC平台中创建新应用的完整流程。

## 前置条件

在开始创建应用前，请确保：
1. 已了解应用的功能需求和业务逻辑
2. 已确定应用的访问路径（URL）
3. 已确定应用所需的权限控制级别

## 应用类型说明

PIOC平台有两种应用类型：

### 内置应用（Built-in Apps）
- **ID范围**: 1-4
- **特点**: 系统核心应用，受保护，不允许删除，名称和URL不可修改
- **包含**: 用户管理、角色管理、应用管理、菜单管理

### 预装应用（Pre-installed Apps）
- **ID范围**: 5及以上
- **特点**: 系统预装的普通应用，硬编码在系统中，但可以被删除和修改
- **与普通应用的区别**: 在系统初始化时自动创建，有固定的ID和URL

## 创建步骤

### 1. 在应用管理中注册应用

**数据库表**: `pioc_apps`（应用信息表）

应用注册通过直接操作数据库完成，需要在两个地方添加应用信息：

#### A. 系统初始化脚本（必须）

**文件位置**: `src/lib/database/init.ts`

在 `initSQL` 变量中找到插入应用的SQL语句，添加新应用：

```sql
-- 插入预装应用（ID从5开始）
INSERT IGNORE INTO pioc_apps (id, name, description, icon, url, status) VALUES
  (5, '你的应用名称', '应用描述', 'AppstoreOutlined', '/your-app-path', 1);
```

**注意**:
- 使用 `INSERT IGNORE` 避免重复插入
- 为新应用分配唯一的ID（从5开始，1-4为系统内置应用保留）
- `icon` 使用Ant Design图标组件名称

#### B. 更新预装应用常量（必须）

**文件位置**: `src/lib/database/models/app.ts`

在 `PREINSTALLED_APPS` 和 `PREINSTALLED_APP_URLS` 中添加新应用：

```typescript
// 预装应用ID常量（普通应用，可删除和修改）
export const PREINSTALLED_APPS = {
  YOUR_APP: 5,           // 你的应用
} as const;

// 预装应用URL映射
export const PREINSTALLED_APP_URLS = {
  '/your-app-path': PREINSTALLED_APPS.YOUR_APP,
} as const;
```

同时，确保 `isPreinstalledApp` 和 `getPreinstalledAppIdByUrl` 函数正确实现：

```typescript
// 检查是否为预装应用
export function isPreinstalledApp(appId: number): boolean {
  return Object.values(PREINSTALLED_APPS).includes(appId as any);
}

// 根据URL获取预装应用ID
export function getPreinstalledAppIdByUrl(url: string): number | null {
  return PREINSTALLED_APP_URLS[url as keyof typeof PREINSTALLED_APP_URLS] || null;
}
```

#### C. 开发环境直接插入（可选）

如果开发环境数据库已初始化，可直接执行：
```sql
INSERT INTO pioc_apps (id, name, description, icon, url, status) 
VALUES (5, '应用名称', '应用描述', 'AppstoreOutlined', '/your-app-path', 1);
```

**重要字段说明**:
- `id`: 应用唯一标识（从5开始）
- `name`: 应用名称（唯一，必填）
- `description`: 应用描述
- `icon`: 图标名称（使用Ant Design图标）
- `url`: 应用访问路径（如 `/your-app`）
- `status`: 状态（1-启用，0-禁用）

### 2. 创建前端页面

**文件位置**: `src/app/{your-app-path}/page.tsx`

创建应用的主页面：

```tsx
'use client';

import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

export default function YourAppPage() {
  return (
    <div>
      <Title level={2}>应用标题</Title>
      <Card>
        {/* 应用内容 */}
      </Card>
    </div>
  );
}
```

**创建布局文件**（可选，如果需要自定义布局）:
```tsx
// src/app/{your-app-path}/layout.tsx
import AppLayout from '@/components/layout/AppLayout';

export default function YourAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
```

### 3. 创建API接口

**文件位置**: `src/app/api/{your-api-path}/route.ts`

创建RESTful API：

```tsx
import { NextRequest, NextResponse } from 'next/server';
import { createAppProtectedHandler } from '@/lib/auth/middleware';

const appUrl = '/your-app-path'; // 与应用注册时的URL一致

// GET 请求处理
async function getHandler(request: NextRequest) {
  try {
    // 业务逻辑
    const data = await fetchYourData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch data', error: String(error) },
      { status: 500 }
    );
  }
}

// POST 请求处理
async function postHandler(request: NextRequest) {
  try {
    const body = await request.json();
    // 业务逻辑
    const result = await createYourData(body);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to create data', error: String(error) },
      { status: 500 }
    );
  }
}

// 使用应用权限保护
export const GET = createAppProtectedHandler(getHandler, appUrl);
export const POST = createAppProtectedHandler(postHandler, appUrl);
```

**带参数的API**（如 `/api/items/[id]`）:
```tsx
// src/app/api/items/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAppProtectedHandler } from '@/lib/auth/middleware';

const appUrl = '/your-app-path';

async function getItemHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // 业务逻辑
    const data = await fetchItemById(id);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch item', error: String(error) },
      { status: 500 }
    );
  }
}

type HandlerFunction = (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => Promise<NextResponse>;

const wrapHandler = (handler: HandlerFunction) => {
  return async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const protectedHandler = createAppProtectedHandler(
      (req: NextRequest) => handler(req, context),
      appUrl
    );
    return protectedHandler(request, context);
  };
};

export const GET = wrapHandler(getItemHandler);
```

### 4. 权限管理（应用创建后配置）

**数据库表**: `pioc_role_apps`（角色应用权限关联表）

⚠️ **注意**: 应用创建时**不分配任何权限**，需要在应用创建完成后手动配置：

**配置方式**:
- 访问 `/roles` 页面
- 选择需要授权的角色
- 在"应用权限"选项卡中勾选新创建的应用
- 保存设置

**权限验证机制**:
- API使用 `createAppProtectedHandler` 包装器自动验证权限
- 用户必须拥有对应应用的权限才能访问API
- 无权限访问会返回 403 错误

### 5. 添加菜单项（应用创建后配置）

**数据库表**: `pioc_menus`（菜单表）

⚠️ **注意**: 应用创建时**不添加任何菜单项**，需要在应用创建完成后手动配置：

**配置方式**:
- 访问 `/menus` 页面
- 选择父菜单组
- 点击"添加应用"
- 选择新创建的应用

### 6. 创建数据模型（可选）

**文件位置**: `src/lib/database/models/{your-model}.ts`

如果应用需要操作数据库，创建数据模型：

```tsx
import { query } from '../connection';

export interface YourModel {
  id: number;
  name: string;
  // 其他字段
  created_at: Date;
  updated_at: Date;
}

export async function findAll(): Promise<YourModel[]> {
  return query<YourModel[]>('SELECT * FROM pioc_your_table ORDER BY created_at DESC');
}

export async function findById(id: number): Promise<YourModel | null> {
  const results = await query<YourModel[]>('SELECT * FROM pioc_your_table WHERE id = ?', [id]);
  return results[0] || null;
}

export async function create(data: Partial<YourModel>): Promise<number> {
  const result = await query<{ insertId: number }>(
    'INSERT INTO pioc_your_table (name, ...) VALUES (?, ...)',
    [data.name, ...]
  );
  return result.insertId;
}
```

## 完整示例

创建一个名为"图书管理"的预装应用：

### 1. 注册应用

**在 `src/lib/database/init.ts` 中添加**:
```sql
INSERT IGNORE INTO pioc_apps (id, name, description, icon, url, status) VALUES
  ...
  (5, '图书管理', '管理系统图书信息', 'BookOutlined', '/books', 1);
```

**在 `src/lib/database/models/app.ts` 中添加**:
```typescript
// 预装应用ID常量
export const PREINSTALLED_APPS = {
  ...
  BOOK_MANAGEMENT: 5,    // 图书管理
} as const;

// 预装应用URL映射
export const PREINSTALLED_APP_URLS = {
  ...
  '/books': PREINSTALLED_APPS.BOOK_MANAGEMENT,
} as const;

// 检查是否为预装应用
export function isPreinstalledApp(appId: number): boolean {
  return Object.values(PREINSTALLED_APPS).includes(appId as any);
}

// 根据URL获取预装应用ID
export function getPreinstalledAppIdByUrl(url: string): number | null {
  return PREINSTALLED_APP_URLS[url as keyof typeof PREINSTALLED_APP_URLS] || null;
}
```

### 2. 创建页面
`src/app/books/page.tsx`:
```tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Table, Button, Card, message } from 'antd';

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  
  useEffect(() => {
    fetchBooks();
  }, []);
  
  const fetchBooks = async () => {
    const response = await fetch('/api/books');
    const data = await response.json();
    if (data.success) {
      setBooks(data.data);
    }
  };
  
  return (
    <Card title="图书管理">
      <Table dataSource={books} />
    </Card>
  );
}
```

### 3. 创建API
`src/app/api/books/route.ts`:
```tsx
import { NextRequest, NextResponse } from 'next/server';
import { createAppProtectedHandler } from '@/lib/auth/middleware';

const appUrl = '/books';

async function getBooksHandler(request: NextRequest) {
  // 实现获取图书列表逻辑
  return NextResponse.json({ success: true, data: [] });
}

export const GET = createAppProtectedHandler(getBooksHandler, appUrl);
```

### 4. 配置权限（应用创建后）
在 `/roles` 页面为相应角色分配"图书管理"应用权限。

### 5. 添加菜单（应用创建后）
在 `/menus` 页面将"图书管理"添加到合适的菜单组。

## 注意事项

1. **应用URL唯一性**: 应用的URL必须唯一，不能与其他应用重复
2. **ID分配**: 
   - 内置应用：ID 1-4（系统核心，不可删除）
   - 预装应用：ID 5及以上（普通应用，可删除和修改）
3. **权限即时生效**: 权限配置修改后立即生效，无需重启服务
4. **内置应用保护**: ID为1-4的应用为系统内置应用，不可删除，名称和URL不可修改
5. **预装应用特性**: 预装应用有固定ID和URL，硬编码在系统中，但可以被删除和修改
6. **数据库表前缀**: 所有自定义数据表必须使用 `pioc_` 前缀
7. **图标选择**: 使用Ant Design的图标组件名称
8. **初始化脚本**: 务必在 `init.ts` 中添加应用，确保新环境能自动创建

## 相关文件参考

- 数据库初始化: `src/lib/database/init.ts`
- 应用模型: `src/lib/database/models/app.ts`
- 权限中间件: `src/lib/auth/middleware.ts`
- 应用页面示例: `src/app/apps/page.tsx`
- API示例: `src/app/api/apps/route.ts`
