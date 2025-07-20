import mongoose from 'mongoose';

const rolesEnum = ['admin', 'user'];

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  lastname: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: rolesEnum, default: 'user' },
  avatar: { type: String },
  resetPasswordToken: { type: String }, // token hashé pour reset password
  resetPasswordExpire: { type: Date },  // date d'expiration du token
}, { timestamps: true });

export default mongoose.model('User', userSchema);
