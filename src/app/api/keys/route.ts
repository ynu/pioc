import { NextRequest, NextResponse } from 'next/server';
import { findAll, create, findByNameAndUserId } from '@/lib/database/models/key';
import { createAppProtectedHandler, getCurrentUserId } from '@/lib/auth/middleware';
import crypto from 'crypto';

const appUrl = '/key-management';

// 生成RSA密钥对
function generateRSAKeyPair(keySize: number): { publicKey: string; privateKey: string } {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: keySize,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });
  return { publicKey, privateKey };
}

// 生成ECC密钥对
function generateECCKeyPair(curve: string): { publicKey: string; privateKey: string } {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: curve,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });
  return { publicKey, privateKey };
}

// 生成EdDSA密钥对
function generateEdDSAKeyPair(_curve: string): { publicKey: string; privateKey: string } {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });
  return { publicKey, privateKey };
}

async function getKeysHandler(_request: NextRequest) {
  try {
    const keys = await findAll();
    return NextResponse.json({ success: true, data: keys });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch keys', error: String(error) },
      { status: 500 }
    );
  }
}

async function createKeyHandler(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, type, key_size, curve, description } = body;

    if (!name || !type) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['RSA', 'ECC', 'EdDSA'].includes(type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid key type. Must be RSA, ECC, or EdDSA' },
        { status: 400 }
      );
    }

    // 检查密钥名称是否已存在
    const existingKey = await findByNameAndUserId(name, userId);
    if (existingKey) {
      return NextResponse.json(
        { success: false, message: 'Key name already exists' },
        { status: 409 }
      );
    }

    // 根据类型生成密钥对
    let keyPair: { publicKey: string; privateKey: string };
    let keySizeValue: number | undefined;
    let curveValue: string | undefined;

    try {
      if (type === 'RSA') {
        if (!key_size || ![1024, 2048, 3072, 4096].includes(key_size)) {
          return NextResponse.json(
            { success: false, message: 'Invalid RSA key size. Must be 1024, 2048, 3072, or 4096' },
            { status: 400 }
          );
        }
        keyPair = generateRSAKeyPair(key_size);
        keySizeValue = key_size;
      } else if (type === 'ECC') {
        if (!curve || !['secp256k1', 'secp256r1', 'secp384r1', 'secp521r1'].includes(curve)) {
          return NextResponse.json(
            { success: false, message: 'Invalid ECC curve' },
            { status: 400 }
          );
        }
        keyPair = generateECCKeyPair(curve);
        curveValue = curve;
      } else if (type === 'EdDSA') {
        if (!curve || !['ed25519', 'ed448'].includes(curve)) {
          return NextResponse.json(
            { success: false, message: 'Invalid EdDSA curve. Must be ed25519 or ed448' },
            { status: 400 }
          );
        }
        // Node.js crypto 只支持 ed25519，ed448 需要额外处理
        if (curve === 'ed448') {
          return NextResponse.json(
            { success: false, message: 'ed448 curve is not supported in this version' },
            { status: 400 }
          );
        }
        keyPair = generateEdDSAKeyPair(curve);
        curveValue = curve;
      } else {
        return NextResponse.json(
          { success: false, message: 'Invalid key type' },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Failed to generate key pair', error: String(error) },
        { status: 500 }
      );
    }

    const id = await create({
      name,
      type,
      key_size: keySizeValue,
      curve: curveValue,
      public_key: keyPair.publicKey,
      private_key: keyPair.privateKey,
      description,
      user_id: userId,
    });

    return NextResponse.json({ success: true, data: { id } }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to create key', error: String(error) },
      { status: 500 }
    );
  }
}

export const GET = createAppProtectedHandler(getKeysHandler, appUrl);
export const POST = createAppProtectedHandler(createKeyHandler, appUrl);
