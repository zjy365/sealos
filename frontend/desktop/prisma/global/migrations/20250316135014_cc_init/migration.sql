-- AlterTable
ALTER TABLE "AccountTransaction" ADD COLUMN     "billing_id_list" STRING[];
ALTER TABLE "AccountTransaction" ADD COLUMN     "credit_id_list" STRING[];
ALTER TABLE "AccountTransaction" ADD COLUMN     "deduction_credit" INT8;
ALTER TABLE "AccountTransaction" ADD COLUMN     "region" UUID;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "activityType" STRING;
ALTER TABLE "Payment" ADD COLUMN     "card_uid" UUID;
ALTER TABLE "Payment" ADD COLUMN     "charge_source" STRING;
ALTER TABLE "Payment" ADD COLUMN     "metadata" STRING;
ALTER TABLE "Payment" ADD COLUMN     "type" STRING;

-- CreateTable
CREATE TABLE "CardInfo" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_uid" UUID NOT NULL,
    "card_no" STRING,
    "card_brand" STRING,
    "card_token" STRING,
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
CREATE TABLE "SubscriptionTransaction" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "subscription_id" UUID NOT NULL,
    "user_uid" UUID NOT NULL,
    "old_plan_id" UUID,
    "new_plan_id" UUID,
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
CREATE TABLE "subscription_processor_locks" (
    "id" STRING NOT NULL,
    "lock_until" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "subscription_processor_locks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CardInfo_card_token_key" ON "CardInfo"("card_token");

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
CREATE INDEX "idx_SubscriptionTransaction_subscription_id" ON "SubscriptionTransaction"("subscription_id");

-- CreateIndex
CREATE INDEX "idx_SubscriptionTransaction_user_uid" ON "SubscriptionTransaction"("user_uid");
