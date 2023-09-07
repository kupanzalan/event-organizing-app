import mongoose from 'mongoose';

const { Schema } = mongoose;

const organizerSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  taskId: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Worker = mongoose.model('Worker', organizerSchema);
export default Worker;
