import mongoose from 'mongoose';

const { Schema } = mongoose;

const organizerSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const User = mongoose.model('User', organizerSchema);
export default User;
