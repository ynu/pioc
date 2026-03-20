import { query } from '../connection';

export interface Menu {
  id: number;
  name: string;
  path: string;
  icon?: string;
  parent_id: number | null;
  sort_order: number;
  status: number;
  app_id?: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface MenuWithChildren extends Menu {
  children?: MenuWithChildren[];
}

// 获取所有菜单（扁平结构）
export async function findAll(): Promise<(Menu & { app_icon?: string })[]> {
  const sql = `
    SELECT m.id, m.name, m.path, m.icon, m.parent_id, m.sort_order, m.status, m.app_id, m.created_at, m.updated_at, a.icon as app_icon
    FROM pioc_menus m
    LEFT JOIN pioc_apps a ON m.app_id = a.id
    WHERE m.status = 1
    ORDER BY m.sort_order ASC, m.id ASC
  `;
  return query<(Menu & { app_icon?: string })[]>(sql);
}

// 获取所有菜单（包括禁用的）
export async function findAllWithDisabled(): Promise<(Menu & { app_icon?: string })[]> {
  const sql = `
    SELECT m.id, m.name, m.path, m.icon, m.parent_id, m.sort_order, m.status, m.app_id, m.created_at, m.updated_at, a.icon as app_icon
    FROM pioc_menus m
    LEFT JOIN pioc_apps a ON m.app_id = a.id
    ORDER BY m.sort_order ASC, m.id ASC
  `;
  return query<(Menu & { app_icon?: string })[]>(sql);
}

// 根据ID获取菜单
export async function findById(id: number): Promise<(Menu & { app_icon?: string }) | null> {
  const sql = `
    SELECT m.id, m.name, m.path, m.icon, m.parent_id, m.sort_order, m.status, m.app_id, m.created_at, m.updated_at, a.icon as app_icon
    FROM pioc_menus m
    LEFT JOIN pioc_apps a ON m.app_id = a.id
    WHERE m.id = ?
  `;
  const results = await query<(Menu & { app_icon?: string })[]>(sql, [id]);
  return results.length > 0 ? results[0] : null;
}

// 根据父ID获取子菜单
export async function findByParentId(parentId: number | null): Promise<(Menu & { app_icon?: string })[]> {
  const sql = `
    SELECT m.id, m.name, m.path, m.icon, m.parent_id, m.sort_order, m.status, m.app_id, m.created_at, m.updated_at, a.icon as app_icon
    FROM pioc_menus m
    LEFT JOIN pioc_apps a ON m.app_id = a.id
    WHERE m.parent_id ${parentId === null ? 'IS NULL' : '= ?'} AND m.status = 1
    ORDER BY m.sort_order ASC, m.id ASC
  `;
  const params = parentId === null ? [] : [parentId];
  return query<Menu[]>(sql, params);
}

// 创建菜单
export async function create(data: {
  name: string;
  path?: string;
  icon?: string;
  parent_id?: number | null;
  sort_order?: number;
  status?: number;
  app_id?: number | null;
}): Promise<number> {
  const sql = `
    INSERT INTO pioc_menus (name, path, icon, parent_id, sort_order, status, app_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const result = await query<{ insertId: number }>(sql, [
    data.name,
    data.path || '',
    data.icon || null,
    data.parent_id ?? null,
    data.sort_order ?? 0,
    data.status ?? 1,
    data.app_id ?? null,
  ]);
  return result.insertId;
}

// 更新菜单
export async function update(
  id: number,
  data: {
    name?: string;
    path?: string;
    icon?: string;
    parent_id?: number | null;
    sort_order?: number;
    status?: number;
    app_id?: number | null;
  }
): Promise<boolean> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.name !== undefined) {
    fields.push('name = ?');
    values.push(data.name);
  }
  if (data.path !== undefined) {
    fields.push('path = ?');
    values.push(data.path);
  }
  if (data.icon !== undefined) {
    fields.push('icon = ?');
    values.push(data.icon);
  }
  if (data.parent_id !== undefined) {
    fields.push('parent_id = ?');
    values.push(data.parent_id);
  }
  if (data.sort_order !== undefined) {
    fields.push('sort_order = ?');
    values.push(data.sort_order);
  }
  if (data.status !== undefined) {
    fields.push('status = ?');
    values.push(data.status);
  }
  if (data.app_id !== undefined) {
    fields.push('app_id = ?');
    values.push(data.app_id);
  }

  if (fields.length === 0) return false;

  const sql = `UPDATE pioc_menus SET ${fields.join(', ')} WHERE id = ?`;
  values.push(id);

  const result = await query<{ affectedRows: number }>(sql, values);
  return result.affectedRows > 0;
}

// 删除菜单
export async function remove(id: number): Promise<boolean> {
  // 先检查是否有子菜单
  const children = await findByParentId(id);
  if (children.length > 0) {
    throw new Error('Cannot delete menu with children');
  }

  const sql = 'DELETE FROM pioc_menus WHERE id = ?';
  const result = await query<{ affectedRows: number }>(sql, [id]);
  return result.affectedRows > 0;
}

// 递归删除菜单及其所有子菜单
export async function removeRecursive(id: number): Promise<boolean> {
  // 先获取所有子菜单
  const children = await findByParentId(id);
  
  // 递归删除子菜单
  for (const child of children) {
    await removeRecursive(child.id);
  }

  // 删除当前菜单
  const sql = 'DELETE FROM pioc_menus WHERE id = ?';
  const result = await query<{ affectedRows: number }>(sql, [id]);
  return result.affectedRows > 0;
}

// 构建树形结构
export function buildTree(menus: Menu[]): MenuWithChildren[] {
  const menuMap = new Map<number, MenuWithChildren>();
  const roots: MenuWithChildren[] = [];

  // 首先将所有菜单放入map
  for (const menu of menus) {
    menuMap.set(menu.id, { ...menu, children: [] });
  }

  // 然后构建树形结构
  for (const menu of menus) {
    const menuWithChildren = menuMap.get(menu.id)!;
    if (menu.parent_id === null) {
      roots.push(menuWithChildren);
    } else {
      const parent = menuMap.get(menu.parent_id);
      if (parent) {
        parent.children!.push(menuWithChildren);
      }
    }
  }

  // 清理没有子节点的children属性
  for (const menu of menuMap.values()) {
    if (menu.children?.length === 0) {
      delete menu.children;
    }
  }

  return roots;
}

// 获取树形结构的菜单
export async function findTree(): Promise<(MenuWithChildren & { app_icon?: string })[]> {
  const menus = await findAll();
  return buildTree(menus) as (MenuWithChildren & { app_icon?: string })[];
}

// 获取树形结构的菜单（包括禁用的）
export async function findTreeWithDisabled(): Promise<(MenuWithChildren & { app_icon?: string })[]> {
  const menus = await findAllWithDisabled();
  return buildTree(menus) as (MenuWithChildren & { app_icon?: string })[];
}

// 检查菜单名称是否已存在（同级）
export async function existsByNameAndParent(
  name: string,
  parentId: number | null,
  excludeId?: number
): Promise<boolean> {
  let sql = `
    SELECT id FROM pioc_menus
    WHERE name = ? AND parent_id ${parentId === null ? 'IS NULL' : '= ?'}
  `;
  const params: unknown[] = [name];
  if (parentId !== null) {
    params.push(parentId);
  }
  if (excludeId !== undefined) {
    sql += ' AND id != ?';
    params.push(excludeId);
  }
  const results = await query<Menu[]>(sql, params);
  return results.length > 0;
}

// 获取用户的菜单（基于角色权限）
export async function findByUserId(userId: number): Promise<(Menu & { app_icon?: string })[]> {
  const sql = `
    SELECT DISTINCT m.id, m.name, m.path, m.icon, m.parent_id, m.sort_order, m.status, m.app_id, m.created_at, m.updated_at, a.icon as app_icon
    FROM pioc_menus m
    LEFT JOIN pioc_apps a ON m.app_id = a.id
    LEFT JOIN pioc_role_apps ra ON a.id = ra.app_id
    LEFT JOIN pioc_user_roles ur ON ra.role_id = ur.role_id
    WHERE m.status = 1
    AND (m.app_id IS NULL OR ur.user_id = ?)
    ORDER BY m.sort_order ASC, m.id ASC
  `;
  return query<(Menu & { app_icon?: string })[]>(sql, [userId]);
}

// 获取用户的菜单树
export async function findTreeByUserId(userId: number): Promise<(MenuWithChildren & { app_icon?: string })[]> {
  const menus = await findByUserId(userId);
  return buildTree(menus) as (MenuWithChildren & { app_icon?: string })[];
}
