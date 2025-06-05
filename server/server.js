const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload());

//Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/files', require('./routes/files'));
//app.use('/api/charts', require('./routes/charts'));

// Connect to DataBase
mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("Mongo Error:",err));

//Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));