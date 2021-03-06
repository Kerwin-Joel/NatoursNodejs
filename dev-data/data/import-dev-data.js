const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose')
const Tour = require('../../model/tourModel')
const Review = require('../../model/reviewModel')
const User = require('../../model/userModel')

//to access the variables globals
dotenv.config({path:'./config.env'})

//generate conenction to DB
const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD)
mongoose.connect(
    DB,{
        useNewUrlParser:true,
        useCreateIndex:true,
        useFindAndModify:false,
        useUnifiedTopology: true
    }
).then(() => console.log('Conection successful'))

//Read JSON file
const tours     = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,     'utf-8'))
const reviews   = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,   'utf-8'))
const users     = JSON.parse(fs.readFileSync(`${__dirname}/users.json`,     'utf-8'))

//IMPORT DATA INTO DB
const importData = async (req, res) => {
    try {
            //El metodo save de mongoose tambien acepta array
        await Tour.create(tours)
        await Review.create(reviews)
        await User.create(users,{ validateBeforeSave:false })
        console.log('Data succesfully loaded!')
    } catch (err) {
        console.log(err)
    }
    process.exit()
}

//DELETE ALL DATA FROM DB
const deleteData = async (req, res) =>{
    try {
            //borra todos los documentos de una colleccion
        await Tour.deleteMany();
        await Review.deleteMany()
        await User.deleteMany()
        console.log('base de datos borrada satisfactoriamente')
    } catch (error) {
        console.log(error)
    }
    process.exit()
}

console.log(process.argv)
//CALL FUNCTINOS TO DELETE AND UPLOADING DATA
if(process.argv[2] === '--import') {
    importData()
}else if(process.argv[2] === '--delete'){
    deleteData()
}
//to delete and import data execute this file this postfix --import or --delete