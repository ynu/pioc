import { query } from '../connection';

export interface Role {
  id: number;
  name: string;
  description: string;
  is_builtin: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateRoleData {
  name: string;
  description?: string;
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
}

export async function findAll(): Promise<Role[]> {
  return query<Role[]>('SELECT * FROM pioc_roles ORDER BY created_at DESC');
}

export async function findById(id: number): Promise<Role | null> {
  const results = await query<Role[]>('SELECT * FROM pioc_roles WHERE id = ?', [id]);
  return results[0] || null;
}

export async function findByName(name: string): Promise<Role | null> {
  const results = await query<Role[]>('SELECT * FROM pioc_roles WHERE name = ?', [name]);
  return results[0] || null;
}

export async function create(data: CreateRoleData): Promise<number> {
  const result = await query<{ insertId: number }>(
    'INSERT INTO pioc_roles (name, description) VALUES (?, ?)',
    [data.name, data.description || '']
  );
  return result.insertId;
}

export async function update(id: number, data: UpdateRoleData): Promise<boolean> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.name !== undefined) {
    fields.push('name = ?');
    values.push(data.name);
  }
  if (data.description !== undefined) {
    fields.push('description = ?');
    values.push(data.description);
  }

  if (fields.length === 0) return false;

  fields.push('updated_at = NOW()');
  values.push(id);

  const result = await query<{ affectedRows: number }>(
    `UPDATE pioc_roles SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
  return result.affectedRows > 0;
}

export async function remove(id: number): Promise<boolean> {
  const result = await query<{ affectedRows: number }>('DELETE FROM pioc_roles WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function findUsersByRoleId(roleId: number): Promise<number[]> {
  const results = await query<{ user_id: number }[]>(
    'SELECT user_id FROM pioc_user_roles WHERE role_id = ?',
    [roleId]
  );
  return results.map(r => r.user_id);
}

export async function findAppsByRoleId(roleId: number): Promise<number[]> {
  const results = await query<{ app_id: number }[]>(
    'SELECT app_id FROM pioc_role_apps WHERE role_id = ?',
    [roleId]
  );
  return results.map(r => r.app_id);
}

export async function assignUser(roleId: number, userId: number): Promise<boolean> {
  try {
    await query(
      'INSERT INTO pioc_user_roles (role_id, user_id) VALUES (?, ?)',
      [roleId, userId]
    );
    return true;
  } catch {
    return false;
  }
}

export async function removeUser(roleId: number, userId: number): Promise<boolean> {
  const result = await query<{ affectedRows: number }>(
    'DELETE FROM pioc_user_roles WHERE role_id = ? AND user_id = ?',
    [roleId, userId]
  );
  return result.affectedRows > 0;
}

export async function assignApp(roleId: number, appId: number): Promise<boolean> {
  try {
    await query(
      'INSERT INTO pioc_role_apps (role_id, app_id) VALUES (?, ?)',
      [roleId, appId]
    );
    return true;
  } catch {
    return false;
  }
}

export async function removeApp(roleId: number, appId: number): Promise<boolean> {
  const result = await query<{ affectedRows: number }>(
    'DELETE FROM pioc_role_apps WHERE role_id = ? AND app_id = ?',
    [roleId, appId]
  );
  return result.affectedRows > 0;
}
