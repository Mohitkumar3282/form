const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    mobile: {
      type: String,
      required: [true, 'Mobile Number is required'],
      trim: true,
      validate: {
        validator: function(v) {
          const cleanMobile = v.replace(/[\s\-\+]/g, '');
          return /^\d{10,15}$/.test(cleanMobile);
        },
        message: props => `${props.value} is not a valid 10-15 digit mobile number`
      }
    },
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle Number is required'],
      trim: true,
      uppercase: true,
      validate: {
        validator: function(v) {
          const cleanVehicle = v.replace(/[\s\-]/g, '');
          return /^[A-Z0-9]{4,15}$/.test(cleanVehicle);
        },
        message: props => `${props.value} is not a valid vehicle registration number`
      }
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      minlength: [5, 'Address must be at least 5 characters long'],
      maxlength: [300, 'Address cannot exceed 300 characters']
    }
  },
  {
    timestamps: true
  }
);

customerSchema.index({ name: 'text', vehicleNumber: 'text', mobile: 'text' });

module.exports = mongoose.model('Customer', customerSchema);
