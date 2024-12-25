const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/crud2");
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name : String,
    email: String
})

userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        const hashedPassword = await bcrypt.hash(this.password, 10);
        this.password = hashedPassword;
    }
    next();
});

module.exports=mongoose.model("user",userSchema);