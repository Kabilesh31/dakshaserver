const User = require("../model/userModel")
const catchAsync = require("../utils/catchAsync")
const jwt = require("jsonwebtoken")
const AppError = require("../utils/appError")
const sendEmail = require("../utils/sendEmail")
const crypto = require("crypto")


const signInToken = id => {
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn: process.env.JWT_SECRET_EXPIRESIN})
}

const createSendToken = (user, statusCode, res) => {
    const token = signInToken(user._id)
    const cookieOptions = {
        expires : new Date( Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60* 1000),
        secure: true,
        httpOnly: true
    }
        res.cookie('jwt', token, cookieOptions);

        // Remove password from output
        user.password = undefined;


        res.status(statusCode).json({
            status: "Success",
            token,
            data: user
        })
}

exports.signup = catchAsync (async (req, res) => {

        const newUser = await User.create(req.body)
        createSendToken(newUser, 201, res)
        
})
exports.login = catchAsync (async (req,res, next) => {

    const {email, password} = req.body

    // 1. check email and password exist
    if(!email || !password) {
        return next(new AppError("Please Provide a Email and Password"), 400)
    }
    // 2. check user exist && password is Correct
    const user = await User.findOne({email}).select('+password')

    if(!user || !(await user.correctPassword(password, user.password))){
        return next(new AppError("Incorrect Email or Password"), 401)
    }

    // 3. if Ok send the Token to Client
    createSendToken(user, 200, res)
    // const token = signInToken(user._id)
    // res.status(201).json({
    //     status:"Success",
    //     token
    // })
})

exports.protect = catchAsync(async(req, res, next)=> {
    //  Getting Token and Check its there
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(' ')[1];
    } 
    if(!token){
        return next(new AppError("You are Not Login! Please Login to get Access", 401))
    }
    // Verify Token 
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    
    // 3 Check if User STill Exist
    const currentUser = await User.findById(decoded.id)
    if(!currentUser){
        return next( new AppError("The user belonging to this tokn does no Longer Exist", 401))
    }
    // 4 if user Changed the Password After the token Was Issued
    if(currentUser.changedPasswordAfter(decoded.iat)){
        return next( new AppError("User Recently Changed Password! Please Login Again"))
    }
    
    req.user = currentUser;
    next()
})

exports.requestTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next( new AppError("You dont have Permission to perform this action", 403))
        }
        next()
    }
}

exports.forgotPassword = catchAsync( async(req,res, next) => {

     // 1. get user based on posted Email
     const user = await User.findOne({email: req.body.email})

        if(!user){
            return next(new AppError("There is no user with email address", 404))
        }
        
    // 2.Generate the random reset Token
        const resetToken = user.createPasswordResetToken()
        await user.save({validateBeforeSave: false})
    // 3.Send its to user Mail
        // const resetUrl = `${req.protocol}://${req.get('host')}/api/user/resetPassword/${resetToken}`;
        const resetUrl = `https://tnpscupdates.xyz/resetpassword/${resetToken}`;

        const message = `Forgot Your Password? Submit a request with your new Password and passwordConfirm to: 
        ${resetUrl}.\nIf You didn't forgot Your Password Please Ignore This Email`;

        try{
            await sendEmail({
                email: user.email,
                subject: "Your Password Reset Token (Valid for 10 min)",
                message
            })
            res.status(200).json({
                status: "Success",
                message: "Token Sent to Email"
            })
        }catch(err) {
            user.passwordResetToken = undefined;
            user.passwordResetTokenExpires= undefined;
            await user.save({validateBeforeSave: false})

            return next(new AppError("There was an error to sending email. Try Again Later", 500))
        }

})

exports.resetPassword = catchAsync( async(req, res, next) => {
        // 1. get User Based on the Token
        const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex")

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetTokenExpires: {$gt: Date.now()}
        })

        //2. if the token is Not Expired, user can Change the Password

        if(!user){
        return next(new AppError("Token is Invalid or Expired", 400))   
        }

        user.password = req.body.password;
        user.confirmPassword = req.body.confirmPassword;
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined;
        await user.save();

        // 3. update changedPassword At property for the User

        // 4. Log the User In, send JWT
        createSendToken(user, 200, res)
})

exports.updatePassword = catchAsync( async (req, res, next) => {
    // 1. Get user from Collection
    const user = await User.findById(req.user.id)
    // 2. Check is Posted Current Password is Correct
    if(!(await user.correctPassword(req.body.currentPassword, user.password))){
        return next(new AppError("You Entered Current Password Is Wrong", 401))
    }

    // 3. if so Update Password
    user.password = req.body.password
    user.confirmPassword = req.body.confirmPassword
    await user.save()   

    // 4. if ok Send Token to Clienr
    createSendToken(user, 200, res)

})