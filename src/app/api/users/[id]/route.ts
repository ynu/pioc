import { NextRequest, NextResponse } from 'next/server';
import { findById, update, remove, findByUsername, findByEmail, findUserRoles, updateUserRoles } from '@/lib/database/models/user';
import { createAppProtectedHandler } from '@/lib/auth/middleware';

const appUrl = '/users';

async function getUserHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await findById(parseInt(id));
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const roles = await findUserRoles(parseInt(id));

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        roles: roles.map(r => ({ id: r.id, name: r.name })),
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user', error: String(error) },
      { status: 500 }
    );
  }
}

async function updateUserHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { username, email, password, name, status, roleIds } = body;

    const existingUser = await findById(parseInt(id));
    if (!existingUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    if (username && username !== existingUser.username) {
      const userWithUsername = await findByUsername(username);
      if (userWithUsername) {
        return NextResponse.json({ success: false, message: 'Username already exists' }, { status: 409 });
      }
    }

    if (email && email !== existingUser.email) {
      const userWithEmail = await findByEmail(email);
      if (userWithEmail) {
        return NextResponse.json({ success: false, message: 'Email already exists' }, { status: 409 });
      }
    }

    const updated = await update(parseInt(id), { username, email, password, name, status });

    // 如果提供了角色ID列表，则更新角色
    if (roleIds !== undefined && Array.isArray(roleIds)) {
      await updateUserRoles(parseInt(id), roleIds);
    }

    if (!updated && roleIds === undefined) {
      return NextResponse.json({ success: false, message: 'No changes made' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update user', error: String(error) },
      { status: 500 }
    );
  }
}

async function deleteUserHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await remove(parseInt(id));
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to delete user', error: String(error) },
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

export const GET = wrapHandler(getUserHandler);
export const PUT = wrapHandler(updateUserHandler);
export const DELETE = wrapHandler(deleteUserHandler);
