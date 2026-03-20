import { NextRequest, NextResponse } from 'next/server';
import { findAll, create, findByName } from '@/lib/database/models/role';
import { createAppProtectedHandler } from '@/lib/auth/middleware';

// 使用应用权限保护处理器（角色管理应用）
const appUrl = '/roles';

async function getRolesHandler() {
  try {
    const roles = await findAll();
    return NextResponse.json({ success: true, data: roles });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch roles', error: String(error) },
      { status: 500 }
    );
  }
}

async function createRoleHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Role name is required' },
        { status: 400 }
      );
    }

    const existingRole = await findByName(name);
    if (existingRole) {
      return NextResponse.json(
        { success: false, message: 'Role name already exists' },
        { status: 409 }
      );
    }

    const id = await create({ name, description });
    return NextResponse.json({ success: true, data: { id } }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to create role', error: String(error) },
      { status: 500 }
    );
  }
}

export const GET = createAppProtectedHandler(getRolesHandler, appUrl);
export const POST = createAppProtectedHandler(createRoleHandler, appUrl);
