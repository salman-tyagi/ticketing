import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { BaseSchema, UserType } from '../dtos/dto';

const userSchema = new mongoose.Schema<BaseSchema, mongoose.Model<UserType>>(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform(_, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
      },
    },
  },
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 14);
});

userSchema.method('comparePassword', function (password) {
  return bcrypt.compare(password, this.password);
});

export const User = mongoose.model<BaseSchema, mongoose.Model<UserType>>('User', userSchema);
