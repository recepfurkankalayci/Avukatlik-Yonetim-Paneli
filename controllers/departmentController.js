const {Department,Employee,EmployeeDepartmant} = require("../models");
const generatePublicId = require('../utils/generatePublicId');
const asyncHandler = require('express-async-handler');

exports.creatDepartmant = asyncHandler(async(req,res) =>{
    const{name,discriptions}=req.body;
    
    // Public ID üret (DEPT prefix ile)
    const public_id = await generatePublicId(Department, 'DEPT');
    
    const newDepartmant = await Department.create({
        public_id,
        name,
        discriptions
    });
    res.status(201).json({ data: newDepartmant });
});

exports.getAllDepartmant = asyncHandler(async(req,res)=>{
    const departmant = await Department.findAll();
    res.status(200).json(departmant);
});

exports.updateDepartmant = asyncHandler(async(req,res)=>{
    const {name,discriptions} = req.body;
    const dep = await Department.findByPk(req.params.id);
    if(!dep) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Departman bulunamadı.' } });
    
    await dep.update({name,discriptions});
    res.status(200).json({ data: dep });
});

exports.toggleStatus=asyncHandler(async(req,res)=>{
    const dept = await Department.findByPk(req.params.id);
    if(!dept) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Departman bulunamadı.' } });

    await dept.update({is_active:!dept.is_active});
    res.status(200).json({ data: { message: `Durum ${dept.is_active ? 'aktif' : 'pasif'} olarak güncellendi.` } });
});

exports.assignEmployee = asyncHandler(async (req, res) => {
    const departmantId = req.params.id;
    const {employeeId} = req.body;
    const departman = await Department.findByPk(departmantId);
    const employee = await Employee.findByPk(employeeId);
    if(!departman||!employee){
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Departman veya çalışan bulunamadı.' } });
    }
    await EmployeeDepartmant.create({
        employee_id: employeeId, 
        department_id: departmantId
    });
    res.status(200).json({ data: { message: 'Çalışan departmana atandı.' } });
});