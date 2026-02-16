const mongoose = require('mongoose');

const monitorSchema = new mongoose.Schema(

    {
     user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
     },

     name:{
        type: String,
        required: true
        
     },

    url:  {
        type: String,
        required: true
    },
    interval: {
        type: Number,
        default: 5
    },

    isActive: {
        type: Boolean,
        default: true

    },
    status: {
        type: String,
        enum: ["UP", "DOWN", "Checking"],
        default: "Checking",
        },
        
        lastChecked: {
        type: Date,
        }

    },

        {timestamps: true}



);

module.exports = mongoose.model("Monitor", monitorSchema);