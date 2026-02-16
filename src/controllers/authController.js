const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
 



const isValidEmail = (email) => {
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};




//Signup
exports.signup = async(req, res) => {
    try{

       

        
        const {name, email, password} = req.body;
        

         if (!isValidEmail(email)) {
  return res.status(400).json({
    message: "Invalid email format",
  });
}

        const existingUser = await User.findOne({ email });
        if(existingUser){
            return res.status(400).json({ message: "User already exists" });

        }
        const hashedPassword = await bcrypt.hash(password, 10);
        

        const user = new User({
            name,
            email,
            password: hashedPassword
        });
        await user.save();
        console.log("User saved with id:", user._id);
        const allUsers = await User.find();
            console.log("Users in DB now:", allUsers.length);
            console.log("REQ BODY:", req.body);

            const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );


        res.status(201).json({ token, message: "User created successfully" });
    }catch(error){
        res.status(500).json({ message: "Server error" });
    }


    };

    //Login
    exports.Login =async(req, res) => {

        try{
            const{email,password} = req.body;
            const user = await User.findOne({ email });
            if(!user){
                return res.status(400).json({ message: "Invalid credentials" });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch){
                return res.status(400).json({ message: "Invalid credentials" });
            }
            const token = jwt.sign({ userId : user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
            res.json({ token });    
        }catch (error) {
  console.error("LOGIN ERROR:", error);
  res.status(500).json({ message: error.message });
}
    }
