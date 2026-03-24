import { NextRequest, NextResponse } from 'next/server';
import { findAppsByUserId, BUILTIN_APPS } from '@/lib/database/models/app';
import { createAppProtectedHandler } from '@/lib/auth/middleware';

// 使用应用权限保护处理器（我的应用）
const appUrl = '/my-apps';

async function getMyAppsHandler(request: NextRequest) {
  try {
    const session = await import('@/lib/auth/jwt').then(m => m.getSession());
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 获取用户有权限的所有应用，排除"我的应用"本身
    const apps = await findAppsByUserId(session.userId);
    const filteredApps = apps.filter(app => app.id !== BUILTIN_APPS.MY_APPS);
    return NextResponse.json({ success: true, data: filteredApps });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch apps', error: String(error) },
      { status: 500 }
    );
  }
}

export const GET = createAppProtectedHandler(getMyAppsHandler, appUrl);
