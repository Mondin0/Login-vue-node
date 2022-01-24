const router = require('express').Router();
const User= require('../models/User');
const Joi= require('@hapi/joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();


//realizamos la validacion de cada uno de los campos acorde lo armado en User.js

const schemaRegister= Joi.object(
    {
        name: Joi.string().min(6).max(255).required(),
        email: Joi.string().min(6).max(255).required().email(),
        password: Joi.string().min(6).max(1024).required()
    }
);

const schemaLogin = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
});


/**********************************************************/

//Login

/**********************************************************/

router.post('/login', async (req,res)=>{
    //Validaciones
    const {error}= schemaLogin.validate(req.body);
    if (error) return res.status(400).json({error: error.details[0].message});
    //validamos email
    const usuario= await User.findOne({email: req.body.email});
    if(!usuario) return res.status(400).json({error: "usuario no encontrado"});
    //comparamos contraseñas con bcrypt
    const validPassword= await bcrypt.compare(req.body.password, usuario.password);
    if(!validPassword) return res.status(400).json({error: "contraseña incorrecta"});


    // crear token

    const token = jwt.sign({
        name: usuario.name,
        id: usuario._id
    }, process.env.TOKEN_SECRET)
    
    res.header('auth-token', token).json({
        error: null,
        data: {token}
    })
});


/**********************************************************/

//Dar de alta a un usuario

/**********************************************************/

router.post('/registro', async (req,res)=>{

    //las validaciones van siempre antes de guardar al usuario
    //validaciones de usuario

    const {error} = schemaRegister.validate(req.body);
    if (error) {
        return res.status(400).json(
            {error: error.details[0].message}
            )
        };
    
    //validar email unico
    
    const mailUnico= await User.findOne({email: req.body.email});
    if (mailUnico){
        return res.status(400).json({
            error: "email ya registrado"
        })
    };
    
    //Hashear contraseña
    
    const salt = await bcrypt.genSalt(10); //cuantas vueltas da.
    const password = await bcrypt.hash(req.body.password, salt);
    
    //una vez que todo esta validado, recien ahora definimos el nuevo usuario
    
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: password
    });
    try {
        const savedUser = await user.save(); //guardamos el usuario en db.
        res.json({
            error: null,
            msg:"Bienvenido",
            data: savedUser
        });
    } catch (error) {
        res.status(400).json({error})
    };
});
    

module.exports = router;