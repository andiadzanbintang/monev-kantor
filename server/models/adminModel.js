const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const {Schema} = mongoose

const adminSchema = new Schema({
    name: {
        type:String,
        required:true,
        trim:true,
    },

    username: {
        type:String,
        required:true,
        unique:true, 
        trim:true,
        enum:[
            'Pak_Hadi',
            'Pak_Medi', 'Bu_Irina', 'Pak_Ruli', 'Bu_Ani', 'Pak_Pius',
            'Pak_Tony', 'Bu_Ayu', 'Bu_Nurul',
            'Bintang','Dinan','Izzy','Ulvi','Obet','Okky'
         ]
    },

    password:{
        type:String,
        required:true, 
        trim:true,
        select:false,
        minLength:[8,"Password must be at least 8 characters"]
    },

    role:{
        type:String,
        required:true,
        default:'admin', 
        enum:['admin']
    },

    refreshToken:{
        type:String,
        default:''
    }
},{
    timestamps: true // This will add createdAt and updatedAt fields
})

// Pre-save hook to hash the password before saving
adminSchema.pre('save', async function (next) {
    try {
        if (!this.isModified('password')) return next();
        this.password = await bcrypt.hash(this.password, 12);
        next();
    } catch (error) {
        next(error); // Kirim error ke middleware error handler
    }
});


// Method to compare input password with hashed password
adminSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

// Static method to check if an admin with given field already exists
adminSchema.statics.doesNotExist = async function (field) {
    return await this.where(field).countDocuments() === 0;
  };


const AdminModel = mongoose.model('Admin', adminSchema)
module.exports = AdminModel