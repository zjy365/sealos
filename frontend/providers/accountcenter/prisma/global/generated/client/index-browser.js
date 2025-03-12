
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  detectRuntime,
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.10.2
 * Query Engine version: 5a9203d0590c951969e85a7d07215503f4672eb9
 */
Prisma.prismaVersion = {
  client: "5.10.2",
  engine: "5a9203d0590c951969e85a7d07215503f4672eb9"
}

Prisma.PrismaClientKnownRequestError = () => {
  throw new Error(`PrismaClientKnownRequestError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  throw new Error(`PrismaClientUnknownRequestError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  throw new Error(`PrismaClientRustPanicError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  throw new Error(`PrismaClientInitializationError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  throw new Error(`PrismaClientValidationError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  throw new Error(`NotFoundError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  throw new Error(`sqltag is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  throw new Error(`empty is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  throw new Error(`join is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  throw new Error(`raw is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  throw new Error(`Extensions.getExtensionContext is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  throw new Error(`Extensions.defineExtension is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}

/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  Serializable: 'Serializable'
});

exports.Prisma.OauthProviderScalarFieldEnum = {
  uid: 'uid',
  userUid: 'userUid',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  providerType: 'providerType',
  providerId: 'providerId',
  password: 'password'
};

exports.Prisma.RegionScalarFieldEnum = {
  uid: 'uid',
  displayName: 'displayName',
  location: 'location',
  domain: 'domain',
  description: 'description'
};

exports.Prisma.AccountScalarFieldEnum = {
  userUid: 'userUid',
  activityBonus: 'activityBonus',
  encryptBalance: 'encryptBalance',
  encryptDeductionBalance: 'encryptDeductionBalance',
  created_at: 'created_at',
  create_region_id: 'create_region_id',
  balance: 'balance',
  deduction_balance: 'deduction_balance'
};

exports.Prisma.AccountTransactionScalarFieldEnum = {
  id: 'id',
  type: 'type',
  deduction_balance: 'deduction_balance',
  balance: 'balance',
  message: 'message',
  created_at: 'created_at',
  updated_at: 'updated_at',
  billing_id: 'billing_id',
  userUid: 'userUid',
  balance_before: 'balance_before',
  deduction_balance_before: 'deduction_balance_before',
  region: 'region',
  deduction_credit: 'deduction_credit',
  billing_id_list: 'billing_id_list',
  credit_id_list: 'credit_id_list'
};

exports.Prisma.ErrorPaymentCreateScalarFieldEnum = {
  userUid: 'userUid',
  regionUid: 'regionUid',
  created_at: 'created_at',
  regionUserOwner: 'regionUserOwner',
  method: 'method',
  amount: 'amount',
  gift: 'gift',
  trade_no: 'trade_no',
  code_url: 'code_url',
  invoiced_at: 'invoiced_at',
  remark: 'remark',
  message: 'message',
  create_time: 'create_time'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  userUid: 'userUid',
  regionUid: 'regionUid',
  created_at: 'created_at',
  regionUserOwner: 'regionUserOwner',
  method: 'method',
  amount: 'amount',
  gift: 'gift',
  trade_no: 'trade_no',
  code_url: 'code_url',
  invoiced_at: 'invoiced_at',
  remark: 'remark',
  message: 'message',
  activityType: 'activityType',
  metadata: 'metadata',
  card_uid: 'card_uid',
  type: 'type',
  charge_source: 'charge_source'
};

exports.Prisma.UserScalarFieldEnum = {
  uid: 'uid',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  avatarUri: 'avatarUri',
  nickname: 'nickname',
  id: 'id',
  name: 'name',
  status: 'status'
};

exports.Prisma.InviteRewardScalarFieldEnum = {
  payment_id: 'payment_id',
  userUid: 'userUid',
  created_at: 'created_at',
  payment_amount: 'payment_amount',
  reward_amount: 'reward_amount',
  inviteFrom: 'inviteFrom'
};

exports.Prisma.UserSemChannelScalarFieldEnum = {
  id: 'id',
  userUid: 'userUid',
  channel: 'channel',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  additionalInfo: 'additionalInfo'
};

exports.Prisma.TaskScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  reward: 'reward',
  order: 'order',
  isActive: 'isActive',
  isNewUserTask: 'isNewUserTask',
  taskType: 'taskType',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserTaskScalarFieldEnum = {
  id: 'id',
  userUid: 'userUid',
  taskId: 'taskId',
  status: 'status',
  rewardStatus: 'rewardStatus',
  completedAt: 'completedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CardInfoScalarFieldEnum = {
  id: 'id',
  user_uid: 'user_uid',
  card_no: 'card_no',
  card_brand: 'card_brand',
  card_token: 'card_token',
  created_at: 'created_at',
  network_transaction_id: 'network_transaction_id',
  default: 'default',
  last_payment_status: 'last_payment_status'
};

exports.Prisma.CreditsScalarFieldEnum = {
  id: 'id',
  user_uid: 'user_uid',
  amount: 'amount',
  used_amount: 'used_amount',
  from_id: 'from_id',
  from_type: 'from_type',
  expire_at: 'expire_at',
  created_at: 'created_at',
  start_at: 'start_at',
  status: 'status'
};

exports.Prisma.InvoicePaymentScalarFieldEnum = {
  invoice_id: 'invoice_id',
  payment_id: 'payment_id',
  amount: 'amount'
};

exports.Prisma.PaymentOrderScalarFieldEnum = {
  id: 'id',
  userUid: 'userUid',
  regionUid: 'regionUid',
  created_at: 'created_at',
  regionUserOwner: 'regionUserOwner',
  method: 'method',
  amount: 'amount',
  gift: 'gift',
  trade_no: 'trade_no',
  code_url: 'code_url',
  invoiced_at: 'invoiced_at',
  remark: 'remark',
  activityType: 'activityType',
  message: 'message',
  card_uid: 'card_uid',
  type: 'type',
  charge_source: 'charge_source',
  status: 'status'
};

exports.Prisma.SubscriptionScalarFieldEnum = {
  id: 'id',
  plan_id: 'plan_id',
  plan_name: 'plan_name',
  user_uid: 'user_uid',
  status: 'status',
  start_at: 'start_at',
  update_at: 'update_at',
  expire_at: 'expire_at',
  card_id: 'card_id',
  next_cycle_date: 'next_cycle_date'
};

exports.Prisma.SubscriptionPlanScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  amount: 'amount',
  gift_amount: 'gift_amount',
  period: 'period',
  upgrade_plan_list: 'upgrade_plan_list',
  downgrade_plan_list: 'downgrade_plan_list',
  max_seats: 'max_seats',
  max_workspaces: 'max_workspaces',
  max_resources: 'max_resources',
  created_at: 'created_at',
  updated_at: 'updated_at',
  most_popular: 'most_popular'
};

exports.Prisma.UserInfoScalarFieldEnum = {
  id: 'id',
  userUid: 'userUid',
  firstname: 'firstname',
  lastname: 'lastname',
  signUpRegionUid: 'signUpRegionUid',
  isInited: 'isInited',
  enSubEmail: 'enSubEmail'
};

exports.Prisma.WorkspaceUsageScalarFieldEnum = {
  id: 'id',
  userUid: 'userUid',
  workspaceUid: 'workspaceUid',
  regionUid: 'regionUid',
  seat: 'seat',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.ProviderType = exports.$Enums.ProviderType = {
  PHONE: 'PHONE',
  GITHUB: 'GITHUB',
  WECHAT: 'WECHAT',
  GOOGLE: 'GOOGLE',
  PASSWORD: 'PASSWORD',
  OAUTH2: 'OAUTH2',
  EMAIL: 'EMAIL'
};

exports.UserStatus = exports.$Enums.UserStatus = {
  NORMAL_USER: 'NORMAL_USER',
  LOCK_USER: 'LOCK_USER',
  DELETE_USER: 'DELETE_USER'
};

exports.TaskType = exports.$Enums.TaskType = {
  LAUNCHPAD: 'LAUNCHPAD',
  COSTCENTER: 'COSTCENTER',
  DATABASE: 'DATABASE',
  DESKTOP: 'DESKTOP',
  APPSTORE: 'APPSTORE',
  CRONJOB: 'CRONJOB',
  DEVBOX: 'DEVBOX',
  CONTACT: 'CONTACT',
  REAL_NAME_AUTH: 'REAL_NAME_AUTH'
};

exports.TaskStatus = exports.$Enums.TaskStatus = {
  NOT_COMPLETED: 'NOT_COMPLETED',
  COMPLETED: 'COMPLETED'
};

exports.Prisma.ModelName = {
  OauthProvider: 'OauthProvider',
  Region: 'Region',
  Account: 'Account',
  AccountTransaction: 'AccountTransaction',
  ErrorPaymentCreate: 'ErrorPaymentCreate',
  Payment: 'Payment',
  User: 'User',
  InviteReward: 'InviteReward',
  UserSemChannel: 'UserSemChannel',
  Task: 'Task',
  UserTask: 'UserTask',
  CardInfo: 'CardInfo',
  Credits: 'Credits',
  InvoicePayment: 'InvoicePayment',
  PaymentOrder: 'PaymentOrder',
  Subscription: 'Subscription',
  SubscriptionPlan: 'SubscriptionPlan',
  UserInfo: 'UserInfo',
  WorkspaceUsage: 'WorkspaceUsage'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        const runtime = detectRuntime()
        const edgeRuntimeName = {
          'workerd': 'Cloudflare Workers',
          'deno': 'Deno and Deno Deploy',
          'netlify': 'Netlify Edge Functions',
          'edge-light': 'Vercel Edge Functions or Edge Middleware',
        }[runtime]

        let message = 'PrismaClient is unable to run in '
        if (edgeRuntimeName !== undefined) {
          message += edgeRuntimeName + '. As an alternative, try Accelerate: https://pris.ly/d/accelerate.'
        } else {
          message += 'this browser environment, or has been bundled for the browser (running in `' + runtime + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
