import mongoose from 'mongoose';

const { Schema } = mongoose;

const imageSchema = new Schema({
  filename: {
    type: String,
    unique: true,
    required: true,
  },
  eventid: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Image = mongoose.model('Image', imageSchema);
export default Image;
