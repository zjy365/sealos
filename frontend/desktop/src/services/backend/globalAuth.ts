import { uploadConvertData } from '@/api/platform';
import { generateAuthenticationToken } from '@/services/backend/auth';
import { prisma, globalPrisma } from '@/services/backend/db/init';
import { AuthConfigType } from '@/types';
import { SemData } from '@/types/sem';
import { hashPassword } from '@/utils/crypto';
import { K8sApiDefault } from '@/services/backend/kubernetes/admin';
import { CreateSignUpReferralNotificationIfNotExists } from '@/services/backend/kubernetes/user';
import { nanoid } from 'nanoid';
import {
  Prisma,
  PrismaClient,
  ProviderType,
  TaskStatus,
  User,
  UserStatus
} from 'prisma/global/generated/client';
import { Role } from 'prisma/region/generated/client';
import { enableSignUp, enableTracking, getRegionUid } from '../enable';
import { trackSignUp } from './tracking';
import { sendEvent } from '../eventBridge';

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;
type TSignInResult = Prisma.OauthProviderGetPayload<{
  select: {
    user: {
      include: {
        userInfo: {
          select: {
            isInited: true;
          };
        };
      };
    };
  };
}>;
async function signIn({
  provider,
  id,
  password
}: {
  provider: ProviderType;
  id: string;
  password?: string;
}): Promise<TSignInResult | null> {
  const query: Prisma.OauthProviderFindUniqueArgs['where'] = {
    providerId_providerType: {
      providerType: provider,
      providerId: id
    }
  };
  if (!!password) query.password = hashPassword(password);

  const userProvider = await globalPrisma.oauthProvider.findUnique({
    where: query,
    select: {
      user: {
        include: {
          userInfo: {
            select: {
              isInited: true
            }
          }
        }
      }
    }
  });
  if (!userProvider) return null;
  try {
    await checkDeductionBalanceAndCreateTasks(userProvider.user.uid);
  } catch (error) {
    console.error('Error occurred while checking deduction balance:', error);
    throw Error();
  }
  return userProvider;
}

export const inviteHandler = ({
  inviteeId,
  inviterId,
  signResult
}: {
  inviteeId: string;
  inviterId: string;
  signResult: any;
}) => {
  const conf = global.AppConfig?.desktop.auth as AuthConfigType;
  const inviteEnabled = conf.invite?.enabled || false;
  const secretKey = conf.invite?.lafSecretKey || '';
  const baseUrl = conf.invite?.lafBaseURL || '';

  if (!inviteEnabled || !baseUrl || inviterId === inviteeId) return;

  const payload = {
    inviterId,
    inviteeId,
    secretKey: secretKey,
    data: {
      type: 'signup',
      signResult
    }
  };

  fetch(`https://${baseUrl}/uploadData`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Upload laf success:', data);
    })
    .catch((error) => {
      console.error('Upload laf error:', error);
    });
};

export async function signInByPassword({ id, password }: { id: string; password: string }) {
  const userProvider = await signIn({
    id,
    password,
    provider: 'PASSWORD'
  });
  if (!userProvider) return null;

  await checkDeductionBalanceAndCreateTasks(userProvider.user.uid);

  return {
    user: userProvider.user
  };
}

/**
 * Checks the deduction balance of a user and creates new tasks if the balance is zero.
 *
 * @param {string} userUid - The unique identifier of the user.
 */
async function checkDeductionBalanceAndCreateTasks(userUid: string) {
  const account = await globalPrisma.account.findUnique({
    where: { userUid }
  });

  // Check if the account exists, the deduction balance is not null, and the balance is zero.
  if (
    account &&
    account.deduction_balance !== null &&
    account.deduction_balance.toString() === '0'
  ) {
    const userTasks = await globalPrisma.userTask.findFirst({
      where: { userUid }
    });
    // If no user tasks are found, create new tasks for the user.
    if (!userTasks) {
      await globalPrisma.$transaction(async (tx) => {
        await createNewUserTasks(tx, userUid);
      });
    }
  }
}

// Assign tasks to newly registered users
async function createNewUserTasks(tx: TransactionClient, userUid: string) {
  const newUserTasks = await tx.task.findMany({
    where: {
      isActive: true
    }
  });

  for (const task of newUserTasks) {
    await tx.userTask.create({
      data: {
        userUid,
        taskId: task.id,
        status: TaskStatus.NOT_COMPLETED,
        rewardStatus: task.taskType === 'DESKTOP' ? TaskStatus.COMPLETED : TaskStatus.NOT_COMPLETED,
        completedAt: new Date(0)
      }
    });
  }
}

async function createFirstSignUpNotification(user: User) {
  try {
    const userCrUid = await prisma.userCr.findUnique({
      where: {
        userUid: user.uid
      },
      select: {
        uid: true
      }
    });
    const currentNamespaces = await prisma.userWorkspace.findMany({
      where: {
        userCrUid: userCrUid?.uid,
        status: 'IN_WORKSPACE',
        role: Role.OWNER
      },
      include: {
        workspace: {
          select: {
            id: true
          }
        }
      }
    });
    const currentNamespacesId = currentNamespaces.map((item) => item.workspace.id);
    const currentNamespaceId = currentNamespacesId[0];
    const defaultKc = K8sApiDefault();
    await CreateSignUpReferralNotificationIfNotExists(defaultKc, currentNamespaceId);
  } catch (err) {
    console.error('Error occurred while creating first sign up notification:', err);
  }
}

async function signUp({
  provider,
  id,
  name: nickname,
  avatar_url,
  password,
  semData,
  firstname = '',
  lastname = '',
  rawPassword = false
}: {
  provider: ProviderType;
  id: string;
  name: string;
  password?: string;
  firstname?: string;
  lastname?: string;
  avatar_url: string;
  semData?: SemData;
  rawPassword?: boolean;
}) {
  const name = nanoid(10);
  try {
    let oauthProvider: Prisma.UserCreateArgs['data']['oauthProvider'] = {
      create: {
        providerId: id,
        providerType: provider
      }
    };
    if (!!password && !!oauthProvider?.create)
      //@ts-ignore
      oauthProvider.create.password = rawPassword ? password : hashPassword(password);
    const result = await globalPrisma.$transaction(async (tx) => {
      const user: User = await tx.user.create({
        data: {
          name: name,
          id: name,
          nickname: firstname && nickname ? `${firstname} ${lastname}` : nickname,
          avatarUri: avatar_url,
          oauthProvider,
          userInfo: {
            create: {
              firstname,
              lastname,
              signUpRegionUid: getRegionUid(),
              isInited: false,
              verifyEmail: true
            }
          }
        }
      });

      if (semData?.channel) {
        await tx.userSemChannel.create({
          data: {
            userUid: user.uid,
            channel: semData.channel,
            ...(semData.additionalInfo && { additionalInfo: semData.additionalInfo })
          }
        });
      }

      await createNewUserTasks(tx, user.uid);

      return { user };
    });

    return result;
  } catch (error) {
    console.error('globalAuth: Error during sign up:', error);
    return null;
  }
}
async function signUpWithEmail({
  provider,
  id,
  name: nickname,
  avatar_url,
  email,
  semData,
  config,
  firstname = '',
  lastname = ''
}: {
  provider: ProviderType;
  id: string;
  name: string;
  email: string;
  firstname?: string;
  lastname?: string;
  avatar_url: string;
  semData?: SemData;
  config?: any;
}) {
  const name = nanoid(10);
  try {
    let oauthProvider: Prisma.UserCreateArgs['data']['oauthProvider'] = {
      create: {
        providerId: id,
        providerType: provider
      }
    };
    const result = await globalPrisma.$transaction(async (tx) => {
      // 先处理 email 再处理剩余的
      const user: User = await tx.user.create({
        data: {
          name: name,
          id: name,
          nickname: nickname,
          avatarUri: avatar_url,
          oauthProvider: {
            create: {
              providerId: email,
              providerType: 'EMAIL'
            }
          },
          userInfo: {
            create: {
              firstname,
              lastname,
              signUpRegionUid: getRegionUid(),
              isInited: false,
              verifyEmail: true,
              config: config || {}
            }
          }
        }
      });
      // o
      await tx.oauthProvider.create({
        data: {
          providerId: id,
          providerType: provider,
          userUid: user.uid
        }
      });
      if (semData?.channel) {
        await tx.userSemChannel.create({
          data: {
            userUid: user.uid,
            channel: semData.channel,
            ...(semData.additionalInfo && { additionalInfo: semData.additionalInfo })
          }
        });
      }

      await createNewUserTasks(tx, user.uid);

      return { user };
    });

    return result;
  } catch (error) {
    console.error('globalAuth: Error during sign up:', error);
    return null;
  }
}
export async function signUpByPassword({
  id,
  name: nickname,
  avatar_url,
  password,
  semData
}: {
  id: string;
  name: string;
  avatar_url: string;
  password: string;
  semData?: SemData;
}) {
  const name = nanoid(10);
  const result = await signUp({
    provider: 'PASSWORD',
    password,
    id,
    avatar_url: '',
    name
  });
  try {
    const result = await globalPrisma.$transaction(async (tx) => {
      const user: User = await tx.user.create({
        data: {
          nickname,
          avatarUri: avatar_url,
          id: name,
          name,
          oauthProvider: {
            create: {
              providerId: id,
              providerType: ProviderType.PASSWORD,
              password: hashPassword(password)
            }
          }
        }
      });

      if (semData?.channel) {
        await tx.userSemChannel.create({
          data: {
            userUid: user.uid,
            channel: semData.channel,
            ...(semData.additionalInfo && { additionalInfo: semData.additionalInfo })
          }
        });
      }

      await createNewUserTasks(tx, user.uid);

      return { user };
    });
    return result;
  } catch (error) {
    console.error('globalAuth: Error during sign up:', error);
    return null;
  }
}

export async function signUpByEmail({
  id,
  password,
  firstname,
  lastname,
  referralCode,
  semData
}: {
  id: string;
  password: string;
  firstname: string;
  lastname: string;
  referralCode?: string;
  semData?: SemData;
}) {
  const name = nanoid(10);
  const result = await signUp({
    provider: 'EMAIL',
    password,
    id,
    avatar_url: '',
    name,
    firstname,
    lastname,
    rawPassword: true
  });
  if (!result) throw Error('email signup error');

  // Send event to EventBridge
  await sendEvent('user_signup', result.user.uid, referralCode);
  await createFirstSignUpNotification(result.user);

  return {
    user: result.user
  };
}

export async function signInByEmail({ id, password }: { id: string; password: string }) {
  const result = await signIn({
    provider: 'EMAIL',
    password,
    id
  });
  if (!result) return null;

  await checkDeductionBalanceAndCreateTasks(result.user.uid);

  return result;
}
export async function updatePassword({ id, password }: { id: string; password: string }) {
  return globalPrisma.oauthProvider.update({
    where: {
      providerId_providerType: {
        providerId: id,
        providerType: ProviderType.PASSWORD
      }
    },
    data: {
      password
    }
  });
}
export async function findUser({ userUid }: { userUid: string }) {
  return globalPrisma.user.findUnique({
    where: {
      uid: userUid
    },
    include: {
      oauthProvider: true
    }
  });
}
// sign in + sign up
export const getGlobalToken = async ({
  provider,
  providerId,
  name,
  avatar_url,
  password,
  inviterId,
  referralCode,
  semData,
  bdVid
}: {
  provider: ProviderType;
  providerId: string;
  name: string;
  avatar_url: string;
  password?: string;
  inviterId?: string;
  referralCode?: string;
  semData?: SemData;
  bdVid?: string;
}) => {
  let user: User | null = null;
  let isInited = false;

  const _user = await globalPrisma.oauthProvider.findUnique({
    where: {
      providerId_providerType: {
        providerType: provider,
        providerId
      }
    },
    select: {
      userUid: true
    }
  });
  console.log('get global Token,');
  if (provider !== ProviderType.GOOGLE && provider !== ProviderType.GITHUB)
    throw new Error('not support other way to signin/signup');
  if (!_user) {
    if (!enableSignUp()) throw new Error('Failed to signUp user');
    const result = await signUp({
      provider,
      id: providerId,
      name,
      avatar_url,
      semData
    });
    if (result) {
      user = result.user;

      // Send event to EventBridge
      await sendEvent('user_signup', user.uid, referralCode);
      await createFirstSignUpNotification(user);

      if (inviterId) {
        inviteHandler({
          inviterId: inviterId,
          inviteeId: result?.user.name,
          signResult: result
        });
      }
      if (bdVid) {
        await uploadConvertData({ newType: [3], bdVid })
          .then((res) => {
            console.log(res);
          })
          .catch((err) => {
            console.log(err);
          });
      }
      if (enableTracking()) {
        await trackSignUp({
          userId: result.user.id,
          userUid: result.user.uid
        });
      }
    }
  } else {
    const result = await signIn({
      provider,
      id: providerId
    });
    if (result) {
      user = result.user;
      isInited = !!result.user.userInfo?.isInited;
    }
  }
  // }
  if (!user) throw new Error('Failed to edit db');
  // user is deleted or banned
  if (user.status !== UserStatus.NORMAL_USER) return null;
  const token = generateAuthenticationToken({
    userUid: user.uid,
    userId: user.name
  });

  return {
    token,
    user: {
      name: user.nickname,
      avatar: user.avatarUri,
      userUid: user.uid
    },
    needInit: !isInited
  };
};
// 要绑定邮箱
export const getGlobalTokenByOauth = async ({
  provider,
  providerId,
  name,
  email,
  avatar_url,
  inviterId,
  referralCode,
  semData,
  config,
  bdVid
}: {
  provider: ProviderType;
  providerId: string;
  name: string;
  email: string;
  avatar_url: string;
  password?: string;
  inviterId?: string;
  referralCode?: string;
  semData?: SemData;
  bdVid?: string;
  config?: any;
}) => {
  let user: User | null = null;
  let isInited = false;
  if (provider !== ProviderType.GOOGLE && provider !== ProviderType.GITHUB)
    throw new Error('not support other way to signin/signup');
  const _user = await globalPrisma.oauthProvider.findUnique({
    where: {
      providerId_providerType: {
        providerType: provider,
        providerId
      }
    },
    select: {
      userUid: true
    }
  });
  // console.log('global ', user, email, ProviderType, providerId);
  if (!_user) {
    // 注册
    if (!enableSignUp()) throw new Error('Failed to signUp user');
    if (!email) {
      // console.log('email is null');
      return null;
    }
    const emailUser = await globalPrisma.oauthProvider.findUnique({
      where: {
        providerId_providerType: {
          providerType: ProviderType.EMAIL,
          providerId: email
        }
      }
    });
    // 被占用了，待定？ 不绑该邮箱
    // let result;
    if (!!emailUser) return 'email conflict';
    const result = await signUpWithEmail({
      email,
      provider,
      id: providerId,
      name,
      avatar_url,
      semData,
      config
    });
    if (!result) return null;
    user = result.user;
    if (inviterId) {
      inviteHandler({
        inviterId: inviterId,
        inviteeId: result?.user.name,
        signResult: result
      });
    }
    if (bdVid) {
      await uploadConvertData({ newType: [3], bdVid })
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
    }

    // Send event to EventBridge
    await sendEvent('user_signup', user.uid, referralCode);
    await createFirstSignUpNotification(user);

    if (enableTracking()) {
      await trackSignUp({
        userId: result.user.id,
        userUid: result.user.uid
      });
    }
  } else {
    const result = await signIn({
      provider,
      id: providerId
    });
    if (ProviderType.GITHUB === provider && config?.github) {
      const userInfo = await globalPrisma.userInfo.findUnique({
        where: {
          userUid: _user.userUid
        },
        select: {
          config: true
        }
      });
      if (userInfo) {
        let defaultConfig = (userInfo?.config || {}) as object;
        // @ts-ignore
        if (!defaultConfig?.github) {
          defaultConfig = {
            ...defaultConfig,
            github: config.github
          };
        }
        await globalPrisma.userInfo.update({
          where: { userUid: _user.userUid },
          data: {
            config: defaultConfig
          }
        });
      }
    }
    if (result) {
      user = result.user;
      isInited = !!result.user.userInfo?.isInited;
    }
  }
  // }
  if (!user) throw new Error('Failed to edit db');
  // user is deleted or banned
  if (user.status !== UserStatus.NORMAL_USER) return null;
  const token = generateAuthenticationToken({
    userUid: user.uid,
    userId: user.name
  });

  return {
    token,
    user: {
      name: user.nickname,
      avatar: user.avatarUri,
      userUid: user.uid
    },
    needInit: !isInited
  };
};
