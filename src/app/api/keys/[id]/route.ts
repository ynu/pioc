import { NextRequest, NextResponse } from 'next/server';
import { findById, update, remove } from '@/lib/database/models/key';
import { createAppProtectedHandler } from '@/lib/auth/middleware';

const appUrl = '/key-management';

async function updateKeyHandler(
  request: NextRequest,
  session: { userId: number; username: string; email: string; name: string },
  params: Promise<{ id: string }>
) {
  try {
    const { id } = await params;

    if (!id || id.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Invalid key ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    // 检查密钥是否存在
    const existingKey = await findById(id);
    if (!existingKey) {
      return NextResponse.json(
        { success: false, message: 'Key not found' },
        { status: 404 }
      );
    }

    // 只允许更新名称和描述
    const updateData: { name?: string; description?: string } = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No fields to update' },
        { status: 400 }
      );
    }

    const success = await update(id, updateData);
    if (success) {
      return NextResponse.json({ success: true, message: 'Key updated successfully' });
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to update key' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update key', error: String(error) },
      { status: 500 }
    );
  }
}

async function deleteKeyHandler(
  request: NextRequest,
  session: { userId: number; username: string; email: string; name: string },
  params: Promise<{ id: string }>
) {
  try {
    const { id } = await params;

    if (!id || id.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Invalid key ID' },
        { status: 400 }
      );
    }

    // 检查密钥是否存在
    const existingKey = await findById(id);
    if (!existingKey) {
      return NextResponse.json(
        { success: false, message: 'Key not found' },
        { status: 404 }
      );
    }

    const success = await remove(id);
    if (success) {
      return NextResponse.json({ success: true, message: 'Key deleted successfully' });
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to delete key' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to delete key', error: String(error) },
      { status: 500 }
    );
  }
}

// 包装处理器以支持动态路由参数
type HandlerFunction = (
  req: NextRequest,
  session: { userId: number; username: string; email: string; name: string },
  params: Promise<{ id: string }>
) => Promise<NextResponse>;

const wrapHandler = (handler: HandlerFunction) => {
  return async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const protectedHandler = createAppProtectedHandler(
      (req: NextRequest, session: { userId: number; username: string; email: string; name: string }, params?: Promise<{ [key: string]: string }>) => 
        handler(req, session, params as Promise<{ id: string }>),
      appUrl
    );
    return protectedHandler(request, context);
  };
};

export const PUT = wrapHandler(updateKeyHandler);
export const DELETE = wrapHandler(deleteKeyHandler);
