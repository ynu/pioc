import { query } from '../connection';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  name: string;
  status: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  name: string;
  status?: number;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;
  name?: string;
  status?: number;
}

export async function findAll(): Promise<User[]> {
  return query<User[]>('SELECT * FROM pioc_users ORDER BY created_at DESC');
}

export async function findById(id: number): Promise<User | null> {
  const results = await query<User[]>('SELECT * FROM pioc_users WHERE id = ?', [id]);
  return results[0] || null;
}

export async function findByUsername(username: string): Promise<User | null> {
  const results = await query<User[]>('SELECT * FROM pioc_users WHERE username = ?', [username]);
  return results[0] || null;
}

export async function findByEmail(email: string): Promise<User | null> {
  const results = await query<User[]>('SELECT * FROM pioc_users WHERE email = ?', [email]);
  return results[0] || null;
}

export async function create(data: CreateUserData): Promise<number> {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const result = await query<{ insertId: number }>(
    'INSERT INTO pioc_users (username, email, password, name, status) VALUES (?, ?, ?, ?, ?)',
    [data.username, data.email, hashedPassword, data.name, data.status ?? 1]
  );
  return result.insertId;
}

export async function update(id: number, data: UpdateUserData): Promise<boolean> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.username !== undefined) {
    fields.push('username = ?');
    values.push(data.username);
  }
  if (data.email !== undefined) {
    fields.push('email = ?');
    values.push(data.email);
  }
  if (data.password !== undefined) {
    fields.push('password = ?');
    values.push(await bcrypt.hash(data.password, 10));
  }
  if (data.name !== undefined) {
    fields.push('name = ?');
    values.push(data.name);
  }
  if (data.status !== undefined) {
    fields.push('status = ?');
    values.push(data.status);
  }

  if (fields.length === 0) return false;

  fields.push('updated_at = NOW()');
  values.push(id);

  const result = await query<{ affectedRows: number }>(
    `UPDATE pioc_users SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
  return result.affectedRows > 0;
}

export async function remove(id: number): Promise<boolean> {
  const result = await query<{ affectedRows: number }>('DELETE FROM pioc_users WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function findUserRoles(userId: number): Promise<{ id: number; name: string }[]> {
  const results = await query<{ id: number; name: string }[]>(
    `SELECT r.id, r.name 
     FROM pioc_roles r 
     INNER JOIN pioc_user_roles ur ON r.id = ur.role_id 
     WHERE ur.user_id = ?`,
    [userId]
  );
  return results;
}

export async function updateUserRoles(userId: number, roleIds: number[]): Promise<void> {
  // 先删除该用户的所有角色
  await query('DELETE FROM pioc_user_roles WHERE user_id = ?', [userId]);

  // 插入新的角色关联
  if (roleIds.length > 0) {
    const values = roleIds.map(() => '(?, ?)').join(', ');
    const params = roleIds.flatMap(roleId => [userId, roleId]);
    await query(`INSERT INTO pioc_user_roles (user_id, role_id) VALUES ${values}`, params);
  }
}
