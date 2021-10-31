//EN EL ARCHIVO APP SE COLOCA TODO LA CONFIGURACION DE EXPRESS

const express = require('express'); //requerimos express
const app = express(); //creamos una instancia de express
const morgan = require('morgan')

const AppError = require('./utils/appError')
const userRoutes = require('./routes/userRoutes')
const tourRoutes = require('./routes/tourRoutes');
const globalErrorController = require('./controllers/errorController');

app.use(morgan('dev'))// middleware de terceros
app.use(express.static(`${__dirname}/public`))
//nos permite recibir parametros en formato JSON
app.use(express.json()); //esto es un middleware, nos ayuda con el post
//app.use(functionHer) con este metodo agregamos la funcion a la app para 
//que se comporte como un middleware
app.use('/api/v1/users',userRoutes);
app.use('/api/v1/tours', tourRoutes);// generamos el middleware para correr una subApp dentro de nuestra app
// similar a correr una app con rutas dentro de nuestra app padre,
// en este caso tourRouter y userRouter "corren" dentro de app
/////Express tiene un metodo para manejar rutas desconocidas y es .all
app.all('*',(req, res, next)=>{
    next(new AppError(`Can't find ${req.originalUrl} on thi server!`,404));
})

//middleware para encargarnos de los errores
app.use(globalErrorController)

// const funtionMiddleware = (req,res, next)=> {
//     console.log('pasaste el acceso')
//     //Si no ponemos el next() solo devolvera el console.log del middleware,
//     // este metodo nos permitirá pasar al manejador de ruta, el endopoint
//     next()
// }
// app.use(funtionMiddleware)//Si agregamos el middliware antes de todos los
//manejadores de ruta , ese middleware se ejecutara para todos las rutas siguientes
// en la que se haga el request. Si tenemos 5 manejadores de ruta y el middleware 
//lo colocamos despues del segundo manejador, este middleware estará disponible para
// todos los controladores siguientes.

// const middlwareSiguiente = (re,res,next)=> {
//     console.log('solo para 3 rutas')
//     next();
// }

//leemos el la ruta del archivo para la data


/*//---------ENDPOINTS
//GET all element  con este endpoint podras obtener todos los datos 
                        //peticion y respuesta como argumentos
app.get('/api/v1/tours',getAllTours)

//GET element by id
//El ':id' se convertira en una variable  
//si anteponemos el '?' en el path ':id?' se convertira en una variable alterna
// es decir que en la ruta es opcional que se le pase el valor, no se usara en este ejemplo 
app.get('/api/v1/tours/:id',getToursById)
// app.use(middlwareSiguiente)
//POST new element , con este endpoint creamos un nuevo elemento a la data
app.post('/api/v1/tours',postTour)

//Path para actualizar data
app.patch('/api/v1/tours/:id',patchTour)

//Delete 
app.delete('/api/v1/tours/:id',deleteTour)


/*Un middleware es una funcion que se ejecuta en el momento en el que 
se esta haciendo una peticion request o response, es decir, que en el momento
en el que el cliente esta haciendo una peticion a un servidor, en el transcurso 
de esa peticion es donde se ejecuta ese middleware
Un middleware es un bloque de codigo que se ejecuta entre la peticion que hace 
el usuario(request) hasta que la peticion llega al servidor */ 



module.exports = app