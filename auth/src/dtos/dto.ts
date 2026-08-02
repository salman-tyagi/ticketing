import mongoose from 'mongoose';
import z from 'zod';

export const baseSchema = z.object({
  email: z.email().trim().toLowerCase().min(5).max(50),
  password: z.string().nonempty().min(6).max(30),
});

export type BaseSchema = z.infer<typeof baseSchema>;

export type UserType = BaseSchema &
  mongoose.Document & {
    comparePassword(password: string): Promise<boolean>;
  };

export const signupSchema = baseSchema;
export type SignupDto = BaseSchema;

export const signinSchema = baseSchema.extend({ password: z.string().nonempty() });
export type SigninDto = z.infer<typeof signinSchema>;
