const jwt = require('jsonwebtoken')
const axios = require('axios')
const ip = require('ip')
const LogModel = require('../models/logModel') 

const checkAdmin = async (req, res, activity) => {
    try {
        // getting token
        const adminToken = req.cookies.authToken;
        if (!adminToken) {
            return res.status(400).json({ status: 400, message: "No token provided" });
        }
        
        // Verifikasi token
        let admin;
        try {
            admin = jwt.verify(adminToken, process.env.ADMIN_JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ status: 401, message: "Invalid or expired token" });
        }

        // Mendapatkan IP yang lebih akurat
        let ipAddress = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
        
        // Jika masih dalam format "::1" atau IPv6, gunakan ip.address()
        if (ipAddress === "::1" || ip.isPrivate(ipAddress)) {
            ipAddress = ip.address(); // Ambil IP lokal jika dijalankan secara lokal
        }

        // Melacak lokasi
        const geoResponse = await axios.get(`http://ip-api.com/json/${ipAddress}`)
        const {country, region, city, lat, lon, timezone} = geoResponse.data

        const now = new Date();
        const userAgent = req.get("User-Agent") || "Unknown Device";

        const newLog = new LogModel({
            name: admin.name || ipAddress,
            username: admin.username,
            activity: `${admin.name ? admin.name : ipAddress} ${activity}`,
            logDate: new Date(now.setHours(0, 0, 0, 0)), // Hanya tanggal
            logTime: new Date(), // Waktu lengkap
            ipAddress: ipAddress,
            userAgent: userAgent,
            country:country,
            region:region,
            city:city,
            lat:lat,
            lon:lon,
            timezone:timezone
        });

        await newLog.save();
    } catch (error) {
        console.error("Error logging admin activity:", error)
    }
}


module.exports = {
    checkAdmin 
}