import mongoose from 'mongoose';

const { Schema } = mongoose;

const eventSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  startdate: {
    type: Date,
    required: true,
  },
  enddate: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  eventCreator: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
export default Event;
