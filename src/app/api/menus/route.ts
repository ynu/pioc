import { NextRequest, NextResponse } from 'next/server';
import {
  findAll,
  findAllWithDisabled,
  findTree,
  findTreeWithDisabled,
  findById,
  create,
  update,
  remove,
  removeRecursive,
  existsByNameAndParent,
} from '@/lib/database/models/menu';
import { createAppProtectedHandler } from '@/lib/auth/middleware';

const appUrl = '/menus';

// 获取菜单列表
async function getMenusHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tree = searchParams.get('tree') === 'true';
    const includeDisabled = searchParams.get('includeDisabled') === 'true';

    let menus;
    if (tree) {
      menus = includeDisabled ? await findTreeWithDisabled() : await findTree();
    } else {
      menus = includeDisabled ? await findAllWithDisabled() : await findAll();
    }

    return NextResponse.json({ success: true, data: menus });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch menus', error: String(error) },
      { status: 500 }
    );
  }
}

// 创建菜单
async function createMenuHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, icon, parent_id, sort_order, status, app_id } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Menu name is required' },
        { status: 400 }
      );
    }

    // 检查同级菜单名称是否已存在
    const exists = await existsByNameAndParent(name, parent_id ?? null);
    if (exists) {
      return NextResponse.json(
        { success: false, message: 'Menu name already exists at this level' },
        { status: 409 }
      );
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

    const id = await create({
      name,
      icon,
      parent_id: parent_id ?? null,
      sort_order,
      status,
      app_id,
    });

    return NextResponse.json({ success: true, data: { id } }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to create menu', error: String(error) },
      { status: 500 }
    );
  }
}

export const GET = createAppProtectedHandler(getMenusHandler, appUrl);
export const POST = createAppProtectedHandler(createMenuHandler, appUrl);
