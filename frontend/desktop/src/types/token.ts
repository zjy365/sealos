export type AuthenticationTokenPayload = {
  userUid: string;
  userId: string;
  regionUid?: string;
};
export type DownGradeTokenPayload = {
  userUid: string;
  regionUid?: string;
};
export type AccessTokenPayload = {
  regionUid: string;
  userCrUid: string;
  userCrName: string;
  workspaceUid: string;
  workspaceId: string;
} & AuthenticationTokenPayload;
export type TverifyType = 'email';
export type VerifyTokenPayload = {
  type: TverifyType;
  userUid: string;
  userId: string;
  regionUid: string;
};

export type CronJobTokenPayload = {
  mergeUserUid: string;
  userUid: string;
};
export type BillingTokenPayload = AuthenticationTokenPayload;

export type OnceTokenPayload = {
  userUid: string;
  type: 'deleteUser';
};
