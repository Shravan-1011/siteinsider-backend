const mongoose = require('mongoose');

const checkLogSchema = new mongoose.Schema(
{
  
    monitor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Monitor",
        required: true
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

    checkedAt: {
        type: Date,
        default: Date.now
    }
},
{timestamps: true}

    


);
checkLogSchema.index({ monitor: 1, checkedAt: -1 });


module.exports = mongoose.model("CheckLog", checkLogSchema);
