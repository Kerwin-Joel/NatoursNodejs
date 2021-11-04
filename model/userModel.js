const crypto = require('crypto')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,'Please tell us your name']
    },
    email: {
        type: String,
        required: [true,'Please tell us your email'],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,'Please provide a valid email']
    },
    photo:{
        type: String,
    },
    role:{
        type: String,
        enum:['user','guide','lead-guide','admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true,'Please provide a password'],
        minlength:8,
        select:false
    },
    passwordConfirm: {
        type: String,
        required: [true,'Please confirm your password'],
        validate: {
            validator: function(el){
                return el === this.password
            },
            message: 'Passwords are not the same'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active:{
        type:Boolean,
        select:false,
        default:true
    }
})
//this pre method is used to encrypt the password before saving it to the database
userSchema.pre('save',async function(next){
    if(!this.isModified('password') ) return next() // if password modified, do nothing next middleware
    this.password = await bcrypt.hash(this.password,12)// if password not modified, hash password
    this.passwordConfirm = undefined;
    next()
})

userSchema.pre('save', function(next){
    if(!this.isModified('password') ||  this.isNew) return next() 
    this.passwordChangedAt = Date.now() - 1000;
    next()
})

userSchema.pre(/^find/, function(next){
    this.find({active: {$ne:false}}) 
    next()
})

userSchema.methods.correctPassword = async function(candidatePassword,userPassword){
    return await bcrypt.compare(candidatePassword,userPassword)
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000,10);
        return JWTTimestamp < changedTimestamp;
    }
    // False means NOT changed
    return false;
}
userSchema.methods.createPasswordResetToken = function(){
    //generate random token of 32 bytes and then transform to format hex
    const resetToken = crypto.randomBytes(32).toString('hex');
    //creating a token with alls formats
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    //send time to expire of token
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken
}

const User = mongoose.model('User', userSchema)
module.exports = User