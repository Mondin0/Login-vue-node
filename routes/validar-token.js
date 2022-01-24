const jwt = require('jsonwebtoken');

//middleware para validar token desde el front 

const validarToken= (req, res, next)=>{
    const token= req.header('auth-token');
    if (!token) return res.status(401).json({error:"Acceso denegado"});
    try{
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user= verified;
        next(); //continuamos a auth.js
    }
    catch (error){
        res.status(400).json({error: 'token no es válido'})
    }
};

module.exports= validarToken;