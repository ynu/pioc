import { NextRequest, NextResponse } from 'next/server';
import { findTreeByUserId } from '@/lib/database/models/menu';
import { authenticateRequest } from '@/lib/auth/middleware';

// 获取当前用户的菜单树
async function getMyMenusHandler(request: NextRequest) {
  try {
    // 验证用户身份
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
      );
    }

    const userId = authResult.userId!;
    const menus = await findTreeByUserId(userId);

    return NextResponse.json({ success: true, data: menus });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch menus', error: String(error) },
      { status: 500 }
    );
  }
}

export const GET = getMyMenusHandler;
