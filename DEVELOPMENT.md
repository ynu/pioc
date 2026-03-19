# 个人智慧运行中心平台（PIOC）开发文档

## 1. 项目概述

个人智慧运行中心平台（Personal Intelligence Operations Center，简称PIOC）是一个集成化的个人数字化管理平台，旨在帮助用户集中管理个人信息、应用、数据和智能服务。平台通过统一的界面和智能分析能力，为用户提供个性化的数字化生活和工作体验。

### 1.1 项目目标

- 建立统一的个人数据管理中心，整合各类个人信息和应用
- 提供智能分析和决策支持，提升个人效率和生活质量
- 确保数据安全和隐私保护，建立可信赖的个人数字化环境
- 支持多设备、多平台的无缝访问和使用体验

### 1.2 技术栈

| 分类 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 前端 | Next.js | 16+ | 服务端渲染框架 |
| 前端 | Ant Design | v6 | UI组件库 |
| 前端 | React | 18+ | 前端框架 |
| 后端 | Node.js | 16+ | 运行环境 |
| 后端 | Express | 4.18+ | Web框架 |
| 数据库 | MySQL | 8.0+ | 关系型数据库 |
| 数据库 | MongoDB | 5.0+ | 非关系型数据库 |
| 缓存 | Redis | 7.0+ | 缓存系统 |
| 认证 | JWT | - | 无状态认证 |
| 认证 | OAuth2.0 | - | 第三方认证 |
| 部署 | Docker | 20.0+ | 容器化 |
| 部署 | Kubernetes | 1.24+ | 容器编排 |

## 2. 项目结构

### 2.1 目录结构

```
pioc/
├── client/                 # 前端代码
│   ├── components/         # 通用组件
│   ├── pages/              # 页面
│   ├── public/             # 静态资源
│   ├── styles/             # 样式文件
│   ├── utils/              # 工具函数
│   ├── services/           # API服务
│   ├── store/              # 状态管理
│   ├── config/             # 配置文件
│   ├── next.config.js      # Next.js配置
│   ├── package.json        # 前端依赖
│   └── tsconfig.json       # TypeScript配置
├── server/                 # 后端代码
│   ├── src/                # 源代码
│   │   ├── controllers/    # 控制器
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由
│   │   ├── middlewares/    # 中间件
│   │   ├── services/       # 业务逻辑
│   │   ├── utils/          # 工具函数
│   │   ├── config/         # 配置文件
│   │   └── app.js          # 应用入口
│   ├── package.json        # 后端依赖
│   └── tsconfig.json       # TypeScript配置
├── docker/                 # Docker配置
│   ├── Dockerfile.client   # 前端Dockerfile
│   ├── Dockerfile.server   # 后端Dockerfile
│   └── docker-compose.yml  # Docker Compose配置
├── kubernetes/             # Kubernetes配置
│   ├── deployment.yaml     # 部署配置
│   ├── service.yaml        # 服务配置
│   └── ingress.yaml        #  ingress配置
├── docs/                   # 文档
├── .gitignore              # Git忽略文件
└── README.md               # 项目说明
```

### 2.2 模块划分

| 模块 | 职责 | 主要文件 |
|------|------|----------|
| 用户管理 | 用户注册、登录、资料管理 | server/src/controllers/userController.js |
| 角色管理 | 角色创建、权限分配、成员管理 | server/src/controllers/roleController.js |
| 应用管理 | 应用集成、授权、状态管理 | server/src/controllers/appController.js |
| 认证授权 | JWT认证、OAuth2.0集成、权限控制 | server/src/middlewares/auth.js |
| 仪表盘 | 个性化仪表盘、数据可视化 | client/components/Dashboard.js |
| 智能分析 | 行为分析、数据洞察、个性化推荐 | server/src/services/analyticsService.js |
| 数据管理 | 数据导入/导出、备份/恢复 | server/src/controllers/dataController.js |
| 通知中心 | 消息通知、通知管理、实时推送 | server/src/controllers/notificationController.js |

## 3. 核心模块实现

### 3.1 用户管理模块

#### 3.1.1 功能实现

- **用户注册**：支持邮箱、手机号、第三方账号注册
- **用户登录**：支持密码登录、验证码登录、第三方账号登录
- **个人资料管理**：支持修改个人基本信息、头像、联系方式等
- **密码管理**：支持修改密码、忘记密码重置功能
- **多因素认证**：支持短信验证码、邮箱验证码、Google Authenticator等多因素认证
- **用户状态管理**：支持用户账户的启用、禁用、锁定等状态管理

#### 3.1.2 关键代码

```javascript
// server/src/controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 用户注册
exports.register = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    
    // 检查用户是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: '用户已存在' });
    }
    
    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建用户
    const user = new User({
      email,
      password: hashedPassword,
      name,
      phone,
      status: 'active'
    });
    
    await user.save();
    
    // 生成JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ message: '注册成功', token, user });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

// 用户登录
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }
    
    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(403).json({ message: '账号已被禁用' });
    }
    
    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }
    
    // 生成JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(200).json({ message: '登录成功', token, user });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};
```

### 3.2 角色管理模块

#### 3.2.1 功能实现

- **角色创建与管理**：支持创建、编辑、删除角色
- **权限分配**：支持为角色分配不同级别的权限
- **角色继承**：支持角色权限的继承机制
- **角色成员管理**：支持将用户分配到不同角色
- **权限审计**：支持查看角色权限变更历史

#### 3.2.2 关键代码

```javascript
// server/src/controllers/roleController.js
const Role = require('../models/Role');
const User = require('../models/User');

// 创建角色
exports.createRole = async (req, res) => {
  try {
    const { name, description, permissions, parentRole } = req.body;
    
    // 检查角色是否已存在
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ message: '角色已存在' });
    }
    
    // 创建角色
    const role = new Role({
      name,
      description,
      permissions,
      parentRole
    });
    
    await role.save();
    
    res.status(201).json({ message: '角色创建成功', role });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

// 分配用户到角色
exports.assignUserToRole = async (req, res) => {
  try {
    const { roleId, userId } = req.body;
    
    // 检查角色是否存在
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: '角色不存在' });
    }
    
    // 检查用户是否存在
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 分配角色
    user.roles.push(roleId);
    await user.save();
    
    res.status(200).json({ message: '用户分配角色成功', user });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};
```

### 3.3 应用管理模块

#### 3.3.1 功能实现

- **应用集成**：支持集成第三方应用（如邮件、日历、任务管理等）
- **应用授权**：支持管理应用的访问权限和数据权限
- **应用状态管理**：支持启用、禁用、删除应用
- **应用分类**：支持对应用进行分类管理
- **应用使用统计**：支持统计应用使用频率和时长

#### 3.3.2 关键代码

```javascript
// server/src/controllers/appController.js
const Application = require('../models/Application');
const User = require('../models/User');

// 集成应用
exports.integrateApp = async (req, res) => {
  try {
    const { name, type, clientId, clientSecret, redirectUri, scopes } = req.body;
    
    // 检查应用是否已存在
    const existingApp = await Application.findOne({ name });
    if (existingApp) {
      return res.status(400).json({ message: '应用已存在' });
    }
    
    // 创建应用
    const app = new Application({
      name,
      type,
      clientId,
      clientSecret,
      redirectUri,
      scopes,
      status: 'active'
    });
    
    await app.save();
    
    res.status(201).json({ message: '应用集成成功', app });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

// 管理应用权限
exports.manageAppPermissions = async (req, res) => {
  try {
    const { appId, permissions } = req.body;
    
    // 检查应用是否存在
    const app = await Application.findById(appId);
    if (!app) {
      return res.status(404).json({ message: '应用不存在' });
    }
    
    // 更新权限
    app.permissions = permissions;
    await app.save();
    
    res.status(200).json({ message: '应用权限更新成功', app });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};
```

### 3.4 认证授权模块

#### 3.4.1 功能实现

- **JWT认证**：支持基于JWT的无状态认证
- **OAuth2.0集成**：支持作为OAuth2.0服务提供商和客户端
- **权限控制**：支持基于角色的访问控制（RBAC）
- **API授权**：支持API访问的授权管理
- **访问日志**：支持记录用户访问和操作日志

#### 3.4.2 关键代码

```javascript
// server/src/middlewares/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

// JWT认证中间件
exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }
    
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查找用户
    const user = await User.findById(decoded.userId).populate('roles');
    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }
    
    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(403).json({ message: '账号已被禁用' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: '认证失败', error });
  }
};

// 权限检查中间件
exports.authorize = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      // 获取用户所有角色的权限
      const roles = await Role.find({ _id: { $in: user.roles } });
      let userPermissions = [];
      
      roles.forEach(role => {
        userPermissions = [...userPermissions, ...role.permissions];
      });
      
      // 去重
      userPermissions = [...new Set(userPermissions)];
      
      // 检查是否有所有必需的权限
      const hasAllPermissions = requiredPermissions.every(permission => 
        userPermissions.includes(permission)
      );
      
      if (!hasAllPermissions) {
        return res.status(403).json({ message: '权限不足' });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ message: '服务器错误', error });
    }
  };
};
```

### 3.5 仪表盘模块

#### 3.5.1 功能实现

- **个性化仪表盘**：支持用户自定义仪表盘布局和组件
- **数据可视化**：支持图表、表格等多种数据展示方式
- **实时数据更新**：支持仪表盘数据的实时更新
- **多维度数据展示**：支持从不同维度展示个人数据
- **仪表盘模板**：支持提供预设的仪表盘模板

#### 3.5.2 关键代码

```javascript
// client/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Button, Modal, Form, Select, Input } from 'antd';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Content } = Layout;

const Dashboard = () => {
  const [dashboards, setDashboards] = useState([]);
  const [activeDashboard, setActiveDashboard] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 模拟仪表盘数据
  const dashboardData = [
    {
      id: 1,
      name: '个人概览',
      widgets: [
        {
          id: 1,
          type: 'line',
          title: '活动趋势',
          data: [
            { name: '周一', value: 120 },
            { name: '周二', value: 190 },
            { name: '周三', value: 150 },
            { name: '周四', value: 230 },
            { name: '周五', value: 180 },
            { name: '周六', value: 90 },
            { name: '周日', value: 110 },
          ],
        },
        {
          id: 2,
          type: 'pie',
          title: '应用使用分布',
          data: [
            { name: '邮件', value: 30 },
            { name: '日历', value: 20 },
            { name: '任务', value: 25 },
            { name: '笔记', value: 15 },
            { name: '其他', value: 10 },
          ],
        },
      ],
    },
  ];

  useEffect(() => {
    setDashboards(dashboardData);
    setActiveDashboard(dashboardData[0]);
  }, []);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      console.log('Received values of form:', values);
      setIsModalVisible(false);
    });
  };

  const renderWidget = (widget) => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    switch (widget.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={widget.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={widget.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={widget.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {widget.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <Content style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>仪表盘</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
          添加仪表盘
        </Button>
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        {dashboards.map(dashboard => (
          <Button
            key={dashboard.id}
            type={activeDashboard?.id === dashboard.id ? 'primary' : 'default'}
            style={{ marginRight: '8px', marginBottom: '8px' }}
            onClick={() => setActiveDashboard(dashboard)}
          >
            {dashboard.name}
          </Button>
        ))}
      </div>
      
      {activeDashboard && (
        <Row gutter={[16, 16]}>
          {activeDashboard.widgets.map(widget => (
            <Col span={8} key={widget.id}>
              <Card
                title={widget.title}
                extra={
                  <div>
                    <Button icon={<EditOutlined />} size="small" style={{ marginRight: '8px' }} />
                    <Button icon={<DeleteOutlined />} size="small" danger />
                  </div>
                }
              >
                {renderWidget(widget)}
              </Card>
            </Col>
          ))}
          <Col span={8}>
            <Card
              title="添加组件"
              bordered={false}
              style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Button type="dashed" icon={<PlusOutlined />} size="large">
                添加组件
              </Button>
            </Card>
          </Col>
        </Row>
      )}
      
      <Modal
        title="添加仪表盘"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="仪表盘名称" rules={[{ required: true, message: '请输入仪表盘名称' }]}>
            <Input placeholder="请输入仪表盘名称" />
          </Form.Item>
          <Form.Item name="template" label="选择模板">
            <Select placeholder="请选择模板">
              <Select.Option value="personal">个人概览</Select.Option>
              <Select.Option value="work">工作管理</Select.Option>
              <Select.Option value="health">健康追踪</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
};

export default Dashboard;
```

### 3.6 智能分析模块

#### 3.6.1 功能实现

- **行为分析**：分析用户行为模式和习惯
- **数据洞察**：提供个人数据的智能洞察和建议
- **预测分析**：基于历史数据进行趋势预测
- **个性化推荐**：根据用户偏好提供个性化推荐
- **异常检测**：检测异常行为和数据异常

#### 3.6.2 关键代码

```javascript
// server/src/services/analyticsService.js
const User = require('../models/User');
const DataRecord = require('../models/DataRecord');
const Application = require('../models/Application');

// 行为分析
exports.analyzeUserBehavior = async (userId) => {
  try {
    // 获取用户数据记录
    const records = await DataRecord.find({ userId }).sort({ timestamp: -1 }).limit(1000);
    
    // 分析行为模式
    const behaviorPatterns = {
      activeHours: {},
      appUsage: {},
      dataTypes: {},
    };
    
    records.forEach(record => {
      // 分析活跃时间
      const hour = new Date(record.timestamp).getHours();
      behaviorPatterns.activeHours[hour] = (behaviorPatterns.activeHours[hour] || 0) + 1;
      
      // 分析应用使用
      if (record.appId) {
        behaviorPatterns.appUsage[record.appId] = (behaviorPatterns.appUsage[record.appId] || 0) + 1;
      }
      
      // 分析数据类型
      behaviorPatterns.dataTypes[record.type] = (behaviorPatterns.dataTypes[record.type] || 0) + 1;
    });
    
    return behaviorPatterns;
  } catch (error) {
    throw new Error('行为分析失败');
  }
};

// 数据洞察
exports.generateInsights = async (userId) => {
  try {
    // 获取用户行为分析
    const behaviorPatterns = await this.analyzeUserBehavior(userId);
    
    // 生成洞察
    const insights = [];
    
    // 活跃时间洞察
    const mostActiveHour = Object.keys(behaviorPatterns.activeHours).reduce((a, b) => 
      behaviorPatterns.activeHours[a] > behaviorPatterns.activeHours[b] ? a : b
    );
    insights.push(`您在${mostActiveHour}:00-${mostActiveHour + 1}:00最为活跃`);
    
    // 应用使用洞察
    const mostUsedAppId = Object.keys(behaviorPatterns.appUsage).reduce((a, b) => 
      behaviorPatterns.appUsage[a] > behaviorPatterns.appUsage[b] ? a : b
    );
    if (mostUsedAppId) {
      const app = await Application.findById(mostUsedAppId);
      if (app) {
        insights.push(`您最常使用的应用是${app.name}`);
      }
    }
    
    return insights;
  } catch (error) {
    throw new Error('生成洞察失败');
  }
};

// 个性化推荐
exports.generateRecommendations = async (userId) => {
  try {
    // 获取用户数据
    const user = await User.findById(userId);
    const records = await DataRecord.find({ userId }).sort({ timestamp: -1 }).limit(500);
    
    // 分析用户偏好
    const preferences = {};
    records.forEach(record => {
      if (record.type) {
        preferences[record.type] = (preferences[record.type] || 0) + 1;
      }
    });
    
    // 生成推荐
    const recommendations = [];
    
    // 基于偏好推荐应用
    if (preferences['task']) {
      recommendations.push('推荐使用任务管理应用提高效率');
    }
    if (preferences['calendar']) {
      recommendations.push('推荐使用日历应用管理时间');
    }
    if (preferences['note']) {
      recommendations.push('推荐使用笔记应用记录灵感');
    }
    
    return recommendations;
  } catch (error) {
    throw new Error('生成推荐失败');
  }
};
```

### 3.7 数据管理模块

#### 3.7.1 功能实现

- **数据导入/导出**：支持数据的导入和导出功能
- **数据备份/恢复**：支持数据的自动备份和恢复
- **数据分类管理**：支持对个人数据进行分类管理
- **数据安全管理**：支持数据加密和安全存储
- **数据访问控制**：支持对数据的访问权限控制

#### 3.7.2 关键代码

```javascript
// server/src/controllers/dataController.js
const DataRecord = require('../models/DataRecord');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 数据导出
exports.exportData = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // 获取用户数据
    const records = await DataRecord.find({ userId });
    
    // 生成导出文件
    const exportData = {
      userId,
      exportTime: new Date(),
      records,
    };
    
    const fileName = `data-export-${userId}-${Date.now()}.json`;
    const filePath = path.join(__dirname, '../../exports', fileName);
    
    // 确保导出目录存在
    if (!fs.existsSync(path.join(__dirname, '../../exports'))) {
      fs.mkdirSync(path.join(__dirname, '../../exports'), { recursive: true });
    }
    
    // 写入文件
    fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
    
    // 下载文件
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('下载文件失败:', err);
      }
      // 清理文件
      setTimeout(() => {
        fs.unlinkSync(filePath);
      }, 60000);
    });
  } catch (error) {
    res.status(500).json({ message: '数据导出失败', error });
  }
};

// 数据导入
exports.importData = async (req, res) => {
  try {
    const userId = req.user._id;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ message: '请选择要导入的文件' });
    }
    
    // 读取文件
    const fileContent = fs.readFileSync(file.path, 'utf8');
    const importData = JSON.parse(fileContent);
    
    // 验证数据
    if (!importData.records || !Array.isArray(importData.records)) {
      return res.status(400).json({ message: '无效的数据文件' });
    }
    
    // 导入数据
    const importedRecords = [];
    for (const record of importData.records) {
      const newRecord = new DataRecord({
        ...record,
        userId,
        _id: uuidv4(),
      });
      await newRecord.save();
      importedRecords.push(newRecord);
    }
    
    // 清理临时文件
    fs.unlinkSync(file.path);
    
    res.status(200).json({ message: '数据导入成功', importedRecords });
  } catch (error) {
    res.status(500).json({ message: '数据导入失败', error });
  }
};

// 数据备份
exports.backupData = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // 获取用户数据
    const user = await User.findById(userId);
    const records = await DataRecord.find({ userId });
    
    // 生成备份数据
    const backupData = {
      userId,
      backupTime: new Date(),
      user,
      records,
    };
    
    const fileName = `backup-${userId}-${Date.now()}.json`;
    const filePath = path.join(__dirname, '../../backups', fileName);
    
    // 确保备份目录存在
    if (!fs.existsSync(path.join(__dirname, '../../backups'))) {
      fs.mkdirSync(path.join(__dirname, '../../backups'), { recursive: true });
    }
    
    // 写入文件
    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));
    
    res.status(200).json({ message: '数据备份成功', fileName });
  } catch (error) {
    res.status(500).json({ message: '数据备份失败', error });
  }
};
```

### 3.8 通知中心模块

#### 3.8.1 功能实现

- **消息通知**：支持系统消息、应用通知等多种通知类型
- **通知管理**：支持通知的查看、标记已读、删除等操作
- **通知设置**：支持用户自定义通知偏好
- **实时通知**：支持实时推送通知

#### 3.8.2 关键代码

```javascript
// server/src/controllers/notificationController.js
const Notification = require('../models/Notification');
const User = require('../models/User');

// 发送通知
exports.sendNotification = async (req, res) => {
  try {
    const { userId, title, content, type, relatedId } = req.body;
    
    // 检查用户是否存在
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 创建通知
    const notification = new Notification({
      userId,
      title,
      content,
      type,
      relatedId,
      isRead: false,
      createdAt: new Date(),
    });
    
    await notification.save();
    
    // 这里可以添加实时推送逻辑，如使用WebSocket
    
    res.status(201).json({ message: '通知发送成功', notification });
  } catch (error) {
    res.status(500).json({ message: '发送通知失败', error });
  }
};

// 获取用户通知
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const query = { userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Notification.countDocuments(query);
    
    res.status(200).json({ 
      message: '获取通知成功', 
      notifications, 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });
  } catch (error) {
    res.status(500).json({ message: '获取通知失败', error });
  }
};

// 标记通知已读
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId } = req.params;
    
    const notification = await Notification.findOne({ _id: notificationId, userId });
    if (!notification) {
      return res.status(404).json({ message: '通知不存在' });
    }
    
    notification.isRead = true;
    await notification.save();
    
    res.status(200).json({ message: '通知已标记为已读', notification });
  } catch (error) {
    res.status(500).json({ message: '标记通知失败', error });
  }
};

// 标记所有通知已读
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    
    res.status(200).json({ message: '所有通知已标记为已读' });
  } catch (error) {
    res.status(500).json({ message: '标记通知失败', error });
  }
};
```

## 4. API 设计

### 4.1 认证相关 API

| API路径 | 方法 | 模块 | 功能描述 | 请求体 (JSON) | 成功响应 (200 OK) |
|---------|------|------|----------|--------------|------------------|
| /api/auth/register | POST | 用户管理 | 用户注册 | `{"email": "user@example.com", "password": "password123", "name": "用户名", "phone": "13800138000"}` | `{"message": "注册成功", "token": "jwt_token", "user": {...}}` |
| /api/auth/login | POST | 用户管理 | 用户登录 | `{"email": "user@example.com", "password": "password123"}` | `{"message": "登录成功", "token": "jwt_token", "user": {...}}` |
| /api/auth/refresh | POST | 用户管理 | 刷新token | `{"refreshToken": "refresh_token"}` | `{"message": "token刷新成功", "token": "new_jwt_token"}` |
| /api/auth/logout | POST | 用户管理 | 用户登出 | N/A | `{"message": "登出成功"}` |
| /api/auth/reset-password | POST | 用户管理 | 重置密码 | `{"email": "user@example.com"}` | `{"message": "重置密码邮件已发送"}` |
| /api/auth/verify-code | POST | 用户管理 | 验证验证码 | `{"email": "user@example.com", "code": "123456"}` | `{"message": "验证码验证成功"}` |

### 4.2 用户相关 API

| API路径 | 方法 | 模块 | 功能描述 | 请求体 (JSON) | 成功响应 (200 OK) |
|---------|------|------|----------|--------------|------------------|
| /api/users/profile | GET | 用户管理 | 获取个人资料 | N/A | `{"message": "获取资料成功", "user": {...}}` |
| /api/users/profile | PUT | 用户管理 | 更新个人资料 | `{"name": "新用户名", "phone": "13900139000", "avatar": "avatar_url"}` | `{"message": "资料更新成功", "user": {...}}` |
| /api/users/password | PUT | 用户管理 | 修改密码 | `{"oldPassword": "old_password", "newPassword": "new_password"}` | `{"message": "密码修改成功"}` |
| /api/users/mfa | POST | 用户管理 | 启用多因素认证 | `{"type": "email"}` | `{"message": "多因素认证已启用"}` |
| /api/users/mfa | DELETE | 用户管理 | 禁用多因素认证 | N/A | `{"message": "多因素认证已禁用"}` |

### 4.3 角色相关 API

| API路径 | 方法 | 模块 | 功能描述 | 请求体 (JSON) | 成功响应 (200 OK) |
|---------|------|------|----------|--------------|------------------|
| /api/roles | GET | 角色管理 | 获取角色列表 | N/A | `{"message": "获取角色列表成功", "roles": [...]}` |
| /api/roles | POST | 角色管理 | 创建角色 | `{"name": "角色名称", "description": "角色描述", "permissions": ["permission1", "permission2"], "parentRole": "parent_role_id"}` | `{"message": "角色创建成功", "role": {...}}` |
| /api/roles/:id | GET | 角色管理 | 获取角色详情 | N/A | `{"message": "获取角色详情成功", "role": {...}}` |
| /api/roles/:id | PUT | 角色管理 | 更新角色 | `{"name": "新角色名称", "description": "新角色描述", "permissions": ["permission1", "permission2"]}` | `{"message": "角色更新成功", "role": {...}}` |
| /api/roles/:id | DELETE | 角色管理 | 删除角色 | N/A | `{"message": "角色删除成功"}` |
| /api/roles/:id/users | GET | 角色管理 | 获取角色成员 | N/A | `{"message": "获取角色成员成功", "users": [...]}` |
| /api/roles/:id/users | POST | 角色管理 | 添加角色成员 | `{"userId": "user_id"}` | `{"message": "添加角色成员成功"}` |
| /api/roles/:id/users/:userId | DELETE | 角色管理 | 移除角色成员 | N/A | `{"message": "移除角色成员成功"}` |

### 4.4 应用相关 API

| API路径 | 方法 | 模块 | 功能描述 | 请求体 (JSON) | 成功响应 (200 OK) |
|---------|------|------|----------|--------------|------------------|
| /api/apps | GET | 应用管理 | 获取应用列表 | N/A | `{"message": "获取应用列表成功", "apps": [...]}` |
| /api/apps | POST | 应用管理 | 集成应用 | `{"name": "应用名称", "type": "应用类型", "clientId": "client_id", "clientSecret": "client_secret", "redirectUri": "redirect_uri", "scopes": ["scope1", "scope2"]}` | `{"message": "应用集成成功", "app": {...}}` |
| /api/apps/:id | GET | 应用管理 | 获取应用详情 | N/A | `{"message": "获取应用详情成功", "app": {...}}` |
| /api/apps/:id | PUT | 应用管理 | 更新应用 | `{"name": "新应用名称", "status": "active"}` | `{"message": "应用更新成功", "app": {...}}` |
| /api/apps/:id | DELETE | 应用管理 | 删除应用 | N/A | `{"message": "应用删除成功"}` |
| /api/apps/:id/permissions | PUT | 应用管理 | 更新应用权限 | `{"permissions": ["permission1", "permission2"]}` | `{"message": "应用权限更新成功", "app": {...}}` |
| /api/apps/:id/authorize | POST | 应用管理 | 授权应用 | `{"userId": "user_id", "scopes": ["scope1", "scope2"]}` | `{"message": "应用授权成功"}` |

### 4.5 仪表盘相关 API

| API路径 | 方法 | 模块 | 功能描述 | 请求体 (JSON) | 成功响应 (200 OK) |
|---------|------|------|----------|--------------|------------------|
| /api/dashboards | GET | 仪表盘 | 获取仪表盘列表 | N/A | `{"message": "获取仪表盘列表成功", "dashboards": [...]}` |
| /api/dashboards | POST | 仪表盘 | 创建仪表盘 | `{"name": "仪表盘名称", "layout": {...}, "widgets": [...]}` | `{"message": "仪表盘创建成功", "dashboard": {...}}` |
| /api/dashboards/:id | GET | 仪表盘 | 获取仪表盘详情 | N/A | `{"message": "获取仪表盘详情成功", "dashboard": {...}}` |
| /api/dashboards/:id | PUT | 仪表盘 | 更新仪表盘 | `{"name": "新仪表盘名称", "layout": {...}, "widgets": [...]}` | `{"message": "仪表盘更新成功", "dashboard": {...}}` |
| /api/dashboards/:id | DELETE | 仪表盘 | 删除仪表盘 | N/A | `{"message": "仪表盘删除成功"}` |
| /api/dashboards/:id/widgets | POST | 仪表盘 | 添加组件 | `{"type": "chart", "title": "组件标题", "config": {...}}` | `{"message": "组件添加成功", "widget": {...}}` |
| /api/dashboards/:id/widgets/:widgetId | PUT | 仪表盘 | 更新组件 | `{"title": "新组件标题", "config": {...}}` | `{"message": "组件更新成功", "widget": {...}}` |
| /api/dashboards/:id/widgets/:widgetId | DELETE | 仪表盘 | 删除组件 | N/A | `{"message": "组件删除成功"}` |

### 4.6 智能分析相关 API

| API路径 | 方法 | 模块 | 功能描述 | 请求体 (JSON) | 成功响应 (200 OK) |
|---------|------|------|----------|--------------|------------------|
| /api/analytics/behavior | GET | 智能分析 | 分析用户行为 | N/A | `{"message": "行为分析成功", "patterns": {...}}` |
| /api/analytics/insights | GET | 智能分析 | 生成数据洞察 | N/A | `{"message": "生成洞察成功", "insights": [...]}` |
| /api/analytics/predictions | GET | 智能分析 | 预测分析 | `{"type": "activity", "days": 7}` | `{"message": "预测分析成功", "predictions": [...]}` |
| /api/analytics/recommendations | GET | 智能分析 | 个性化推荐 | N/A | `{"message": "生成推荐成功", "recommendations": [...]}` |
| /api/analytics/anomalies | GET | 智能分析 | 异常检测 | N/A | `{"message": "异常检测成功", "anomalies": [...]}` |

### 4.7 数据管理相关 API

| API路径 | 方法 | 模块 | 功能描述 | 请求体 (JSON) | 成功响应 (200 OK) |
|---------|------|------|----------|--------------|------------------|
| /api/data/export | GET | 数据管理 | 导出数据 | N/A | 文件下载 |
| /api/data/import | POST | 数据管理 | 导入数据 | `multipart/form-data` | `{"message": "数据导入成功", "importedRecords": [...]}` |
| /api/data/backup | POST | 数据管理 | 备份数据 | N/A | `{"message": "数据备份成功", "fileName": "backup_file_name"}` |
| /api/data/restore | POST | 数据管理 | 恢复数据 | `{"fileName": "backup_file_name"}` | `{"message": "数据恢复成功"}` |
| /api/data/records | GET | 数据管理 | 获取数据记录 | `{"type": "task", "page": 1, "limit": 20}` | `{"message": "获取数据记录成功", "records": [...], "total": 100}` |
| /api/data/records | POST | 数据管理 | 创建数据记录 | `{"type": "task", "content": "任务内容", "metadata": {...}}` | `{"message": "数据记录创建成功", "record": {...}}` |
| /api/data/records/:id | PUT | 数据管理 | 更新数据记录 | `{"content": "新任务内容", "metadata": {...}}` | `{"message": "数据记录更新成功", "record": {...}}` |
| /api/data/records/:id | DELETE | 数据管理 | 删除数据记录 | N/A | `{"message": "数据记录删除成功"}` |

### 4.8 通知相关 API

| API路径 | 方法 | 模块 | 功能描述 | 请求体 (JSON) | 成功响应 (200 OK) |
|---------|------|------|----------|--------------|------------------|
| /api/notifications | GET | 通知中心 | 获取通知列表 | `{"page": 1, "limit": 20, "unreadOnly": false}` | `{"message": "获取通知成功", "notifications": [...], "total": 50}` |
| /api/notifications | POST | 通知中心 | 发送通知 | `{"userId": "user_id", "title": "通知标题", "content": "通知内容", "type": "system", "relatedId": "related_id"}` | `{"message": "通知发送成功", "notification": {...}}` |
| /api/notifications/:id | GET | 通知中心 | 获取通知详情 | N/A | `{"message": "获取通知详情成功", "notification": {...}}` |
| /api/notifications/:id | PUT | 通知中心 | 标记通知已读 | N/A | `{"message": "通知已标记为已读", "notification": {...}}` |
| /api/notifications/:id | DELETE | 通知中心 | 删除通知 | N/A | `{"message": "通知删除成功"}` |
| /api/notifications/read-all | PUT | 通知中心 | 标记所有通知已读 | N/A | `{"message": "所有通知已标记为已读"}` |
| /api/notifications/settings | GET | 通知中心 | 获取通知设置 | N/A | `{"message": "获取通知设置成功", "settings": {...}}` |
| /api/notifications/settings | PUT | 通知中心 | 更新通知设置 | `{"email": true, "sms": false, "push": true}` | `{"message": "通知设置更新成功", "settings": {...}}` |

## 5. 数据库设计

### 5.1 关系型数据库 (MySQL)

#### 5.1.1 用户表 (pioc_user)

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 用户ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 邮箱 |
| password | VARCHAR(255) | NOT NULL | 密码（加密存储） |
| name | VARCHAR(100) | NOT NULL | 用户名 |
| phone | VARCHAR(20) | | 手机号 |
| avatar | VARCHAR(255) | | 头像URL |
| status | ENUM('active', 'inactive', 'locked') | DEFAULT 'active' | 用户状态 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

#### 5.1.2 角色表 (pioc_role)

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 角色ID |
| name | VARCHAR(100) | UNIQUE, NOT NULL | 角色名称 |
| description | TEXT | | 角色描述 |
| parent_role_id | INT | FOREIGN KEY (parent_role_id) REFERENCES pioc_role(id) | 父角色ID |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

#### 5.1.3 权限表 (pioc_permission)

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 权限ID |
| name | VARCHAR(100) | UNIQUE, NOT NULL | 权限名称 |
| description | TEXT | | 权限描述 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

#### 5.1.4 角色权限表 (pioc_role_permission)

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | ID |
| role_id | INT | FOREIGN KEY (role_id) REFERENCES pioc_role(id) | 角色ID |
| permission_id | INT | FOREIGN KEY (permission_id) REFERENCES pioc_permission(id) | 权限ID |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

#### 5.1.5 用户角色表 (pioc_user_role)

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | ID |
| user_id | INT | FOREIGN KEY (user_id) REFERENCES pioc_user(id) | 用户ID |
| role_id | INT | FOREIGN KEY (role_id) REFERENCES pioc_role(id) | 角色ID |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

#### 5.1.6 应用表 (pioc_application)

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 应用ID |
| name | VARCHAR(100) | UNIQUE, NOT NULL | 应用名称 |
| type | VARCHAR(50) | NOT NULL | 应用类型 |
| client_id | VARCHAR(255) | NOT NULL | 客户端ID |
| client_secret | VARCHAR(255) | NOT NULL | 客户端密钥 |
| redirect_uri | VARCHAR(255) | NOT NULL | 重定向URI |
| status | ENUM('active', 'inactive') | DEFAULT 'active' | 应用状态 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

#### 5.1.7 应用权限表 (pioc_application_permission)

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | ID |
| app_id | INT | FOREIGN KEY (app_id) REFERENCES pioc_application(id) | 应用ID |
| permission_id | INT | FOREIGN KEY (permission_id) REFERENCES pioc_permission(id) | 权限ID |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

#### 5.1.8 仪表盘表 (pioc_dashboard)

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 仪表盘ID |
| user_id | INT | FOREIGN KEY (user_id) REFERENCES pioc_user(id) | 用户ID |
| name | VARCHAR(100) | NOT NULL | 仪表盘名称 |
| layout | JSON | NOT NULL | 仪表盘布局 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

#### 5.1.9 仪表盘组件表 (pioc_dashboard_widget)

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 组件ID |
| dashboard_id | INT | FOREIGN KEY (dashboard_id) REFERENCES pioc_dashboard(id) | 仪表盘ID |
| type | VARCHAR(50) | NOT NULL | 组件类型 |
| title | VARCHAR(100) | NOT NULL | 组件标题 |
| config | JSON | NOT NULL | 组件配置 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

#### 5.1.10 通知表 (pioc_notification)

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 通知ID |
| user_id | INT | FOREIGN KEY (user_id) REFERENCES pioc_user(id) | 用户ID |
| title | VARCHAR(100) | NOT NULL | 通知标题 |
| content | TEXT | NOT NULL | 通知内容 |
| type | VARCHAR(50) | NOT NULL | 通知类型 |
| related_id | VARCHAR(255) | | 相关ID |
| is_read | BOOLEAN | DEFAULT FALSE | 是否已读 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

#### 5.1.11 日志表 (pioc_log)

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 日志ID |
| user_id | INT | FOREIGN KEY (user_id) REFERENCES pioc_user(id) | 用户ID |
| action | VARCHAR(100) | NOT NULL | 操作类型 |
| resource | VARCHAR(255) | NOT NULL | 操作资源 |
| details | JSON | | 操作详情 |
| ip_address | VARCHAR(50) | | IP地址 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

### 5.2 非关系型数据库 (MongoDB)

#### 5.2.1 数据记录表 (data_records)

```json
{
  "_id": ObjectId,           // 记录ID
  "userId": String,          // 用户ID
  "type": String,            // 数据类型（如task, note, calendar等）
  "content": String,         // 数据内容
  "metadata": Object,        // 元数据（根据类型不同而不同）
  "tags": [String],          // 标签
  "createdAt": Date,         // 创建时间
  "updatedAt": Date,         // 更新时间
  "appId": String            // 关联应用ID
}
```

#### 5.2.2 应用使用统计表 (app_usage)

```json
{
  "_id": ObjectId,           // 统计ID
  "userId": String,          // 用户ID
  "appId": String,           // 应用ID
  "usageCount": Number,      // 使用次数
  "totalDuration": Number,   // 总使用时长（秒）
  "lastUsedAt": Date,        // 最后使用时间
  "dailyStats": [            // 每日统计
    {
      "date": Date,          // 日期
      "count": Number,       // 当日使用次数
      "duration": Number     // 当日使用时长
    }
  ]
}
```

#### 5.2.3 用户行为表 (user_behavior)

```json
{
  "_id": ObjectId,           // 行为ID
  "userId": String,          // 用户ID
  "action": String,          // 行为类型
  "resource": String,        // 行为对象
  "details": Object,         // 行为详情
  "timestamp": Date,         // 行为时间戳
  "ipAddress": String,       // IP地址
  "userAgent": String        // 用户代理
}
```

#### 5.2.4 智能分析结果表 (analytics_results)

```json
{
  "_id": ObjectId,           // 分析结果ID
  "userId": String,          // 用户ID
  "type": String,            // 分析类型（如behavior, insights, predictions等）
  "results": Object,         // 分析结果
  "generatedAt": Date,       // 生成时间
  "expiresAt": Date          // 过期时间
}
```

## 6. 部署方案

### 6.1 Docker 部署

#### 6.1.1 前端 Dockerfile

```dockerfile
# Dockerfile.client
FROM node:16-alpine AS build

WORKDIR /app

COPY client/package.json client/package-lock.json ./
RUN npm install

COPY client/ ./
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/out /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 6.1.2 后端 Dockerfile

```dockerfile
# Dockerfile.server
FROM node:16-alpine

WORKDIR /app

COPY server/package.json server/package-lock.json ./
RUN npm install

COPY server/ ./

EXPOSE 3001

CMD ["npm", "start"]
```

#### 6.1.3 Docker Compose 配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  client:
    build:
      context: .
      dockerfile: docker/Dockerfile.client
    ports:
      - "80:80"
    depends_on:
      - server
    networks:
      - pioc-network

  server:
    build:
      context: .
      dockerfile: docker/Dockerfile.server
    ports:
      - "3001:3001"
    depends_on:
      - mysql
      - mongodb
      - redis
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USER=root
      - DB_PASSWORD=root123
      - DB_NAME=mydb
      - MONGO_HOST=mongodb
      - MONGO_PORT=27017
      - MONGO_USER=root
      - MONGO_PASSWORD=root123
      - MONGO_DB=mymongo
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=your_jwt_secret
    networks:
      - pioc-network

  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=root123
      - MYSQL_DATABASE=mydb
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - pioc-network

  mongodb:
    image: mongo:5.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=root
      - MONGO_INITDB_ROOT_PASSWORD=root123
      - MONGO_INITDB_DATABASE=mymongo
    volumes:
      - mongodb-data:/data/db
    networks:
      - pioc-network

  redis:
    image: redis:7.0
    ports:
      - "6379:6379"
    networks:
      - pioc-network

volumes:
  mysql-data:
  mongodb-data:

networks:
  pioc-network:
    driver: bridge
```

### 6.2 Kubernetes 部署

#### 6.2.1 部署配置

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pioc-client
  namespace: pioc
spec:
  replicas: 2
  selector:
    matchLabels:
      app: pioc-client
  template:
    metadata:
      labels:
        app: pioc-client
    spec:
      containers:
      - name: pioc-client
        image: pioc-client:latest
        ports:
        - containerPort: 80
        resources:
          limits:
            cpu: "1"
            memory: "512Mi"
          requests:
            cpu: "0.5"
            memory: "256Mi"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pioc-server
  namespace: pioc
spec:
  replicas: 2
  selector:
    matchLabels:
      app: pioc-server
  template:
    metadata:
      labels:
        app: pioc-server
    spec:
      containers:
      - name: pioc-server
        image: pioc-server:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_HOST
          value: "pioc-mysql"
        - name: DB_PORT
          value: "3306"
        - name: DB_USER
          value: "root"
        - name: DB_PASSWORD
          value: "root123"
        - name: DB_NAME
          value: "mydb"
        - name: MONGO_HOST
          value: "pioc-mongodb"
        - name: MONGO_PORT
          value: "27017"
        - name: MONGO_USER
          value: "root"
        - name: MONGO_PASSWORD
          value: "root123"
        - name: MONGO_DB
          value: "mymongo"
        - name: REDIS_HOST
          value: "pioc-redis"
        - name: REDIS_PORT
          value: "6379"
        - name: JWT_SECRET
          value: "your_jwt_secret"
        resources:
          limits:
            cpu: "1"
            memory: "1Gi"
          requests:
            cpu: "0.5"
            memory: "512Mi"
```

#### 6.2.2 服务配置

```yaml
# kubernetes/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: pioc-client
  namespace: pioc
spec:
  selector:
    app: pioc-client
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
---
apiVersion: v1
kind: Service
metadata:
  name: pioc-server
  namespace: pioc
spec:
  selector:
    app: pioc-server
  ports:
  - port: 3001
    targetPort: 3001
  type: ClusterIP
---
apiVersion: v1
kind: Service
metadata:
  name: pioc-mysql
  namespace: pioc
spec:
  selector:
    app: pioc-mysql
  ports:
  - port: 3306
    targetPort: 3306
  type: ClusterIP
---
apiVersion: v1
kind: Service
metadata:
  name: pioc-mongodb
  namespace: pioc
spec:
  selector:
    app: pioc-mongodb
  ports:
  - port: 27017
    targetPort: 27017
  type: ClusterIP
---
apiVersion: v1
kind: Service
metadata:
  name: pioc-redis
  namespace: pioc
spec:
  selector:
    app: pioc-redis
  ports:
  - port: 6379
    targetPort: 6379
  type: ClusterIP

#### 6.2.3 Ingress 配置

```yaml
# kubernetes/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: pioc-ingress
  namespace: pioc
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: pioc.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: pioc-client
            port:
              number: 80
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: pioc-server
            port:
              number: 3001
```

### 6.3 部署步骤

#### 6.3.1 Docker 部署步骤

1. **准备环境**：确保安装了 Docker 和 Docker Compose
2. **配置环境变量**：根据实际情况修改 `docker-compose.yml` 中的环境变量
3. **构建和启动容器**：
   ```bash
   docker-compose up -d --build
   ```
4. **验证部署**：访问 `http://localhost` 查看前端页面

#### 6.3.2 Kubernetes 部署步骤

1. **准备环境**：确保安装了 kubectl 并配置了 Kubernetes 集群
2. **创建命名空间**：
   ```bash
   kubectl create namespace pioc
   ```
3. **部署应用**：
   ```bash
   kubectl apply -f kubernetes/deployment.yaml
   kubectl apply -f kubernetes/service.yaml
   kubectl apply -f kubernetes/ingress.yaml
   ```
4. **验证部署**：
   ```bash
   kubectl get pods -n pioc
   kubectl get services -n pioc
   kubectl get ingress -n pioc
   ```
5. **访问应用**：根据 Ingress 配置的域名访问应用

## 7. 监控与维护

### 7.1 监控方案

- **应用监控**：使用 Prometheus 监控应用性能和资源使用情况
- **日志管理**：使用 ELK Stack (Elasticsearch, Logstash, Kibana) 收集和分析日志
- **健康检查**：实现应用健康检查端点，用于 Kubernetes 探针

### 7.2 维护计划

- **定期备份**：定期备份数据库和重要配置文件
- **安全更新**：定期更新依赖包和系统组件，修复安全漏洞
- **性能优化**：根据监控数据进行性能优化
- **灾难恢复**：制定灾难恢复计划，确保系统在故障时能够快速恢复

## 8. 安全考虑

### 8.1 安全措施

- **数据加密**：使用 HTTPS 传输数据，敏感数据加密存储
- **身份认证**：实现强密码策略和多因素认证
- **权限控制**：严格的基于角色的访问控制
- **安全审计**：完整的安全审计日志
- **漏洞防护**：定期进行安全漏洞扫描和修复

### 8.2 安全最佳实践

- **最小权限原则**：只授予必要的权限
- **输入验证**：对所有用户输入进行严格验证
- **防止 SQL 注入**：使用参数化查询
- **防止 XSS 攻击**：对输出进行适当转义
- **防止 CSRF 攻击**：使用 CSRF 令牌

## 9. 总结

个人智慧运行中心平台（PIOC）是一个综合性的个人数字化管理解决方案，通过整合个人信息、应用和数据，提供智能分析和决策支持，帮助用户提升数字化生活和工作体验。

本开发文档详细描述了平台的技术架构、核心模块实现、API 设计、数据库设计和部署方案，为项目开发提供了明确的指导。通过合理的技术选型和实施计划，本项目有望成为一个安全、高效、易用的个人数字化管理平台，满足用户对个人数据管理和智能服务的需求。

## 10. 附录

### 10.1 技术栈详细说明

| 技术 | 版本 | 用途 | 选型理由 |
|------|------|------|----------|
| Next.js | 16+ | 前端框架 | 服务端渲染，性能优异，开发效率高 |
| Ant Design | v6 | UI组件库 | 丰富的组件，美观的设计，良好的文档 |
| React | 18+ | 前端库 | 组件化开发，生态丰富 |
| Node.js | 16+ | 运行环境 | 高性能，异步IO，生态丰富 |
| Express | 4.18+ | Web框架 | 轻量，灵活，易于扩展 |
| MySQL | 8.0+ | 关系型数据库 | 稳定，可靠，适合结构化数据 |
| MongoDB | 5.0+ | 非关系型数据库 | 灵活，适合非结构化数据 |
| Redis | 7.0+ | 缓存系统 | 高性能，适合缓存和会话管理 |
| JWT | - | 认证 | 无状态，易于扩展 |
| OAuth2.0 | - | 第三方认证 | 标准，安全，广泛支持 |
| Docker | 20.0+ | 容器化 | 环境一致性，易于部署 |
| Kubernetes | 1.24+ | 容器编排 | 自动扩缩容，高可用性 |

### 10.2 开发规范

- **代码风格**：使用 ESLint 和 Prettier 保持代码风格一致
- **版本控制**：使用 Git 进行版本控制，遵循 Git Flow 工作流
- **提交规范**：使用 Conventional Commits 规范提交信息
- **代码审查**：所有代码变更都需要经过代码审查
- **测试**：实现单元测试和集成测试，确保代码质量

### 10.3 项目管理

- **任务管理**：使用 Jira 或 Trello 管理开发任务
- **文档管理**：使用 Confluence 或 GitBook 管理项目文档
- **持续集成**：使用 Jenkins 或 GitHub Actions 实现持续集成
- **持续部署**：使用 Kubernetes 实现持续部署

### 10.4 常见问题与解决方案

| 问题 | 解决方案 |
|------|----------|
| 数据库连接失败 | 检查数据库配置和网络连接 |
| 认证失败 | 检查 JWT 密钥和 token 格式 |
| 应用集成失败 | 检查应用配置和授权流程 |
| 性能问题 | 使用缓存，优化数据库查询，考虑水平扩展 |
| 安全漏洞 | 定期进行安全扫描，及时更新依赖 |