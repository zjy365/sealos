
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  detectRuntime,
} = require('./runtime/edge.js')


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

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

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
 * Create the Client
 */
const config = {
  "generator": {
    "name": "globalClient",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "/Users/levin/sealos/frontend/providers/accountcenter/prisma/global/generated/client",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "darwin-arm64",
        "native": true
      },
      {
        "fromEnvVar": null,
        "value": "linux-musl-openssl-3.0.x"
      }
    ],
    "previewFeatures": [],
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../../../../.env"
  },
  "relativePath": "../..",
  "clientVersion": "5.10.2",
  "engineVersion": "5a9203d0590c951969e85a7d07215503f4672eb9",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "cockroachdb",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "GLOBAL_DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "generator globalClient {\n  provider      = \"prisma-client-js\"\n  output        = \"./generated/client\"\n  binaryTargets = [\"native\", \"linux-musl-openssl-3.0.x\"]\n}\n\ndatasource db {\n  provider     = \"cockroachdb\"\n  url          = env(\"GLOBAL_DATABASE_URL\")\n  relationMode = \"prisma\"\n}\n\nmodel OauthProvider {\n  uid          String       @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  userUid      String       @db.Uuid\n  createdAt    DateTime     @default(now()) @db.Timestamptz(3)\n  updatedAt    DateTime     @updatedAt @db.Timestamptz(3)\n  providerType ProviderType\n  providerId   String\n  password     String?\n  user         User         @relation(fields: [userUid], references: [uid])\n\n  @@unique([providerId, providerType])\n  @@index([userUid])\n}\n\nmodel Region {\n  uid            String              @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  displayName    String\n  location       String\n  domain         String\n  description    String?\n  txDetail       TransactionDetail[] @ignore\n  WorkspaceUsage WorkspaceUsage[]\n}\n\nmodel Account {\n  userUid                 String   @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  activityBonus           BigInt\n  encryptBalance          String\n  encryptDeductionBalance String\n  created_at              DateTime @default(now()) @db.Timestamptz(3)\n  create_region_id        String\n  balance                 BigInt?\n  deduction_balance       BigInt?\n}\n\nmodel AccountTransaction {\n  id                       String   @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  type                     String\n  deduction_balance        BigInt\n  balance                  BigInt\n  message                  String?\n  created_at               DateTime @default(now()) @db.Timestamptz(3)\n  updated_at               DateTime @default(now()) @db.Timestamptz(3)\n  billing_id               String   @db.Uuid\n  userUid                  String   @db.Uuid\n  balance_before           BigInt?\n  deduction_balance_before BigInt?\n  region                   String?  @db.Uuid\n  deduction_credit         BigInt?\n  billing_id_list          String[]\n  credit_id_list           String[]\n}\n\nmodel ErrorPaymentCreate {\n  userUid         String   @db.Uuid\n  regionUid       String   @db.Uuid\n  created_at      DateTime @default(now()) @db.Timestamptz(3)\n  regionUserOwner String\n  method          String\n  amount          BigInt\n  gift            BigInt?\n  trade_no        String   @unique\n  code_url        String?\n  invoiced_at     Boolean? @default(false)\n  remark          String?\n  message         String\n  create_time     DateTime @default(now()) @db.Timestamptz(3)\n}\n\nmodel Payment {\n  id              String   @id\n  userUid         String   @db.Uuid\n  regionUid       String   @db.Uuid\n  created_at      DateTime @default(now()) @db.Timestamptz(3)\n  regionUserOwner String\n  method          String\n  amount          BigInt\n  gift            BigInt?\n  trade_no        String   @unique\n  code_url        String?\n  invoiced_at     Boolean? @default(false)\n  remark          String?\n  message         String\n  activityType    String?\n  metadata        String?\n  card_uid        String?  @db.Uuid\n  type            String?\n  charge_source   String?\n}\n\nmodel User {\n  uid                         String                     @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  createdAt                   DateTime                   @default(now()) @db.Timestamptz(3)\n  updatedAt                   DateTime                   @updatedAt @db.Timestamptz(3)\n  avatarUri                   String\n  nickname                    String\n  id                          String                     @unique\n  name                        String                     @unique\n  status                      UserStatus                 @default(NORMAL_USER)\n  oauthProvider               OauthProvider[]\n  oldMergeUserTransactionInfo MergeUserTransactionInfo[] @relation(\"oldUser\") @ignore\n  newMergeUserTransactionInfo MergeUserTransactionInfo[] @relation(\"newUser\") @ignore\n  DeleteUserTransactionInfo   DeleteUserTransactionInfo? @ignore\n  deleteUserLog               DeleteUserLog?             @ignore\n  userTasks                   UserTask[]\n  userInfo                    UserInfo?\n  workspaceUsage              WorkspaceUsage[]\n  subscription                Subscription?\n}\n\nmodel Transfer {\n  uid         String   @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  fromUserUid String   @db.Uuid\n  toUserUid   String   @db.Uuid\n  amount      BigInt\n  remark      String\n  created_at  DateTime @default(now()) @db.Timestamptz(6)\n\n  @@ignore\n}\n\nmodel ErrorAccountCreate {\n  userUid                 String   @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  activityBonus           BigInt\n  encryptBalance          String\n  encryptDeductionBalance String\n  created_at              DateTime @default(now()) @db.Timestamptz(3)\n  create_region_id        String\n  balance                 BigInt?\n  deduction_balance       BigInt?\n  userCr                  String   @unique\n  error_time              DateTime @default(now()) @db.Timestamptz(3)\n  regionUid               String   @db.Uuid\n  regionUserOwner         String\n  message                 String\n\n  @@ignore\n}\n\nmodel CommitTransactionSet {\n  createdAt               DateTime             @default(now()) @db.Timestamptz(3)\n  precommitTransactionUid String               @unique @db.Uuid\n  precommitTransaction    PrecommitTransaction @relation(fields: [precommitTransactionUid], references: [uid])\n\n  @@ignore\n}\n\nmodel PrecommitTransaction {\n  uid                       String                     @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  createdAt                 DateTime                   @default(now()) @db.Timestamptz(3)\n  updatedAt                 DateTime                   @updatedAt @db.Timestamptz(3)\n  transactionType           TransactionType\n  infoUid                   String\n  status                    TransactionStatus\n  transactionDetail         TransactionDetail[]\n  commitTransactionSet      CommitTransactionSet?\n  errorPreCommitTransaction ErrorPreCommitTransaction?\n\n  @@unique([infoUid, transactionType])\n  @@ignore\n}\n\nmodel ErrorPreCommitTransaction {\n  uid                  String               @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  reason               String?\n  createdAt            DateTime             @default(now()) @db.Timestamptz(3)\n  transactionUid       String               @unique @db.Uuid\n  precommitTransaction PrecommitTransaction @relation(fields: [transactionUid], references: [uid])\n\n  @@ignore\n}\n\nmodel TransactionDetail {\n  uid                  String               @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  createdAt            DateTime             @default(now()) @db.Timestamptz(3)\n  updatedAt            DateTime             @updatedAt @db.Timestamptz(3)\n  status               TransactionStatus\n  regionUid            String\n  transactionUid       String\n  region               Region               @relation(fields: [regionUid], references: [uid])\n  precommitTransaction PrecommitTransaction @relation(fields: [transactionUid], references: [uid])\n\n  @@unique([transactionUid, regionUid])\n  @@index([regionUid])\n  @@ignore\n}\n\nmodel MergeUserTransactionInfo {\n  uid          String @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  mergeUserUid String @unique\n  userUid      String\n  mergeUser    User?  @relation(\"oldUser\", fields: [mergeUserUid], references: [uid])\n  user         User?  @relation(\"newUser\", fields: [userUid], references: [uid])\n\n  @@index([userUid])\n  @@ignore\n}\n\nmodel DeleteUserTransactionInfo {\n  uid     String @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  userUid String @unique\n  user    User?  @relation(fields: [userUid], references: [uid])\n\n  @@ignore\n}\n\nmodel DeleteUserLog {\n  userUid   String   @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  createdAt DateTime @default(now()) @db.Timestamptz(3)\n  user      User     @relation(fields: [userUid], references: [uid])\n\n  @@ignore\n}\n\nmodel AuditLog {\n  uid            String           @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  entityUid      String\n  entityName     String\n  createdAt      DateTime         @default(now()) @db.Timestamptz(3)\n  action         AuditAction\n  auditLogDetail AuditLogDetail[]\n\n  @@ignore\n}\n\nmodel AuditLogDetail {\n  auditLogUid String   @id\n  key         String\n  preValue    String\n  newValue    String\n  auditLog    AuditLog @relation(fields: [auditLogUid], references: [uid])\n\n  @@ignore\n}\n\nmodel EventLog {\n  uid       String   @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  createdAt DateTime @default(now()) @db.Timestamptz(3)\n  mainId    String\n  eventName String\n  data      String\n\n  @@ignore\n}\n\nmodel InviteReward {\n  payment_id     String   @id\n  userUid        String   @db.Uuid\n  created_at     DateTime @default(now()) @db.Timestamptz(3)\n  payment_amount BigInt\n  reward_amount  BigInt\n  inviteFrom     String   @db.Uuid\n}\n\nmodel UserRealNameInfo {\n  id                  String   @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  userUid             String   @unique @db.Uuid\n  realName            String?\n  idCard              String?\n  phone               String?\n  isVerified          Boolean  @default(false)\n  idVerifyFailedTimes Int      @default(0)\n  createdAt           DateTime @default(now()) @db.Timestamptz(3)\n  updatedAt           DateTime @updatedAt @db.Timestamptz(3)\n  additionalInfo      Json?\n\n  @@map(\"UserRealNameInfo\")\n  @@ignore\n}\n\nmodel EnterpriseRealNameInfo {\n  id                       String   @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  userUid                  String   @unique @db.Uuid\n  enterpriseName           String?\n  enterpriseQualification  String?\n  legalRepresentativePhone String?\n  isVerified               Boolean  @default(false)\n  verificationStatus       String?\n  createdAt                DateTime @default(now()) @db.Timestamptz(3)\n  updatedAt                DateTime @updatedAt @db.Timestamptz(3)\n  additionalInfo           Json?\n  supportingMaterials      Json?\n\n  @@map(\"EnterpriseRealNameInfo\")\n  @@ignore\n}\n\nmodel RestrictedUser {\n  id              String   @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  userUid         String   @unique @db.Uuid\n  restrictedLevel Int\n  createdAt       DateTime @default(now()) @db.Timestamptz(3)\n  updatedAt       DateTime @updatedAt @db.Timestamptz(3)\n  additionalInfo  Json?\n\n  @@map(\"RestrictedUser\")\n  @@ignore\n}\n\nmodel UserSemChannel {\n  id             String   @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  userUid        String   @unique @db.Uuid\n  channel        String\n  createdAt      DateTime @default(now()) @db.Timestamptz(3)\n  updatedAt      DateTime @updatedAt @db.Timestamptz(3)\n  additionalInfo Json?\n\n  @@map(\"UserSemChannel\")\n}\n\nmodel GiftCode {\n  id           String    @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  code         String    @unique\n  creditAmount BigInt    @default(0)\n  used         Boolean   @default(false)\n  usedBy       String?   @db.Uuid\n  usedAt       DateTime?\n  createdAt    DateTime  @default(now())\n  expiredAt    DateTime?\n  comment      String?\n\n  @@ignore\n}\n\nmodel Task {\n  id            String     @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  title         String\n  description   String\n  reward        BigInt\n  order         Int\n  isActive      Boolean    @default(true)\n  isNewUserTask Boolean    @default(false)\n  taskType      TaskType\n  createdAt     DateTime   @default(now()) @db.Timestamptz(3)\n  updatedAt     DateTime   @updatedAt @db.Timestamptz(3)\n  userTasks     UserTask[]\n}\n\nmodel UserTask {\n  id           String     @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  userUid      String     @db.Uuid\n  taskId       String     @db.Uuid\n  status       TaskStatus\n  rewardStatus TaskStatus\n  completedAt  DateTime\n  createdAt    DateTime   @default(now()) @db.Timestamptz(3)\n  updatedAt    DateTime   @updatedAt @db.Timestamptz(3)\n  user         User       @relation(fields: [userUid], references: [uid])\n  task         Task       @relation(fields: [taskId], references: [id])\n\n  @@unique([userUid, taskId])\n  @@index([taskId])\n}\n\nmodel CardInfo {\n  id                     String    @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  user_uid               String    @db.Uuid\n  card_no                String?\n  card_brand             String?\n  card_token             String?   @unique\n  created_at             DateTime? @default(now()) @db.Timestamptz(3)\n  network_transaction_id String?\n  default                Boolean?  @default(false)\n  last_payment_status    String?\n}\n\n/// The underlying table does not contain a valid unique identifier and can therefore currently not be handled by Prisma Client.\nmodel Configs {\n  type String? @db.String(255)\n  data Json?\n\n  @@ignore\n}\n\nmodel Credits {\n  id          String    @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  user_uid    String?   @db.Uuid\n  amount      BigInt?\n  used_amount BigInt?\n  from_id     String?\n  from_type   String?\n  expire_at   DateTime? @db.Timestamp(6)\n  created_at  DateTime? @default(now()) @db.Timestamptz(3)\n  start_at    DateTime? @db.Timestamp(6)\n  status      String?\n}\n\nmodel CreditsTransaction {\n  id                     String    @id\n  user_uid               String?\n  account_transaction_id String?\n  region_uid             String?\n  credits_id             String?\n  used_amount            BigInt?\n  created_at             DateTime? @db.Timestamptz(6)\n  reason                 String?\n\n  @@ignore\n}\n\nmodel Invoice {\n  id           String    @id\n  user_id      String\n  created_at   DateTime? @default(now()) @db.Timestamptz(3)\n  updated_at   DateTime? @default(now()) @db.Timestamptz(3)\n  detail       String\n  remark       String?\n  total_amount BigInt\n  status       String\n\n  @@ignore\n}\n\nmodel InvoicePayment {\n  invoice_id String?\n  payment_id String  @id\n  amount     BigInt\n}\n\nmodel PaymentOrder {\n  id              String    @id\n  userUid         String    @db.Uuid\n  regionUid       String    @db.Uuid\n  created_at      DateTime? @default(now()) @db.Timestamptz(3)\n  regionUserOwner String\n  method          String\n  amount          BigInt\n  gift            BigInt?\n  trade_no        String    @unique\n  code_url        String?\n  invoiced_at     Boolean?  @default(false)\n  remark          String?\n  activityType    String?\n  message         String\n  card_uid        String?   @db.Uuid\n  type            String?\n  charge_source   String?\n  status          String\n}\n\nmodel Subscription {\n  id               String           @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  plan_id          String           @db.Uuid\n  plan_name        String?          @db.String(50)\n  user_uid         String           @unique @db.Uuid\n  status           String?          @db.String(50)\n  start_at         DateTime?        @db.Timestamptz(6)\n  update_at        DateTime?        @db.Timestamptz(6)\n  expire_at        DateTime?        @db.Timestamptz(6)\n  card_id          String?          @db.Uuid\n  next_cycle_date  DateTime?        @db.Timestamptz(6)\n  subscriptionPlan SubscriptionPlan @relation(fields: [plan_id], references: [id])\n  user             User             @relation(fields: [user_uid], references: [uid])\n}\n\nmodel SubscriptionPlan {\n  id                  String         @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  name                String         @unique\n  description         String?\n  amount              BigInt?\n  gift_amount         BigInt?\n  period              String?        @db.String(50)\n  upgrade_plan_list   String[]\n  downgrade_plan_list String[]\n  max_seats           BigInt\n  max_workspaces      BigInt\n  max_resources       String?\n  created_at          DateTime?      @db.Timestamptz(6)\n  updated_at          DateTime?      @db.Timestamptz(6)\n  most_popular        Boolean?\n  Subscription        Subscription[]\n}\n\n/// The underlying table does not contain a valid unique identifier and can therefore currently not be handled by Prisma Client.\nmodel SubscriptionTransaction {\n  subscription_id String    @db.Uuid\n  user_uid        String    @db.Uuid\n  old_plan_id     String?   @db.Uuid\n  new_plan_id     String?   @db.Uuid\n  old_plan_name   String?   @db.String(50)\n  new_plan_name   String?   @db.String(50)\n  old_plan_status String?   @db.String(50)\n  operator        String?   @db.String(50)\n  start_at        DateTime? @db.Timestamptz(6)\n  created_at      DateTime? @db.Timestamptz(6)\n  updated_at      DateTime? @db.Timestamptz(6)\n  status          String?   @db.String(50)\n  pay_status      String?   @db.String(50)\n  pay_id          String?\n  amount          BigInt?\n\n  @@index([subscription_id], map: \"idx_SubscriptionTransaction_subscription_id\")\n  @@index([user_uid], map: \"idx_SubscriptionTransaction_user_uid\")\n  @@ignore\n}\n\nmodel UserTransfer {\n  id          String\n  uid         String    @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  fromUserUid String    @db.Uuid\n  fromUserId  String\n  toUserUid   String    @db.Uuid\n  toUserId    String\n  amount      BigInt\n  remark      String\n  created_at  DateTime? @default(now()) @db.Timestamptz(3)\n\n  @@id([id, uid])\n  @@ignore\n}\n\nmodel RealNameAuthProvider {\n  id             String   @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  backend        String\n  authType       String\n  maxFailedTimes Int\n  config         Json?\n  createdAt      DateTime @default(now()) @db.Timestamptz(3)\n  updatedAt      DateTime @db.Timestamptz(3)\n\n  @@ignore\n}\n\nmodel UserInfo {\n  id              String  @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  userUid         String  @unique @db.Uuid\n  firstname       String  @default(\"\")\n  lastname        String  @default(\"\")\n  signUpRegionUid String  @db.Uuid\n  isInited        Boolean @default(false)\n  enSubEmail      Boolean @default(false)\n  user            User    @relation(fields: [userUid], references: [uid])\n}\n\nmodel WorkspaceUsage {\n  id           String   @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  userUid      String   @db.Uuid\n  workspaceUid String   @db.Uuid\n  regionUid    String   @db.Uuid\n  seat         Int\n  createdAt    DateTime @default(now()) @db.Timestamptz(3)\n  updatedAt    DateTime @db.Timestamptz(3)\n\n  region Region @relation(fields: [regionUid], references: [uid])\n  user   User   @relation(fields: [userUid], references: [uid])\n\n  @@unique([regionUid, userUid, workspaceUid])\n  @@index([userUid])\n}\n\nenum ProviderType {\n  PHONE\n  GITHUB\n  WECHAT\n  GOOGLE\n  PASSWORD\n  OAUTH2\n  EMAIL\n}\n\nenum TransactionStatus {\n  READY\n  RUNNING\n  FINISH\n  COMMITED\n  ERROR\n}\n\nenum TransactionType {\n  MERGE_USER\n  DELETE_USER\n}\n\nenum AuditAction {\n  UPDATE\n  DELETE\n  CREATE\n}\n\nenum UserStatus {\n  NORMAL_USER\n  LOCK_USER\n  DELETE_USER\n}\n\nenum TaskType {\n  LAUNCHPAD\n  COSTCENTER\n  DATABASE\n  DESKTOP\n  APPSTORE\n  CRONJOB\n  DEVBOX\n  CONTACT\n  REAL_NAME_AUTH\n}\n\nenum TaskStatus {\n  NOT_COMPLETED\n  COMPLETED\n}\n",
  "inlineSchemaHash": "8b70d7801704ada6259bd0cf845d06ab8efdd914b76e6747b82cf5c363abc78d",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"OauthProvider\":{\"dbName\":null,\"fields\":[{\"name\":\"uid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userUid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"providerType\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ProviderType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"providerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"password\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"OauthProviderToUser\",\"relationFromFields\":[\"userUid\"],\"relationToFields\":[\"uid\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"providerId\",\"providerType\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"providerId\",\"providerType\"]}],\"isGenerated\":false},\"Region\":{\"dbName\":null,\"fields\":[{\"name\":\"uid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"displayName\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"location\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"domain\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"WorkspaceUsage\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"WorkspaceUsage\",\"relationName\":\"RegionToWorkspaceUsage\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Account\":{\"dbName\":null,\"fields\":[{\"name\":\"userUid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"activityBonus\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"encryptBalance\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"encryptDeductionBalance\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"create_region_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"balance\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deduction_balance\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"AccountTransaction\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deduction_balance\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"balance\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"message\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"billing_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userUid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"balance_before\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deduction_balance_before\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"region\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deduction_credit\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"billing_id_list\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"credit_id_list\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ErrorPaymentCreate\":{\"dbName\":null,\"fields\":[{\"name\":\"userUid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"regionUid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"regionUserOwner\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"method\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gift\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"trade_no\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"code_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"invoiced_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"remark\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"message\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"create_time\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Payment\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userUid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"regionUid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"regionUserOwner\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"method\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gift\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"trade_no\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"code_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"invoiced_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"remark\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"message\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"activityType\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"card_uid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"charge_source\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"User\":{\"dbName\":null,\"fields\":[{\"name\":\"uid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"avatarUri\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nickname\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"UserStatus\",\"default\":\"NORMAL_USER\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"oauthProvider\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"OauthProvider\",\"relationName\":\"OauthProviderToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userTasks\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserTask\",\"relationName\":\"UserToUserTask\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userInfo\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserInfo\",\"relationName\":\"UserToUserInfo\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"workspaceUsage\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"WorkspaceUsage\",\"relationName\":\"UserToWorkspaceUsage\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"subscription\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Subscription\",\"relationName\":\"SubscriptionToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"InviteReward\":{\"dbName\":null,\"fields\":[{\"name\":\"payment_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userUid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"payment_amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reward_amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"inviteFrom\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"UserSemChannel\":{\"dbName\":\"UserSemChannel\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userUid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"channel\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"additionalInfo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Task\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reward\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"order\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isActive\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isNewUserTask\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"taskType\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"TaskType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"userTasks\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserTask\",\"relationName\":\"TaskToUserTask\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"UserTask\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userUid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"taskId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"TaskStatus\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rewardStatus\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"TaskStatus\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"completedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"UserToUserTask\",\"relationFromFields\":[\"userUid\"],\"relationToFields\":[\"uid\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"task\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Task\",\"relationName\":\"TaskToUserTask\",\"relationFromFields\":[\"taskId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"userUid\",\"taskId\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"userUid\",\"taskId\"]}],\"isGenerated\":false},\"CardInfo\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_uid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"card_no\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"card_brand\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"card_token\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"network_transaction_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"default\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"last_payment_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Credits\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_uid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"used_amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"from_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"from_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"expire_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"start_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"InvoicePayment\":{\"dbName\":null,\"fields\":[{\"name\":\"invoice_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"payment_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"PaymentOrder\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userUid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"regionUid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"regionUserOwner\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"method\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gift\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"trade_no\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"code_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"invoiced_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"remark\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"activityType\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"message\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"card_uid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"charge_source\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Subscription\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"plan_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"plan_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_uid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"start_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"update_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"expire_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"card_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"next_cycle_date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"subscriptionPlan\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"SubscriptionPlan\",\"relationName\":\"SubscriptionToSubscriptionPlan\",\"relationFromFields\":[\"plan_id\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"SubscriptionToUser\",\"relationFromFields\":[\"user_uid\"],\"relationToFields\":[\"uid\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"SubscriptionPlan\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gift_amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"period\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"upgrade_plan_list\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"downgrade_plan_list\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"max_seats\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"max_workspaces\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"max_resources\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"most_popular\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"Subscription\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Subscription\",\"relationName\":\"SubscriptionToSubscriptionPlan\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"UserInfo\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userUid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"firstname\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastname\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"signUpRegionUid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isInited\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"enSubEmail\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"UserToUserInfo\",\"relationFromFields\":[\"userUid\"],\"relationToFields\":[\"uid\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"WorkspaceUsage\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userUid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"workspaceUid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"regionUid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"seat\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"region\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Region\",\"relationName\":\"RegionToWorkspaceUsage\",\"relationFromFields\":[\"regionUid\"],\"relationToFields\":[\"uid\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"UserToWorkspaceUsage\",\"relationFromFields\":[\"userUid\"],\"relationToFields\":[\"uid\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"regionUid\",\"userUid\",\"workspaceUid\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"regionUid\",\"userUid\",\"workspaceUid\"]}],\"isGenerated\":false}},\"enums\":{\"ProviderType\":{\"values\":[{\"name\":\"PHONE\",\"dbName\":null},{\"name\":\"GITHUB\",\"dbName\":null},{\"name\":\"WECHAT\",\"dbName\":null},{\"name\":\"GOOGLE\",\"dbName\":null},{\"name\":\"PASSWORD\",\"dbName\":null},{\"name\":\"OAUTH2\",\"dbName\":null},{\"name\":\"EMAIL\",\"dbName\":null}],\"dbName\":null},\"TransactionStatus\":{\"values\":[{\"name\":\"READY\",\"dbName\":null},{\"name\":\"RUNNING\",\"dbName\":null},{\"name\":\"FINISH\",\"dbName\":null},{\"name\":\"COMMITED\",\"dbName\":null},{\"name\":\"ERROR\",\"dbName\":null}],\"dbName\":null},\"TransactionType\":{\"values\":[{\"name\":\"MERGE_USER\",\"dbName\":null},{\"name\":\"DELETE_USER\",\"dbName\":null}],\"dbName\":null},\"AuditAction\":{\"values\":[{\"name\":\"UPDATE\",\"dbName\":null},{\"name\":\"DELETE\",\"dbName\":null},{\"name\":\"CREATE\",\"dbName\":null}],\"dbName\":null},\"UserStatus\":{\"values\":[{\"name\":\"NORMAL_USER\",\"dbName\":null},{\"name\":\"LOCK_USER\",\"dbName\":null},{\"name\":\"DELETE_USER\",\"dbName\":null}],\"dbName\":null},\"TaskType\":{\"values\":[{\"name\":\"LAUNCHPAD\",\"dbName\":null},{\"name\":\"COSTCENTER\",\"dbName\":null},{\"name\":\"DATABASE\",\"dbName\":null},{\"name\":\"DESKTOP\",\"dbName\":null},{\"name\":\"APPSTORE\",\"dbName\":null},{\"name\":\"CRONJOB\",\"dbName\":null},{\"name\":\"DEVBOX\",\"dbName\":null},{\"name\":\"CONTACT\",\"dbName\":null},{\"name\":\"REAL_NAME_AUTH\",\"dbName\":null}],\"dbName\":null},\"TaskStatus\":{\"values\":[{\"name\":\"NOT_COMPLETED\",\"dbName\":null},{\"name\":\"COMPLETED\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined

config.injectableEdgeEnv = () => ({
  parsed: {
    GLOBAL_DATABASE_URL: typeof globalThis !== 'undefined' && globalThis['GLOBAL_DATABASE_URL'] || typeof process !== 'undefined' && process.env && process.env.GLOBAL_DATABASE_URL || undefined
  }
})

if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
  Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined)
}

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

