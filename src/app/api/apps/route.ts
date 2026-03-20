import { NextRequest, NextResponse } from 'next/server';
import { findAll, create, findByName, findByStatus, BUILTIN_APPS, isBuiltinApp } from '@/lib/database/models/app';
import { createAppProtectedHandler } from '@/lib/auth/middleware';

// 使用应用权限保护处理器（应用管理应用）
const appUrl = '/apps';

async function getAppsHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let apps;
    if (status !== null) {
      apps = await findByStatus(parseInt(status));
    } else {
      apps = await findAll();
    }
    return NextResponse.json({ success: true, data: apps });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch apps', error: String(error) },
      { status: 500 }
    );
  }
}

async function createAppHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon, url } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: 'App name is required' },
        { status: 400 }
      );
    }

    const existingApp = await findByName(name);
    if (existingApp) {
      return NextResponse.json(
        { success: false, message: 'App name already exists' },
        { status: 409 }
      );
    }

    const id = await create({ name, description, icon, url });
    return NextResponse.json({ success: true, data: { id } }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to create app', error: String(error) },
      { status: 500 }
    );
  }
}

export const GET = createAppProtectedHandler(getAppsHandler, appUrl);
export const POST = createAppProtectedHandler(createAppHandler, appUrl);
