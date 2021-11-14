
//EN EL ARCHIVO APP SE COLOCA TODO LA CONFIGURACION DE EXPRESS

//to access the variables globals in all files js
const dotenv        = require('dotenv');
dotenv.config(  { path:'./config.env' }  )

const path          = require('path');
const express       = require('express'); //requerimos express
const app           = express(); //creamos una instancia de express
const morgan        = require('morgan')
const rateLmit      = require('express-rate-limit')
const helmet        = require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const xss           = require('xss-clean')
const hpp           = require('hpp')
const cookieParser  = require('cookie-parser')
const compression   = require('compression')
const cors          = require('cors')

const AppError          = require('./utils/appError')
const userRoutes        = require('./routes/userRoutes')
const tourRoutes        = require('./routes/tourRoutes');
const reviewRoutes      = require('./routes/reviewRoutes');
const viewRoutes        = require('./routes/viewRoutes');
const bookingRoutes     = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const globalErrorController = require('./controllers/errorController');

app.enable('trust proxy');

app.use(cors());
//Access-Control-Allow-Origin: *
//api.natours.com, frontend natours.com
//app.use(cors({
//    origin: 'https://api.natours.com'
//}))

app.options('*', cors());
// app.options('api/v1/tour/:id', cors());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//Serving static files
// app.use(express.static(`${__dirname}/public`))
app.use(express.static(path.join(__dirname,'public')))
//Set security HTTP header
app.use(helmet({ //Este objeto es para poder dar permiso a webs externas que inserten su codigo en nuestra pagina
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
            baseUri: ["'self'"],
            fontSrc: ["'self'", 'https:', 'data:'],
            scriptSrc: [
                "'self'",
                'https:',
                'http:',
                'blob:',
                'https://*.mapbox.com',
                'https://js.stripe.com',
                'https://m.stripe.network',
                'https://*.cloudflare.com',
            ],
            frameSrc: ["'self'", 'https://js.stripe.com'],
            objectSrc: ["'none'"],
            styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
            workerSrc: [
                "'self'",
                'data:',
                'blob:',
                'https://*.tiles.mapbox.com',
                'https://api.mapbox.com',
                'https://events.mapbox.com',
                'https://m.stripe.network',
            ],
            childSrc: ["'self'", 'blob:'],
            imgSrc: ["'self'", 'data:', 'blob:'],
            formAction: ["'self'"],
            connectSrc: [
                "'self'",
                "'unsafe-inline'",
                'data:',
                'blob:',
                'https://*.stripe.com',
                'https://*.mapbox.com',
                'https://*.cloudflare.com/',
                'https://bundle.js:*',
                // 'ws://127.0.0.1:*/'
            ],
            upgradeInsecureRequests: [],
        },
    },
}))

app.use(compression())

//Limit request from same API
const limiter = rateLmit({
    max         : 100,
    windowMs    : 60 * 60 * 1000,
    message     : 'Too many request for this IP, please try again in a hour'
})
app.post('/webhooks-checkout',
            express.raw({ type: 'application/json' }),
            bookingController.webhookCheckout
            )

app.use('/api', limiter)
app.use(morgan('dev'))// middleware de terceros


app.use(cookieParser())
//nos permite recibir parametros en formato JSON
app.use(express.json( {limit:'10kb'}) ); //esto es un middleware, nos ayuda con el post y que solo acepta 10kb de tamaño
//app.use(functionHer) con este metodo agregamos la funcion a la app para 
//que se comporte como un middleware
app.use(express.urlencoded( { extended : true , limit : '10kb'} ))


//Data sanitization against NoSQL query injection
app.use(mongoSanitize());// remueve los caracteres extraños 

//Data sanitization against XSS
app.use(xss())//previene la injeccion de html malicioso
app.use(hpp({
    whitelist:['duration','ratingsQuantity','ratingsAverage','maxGroupSize','difficulty','price']
}))//previene la polucion de queries en el url

//ROUTES

app.use('/', viewRoutes)
app.use('/api/v1/users',    userRoutes);
app.use('/api/v1/reviews',  reviewRoutes);
app.use('/api/v1/bookings',  bookingRoutes);
app.use('/api/v1/tours',    tourRoutes);// generamos el middleware para correr una subApp dentro de nuestra app
// similar a correr una app con rutas dentro de nuestra app padre,
// en este caso tourRouter y userRouter "corren" dentro de app
/////Express tiene un metodo para manejar rutas desconocidas y es .all
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
    


app.use(globalErrorController)
//middleware para encargarnos de los errores

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