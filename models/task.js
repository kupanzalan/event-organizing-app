import mongoose from 'mongoose';

const { Schema } = mongoose;

const eventSchema = new Schema({
  description: {
    type: String,
    required: true,
  },
  eventid: {
    type: String,
    required: true,
  },
  freePlaces: {
    type: Number,
    required: true,
  },
  due: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

const Task = mongoose.model('Task', eventSchema);
export default Task;
