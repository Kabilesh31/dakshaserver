const Staff = require("../model/staffModal") 
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
const xlsx = require('node-xlsx');
const fs = require('fs');
const path = require('path');


exports.getAllDetails = async (req, res) => {
  try {
      const details = await Staff.find();

      const formattedDetails = details.map((detail) => {
          const fileData =
              detail.file
                  ? `data:image/jpeg;base64,${detail.file.toString('base64')}`  
                  : null;

          return {
              ...detail._doc, 
              file: fileData, 
          };
      });

      res.status(200).json(formattedDetails);
  } catch (error) {
      console.error("Error fetching details:", error);
      res.status(500).json({ message: "Failed to fetch details", error });
  }
};



exports.createStaff = async (req, res) => {
  try {
    const {
      name,
      phone,
      employeeId,
      designation,
      email,
      createdBy,
      address,
      dob,
      doj,
      blood,
      aadhar,
      emergencyContact,
      emergencyContact2,
      bankName,
      accountNo,
      branch,
      ifsc,
      family,
      education
    } = req.body;

    // Validate required fields
    if (!name || !phone || !designation || !email || !employeeId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check for duplicates
    const existingStaff = await Staff.findOne({
      $or: [{ employeeId }, { phone }, { email }, {aadhar}]
    });

    if (existingStaff) {
      return res.status(409).json({
        message: "Staff with this employee ID, phone, Aadhar or email already exists"
      });
    }

    const newStaff = new Staff({
      name,
      phone,
      email,
      employeeId,
      designation,
      createdBy: createdBy || "Admin",
      address,
      dob: dob || null,
      doj: doj || null,
      blood,
      aadhar,
      emergencyContact: emergencyContact || null,
      emergencyContact2: emergencyContact2 || null,
      bankName,
      accountNo: accountNo || null,
      branch,
      ifsc,
      file: req.file ? req.file.buffer : null, // Handle file uploads
      family: family || {}, // Validate sub-documents
      education: education || {} // Validate sub-documents
    });

    const savedStaff = await newStaff.save();

    res.status(201).json({
      message: "Staff created successfully",
      user: savedStaff
    });
  } catch (error) {
    console.error("Error creating staff:", error);
    res.status(500).json({
      message: "An error occurred while creating staff",
      error: error.message
    });
  }
};




exports.updateStaffData = async (req, res, next) => {
  try {
    const {
      name, phone, department, emergencyContact2, employeeId, designation, address,
      staffStatus, dob, doj, blood, aadhar, staffId, emergencyContact, bankName,
      accountNo, branch, ifsc, pan, family, education
    } = req.body;

    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (designation) updateData.designation = designation;
    if (department) updateData.department = department;
    if (emergencyContact2) updateData.emergencyContact2 = emergencyContact2;
    if (address) updateData.address = address;
    if (staffStatus) updateData.staffStatus = staffStatus;
    if (dob) updateData.dob = dob;
    if (doj) updateData.doj = doj;
    if (blood) updateData.blood = blood;
    if (aadhar) updateData.aadhar = aadhar;
    if (staffId) updateData.staffId = staffId;
    if (emergencyContact) updateData.emergencyContact = emergencyContact;
    if (bankName) updateData.bankName = bankName;
    if (accountNo) updateData.accountNo = accountNo;
    if (branch) updateData.branch = branch;
    if (ifsc) updateData.ifsc = ifsc;
    if (pan) updateData.pan = pan;  // Add pan field
    if (family) {
      if (family.fatherName) updateData.family = updateData.family || {};
      if (family.fatherName) updateData.family.fatherName = family.fatherName;
      if (family.motherName) updateData.family.motherName = family.motherName;
      if (family.siblingName) updateData.family.siblingName = family.siblingName;
      if (family.familyNumber) updateData.family.familyNumber = family.familyNumber;
      if (family.familyMembers) updateData.family.familyMembers = family.familyMembers;
    }
    if (education) {
      if (education.degree) updateData.education = updateData.education || {};
      if (education.degree) updateData.education.degree = education.degree;
      if (education.universityName) updateData.education.universityName = education.universityName;
      if (education.degreeName1) updateData.education.degreeName1 = education.degreeName1;
      if (education.degreeName2) updateData.education.degreeName2 = education.degreeName2;
    }

    if (req.file) {
      updateData.file = req.file.buffer;
    }

    const updatedStaff = await Staff.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedStaff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    res.status(200).json(updatedStaff);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.updateIsDeleted = catchAsync(async(req, res, next) => {
    const data = await Staff.findByIdAndUpdate(req.params.id, req.body, {
        new:true
    })
    if(!data){
        return next(new AppError("This id Cant Find", 404))
    }
    res.status(200).json({
        status:"Success",
        data: data
    })
})


exports.importStaff = async (req, res) => {
  const { data: sheetData, createdBy } = req.body;

  if (!sheetData || sheetData.length === 0 || !createdBy) {
    return res.status(400).send({ status: 0, message: 'No data or createdBy ID provided' });
  }

  // Create a Set to track employeeIds in the current file
  const existingEmployeeIdsInFile = new Set();

  const promises = sheetData.map(async (newRow) => {
    const [name, phone, email, employeeId, designation, department] = newRow;

    // Validation for required fields
    if (!name || !phone || !email || !employeeId) {
      return { status: 0, message: 'Required fields are empty' };
    }

    // Check if the employeeId is already in the current file
    if (existingEmployeeIdsInFile.has(employeeId)) {
      return { status: 0, message: `Duplicate employeeId "${employeeId}" skipped in the file` };
    }

    // Add employeeId to the set
    existingEmployeeIdsInFile.add(employeeId);

    try {
      // Check if the employeeId already exists in the database
      const existingStaff = await Staff.findOne({ employeeId });
      if (existingStaff) {
        return { status: 0, message: `Duplicate employeeId "${employeeId}" skipped (already in database)` };
      }

      // Create a new staff entry
      const newProduct = new Staff({
        name,
        phone,
        email,
        employeeId,
        designation,
        department,
        createdBy,
      });

      await newProduct.save();
      return { status: 1, message: 'Staff inserted successfully' };
    } catch (error) {
      return { status: 0, message: `Error: ${error.message}` };
    }
  });

  try {
    const results = await Promise.all(promises);
    res.status(200).send(results);
  } catch (error) {
    res.status(500).send({ status: 0, message: `Error: ${error.message}` });
  }
};


exports.exportStaff = async(req, res) => {  
  try {
    // Fetch only required fields
    const staffData = await Staff.find({}, 'name email phone employeeId department').lean();

    // Prepare data for the XLSX file
    const header = ['Name', 'Email', 'Phone', 'Employee ID', 'Department'];
    const data = staffData.map(staff => [
      staff.name || '',
      staff.email || '',
      staff.phone || '',
      staff.employeeId || '',
      staff.department || '',
    ]);

    const buffer = xlsx.build([{ name: 'Staff Data', data: [header, ...data] }]);

    // Set response headers for downloading the XLSX file
    const fileName = `staffs_${Date.now()}.xlsx`;
    const filePath = path.join(__dirname, fileName);

    fs.writeFileSync(filePath, buffer);

    res.download(filePath, fileName, err => {
      if (err) {
        console.error(err);
        res.status(500).send('Error while downloading the file');
      }
      // Clean up: remove the file after sending it
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

