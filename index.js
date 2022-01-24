const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
require('dotenv').config();

//inicializamos variables 

const app = express();

// cors
const cors = require('cors');
var corsOptions = {
    origin: '*', // Reemplazar con dominio
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));

//capturar el body
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(morgan('dev')); //para que en consola nos muestre las respuestas http

//conexion a la base de datos

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.bhikv.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`; //los datos estan ocultos por ello los llamamos desde process.env
const options = { useNewUrlParser: true, useUnifiedTopology: true } /*opciones separadas para mas orden
leer documentacion de mongoose en caso de no recordar*/
mongoose.connect(uri,options).then(()=>console.log('Base de datos conectada')).catch(e=>console.log('error db: ',e)); //conectamos, de no poder conectarse capturamos el error y lo mostramos por consola

//importar routes

const authRoutes= require('./routes/auth');
const validarToken= require('./routes/validar-token');
const admin= require('./routes/admin');

//middlewares

app.use('/api/usuario', authRoutes);
app.use('/api/admin', validarToken, admin); //primero se ejecuta validarToken, si el token es valido, recien ahi entra a admin, la ruta protegida

// app.get('/', (req, res)=>{
//     res.json({"message": "Welcome to the home page"});
// });

// Middleware para Vue.js router modo history
const history = require('connect-history-api-fallback');
app.use(history());
app.use(express.static(__dirname + "/public"));

//iniciamos servidor 

const port = process.env.PORT || 3000; 
app.listen(port, ()=>{
    console.log(`Servidor escuchando en puerto ${port}`);
});