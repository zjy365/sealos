import { v4 } from 'uuid';
import { connectToDatabase } from './mongodb';
export type TEmailPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};
type TVerification_Codes = {
  id: string;
  code: string;
  payload: TEmailPayload;
  createdAt: Date;
};

async function connectToCollection() {
  const client = await connectToDatabase();
  const collection = client.db().collection<TVerification_Codes>('email_verification_codes');
  // 10天后过期
  await collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 10 });
  await collection.createIndex({ code: 1 }, { unique: true });
  await collection.createIndex({ id: 1 }, { unique: true });

  return collection;
}

// addOrUpdateCode
export async function addOrUpdateCode({
  id,
  payload,
  code
}: {
  id: string;
  code: string;
  payload: TEmailPayload;
}) {
  const codes = await connectToCollection();
  const result = await codes.updateOne(
    {
      id
    },
    {
      $set: {
        code,
        payload,
        createdAt: new Date(),
        uid: v4()
      }
    },
    {
      upsert: true
    }
  );
  return result;
}
// checkCode 1分钟内不能重发
export async function checkSendable({ id, timeout = 60 * 1000 }: { id: string; timeout?: number }) {
  const codes = await connectToCollection();
  const result = await codes.findOne({
    id,
    createdAt: {
      $gt: new Date(new Date().getTime() - timeout)
    }
  });
  return !result;
}
// checkCode
export async function checkCode({
  // id,
  code,
  cacheTime = 5 * 60 * 1000
}: {
  // id: string;
  code: string;
  cacheTime?: number;
}) {
  const codes = await connectToCollection();
  const result = await codes.findOne({
    // id,
    code,
    createdAt: {
      $gt: new Date(new Date().getTime() - cacheTime)
    }
  });
  return result;
}
// export async function getInfoByUid({ uid }: { uid: string }) {
//   const codes = await connectToCollection();
//   const result = await codes.findOne({
//     uid
//   });
//   return result;
// }
