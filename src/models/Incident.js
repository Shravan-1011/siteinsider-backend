const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema(
{
 
     monitor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "monitor",
        required: true
     },

     startedAt: {
        type: Date,
        required : true 
     },
     duration: {
  type: Number, // milliseconds
},

statusCode: {
  type: Number,
},

     resolvedAt: {
        type: Date,
        
     },

     isResolved: {
        type: Boolean,
        default: false
     },
     lastAlertSentAt: {
  type: Date,
},

     reason: {
        type: String,
        
     }
    },
    {timestamps: true}

);

module.exports = mongoose.model("Incident", IncidentSchema);