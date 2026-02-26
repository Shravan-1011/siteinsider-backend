const mongoose = require('mongoose');

const checkLogSchema = new mongoose.Schema(
{
  
    monitor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Monitor",
        required: true
    },
    region: {
    type: String,
    required: true,
  },

    status: {
        type: String,
        enum : ['UP', 'DOWN'],
        required: true

    },
    responseTime: {
        type: Number
    },
    statusCode: {
        type: Number
    },
    reason: {
  type: String
},

    checkedAt: {
        type: Date,
        default: Date.now
    }
},
{timestamps: true}

    


);
checkLogSchema.index({ monitor: 1, checkedAt: -1 });


module.exports = mongoose.model("CheckLog", checkLogSchema);
