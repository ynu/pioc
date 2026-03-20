'use client';

import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Avatar, theme, Flex, Typography, Empty } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  AppstoreOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

interface App {
  id: number;
  name: string;
  description: string;
  icon: string;
  url: string;
  status: number;
}

interface DashboardStats {
  totalUsers: number;
  totalRoles: number;
  totalApps: number;
}

interface RecentActivity {
  id: number;
  type: string;
  description: string;
  time: string;
}

// 图标映射
const iconMapping: Record<string, React.ReactNode> = {
  UserOutlined: <UserOutlined />,
  TeamOutlined: <TeamOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
  BookOutlined: <AppstoreOutlined />,
  CalendarOutlined: <AppstoreOutlined />,
  CameraOutlined: <AppstoreOutlined />,
  CloudOutlined: <AppstoreOutlined />,
  DashboardOutlined: <AppstoreOutlined />,
  FileTextOutlined: <AppstoreOutlined />,
  MailOutlined: <AppstoreOutlined />,
  SettingOutlined: <AppstoreOutlined />,
};

export default function DashboardPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalUsers: 0, totalRoles: 0, totalApps: 0 });
  const [loading, setLoading] = useState(true);
  const { token } = theme.useToken();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 获取用户有权限的应用
      const myAppsRes = await fetch('/api/apps/my');
      const myAppsData = await myAppsRes.json();
      if (myAppsData.success) {
        setApps(myAppsData.data);
      }

      // 获取统计数据
      const [usersRes, rolesRes, appsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/roles'),
        fetch('/api/apps'),
      ]);

      const [usersData, rolesData, appsData] = await Promise.all([
        usersRes.json(),
        rolesRes.json(),
        appsRes.json(),
      ]);

      setStats({
        totalUsers: usersData.success ? usersData.data.length : 0,
        totalRoles: rolesData.success ? rolesData.data.length : 0,
        totalApps: appsData.success ? appsData.data.length : 0,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentActivities: RecentActivity[] = [
    { id: 1, type: 'user', description: '用户 admin 登录系统', time: '5分钟前' },
    { id: 2, type: 'role', description: '角色 "管理员" 被创建', time: '30分钟前' },
    { id: 3, type: 'app', description: '应用 "笔记" 上线', time: '1小时前' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <Avatar icon={<UserOutlined />} style={{ backgroundColor: token.colorPrimary }} />;
      case 'role':
        return <Avatar icon={<TeamOutlined />} style={{ backgroundColor: token.colorSuccess }} />;
      case 'app':
        return <Avatar icon={<AppstoreOutlined />} style={{ backgroundColor: token.colorWarning }} />;
      default:
        return <Avatar icon={<ClockCircleOutlined />} />;
    }
  };

  const getAppIcon = (iconName: string) => {
    return iconMapping[iconName] || <AppstoreOutlined />;
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>仪表盘</h1>
      
      {/* 我的应用区域 */}
      <Card 
        title="我的应用" 
        variant="borderless" 
        style={{ marginBottom: 24 }}
        loading={loading}
      >
        {apps.length === 0 ? (
          <Empty description="暂无可用应用" />
        ) : (
          <Row gutter={[16, 16]}>
            {apps.map((app) => (
              <Col xs={24} sm={12} lg={8} key={app.id}>
                <Link href={app.url || '#'} style={{ textDecoration: 'none' }}>
                  <Card
                    hoverable
                    variant="borderless"
                    style={{
                      background: token.colorBgContainer,
                      border: `1px solid ${token.colorBorderSecondary}`,
                    }}
                  >
                    <Flex align="center" gap={16}>
                      <Avatar
                        size={48}
                        icon={getAppIcon(app.icon)}
                        style={{ backgroundColor: token.colorPrimary }}
                      />
                      <Flex vertical flex={1}>
                        <Typography.Text strong style={{ fontSize: 16 }}>
                          {app.name}
                        </Typography.Text>
                        <Typography.Text type="secondary" ellipsis>
                          {app.description || '暂无描述'}
                        </Typography.Text>
                      </Flex>
                      <ArrowRightOutlined style={{ color: token.colorTextSecondary }} />
                    </Flex>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* 统计数据 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card variant="borderless" loading={loading}>
            <Statistic
              title="用户总数"
              value={stats.totalUsers}
              prefix={<UserOutlined style={{ color: token.colorPrimary }} />}
              suffix={<RiseOutlined style={{ color: token.colorSuccess, fontSize: 14 }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card variant="borderless" loading={loading}>
            <Statistic
              title="角色总数"
              value={stats.totalRoles}
              prefix={<TeamOutlined style={{ color: token.colorSuccess }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card variant="borderless" loading={loading}>
            <Statistic
              title="应用总数"
              value={stats.totalApps}
              prefix={<AppstoreOutlined style={{ color: token.colorWarning }} />}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card
            title="最近活动"
            variant="borderless"
            styles={{ body: { padding: 0 } }}
          >
            <Flex vertical>
              {recentActivities.map((item) => (
                <Flex
                  key={item.id}
                  align="center"
                  gap={12}
                  style={{ padding: '12px 24px', borderBottom: `1px solid ${token.colorBorderSecondary}` }}
                >
                  {getActivityIcon(item.type)}
                  <Flex vertical flex={1}>
                    <Typography.Text>{item.description}</Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {item.time}
                    </Typography.Text>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="快捷操作" variant="borderless">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href="/users" style={{ color: token.colorPrimary }}>+ 添加用户</Link>
              <Link href="/roles" style={{ color: token.colorPrimary }}>+ 添加角色</Link>
              <Link href="/apps" style={{ color: token.colorPrimary }}>+ 添加应用</Link>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
