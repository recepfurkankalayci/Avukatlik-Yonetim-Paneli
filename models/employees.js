const {DataTypes} = require('sequelize');
const sequelize = require('../config/database');

const Employee = sequelize.define('Employee',{
    id : {
        type:DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    public_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    fullname : {
        type:DataTypes.STRING,
        allowNull : false
    },
    email : {
        type : DataTypes.STRING,
        allowNull : false,
        unique : true,
        validate : {
            isEmail:true,
        }
    },
    password_hash :{
        type : DataTypes.STRING,
        allowNull : false,
    },
    phone:{
        type : DataTypes.STRING,
        allowNull : false,
    },
    role: {
        type :DataTypes.ENUM("ADMIN","LAWYER"),
        allowNull : false,
    },
    photo_url: {
    type: DataTypes.STRING,
    allowNull: true,
    },
    hired_at: {
        type: DataTypes.DATEONLY, // Sadece tarih (saat yok)
    allowNull: true,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true, // DEFAULT TRUE kuralı
    }
},
{ 
 tableName:"employee",
 timestamps:true,
 createdAt:"created_at",
 updatedAt:"updated_at",
},
);
module.exports=Employee;