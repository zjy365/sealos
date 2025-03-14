import { z } from 'zod';

export const UserInfoReponse = z.object({
  user: z.object({
    avatarUri: z.string().optional(),
    firstname: z.string().optional(),
    lastname: z.string().optional(),
    email: z.string().optional()
  }),
  bindings: z.object({
    github: z.boolean().optional(),
    google: z.boolean().optional()
  })
});

export const UpdateInfoRequest = z.object({
  firstname: z.string(),
  lastname: z.string()
});

export const DeleteRequest = z.object({
  userUid: z.string()
});
export type TUpdateInfoRequest = z.infer<typeof UpdateInfoRequest>;

export type TUserInfoReponse = z.infer<typeof UserInfoReponse>;
