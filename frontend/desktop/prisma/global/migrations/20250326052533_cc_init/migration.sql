-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('PHONE', 'GITHUB', 'WECHAT', 'GOOGLE', 'PASSWORD', 'OAUTH2', 'EMAIL');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('READY', 'RUNNING', 'FINISH', 'COMMITED', 'ERROR');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('MERGE_USER', 'DELETE_USER', 'SYNC_PLAN');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('UPDATE', 'DELETE', 'CREATE');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('NORMAL_USER', 'LOCK_USER', 'DELETE_USER');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('LAUNCHPAD', 'COSTCENTER', 'DATABASE', 'DESKTOP', 'APPSTORE', 'CRONJOB', 'DEVBOX', 'CONTACT', 'REAL_NAME_AUTH');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('NOT_COMPLETED', 'COMPLETED');

-- CreateTable
CREATE TABLE "OauthProvider" (
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userUid" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "providerType" "ProviderType" NOT NULL,
    "providerId" STRING NOT NULL,
    "password" STRING,

    CONSTRAINT "OauthProvider_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "Region" (
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "displayName" STRING NOT NULL,
    "location" STRING NOT NULL,
    "domain" STRING NOT NULL,
    "description" STRING,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "Account" (
    "userUid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "activityBonus" INT8 NOT NULL,
    "encryptBalance" STRING NOT NULL,
    "encryptDeductionBalance" STRING NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "create_region_id" STRING NOT NULL,
    "balance" INT8,
    "deduction_balance" INT8,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("userUid")
);

-- CreateTable
CREATE TABLE "AccountTransaction" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" STRING NOT NULL,
    "deduction_balance" INT8 NOT NULL,
    "balance" INT8 NOT NULL,
    "message" STRING,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "billing_id" UUID NOT NULL,
    "userUid" UUID NOT NULL,
    "balance_before" INT8,
    "deduction_balance_before" INT8,
    "region" UUID,
    "deduction_credit" INT8,
    "billing_id_list" STRING[],
    "credit_id_list" STRING[],

    CONSTRAINT "AccountTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorPaymentCreate" (
    "userUid" UUID NOT NULL,
    "regionUid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "regionUserOwner" STRING NOT NULL,
    "method" STRING NOT NULL,
    "amount" INT8 NOT NULL,
    "gift" INT8,
    "trade_no" STRING NOT NULL,
    "code_url" STRING,
    "invoiced_at" BOOL DEFAULT false,
    "remark" STRING,
    "message" STRING NOT NULL,
    "create_time" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" STRING NOT NULL,
    "userUid" UUID NOT NULL,
    "regionUid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "regionUserOwner" STRING NOT NULL,
    "method" STRING NOT NULL,
    "amount" INT8 NOT NULL,
    "gift" INT8,
    "trade_no" STRING NOT NULL,
    "code_url" STRING,
    "invoiced_at" BOOL DEFAULT false,
    "remark" STRING,
    "message" STRING NOT NULL,
    "activityType" STRING,
    "card_uid" UUID,
    "type" STRING,
    "charge_source" STRING,
    "metadata" STRING,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "avatarUri" STRING NOT NULL,
    "nickname" STRING NOT NULL,
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'NORMAL_USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "Transfer" (
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fromUserUid" UUID NOT NULL,
    "toUserUid" UUID NOT NULL,
    "amount" INT8 NOT NULL,
    "remark" STRING NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "ErrorAccountCreate" (
    "userUid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "activityBonus" INT8 NOT NULL,
    "encryptBalance" STRING NOT NULL,
    "encryptDeductionBalance" STRING NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "create_region_id" STRING NOT NULL,
    "balance" INT8,
    "deduction_balance" INT8,
    "userCr" STRING NOT NULL,
    "error_time" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "regionUid" UUID NOT NULL,
    "regionUserOwner" STRING NOT NULL,
    "message" STRING NOT NULL,

    CONSTRAINT "ErrorAccountCreate_pkey" PRIMARY KEY ("userUid")
);

-- CreateTable
CREATE TABLE "CommitTransactionSet" (
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "precommitTransactionUid" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "PrecommitTransaction" (
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "transactionType" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "info" JSONB NOT NULL,

    CONSTRAINT "PrecommitTransaction_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "ErrorPreCommitTransaction" (
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "reason" STRING,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionUid" UUID NOT NULL,

    CONSTRAINT "ErrorPreCommitTransaction_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "TransactionDetail" (
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "regionUid" STRING NOT NULL,
    "transactionUid" UUID NOT NULL,

    CONSTRAINT "TransactionDetail_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "DeleteUserLog" (
    "userUid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeleteUserLog_pkey" PRIMARY KEY ("userUid")
);

-- CreateTable
CREATE TABLE "EventLog" (
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mainId" STRING NOT NULL,
    "eventName" STRING NOT NULL,
    "data" STRING NOT NULL,

    CONSTRAINT "EventLog_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "InviteReward" (
    "payment_id" STRING NOT NULL,
    "userUid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_amount" INT8 NOT NULL,
    "reward_amount" INT8 NOT NULL,
    "inviteFrom" UUID NOT NULL,

    CONSTRAINT "InviteReward_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "UserRealNameInfo" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userUid" UUID NOT NULL,
    "realName" STRING,
    "idCard" STRING,
    "phone" STRING,
    "isVerified" BOOL NOT NULL DEFAULT false,
    "idVerifyFailedTimes" INT4 NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "additionalInfo" JSONB,

    CONSTRAINT "UserRealNameInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnterpriseRealNameInfo" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userUid" UUID NOT NULL,
    "enterpriseName" STRING,
    "enterpriseQualification" STRING,
    "legalRepresentativePhone" STRING,
    "isVerified" BOOL NOT NULL DEFAULT false,
    "verificationStatus" STRING,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "additionalInfo" JSONB,
    "supportingMaterials" JSONB,

    CONSTRAINT "EnterpriseRealNameInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestrictedUser" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userUid" UUID NOT NULL,
    "restrictedLevel" INT4 NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "additionalInfo" JSONB,

    CONSTRAINT "RestrictedUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSemChannel" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userUid" UUID NOT NULL,
    "channel" STRING NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "additionalInfo" JSONB,

    CONSTRAINT "UserSemChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftCode" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" STRING NOT NULL,
    "creditAmount" INT8 NOT NULL DEFAULT 0,
    "used" BOOL NOT NULL DEFAULT false,
    "usedBy" UUID,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiredAt" TIMESTAMP(3),
    "comment" STRING,

    CONSTRAINT "GiftCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" STRING NOT NULL,
    "description" STRING NOT NULL,
    "reward" INT8 NOT NULL,
    "order" INT4 NOT NULL,
    "isActive" BOOL NOT NULL DEFAULT true,
    "isNewUserTask" BOOL NOT NULL DEFAULT false,
    "taskType" "TaskType" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTask" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userUid" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "status" "TaskStatus" NOT NULL,
    "rewardStatus" "TaskStatus" NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "UserTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardInfo" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_uid" UUID NOT NULL,
    "card_no" STRING,
    "card_brand" STRING,
    "created_at" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "network_transaction_id" STRING,
    "default" BOOL DEFAULT false,
    "last_payment_status" STRING,

    CONSTRAINT "CardInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configs" (
    "type" STRING(255),
    "data" JSONB
);

-- CreateTable
CREATE TABLE "Credits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_uid" UUID,
    "amount" INT8,
    "used_amount" INT8,
    "from_id" STRING,
    "from_type" STRING,
    "expire_at" TIMESTAMP(6),
    "created_at" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "start_at" TIMESTAMP(6),
    "status" STRING,

    CONSTRAINT "Credits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditsTransaction" (
    "id" STRING NOT NULL,
    "user_uid" STRING,
    "account_transaction_id" STRING,
    "region_uid" STRING,
    "credits_id" STRING,
    "used_amount" INT8,
    "created_at" TIMESTAMPTZ(6),
    "reason" STRING,

    CONSTRAINT "CreditsTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "created_at" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "detail" STRING NOT NULL,
    "remark" STRING,
    "total_amount" INT8 NOT NULL,
    "status" STRING NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoicePayment" (
    "invoice_id" STRING,
    "payment_id" STRING NOT NULL,
    "amount" INT8 NOT NULL,

    CONSTRAINT "InvoicePayment_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "PaymentOrder" (
    "id" STRING NOT NULL,
    "userUid" UUID NOT NULL,
    "regionUid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "regionUserOwner" STRING NOT NULL,
    "method" STRING NOT NULL,
    "amount" INT8 NOT NULL,
    "gift" INT8,
    "trade_no" STRING NOT NULL,
    "code_url" STRING,
    "invoiced_at" BOOL DEFAULT false,
    "remark" STRING,
    "activityType" STRING,
    "message" STRING NOT NULL,
    "card_uid" UUID,
    "type" STRING,
    "charge_source" STRING,
    "status" STRING NOT NULL,

    CONSTRAINT "PaymentOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plan_id" UUID NOT NULL,
    "plan_name" STRING(50),
    "user_uid" UUID NOT NULL,
    "status" STRING(50),
    "start_at" TIMESTAMPTZ(6),
    "update_at" TIMESTAMPTZ(6),
    "expire_at" TIMESTAMPTZ(6),
    "card_id" UUID,
    "next_cycle_date" TIMESTAMPTZ(6),

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" STRING NOT NULL,
    "description" STRING,
    "amount" INT8,
    "gift_amount" INT8,
    "period" STRING(50),
    "upgrade_plan_list" STRING[],
    "downgrade_plan_list" STRING[],
    "max_seats" INT8 NOT NULL,
    "max_workspaces" INT8 NOT NULL,
    "max_resources" STRING,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "most_popular" BOOL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceUsage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userUid" UUID NOT NULL,
    "workspaceUid" UUID NOT NULL,
    "regionUid" UUID NOT NULL,
    "seat" INT4 NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "WorkspaceUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInfo" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userUid" UUID NOT NULL,
    "firstname" STRING NOT NULL DEFAULT '',
    "lastname" STRING NOT NULL DEFAULT '',
    "signUpRegionUid" UUID NOT NULL,
    "isInited" BOOL NOT NULL DEFAULT false,
    "enSubEmail" BOOL NOT NULL DEFAULT false,

    CONSTRAINT "UserInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountRegionUserTask" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "region_domain" STRING(50) NOT NULL,
    "user_uid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "type" STRING NOT NULL DEFAULT 'flush-quota',
    "start_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_at" TIMESTAMPTZ(6),
    "status" STRING NOT NULL DEFAULT 'pending',

    CONSTRAINT "AccountRegionUserTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionTransaction" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "subscription_id" UUID NOT NULL,
    "user_uid" UUID NOT NULL,
    "old_plan_id" UUID NOT NULL,
    "new_plan_id" UUID NOT NULL,
    "old_plan_name" STRING(50),
    "new_plan_name" STRING(50),
    "old_plan_status" STRING(50),
    "operator" STRING(50),
    "start_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "status" STRING(50),
    "pay_status" STRING(50),
    "pay_id" STRING,
    "amount" INT8,

    CONSTRAINT "SubscriptionTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTransfer" (
    "id" STRING NOT NULL,
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fromUserUid" UUID NOT NULL,
    "fromUserId" STRING NOT NULL,
    "toUserUid" UUID NOT NULL,
    "toUserId" STRING NOT NULL,
    "amount" INT8 NOT NULL,
    "remark" STRING NOT NULL,
    "created_at" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTransfer_pkey" PRIMARY KEY ("id","uid")
);

-- CreateTable
CREATE TABLE "RealNameAuthProvider" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "backend" STRING NOT NULL,
    "authType" STRING NOT NULL,
    "maxFailedTimes" INT4 NOT NULL,
    "config" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "RealNameAuthProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_processor_locks" (
    "id" STRING NOT NULL,
    "lock_until" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "subscription_processor_locks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OauthProvider_userUid_idx" ON "OauthProvider"("userUid");

-- CreateIndex
CREATE UNIQUE INDEX "OauthProvider_providerId_providerType_key" ON "OauthProvider"("providerId", "providerType");

-- CreateIndex
CREATE UNIQUE INDEX "ErrorPaymentCreate_trade_no_key" ON "ErrorPaymentCreate"("trade_no");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_trade_no_key" ON "Payment"("trade_no");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ErrorAccountCreate_userCr_key" ON "ErrorAccountCreate"("userCr");

-- CreateIndex
CREATE UNIQUE INDEX "CommitTransactionSet_precommitTransactionUid_key" ON "CommitTransactionSet"("precommitTransactionUid");

-- CreateIndex
CREATE UNIQUE INDEX "ErrorPreCommitTransaction_transactionUid_key" ON "ErrorPreCommitTransaction"("transactionUid");

-- CreateIndex
CREATE INDEX "TransactionDetail_regionUid_idx" ON "TransactionDetail"("regionUid");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionDetail_transactionUid_regionUid_key" ON "TransactionDetail"("transactionUid", "regionUid");

-- CreateIndex
CREATE UNIQUE INDEX "UserRealNameInfo_userUid_key" ON "UserRealNameInfo"("userUid");

-- CreateIndex
CREATE UNIQUE INDEX "EnterpriseRealNameInfo_userUid_key" ON "EnterpriseRealNameInfo"("userUid");

-- CreateIndex
CREATE UNIQUE INDEX "RestrictedUser_userUid_key" ON "RestrictedUser"("userUid");

-- CreateIndex
CREATE UNIQUE INDEX "UserSemChannel_userUid_key" ON "UserSemChannel"("userUid");

-- CreateIndex
CREATE UNIQUE INDEX "GiftCode_code_key" ON "GiftCode"("code");

-- CreateIndex
CREATE INDEX "UserTask_taskId_idx" ON "UserTask"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTask_userUid_taskId_key" ON "UserTask"("userUid", "taskId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentOrder_trade_no_key" ON "PaymentOrder"("trade_no");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_user_uid_key" ON "Subscription"("user_uid");

-- CreateIndex
CREATE INDEX "Subscription_plan_id_idx" ON "Subscription"("plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_name_key" ON "SubscriptionPlan"("name");

-- CreateIndex
CREATE INDEX "WorkspaceUsage_userUid_idx" ON "WorkspaceUsage"("userUid");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceUsage_regionUid_userUid_workspaceUid_key" ON "WorkspaceUsage"("regionUid", "userUid", "workspaceUid");

-- CreateIndex
CREATE UNIQUE INDEX "UserInfo_userUid_key" ON "UserInfo"("userUid");

-- CreateIndex
CREATE INDEX "idx_AccountRegionUserTask_user_uid" ON "AccountRegionUserTask"("user_uid");

-- CreateIndex
CREATE INDEX "SubscriptionTransaction_old_plan_id_idx" ON "SubscriptionTransaction"("old_plan_id");

-- CreateIndex
CREATE INDEX "SubscriptionTransaction_new_plan_id_idx" ON "SubscriptionTransaction"("new_plan_id");

-- CreateIndex
CREATE INDEX "idx_SubscriptionTransaction_subscription_id" ON "SubscriptionTransaction"("subscription_id");

-- CreateIndex
CREATE INDEX "idx_SubscriptionTransaction_user_uid" ON "SubscriptionTransaction"("user_uid");
