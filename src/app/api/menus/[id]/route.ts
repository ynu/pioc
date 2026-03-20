import { NextRequest, NextResponse } from 'next/server';
import {
  findById,
  update,
  remove,
  removeRecursive,
  existsByNameAndParent,
} from '@/lib/database/models/menu';
import { createAppProtectedHandler } from '@/lib/auth/middleware';

const appUrl = '/menus';

// 获取单个菜单
async function getMenuHandler(request: NextRequest, session: { userId: number; username: string; email: string; name: string }, params?: Promise<{ [key: string]: string }>) {
  try {
    const { id } = await params!;
    const menuId = parseInt(id);

    if (isNaN(menuId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid menu ID' },
        { status: 400 }
      );
    }

    const menu = await findById(menuId);
    if (!menu) {
      return NextResponse.json(
        { success: false, message: 'Menu not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: menu });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch menu', error: String(error) },
      { status: 500 }
    );
  }
}

// 更新菜单
async function updateMenuHandler(request: NextRequest, session: { userId: number; username: string; email: string; name: string }, params?: Promise<{ [key: string]: string }>) {
  try {
    const { id } = await params!;
    const menuId = parseInt(id);

    if (isNaN(menuId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid menu ID' },
        { status: 400 }
      );
    }

    const existingMenu = await findById(menuId);
    if (!existingMenu) {
      return NextResponse.json(
        { success: false, message: 'Menu not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, icon, parent_id, sort_order, status, app_id } = body;

    // 检查是否试图将自己设为父菜单
    if (parent_id === menuId) {
      return NextResponse.json(
        { success: false, message: 'Menu cannot be its own parent' },
        { status: 400 }
      );
    }

    // 如果名称或父菜单发生变化，检查名称是否重复
    if (name !== undefined && (name !== existingMenu.name || parent_id !== undefined)) {
      const newParentId = parent_id !== undefined ? parent_id : existingMenu.parent_id;
      const exists = await existsByNameAndParent(name, newParentId, menuId);
      if (exists) {
        return NextResponse.json(
          { success: false, message: 'Menu name already exists at this level' },
          { status: 409 }
        );
      }
    }

    // 检查父菜单是否存在
    if (parent_id !== undefined && parent_id !== null) {
      const parent = await findById(parent_id);
      if (!parent) {
        return NextResponse.json(
          { success: false, message: 'Parent menu not found' },
          { status: 404 }
        );
      }
    }

    const updated = await update(menuId, {
      name,
      icon,
      parent_id,
      sort_order,
      status,
      app_id,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Failed to update menu' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Menu updated successfully' });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update menu', error: String(error) },
      { status: 500 }
    );
  }
}

// 删除菜单
async function deleteMenuHandler(request: NextRequest, session: { userId: number; username: string; email: string; name: string }, params?: Promise<{ [key: string]: string }>) {
  try {
    const { id } = await params!;
    const menuId = parseInt(id);

    if (isNaN(menuId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid menu ID' },
        { status: 400 }
      );
    }

    const existingMenu = await findById(menuId);
    if (!existingMenu) {
      return NextResponse.json(
        { success: false, message: 'Menu not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const recursive = searchParams.get('recursive') === 'true';

    let deleted;
    if (recursive) {
      deleted = await removeRecursive(menuId);
    } else {
      deleted = await remove(menuId);
    }

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete menu' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Menu deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('children')) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete menu with children. Use recursive=true to delete with all children.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Failed to delete menu', error: message },
      { status: 500 }
    );
  }
}

export const GET = createAppProtectedHandler(getMenuHandler, appUrl);
export const PUT = createAppProtectedHandler(updateMenuHandler, appUrl);
export const DELETE = createAppProtectedHandler(deleteMenuHandler, appUrl);
