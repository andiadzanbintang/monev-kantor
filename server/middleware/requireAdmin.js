const jwt = require('jsonwebtoken')
const AdminModel = require('../models/adminModel')
const {body} = require('express-validator')
const rateLimit = require('express-rate-limit');
require('dotenv').config()
  
const validateLogin = [ 
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
]  

const requireAdmin = async (req, res, next) => { 
    try {
        const token = req.cookies.authToken

        if(!token) {
            return res.status(401).json({status:401, error:"Unauthorized, Bad Request!"})
        }

        // token verification
        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET)
        if(!decoded || !decoded.id) {
            return res.status(401).json({status:401, error:"Unauthorized!, Bad Request"})
        }

        // Role check
        if(decoded.role !== "admin"){
            return res.status(403).json({status:403, error:"Forbidden! Access is denied"})
        }

        // admin check
        const admin = await AdminModel.findById(decoded.id)
        if(!admin){
            return res.status(404).json({status:404, error:"Unauthorized!, admin not found!"})
        }

        req.admin = admin
        next()
    } catch (error) {
        console.error("Unauthorized:", error)
        return res.status(500).json({status:500, error:"Something went wrong"})
    }
}

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message:{
        status:429,
        message:"Too much attempt. Please try again in 15 minutes"
    },
    standardHeaders:true,
    legacyHeaders:false,
    handler:(req, res, next, options) => {
        console.warn(`Rate limit hit for IP : ${req.ip} on ${new Date()}`)
        res.status(options.statusCode).send(options.message)
    }
})

module.exports = {requireAdmin, validateLogin, loginLimiter}