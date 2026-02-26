const { nanoid } = require("nanoid");
const mongoose = require('mongoose');


const userSchema = new mongoose.Schema(
    
{

  publicId: {
  type: String,
  unique: true,
  default: () => nanoid(10),
},
 name: {
    type:String,
    required:true,
    trim:true
 },
    email: {
        type:String,
        required:true,
        unique:true,
        lowercase:true,
    },
    
    password: {
      type: String,
      required: true
    },
    plan: {
  type: String,
  enum: ["free", "pro"],
  default: "free",
}
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
