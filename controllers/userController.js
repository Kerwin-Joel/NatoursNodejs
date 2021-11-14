const User          = require("../model/userModel");
const catchAsync    = require("../utils/catchAsync");
const AppError      = require('../utils/appError');
const factory       = require("./handleFactory");
const sharp         = require('sharp')

//multer es un paquete middlware que nos permite subir archivos al servidor
// y que nuestro endpoint pueda aceptar archivos
const multer            = require('multer')

// const multerStorage = multer.diskStorage({ // metodo que recibe un objeto para guardar el archivo
//     destination: ( req,file,cb ) =>{ //cb de callback function
//         cb(null, 'public/img/users')
//     },
//     filename: ( req,file,cb ) =>{
//         // user-7857878ab87ae78dba.jpeg
//         const ext = file.mimetype.split('/')[1]
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//     }
// })

const multerStorage = multer.memoryStorage()
// The memory storage engine stores the files in memory as Buffer objects


const multerFilter = (req, file, cb) =>{
    if(file.mimetype.startsWith('image')){
        cb(null, true)
    }else{
        cb(new AppError('Not an image! Please upload only images', 400), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})
exports.uploadUserPhoto = upload.single('photo')

exports.resizeUserPhoto = catchAsync(async(req, res, next)=>{
    //Si no existe la imagen pasa al siguiente middleware
    if ( !req.file ) return next()
    //Asginar el nombre de la imagen
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`
    
    //Con el paquete sharp redimensionamos la imagen
    //le pasamos el buffer de la imagen, aplicamos propiedades de redimensionamiento
    //y guardamos el resultado en el path ingresado
    await sharp(req.file.buffer)
        .resize(500,500)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`public/img/users/${req.file.filename}`)
    
    next();
})

const filterObj = (obj,...allowFields)=>{
    const newObj = {}
    Object.keys(obj).forEach(el=>{
        if (allowFields.includes(el)) newObj[el] = obj[el]
    })
    return newObj
}

//FUNCTIONES TO USERS (CONTROLLERS)

exports.postUser = (req, res)=>{
    res.status(500).json({
        status: 'error', 
        message: 'this route yet not defined / Please use /sigin instead'
    })
}
exports.getMe       = (req, res, next) =>{
    req.params.id = req.user.id
    next()
}



exports.getAllUsers = factory.getAll(User)
exports.getUser     = factory.getOne(User)
exports.patchUser   = factory.updateOne(User)
exports.deleteUser  = factory.deleteOne(User)

exports.updateUserData =catchAsync(async(req, res, next) => {

    // 1) Create error if user Post password data
    if(req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError('This route is not for password updates.Please use /updatePassword',400))
    };
    // 2) Filtered out unwanted fields names that not allowed to be update 
    const filteredBody = filterObj(req.body,'name','email')
    if(req.file) filteredBody.photo = req.file.filename
    // 3) Update user document
    const updateUser = await User.findByIdAndUpdate(req.user.id,filteredBody,{
        new:true,
        runValidators:true
    })
    res.status(200).json({ 
        status:'success',
        data:{
            user:updateUser,
        }
    })
})
exports.deleted = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id,{
        active:false
    })
    res.status(200).json({
        status: 'success',
        data:null
    })
})
