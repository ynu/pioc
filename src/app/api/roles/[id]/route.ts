import { NextRequest, NextResponse } from 'next/server';
import { findById, update, remove, findByName, assignUser, removeUser, assignApp, removeApp, findUsersByRoleId, findAppsByRoleId } from '@/lib/database/models/role';
import { createAppProtectedHandler } from '@/lib/auth/middleware';

const appUrl = '/roles';

async function getRoleHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const role = await findById(parseInt(id));
    if (!role) {
      return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: role });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch role', error: String(error) },
      { status: 500 }
    );
  }
}

async function updateRoleHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    const existingRole = await findById(parseInt(id));
    if (!existingRole) {
      return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
    }

    if (name && name !== existingRole.name) {
      const roleWithName = await findByName(name);
      if (roleWithName) {
        return NextResponse.json({ success: false, message: 'Role name already exists' }, { status: 409 });
      }
    }

    const updated = await update(parseInt(id), { name, description });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'No changes made' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Role updated successfully' });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update role', error: String(error) },
      { status: 500 }
    );
  }
}

async function deleteRoleHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await remove(parseInt(id));
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Role deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to delete role', error: String(error) },
      { status: 500 }
    );
  }
}

async function patchRoleHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, userId, appId } = body;

    const role = await findById(parseInt(id));
    if (!role) {
      return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
    }

    if (action === 'assignUser' && userId) {
      await assignUser(parseInt(id), userId);
      return NextResponse.json({ success: true, message: 'User assigned to role' });
    }

    if (action === 'removeUser' && userId) {
      await removeUser(parseInt(id), userId);
      return NextResponse.json({ success: true, message: 'User removed from role' });
    }

    if (action === 'assignApp' && appId) {
      await assignApp(parseInt(id), appId);
      return NextResponse.json({ success: true, message: 'App assigned to role' });
    }

    if (action === 'removeApp' && appId) {
      await removeApp(parseInt(id), appId);
      return NextResponse.json({ success: true, message: 'App removed from role' });
    }

    if (action === 'getUsers') {
      const userIds = await findUsersByRoleId(parseInt(id));
      return NextResponse.json({ success: true, data: userIds });
    }

    if (action === 'getApps') {
      const appIds = await findAppsByRoleId(parseInt(id));
      return NextResponse.json({ success: true, data: appIds });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to perform action', error: String(error) },
      { status: 500 }
    );
  }
}

// 包装处理器以添加权限检查
const wrapHandler = (handler: Function) => {
  return async (request: NextRequest, context: { params: Promise<{ [key: string]: string }> }) => {
    const protectedHandler = createAppProtectedHandler(
      (req: NextRequest, session: { userId: number; username: string; email: string; name: string }, params?: Promise<{ [key: string]: string }>) => handler(req, { params: params! }),
      appUrl
    );
    return protectedHandler(request, context);
  };
};

export const GET = wrapHandler(getRoleHandler);
export const PUT = wrapHandler(updateRoleHandler);
export const DELETE = wrapHandler(deleteRoleHandler);
export const PATCH = wrapHandler(patchRoleHandler);
