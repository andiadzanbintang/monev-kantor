const AdminModel = require('../models/adminModel')
const IndicatorModel = require('../models/indicatorModel')
const DimensionModel = require('../models/dimensionModel')
const PolicyModel = require('../models/policyModel')
const MissionModel = require('../models/missionModel')
const TableVersion = require('../models/tableVersionModel')
const LogModel = require('../models/logModel')
const { checkAdmin } = require('../helpers/checkAdmin')
const jwt = require('jsonwebtoken')
const mongoSanitize = require('mongo-sanitize')
const { validationResult } = require('express-validator')
const { default: mongoose } = require('mongoose') 
require('dotenv').config()
const axios = require('axios')



// ###################### AUTHENTICATION ###########################
const loginAdmin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 400, errors: errors.array() });
    }

    try {
        const { username, password } = mongoSanitize(req.body);

        const validUsername = [
            'Pak_Hadi',
            'Pak_Medi', 'Bu_Irina', 'Pak_Ruli', 'Bu_Ani', 'Pak_Pius',
            'Pak_Tony', 'Bu_Ayu', 'Bu_Nurul',
            'Bintang', 'Dinan', 'Izzy', 'Ulvi', 'Obet', 'Okky'
        ];

        // Cek apakah username yang masuk ada dalam daftar validUsername
        if (!validUsername.includes(username)) {
            return res.status(403).json({ status: 403, message: "Unauthorized" });
        }

        if (!username || !password) {
            return res.status(400).json({ status: 400, message: "Username and password are required!" });
        }

        const admin = await AdminModel.findOne({ username }).select("+password"); 
        if (!admin) {
            return res.status(404).json({ status: 404, message: "Admin not found" });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ status: 401, message: "Invalid Credentials" });
        }

        const authToken = jwt.sign(
            { id: admin._id, role: admin.role, name: admin.name, username: admin.username },
            process.env.ADMIN_JWT_SECRET,
            { expiresIn: "1d" }
        );

        try {
            res.cookie("authToken", authToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000,
            });

            await checkAdmin(req, res, "Telah login")

            return res.status(200).json({ status: 200, message: "Logged In"});
        } catch (error) {
            console.error("Something went wrong", error);
            return res.status(500).json({ status: 500, message: "Something went wrong" });
        }
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ status: 500, message: "Server error." });
    }
};

const logoutAdmin = async(req, res) => {
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

        await checkAdmin(req,res,"Telah Logout")

        // clear cookie regardless of the presence of a token
        res.clearCookie("authToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        });
        
        if(req.session){
            req.session.destroy()
        }

        return res.status(200).json({status:200, message:"Logged Out"})
    } catch (error) {
        console.error("Something Went Wrong", error)
        return res.status(500).json({status:500, message:"Internal Server Erorr"})
    }
}

// ###################### INDICATOR ###############################
const getAllIndicator = async (req, res) => {
    try {
        const indicators = await IndicatorModel.find()
        if(!indicators || indicators.length === 0){
            res.status(200).json({status:200, message:"no data", data:[]})
        } else {
            res.status(200).json({status:200, message:"Success", data:indicators})
        }
    } catch (error) {
        console.error("Error fetching data:", error)
        res.status(500).json({status:500, message:"Error fetching data"})
    }
}

const addIndicator = async (req, res) => {
    try {
        const {name} = mongoSanitize(req.body)
        if(!name){
            return res.status(400).json({status:400, message:"All field is required!"})
        }

        const existingIndicator = await IndicatorModel.findOne({name})
        if(existingIndicator){
            return res.status(409).json({status:409, message:"Indicator already exist"})
        }

        const category = "Indicator"

        const newIndicator = new IndicatorModel({
            name,
            category
        })

        await newIndicator.save()

        await checkAdmin(req, res, `Menambah indikator ${name}`)
        res.status(201).json({status:201, message:"Indicator added successfully", data:newIndicator})
    } catch (error) {
        console.error("Error adding indicator", error)
        res.status(500).json({status:500, message:"Error adding indicator"})
    }
}

const editIndicator = async (req, res) => {
    try {
        const { id } = mongoSanitize(req.params)
        const { name } = mongoSanitize(req.body)

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                status:400,
                message:"Invalid Indicator ID"
            })
        }

        if(!name){
            return res.status(400).json({status:400, message:"All field is required!"})
        }

        const existingIndicator = await IndicatorModel.findById(id);
        if (!existingIndicator) {
            return res.status(404).json({ status: 404, message: "Indicator not found" });
        }

        const isNameUsed = await IndicatorModel.findOne({ name });
        if (isNameUsed) {
            return res.status(409).json({ status: 409, message: "Indicator name already in use" });
        }

        const prevName = existingIndicator.name;
        const category = "Indicator"

        const updatedIndicator = await IndicatorModel.findByIdAndUpdate(
            id,
            {name, category},
            {new:true, runValidators:true}
        )

        if(!updatedIndicator){
            return res.status(404).json({
                status:404,
                message:"Indicator not found"
            })
        }

        await checkAdmin(req, res, `Mengubah indikator ${prevName} menjadi ${name}`)

        res.status(200).json({
            status:200,
            message:"Indicator updated Successfully",
            data:updatedIndicator
        })

    } catch (error) {
        console.error("Something went wrong:", error)
        res.status(500).json({
            status:500, 
            message:"Something went wrong while updating indicator",
            error:error
        })
    }
}

const deleteIndicator = async (req, res) => {
    const {id} = mongoSanitize(req.params)

    try {
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                status:400,
                message:"Invalid id"
            })
        }

        const indicator = await IndicatorModel.findById(id).select("name")
        await checkAdmin(req, res, `Menghapus indikator ${indicator.name}`)

        const deletedIndicator = await IndicatorModel.findByIdAndDelete(id)
    
        if(!deletedIndicator){
            return res.status(404).json({
                status:404,
                message:"Indicator not found"
            })
        }
    
        res.status(200).json({
            status:200,
            message:"Indicator deleted successfully",
            data:deletedIndicator
        })
    } catch (error) {
        console.error("Error deleting indicator:", error)
        res.status(500).json({
            status:500,
            message:"Error deleting indicator",
            error:error
        })
    }

}

// ###################### DIMENSION #################################
const getAllDimension = async (req, res) => {
    const dimensions = await DimensionModel.find()
    try {
        if(!dimensions || dimensions.length === 0){
            res.status(200).json({status:200, message:"No data", data:[]})
        } else {
            res.status(200).json({status:200, message:"Success", data:dimensions})
        }
    } catch (error) {
        console.error("Error fetching data:", error)
        res.status(500).json({status:500, message:"Error fetching data"})
    }
}

const addDimension = async (req, res) => {
    const {name, kode} = mongoSanitize(req.body)
    try {
    
        if(!name || typeof name !== 'string' || !kode || typeof kode !== 'string'){
            return res.status(400).json({
                status:400,
                message:"all fields are required!"
            })
        }
        
        const existingDimension = await DimensionModel.findOne({name})
        if(existingDimension){
            return res.status(409).json({
                status:409,
                message: `dimension - ${name} is already in use`
            })
        }

        const category = 'Dimension'

        const newDimension = new DimensionModel({
            name,
            category,
            kode
        })

        await newDimension.save()
        await checkAdmin(req, res, `Menambah dimensi ${name}`)

        res.status(201).json({
            status:201,
            message:"Dimension added successfully",
            data:newDimension
        })

    } catch (error) {
        console.error("Error adding dimension:", error)
        res.status(500).json({
            status:500,
            message:"Something went wrong while adding dimension",
            error:error
        })
    }
}

const editDimension = async (req, res) => {
    try {
        const {id} = mongoSanitize(req.params)
        const {name, kode} = mongoSanitize(req.body)

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                status:400,
                message:"Invalid dimension id"
            })
        }

        if(!name || typeof name !== "string" || !kode || typeof kode !== 'string'){
            return res.status(400).json({
                status:400,
                message:"dimension must be a string"
            })
        }

        // Cek apakah dimension dengan ID yang diberikan ada
        const existingDimension = await DimensionModel.findById(id);
        if (!existingDimension) {
            return res.status(404).json({
                status: 404,
                message: "Dimension not found"
            });
        }

        // Cek apakah nama baru sudah digunakan oleh dimension lain
        const isNameUsed = await DimensionModel.findOne({ name, _id: { $ne: id } });
        if (isNameUsed) {
            return res.status(409).json({
                status: 409,
                message: `Dimension name "${name}" is already in use`
            });
        }

        // Simpan nama lama sebelum update untuk logging
        const prevName = existingDimension.name;

        const updatedDimension = await DimensionModel.findByIdAndUpdate(
            id,
            {name, kode},
            {new:true, runValidators:true}
        )

        if(!updatedDimension) {
            return res.status(404).json({
                status:404,
                message:"Dimension not found"
            })
        }

        await checkAdmin(req, res, `Mengubah dimensi "${prevName}" menjadi "${name}"`);

        res.status(200).json({
            status:200,
            message:"dimension updated successfully",
            data:updatedDimension
        })

    } catch (error) {
        console.error("Error editing dimension:", error)
        res.status(500).json({
            status:500,
            message:"Something went wrong while editing dimension",
            error:error
        })
    }
}

const deleteDimension = async (req, res) => {
    const {id} = mongoSanitize(req.params)

    try {
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                status:400,
                message:"Invalid id"
            })
        }

        const dimension = await DimensionModel.findById(id).select("name")

        await checkAdmin(req, res, `Menghapus dimensi ${dimension.name}`)
    
        const deletedDimension = await DimensionModel.findByIdAndDelete(id)
    
        if(!deletedDimension){
            return res.status(404).json({
                status:404,
                message:"Dimension not found"
            })
        }
    
        res.status(200).json({
            status:200,
            message:"Dimension deleted successfully",
            data:deletedDimension
        })

    } catch (error) {
        console.error("Error deleting Dimension:", error)
        res.status(500).json({
            status:500,
            message:"Error deleting Dimension",
            error:error
        })
    }
} 

// ####################### POLICY ###################################
const getAllPolicies = async (req, res) => {
    const policies = await PolicyModel.find()
    try {
        res.status(200).json({
            status:200,
            message: policies.length ? "Success" : "No data",
            data: policies
        })
    } catch (error) {
        console.error("Error fetching policies", error)
        res.status(500).json({
            status:500,
            message:"Error fetching policies"
        })
    }
}

const addPolicy = async (req, res) => {
    const {name, kode} = mongoSanitize(req.body)

    try {

        if(!name || typeof name !== 'string' || !kode || typeof kode !== 'string'){
            return res.status(400).json({
                status:400,
                message:"all fields are required!"
            })
        }

        const existingPolicy = await PolicyModel.findOne({name})
        if(existingPolicy){
            return res.status(409).json({
                status:409,
                message: `policy - ${name} is already in use`
            })
        }

        const category = 'Policy'

        const newPolicy = new PolicyModel({
            name,
            category,
            kode
        })

        await newPolicy.save()
        await checkAdmin(req, res, `Menambah kebijakan ${name}`)

        res.status(201).json({
            status:201,
            message:"Policy added successfully",
            data:newPolicy
        })
    } catch (error) {
        console.error("Error adding policy:", error)
        res.status(500).json({
            status:500,
            message:"Something went wrong while adding policy",
            error:error
        })
    }
}

const editPolicy = async (req, res) => {
    const {id} = mongoSanitize(req.params)
    const { name, kode } = mongoSanitize(req.body)

    try {

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                status:400,
                message:"Invalid policy id"
            })
        }


        if(!name || typeof name !== 'string' || !kode || typeof kode !== 'string'){
            return res.status(400).json({
                status:400,
                message:"all fields are required!"
            })
        }

        // Cek apakah policy dengan ID yang diberikan ada
        const existingPolicy = await PolicyModel.findById(id);
        if (!existingPolicy) {
            return res.status(404).json({
                status: 404,
                message: "Policy not found"
            });
        }

        // Cek apakah nama baru sudah digunakan oleh kebijakan lain
        const isNameUsed = await PolicyModel.findOne({ name, _id: { $ne: id } });
        if (isNameUsed) {
            return res.status(409).json({
                status: 409,
                message: `Policy name "${name}" is already in use`
            });
        }

        // Simpan nama lama sebelum update untuk logging
        const prevName = existingPolicy.name;

        const updatedPolicy = await PolicyModel.findByIdAndUpdate(
            id,
            {name, kode},
            {new:true, runValidators:true}
        )

        if(!updatedPolicy) {
            return res.status(404).json({
                status:404,
                message:"Policy not found"
            })
        }

        await checkAdmin(req, res, `Mengubah Kebijakan "${prevName}" menjadi "${name}"`);

        res.status(200).json({
            status:200,
            message:"Policy updated successfully",
            data:updatedPolicy
        })
        

    } catch (error) {
        console.error("Error editing policy:", error)
        res.status(500).json({
            status:500,
            message:"Something went wrong while editing policy",
            error:error
        })
    }
}

const deletePolicy = async (req, res) => {
    const {id} = mongoSanitize(req.params)

    try {
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                status:400,
                message:"Invalid id"
            })
        } 

        const policy = await PolicyModel.findById(id).select("name")

        await checkAdmin(req, res, `Menghapus kebijakan "${policy.name}"`)

        const deletedPolicy = await PolicyModel.findByIdAndDelete(id)
    
        if(!deletedPolicy){
            return res.status(404).json({
                status:404,
                message:"Policy not found"
            })
        }
    
        res.status(200).json({
            status:200,
            message:"Policy deleted successfully",
            data:deletedPolicy
        })
    } catch (error) {
        console.error("Error deleting Policy:", error)
        res.status(500).json({
            status:500,
            message:"Error deleting Policy",
            error:error
        })
    }
}


// ########################## PRINCIPLE ###################################
const getAllMission = async (req, res) => {
    const mission = await MissionModel.find()
    try {
        res.status(200).json({
            status:200,
            message:mission.length ? "success" : "No data",
            data:mission
        })
    } catch (error) {
        console.error("Error fetching Mission", error)
        res.status(500).json({
            status:500,
            message:"Error fetching Mission"
        })
    }
}

const addMission = async (req, res) => {
    const { name } = mongoSanitize(req.body)

    try {

        if(!name || typeof name !== 'string'){
            return res.status(400).json({
                status:400,
                message:"all fields are required!"
            })
        }

        const existingMission = await MissionModel.findOne({name})
        if(existingMission){
            return res.status(409).json({
                status:409,
                message: `mission - ${name} is already in use`
            })
        }

        const category = 'Mission'

        const newMission = new MissionModel({
            name,
            category,
        })

        await newMission.save()
        await checkAdmin(req, res, `Menambah Misi : ${name}`)

        res.status(201).json({
            status:201,
            message:"Mission added successfully",
            data:newMission
        })
    } catch (error) {
        console.error("Error adding mission:", error)
        res.status(500).json({
            status:500,
            message:"Something went wrong while adding mission",
            error:error
        })
    }
}

const editMission = async (req, res) => {
    const {id} = mongoSanitize(req.params)
    const {name} = mongoSanitize(req.body)

    try {
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                status:400,
                message:"Invalid mission id"
            })
        }

        
        if(!name || typeof name !== 'string' ){
            return res.status(400).json({
                status:400,
                message:"all fields are required!"
            })
        }

        // Cek apakah policy dengan ID yang diberikan ada
        const existingMission = await MissionModel.findById(id);
        if (!existingMission) {
            return res.status(404).json({
                status: 404,
                message: "Mission not found"
            });
        }

        // Cek apakah nama baru sudah digunakan oleh kebijakan lain
        const isNameUsed = await MissionModel.findOne({ name, _id: { $ne: id } });
        if (isNameUsed) {
            return res.status(409).json({
                status: 409,
                message: `Mission name "${name}" is already in use`
            });
        }

        // Simpan nama lama sebelum update untuk logging
        const prevName = existingMission.name;

        const updatedMission = await MissionModel.findByIdAndUpdate(
            id,
            {name},
            {new:true, runValidators:true}
        )

        if(!updatedMission) {
            return res.status(404).json({
                status:404,
                message:"Mission not found"
            })
        }

        await checkAdmin(req, res, `Mengubah Misi "${prevName}" menjadi "${name}"`);

        res.status(200).json({
            status:200,
            message:"Mission updated successfully",
            data:updatedMission
        })

    } catch (error) {
        console.error("Error editing policy:", error)
        res.status(500).json({
            status:500,
            message:"Something went wrong while editing policy",
            error:error
        })
    }
}

const deleteMission = async (req, res) => {
    const {id} = mongoSanitize(req.params)

    try {
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                status:400,
                message:"Invalid id"
            })
        } 

        const mission = await MissionModel.findById(id).select("name")

        await checkAdmin(req, res, `Menghapus Misi "${mission.name}"`)

        const deletedMission = await MissionModel.findByIdAndDelete(id)
    
        if(!deletedMission){
            return res.status(404).json({
                status:404,
                message:"Mission not found"
            })
        }
    
        res.status(200).json({
            status:200,
            message:"Mission deleted successfully",
            data:deletedMission
        })
    } catch (error) {
        console.error("Error deleting Mission:", error)
        res.status(500).json({
            status:500,
            message:"Error deleting Mission",
            error:error
        })
    }    
}


// ########################### TABEL #######################################
const getTableNewestVersion = async (req, res) => {
    try {
        const latestTable = await TableVersion.findOne().sort({ version: -1 }).populate('data.mission data.policy data.dimension data.indicator data.kode');

        if (!latestTable || latestTable.length === 0) {
            return res.status(200).json({status:200, success: false, message: 'Data tidak ditemukan', data:[] });
        }

        res.json({ status:200, success: true, data: latestTable });
    } catch (error) {
        console.error('Error fetching latest table version:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

const addTableData = async (req, res) => {
    try {
        const { rows} = mongoSanitize(req.body)


        // Cari versi terakhir 
        const lastVersion = await TableVersion.findOne().sort({version:-1})
        const newVersion = lastVersion ? lastVersion.version + 1 : 1;

        const formattedRows = rows.map((row, index) => ({
            kode: row.kode ,
            mission:row.mission,
            policy : row.policy,
            dimension: row.dimension,
            indicator:row.indicator
        }))

        const newTableVerion = new TableVersion({
            version: newVersion,
            data:formattedRows
        })

        await newTableVerion.save()
        await checkAdmin(req, res, `Menyimpan data tabel`)


        res.json({
            status:200,
            success:true,
            message:'Success Saving data',
            version:newVersion
        })
    } catch (error) {
        console.error('Error saving table data:', error)
        res.status(500).json({
            status:500,
            success:false,
            message:'Terjadi kesalahan'
        })
    }
}

// ########################### AKTIVITAS #####################################
const getAllLogData = async(req, res) => {
    const log = await LogModel.find()
    try {
        res.status(200).json({
            status:200,
            message: log.length ? "Success" : "No data",
            data: log
        })
    } catch (error) {
        console.error("Error fetching log data", error)
        res.status(500).json({
            status:500,
            message:"Error fetching log data"
        })
    }
}



module.exports = {
    loginAdmin, logoutAdmin,
    getAllIndicator, addIndicator, editIndicator, deleteIndicator,
    getAllDimension, addDimension, editDimension, deleteDimension, 
    getAllPolicies, addPolicy, editPolicy, deletePolicy,
    getAllMission, addMission, editMission, deleteMission,
    getAllLogData,
    getTableNewestVersion, addTableData
} 