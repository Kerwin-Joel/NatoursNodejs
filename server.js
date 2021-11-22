const dotenv = require('dotenv');
const app = require('./app');
const mongoose = require('mongoose')
const port = 3000; //definimos el puerto en una variable



process.on('uncaughtException',err=>{
    console.log('UNCAUGHT EXCEPTION shutting down...');
    console.log(err.name,err.message);
    process.exit(0);
})


//generate conenction to DB
const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD)

mongoose.connect(
    DB,{
        useNewUrlParser:true,
        useCreateIndex:true,
        useFindAndModify:false,
        useUnifiedTopology: true
    })
    .then(() => console.log('Conection successful'))

//PUERTO EN EL QUE EL SERVIDOR ESCUCHARÁ
// const server = app.listen(process.env.PORT || port,()=>{
const server = app.listen(3800 || port,()=>{
    console.log(`app listening on port ${port}`)
})

process.on('unhandledRejection',err =>{
    console.log('UNHANDLED REJECTED shutting down...');
    console.log(err.name,err.message);
    server.close(()=>{
        process.exit(1);
    })
})


process.on('SIGTERM',()=>{
    console.log('🤚🏻 SIGTERM RECEIVED shutting down...');
    server.close(()=>{
        console.log('💥 Process terminated');
    })
})