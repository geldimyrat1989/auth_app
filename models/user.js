//in this model we only need mongoose and bcrypt:
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

//here we declare our schema:
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username connot be blank!']
    },
    password: {
        type: String,
        required: [true, 'Password cannot be blank!']
    }
})

//here we have to find user info from req.body and compare to exsisting in our database:
userSchema.statics.findAndValidate = async function (username, password)
{
    //first find user:
    const foundUser = await this.findOne({ username });
    //and then take that password and compare with existing hashed password in our database:
    const isValid = await bcrypt.compare(password, foundUser.password);
    //here we use ternary operator to check if it matches:
    return isValid ? foundUser : false
}

//here we use middleware that will run before each save() operator,
//it will hash password before saving to mongodb:
userSchema.pre('save', async function (next)
{
    if (!this.isModified('password')) return next();
    //this line will take the password and hash it with 12 rounds:
    this.password = await bcrypt.hash(this.password, 12);
    next();
})

module.exports = mongoose.model('User', userSchema);