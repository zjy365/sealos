import { getPasswordStrength } from '@/utils/tools';
import { z } from 'zod';
export const loginParamsSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email format' }),
    password: z
      .string()
      .refine((pw) => getPasswordStrength(pw) >= 50, { message: 'Password is too weak' })
  })
  .passthrough();
export const registerParamsSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email format' }),
    password: z
      .string()
      .refine((pw) => getPasswordStrength(pw) >= 50, { message: 'Password is too weak' }),
    confirmPassword: z.string(),
    firstName: z.string().min(1, { message: 'FirstName is required' }),
    lastName: z.string().min(1, { message: 'LastName is required' }),
    country: z.enum(['US'], { message: 'Invalid country code' }).default('US'),
    language: z.enum(['en', 'zh'], { message: 'Invalid language code' }).default('en')
  })
  .passthrough()
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

const forgotPasswordParamsSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email format' })
  })
  .passthrough();

export const registerParamsWithoutNameSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email format' }),
    password: z
      .string()
      .refine((pw) => getPasswordStrength(pw) >= 50, { message: 'Password is too weak' }),
    confirmPassword: z.string(),
    country: z.enum(['US'], { message: 'Invalid country code' }).default('US'),
    language: z.enum(['en', 'zh'], { message: 'Invalid language code' }).default('en')
  })
  .passthrough()
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

export const personalInfoSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' })
});

export type IPersonalInfo = z.infer<typeof personalInfoSchema>;
export type ILoginParams = z.infer<typeof loginParamsSchema>;
export type IRegisterParams = z.infer<typeof registerParamsSchema>;
export type IForgotPasswordParams = z.infer<typeof forgotPasswordParamsSchema>;
export type IRegisterParamsWithoutName = z.infer<typeof registerParamsWithoutNameSchema>;

export interface ILoginResult {
  token: string;
  user: {
    name: string;
    avatar: string;
    userUid: string;
  };
  needInit: boolean;
}
