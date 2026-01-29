import { NextResponse } from "next/server";
import { applyMigration } from "@/storage/database/migrate";
import { authManager } from "@/storage/database";

/**
 * 应用数据库迁移
 * 
 * POST /api/migrate
 * 
 * 此接口用于应用数据库迁移文件，将Schema变更应用到数据库。
 * 仅管理员可以调用此接口。
 */
export async function POST(request: Request) {
  try {
    // 开发环境：允许任何用户运行迁移
    // 生产环境：需要管理员权限
    const authHeader = request.headers.get("authorization");
    
    // 如果是开发环境，直接运行迁移
    const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    
    let userId: string | null = null;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const session = await authManager.verifyToken(token);
      userId = session?.userId || null;
    }

    // 生产环境：验证用户权限
    if (!isDev) {
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { error: "未授权访问" },
          { status: 401 }
        );
      }

      if (!userId) {
        return NextResponse.json(
          { error: "无效的授权令牌" },
          { status: 401 }
        );
      }

      // 验证用户权限（仅管理员可以执行迁移）
      const user = await authManager.getUserById(userId);
      if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
        return NextResponse.json(
          { error: "权限不足，仅管理员可以执行数据库迁移" },
          { status: 403 }
        );
      }
    }

    // 应用迁移
    console.log("开始应用数据库迁移...");
    const result = await applyMigration();

    return NextResponse.json({
      success: true,
      message: "数据库迁移成功",
      data: result,
    });

  } catch (error) {
    console.error("迁移失败：", error);
    return NextResponse.json(
      { 
        error: "数据库迁移失败",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * 获取迁移状态
 * 
 * GET /api/migrate
 * 
 * 获取当前数据库迁移状态信息
 */
export async function GET(request: Request) {
  try {
    // 验证用户身份
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const session = await authManager.verifyToken(token);

    if (!session || !session.userId) {
      return NextResponse.json(
        { error: "无效的授权令牌" },
        { status: 401 }
      );
    }

    // 验证用户权限
    const user = await authManager.getUserById(session.userId);
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json(
        { error: "权限不足" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "迁移状态查询",
      note: "当前使用 drizzle-kit push 方式直接同步Schema",
      documentation: "可通过运行 npm run migrate:apply 应用最新变更",
    });

  } catch (error) {
    console.error("查询迁移状态失败：", error);
    return NextResponse.json(
      { 
        error: "查询失败",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
