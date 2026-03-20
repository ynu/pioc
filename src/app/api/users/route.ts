import { NextRequest, NextResponse } from 'next/server';
import { findAll, create, findByUsername, findByEmail, findUserRoles, updateUserRoles } from '@/lib/database/models/user';
import { createAppProtectedHandler } from '@/lib/auth/middleware';

// 使用应用权限保护处理器（用户管理应用）
const appUrl = '/users';

async function getUsersHandler() {
  try {
    const users = await findAll();
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const roles = await findUserRoles(user.id);
        return {
          ...user,
          roles: roles.map(r => ({ id: r.id, name: r.name })),
        };
      })
    );
    return NextResponse.json({ success: true, data: usersWithRoles });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users', error: String(error) },
      { status: 500 }
    );
  }
}

async function createUserHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, name, roleIds } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Username, email and password are required' },
        { status: 400 }
      );
    }

    const existingUsername = await findByUsername(username);
    if (existingUsername) {
      return NextResponse.json(
        { success: false, message: 'Username already exists' },
        { status: 409 }
      );
    }

    const existingEmail = await findByEmail(email);
    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 409 }
      );
    }

    const id = await create({ username, email, password, name: name || '' });

    // 如果提供了角色ID列表，则分配角色
    if (roleIds && Array.isArray(roleIds) && roleIds.length > 0) {
      await updateUserRoles(id, roleIds);
    }

    return NextResponse.json({ success: true, data: { id } }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to create user', error: String(error) },
      { status: 500 }
    );
  }
}

export const GET = createAppProtectedHandler(getUsersHandler, appUrl);
export const POST = createAppProtectedHandler(createUserHandler, appUrl);
