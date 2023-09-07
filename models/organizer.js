import mongoose from 'mongoose';

const { Schema } = mongoose;

const organizerSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  eventid: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Organizer = mongoose.model('Organizer', organizerSchema);
export default Organizer;
