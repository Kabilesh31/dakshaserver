require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const auth = require("./routes/userRoutes")
const cors = require('cors');
const AppError = require("./utils/appError");
const authRoutes = require("./routes/authRoutes");
const globalErrorHandling = require("./controllers/errorController")
const productData = require("./routes/productRoutes")
const stockData = require("./routes/stockRoutes")
const multer = require('multer');
const app = express();
const details = require("./routes/detailsRoutes")
const { ObjectId } = require('mongodb') 
const mongoString = process.env.DATABASE_URL 
const customer = require("./routes/customerRoutes")
const staff = require("./routes/staffRoutes")
const activity = require("./routes/activityRoutes")
const attendace = require("./routes/attendanceRoutes")
const staffAuthRoutes = require("./routes/staffAuthRoutes");
const locationRoutes = require("./routes/locationRoutes");
const billRoutes = require("./routes/billsRoutes");





const vehicle = require('./routes/vehicleRoutes');
const routeZone = require("./routes/routeRoutes");
const routeAssign = require("./routes/routeAssignmentRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");

app.use(express.json());

const allowedOrigins = [
    "http://localhost:3000", // Web
    "https://retailpulse2.netlify.app",
    "https://kochai.netlify.app",
    "http://192.168.0.100:3000"
    // "http://localhost:8081", // React Native
    // "http://192.168.0.107:8081", // Ensure this is the correct IP and port
    // "http://192.168.3.176:8081"
];

app.get('/', (req, res) => {
    res.send("Server is running on port 8000!");
});

const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

app.use(
    cors({
    origin: ( origin, callback) => {
        if(!origin) return callback(null, true)
        if(allowedOrigins.indexOf(origin) === -1 ){
            const msg = "The CORS policy for this site does not allow access from the specified Origin";
            return callback(new Error(msg), false);
        }
        return callback(null, true)
    }
}))

app.use("/api/auth", authRoutes);
app.use('/api/user', auth)
app.use("/api/product", productData)
app.use("/api/stock", stockData)
app.use("/api/detail", details)
app.use("/api/customer", customer)
app.use("/api/staff", staff)
app.use("/api/activity", activity)
app.use("/api/attendance", attendace)
app.use("/api/vehicle", vehicle)
app.use("/api/route", routeZone);
app.use("/api/route-assignment", routeAssign);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/staff/auth", staffAuthRoutes);
app.use("/api/bills", billRoutes);

app.use("/api/location", locationRoutes);

app.post('/api/driveUpload', upload.single('file'), async (req, res) => {
    try {
        const db = mongoose.connection; // Use mongoose connection
        const collection = db.collection('drive'); 
        const staffId = req.body.userId;
      // Create a file object
      const file = {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        data: req.file.buffer,
        staffId : staffId,
        uploadedAt: new Date()
      };
  
      // Insert file into MongoDB
      const result = await collection.insertOne(file);
      res.status(200).json({ message: 'File uploaded successfully', fileId: result.insertedId });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ message: 'File upload failed', error });
    }
  });

  app.get('/files/:id', async (req, res) => {
    try {
        const fileId = req.params.id; // Get the file ID from the request parameters
        // Access the MongoDB collection (replace 'YOUR_COLLECTION_NAME' with your actual collection name)
        const collection = mongoose.connection.collection('drive');

        // Find the file by its _id using ObjectId
        const file = await collection.findOne({ _id: new ObjectId(fileId) });

        if (!file) {
            return res.status(404).json({ message: 'File not found' }); // Handle case when file is not found
        }

        // Set the appropriate headers for the response
        res.set('Content-Type', file.contentType);
        res.set('Content-Disposition', `attachment; filename="${file.filename}"`); // Forces download with the original filename
        res.send(file.data);
    } catch (error) {
        console.error('Error retrieving file:', error);
        res.status(500).json({ message: 'File retrieval failed', error }); // Handle errors
    }
});

app.get('/api/driveFiles', async (req, res) => {
    try {
        const collection = mongoose.connection.collection('drive');
        const files = await collection.find({}).toArray(); 

        if (files.length === 0) {
            return res.status(404).json({ message: 'No files found' });
        }
        res.status(200).json(files); 
    } catch (error) {
        console.error('Error retrieving files:', error);
        res.status(500).json({ message: 'Failed to retrieve files', error }); 
    }
});


// Connect to MongoDB
mongoose.connect(mongoString)
    .then(() => console.log('Database Connected'))
    .catch((error) => console.log('Database Not Connected:', error));

    app.all("*", (req, res, next) => {
        next(new AppError(`Can't find ${req.originalUrl}`), 404)
    })
    app.use(globalErrorHandling)

module.exports = app;
