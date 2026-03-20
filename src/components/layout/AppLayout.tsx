'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Typography, Space, Tag, App, Avatar, Dropdown, Menu, theme, Skeleton } from 'antd';
import type { MenuProps } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  DownOutlined,
  TeamOutlined,
  AppstoreOutlined,
  HomeOutlined,
  AuditOutlined,
  MonitorOutlined,
  DatabaseOutlined,
  MenuOutlined,
  FileTextOutlined,
  MailOutlined,
  CalendarOutlined,
  CloudOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

interface UserInfo {
  userId: number;
  username: string;
  email: string;
  name: string;
  role?: string;
}

interface MenuItem {
  id: number;
  name: string;
  path: string;
  icon?: string;
  parent_id: number | null;
  sort_order: number;
  status: number;
  app_id?: number | null;
  app_icon?: string;
  children?: MenuItem[];
}

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

// 图标映射
const iconMapping: Record<string, React.ReactNode> = {
  HomeOutlined: <HomeOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
  UserOutlined: <UserOutlined />,
  TeamOutlined: <TeamOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
  MenuOutlined: <MenuOutlined />,
  SettingOutlined: <SettingOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  MailOutlined: <MailOutlined />,
  CalendarOutlined: <CalendarOutlined />,
  CloudOutlined: <CloudOutlined />,
  BookOutlined: <BookOutlined />,
  AuditOutlined: <AuditOutlined />,
  MonitorOutlined: <MonitorOutlined />,
};

function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(true);
  const { message } = App.useApp();
  const { token } = theme.useToken();

  useEffect(() => {
    fetchUserInfo();
    fetchMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();

      if (data.success) {
        setUserInfo(data.data);
      } else {
        router.push('/login');
      }
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenus = async () => {
    try {
      setMenuLoading(true);
      const response = await fetch('/api/menus/my');
      const data = await response.json();
      if (data.success) {
        setMenus(data.data);
      }
    } catch {
      // 如果获取失败，使用默认菜单
      setMenus([]);
    } finally {
      setMenuLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      message.success('已退出登录');
      router.push('/login');
      router.refresh();
    } catch {
      message.error('退出失败');
    }
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      handleLogout();
    } else if (key === 'profile') {
      message.info('个人中心功能开发中');
    } else if (key.startsWith('/')) {
      router.push(key);
    }
  };

  // 将菜单数据转换为 Ant Design Menu 组件需要的格式
  const convertToMenuItems = (items: MenuItem[]): MenuProps['items'] => {
    return items.map(item => {
      // 如果是应用链接，优先使用应用的图标
      const iconName = item.app_id && item.app_icon ? item.app_icon : item.icon;
      const menuItem: any = {
        key: item.path || `menu-${item.id}`,
        icon: iconName ? iconMapping[iconName] : null,
        label: item.name,
      };

      if (item.children && item.children.length > 0) {
        menuItem.children = convertToMenuItems(item.children);
      }

      return menuItem;
    });
  };

  // 获取选中的菜单项
  const getSelectedKeys = (): string[] => {
    const keys: string[] = [];

    const findPath = (items: MenuItem[], parentKeys: string[] = []): string[] => {
      for (const item of items) {
        const currentKeys = [...parentKeys, item.path || `menu-${item.id}`];

        if (item.path && pathname.startsWith(item.path)) {
          return currentKeys;
        }

        if (item.children) {
          const childKeys = findPath(item.children, currentKeys);
          if (childKeys.length > 0) {
            return childKeys;
          }
        }
      }
      return [];
    };

    return findPath(menus);
  };

  const handleNavClick = ({ key }: { key: string }) => {
    if (key.startsWith('/')) {
      router.push(key);
    }
  };

  const isAdmin = userInfo?.role === 'admin';

  const getUserMenuItems = (): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: '个人中心',
      },
    ];

    if (isAdmin) {
      items.push({
        key: 'system-management',
        icon: <SettingOutlined />,
        label: '系统管理',
        children: [
          {
            key: '/users',
            icon: <UserOutlined />,
            label: '用户管理',
          },
          {
            key: '/roles',
            icon: <TeamOutlined />,
            label: '角色管理',
          },
          {
            key: '/audit-logs',
            icon: <AuditOutlined />,
            label: '操作日志',
          },
          {
            key: '/monitoring',
            icon: <MonitorOutlined />,
            label: '系统监控',
          },
          {
            key: '/system',
            icon: <SettingOutlined />,
            label: '系统设置',
          },
        ],
      });
    }

    items.push(
      {
        key: 'divider',
        type: 'divider',
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        danger: true,
      }
    );

    return items;
  };

  const navMenuItems = convertToMenuItems(menus);
  const selectedKeys = getSelectedKeys();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: token.colorBgLayout,
      }}>
        <Text>加载中...</Text>
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: token.colorBgContainer,
        boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Title
            level={4}
            style={{
              margin: '16px 0',
              color: token.colorPrimary,
              cursor: 'pointer',
              marginRight: 24
            }}
            onClick={() => router.push('/dashboard')}
          >
            个人智慧运行中心
          </Title>
          {menuLoading ? (
            <Skeleton.Button active style={{ width: 400, height: 40 }} />
          ) : (
            <Menu
              mode="horizontal"
              selectedKeys={selectedKeys}
              items={navMenuItems}
              onClick={handleNavClick}
              style={{ borderBottom: 'none', minWidth: 400, background: 'transparent' }}
            />
          )}
        </div>

        <Space size="large">
          <Dropdown
            menu={{
              items: getUserMenuItems(),
              onClick: handleUserMenuClick
            }}
            placement="bottomRight"
          >
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: token.colorPrimary }} />
              <Text strong>{userInfo?.name || userInfo?.username || '用户'}</Text>
              {userInfo?.role && <Tag color="blue">{userInfo.role}</Tag>}
              <DownOutlined />
            </Space>
          </Dropdown>
        </Space>
      </Header>

      <Content style={{ padding: '24px 50px', background: token.colorBgLayout }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {children}
        </div>
      </Content>

      <Footer style={{
        textAlign: 'center',
        background: token.colorBgContainer,
        padding: '24px 50px',
        marginTop: 'auto',
      }}>
        <Text type="secondary">
          个人智慧运行中心 ©2026 PIOC
        </Text>
      </Footer>
    </Layout>
  );
}

export default AppLayout;
