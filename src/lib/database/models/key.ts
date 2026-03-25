import { query } from '../connection';

export interface KeyPair {
  id: string;
  name: string;
  type: 'RSA' | 'ECC' | 'EdDSA';
  key_size?: number;
  curve?: string;
  public_key: string;
  private_key: string;
  description?: string;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateKeyData {
  name: string;
  type: 'RSA' | 'ECC' | 'EdDSA';
  key_size?: number;
  curve?: string;
  public_key: string;
  private_key: string;
  description?: string;
  user_id: number;
}

export interface UpdateKeyData {
  name?: string;
  description?: string;
}

export async function findAll(): Promise<KeyPair[]> {
  return query<KeyPair[]>('SELECT * FROM pioc_keys ORDER BY created_at DESC');
}

export async function findById(id: string): Promise<KeyPair | null> {
  const results = await query<KeyPair[]>('SELECT * FROM pioc_keys WHERE id = ?', [id]);
  return results[0] || null;
}

export async function findByUserId(userId: number): Promise<KeyPair[]> {
  return query<KeyPair[]>('SELECT * FROM pioc_keys WHERE user_id = ? ORDER BY created_at DESC', [userId]);
}

export async function create(data: CreateKeyData): Promise<string> {
  const result = await query<{ insertId: number }>(
    'INSERT INTO pioc_keys (name, type, key_size, curve, public_key, private_key, description, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [data.name, data.type, data.key_size || null, data.curve || null, data.public_key, data.private_key, data.description || '', data.user_id]
  );
  // 查询刚插入的记录获取UUID
  const [newKey] = await query<KeyPair[]>('SELECT id FROM pioc_keys WHERE name = ? AND user_id = ? ORDER BY created_at DESC LIMIT 1', [data.name, data.user_id]);
  return newKey?.id || '';
}

export async function update(id: string, data: UpdateKeyData): Promise<boolean> {
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
    `UPDATE pioc_keys SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
  return result.affectedRows > 0;
}

export async function remove(id: string): Promise<boolean> {
  const result = await query<{ affectedRows: number }>('DELETE FROM pioc_keys WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function findByNameAndUserId(name: string, userId: number): Promise<KeyPair | null> {
  const results = await query<KeyPair[]>('SELECT * FROM pioc_keys WHERE name = ? AND user_id = ?', [name, userId]);
  return results[0] || null;
}
