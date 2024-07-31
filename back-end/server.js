const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const env = require('dotenv');
const bcrypt = require("bcrypt");
const axios = require('axios');
const cron = require("node-cron");
const crypto = require('crypto');
const http = require('http');
const multer=require('multer')
const socketIo = require('socket.io');
const pool = require('./db'); // Import the MySQL pool
const { validationResult } = require('express-validator');
const app = express();

env.config();
const PORT = process.env.PORT || 5000;
const upload = multer({ storage: multer.memoryStorage() }); 
app.use(bodyParser.json());
app.use(cors());
var server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
var io = require('socket.io')(server, { cors: { origin: '*' } });

const ZEPTOMAIL_API_URL = 'https://api.zeptomail.in/v1.1/email';
const ZEPTOMAIL_API_KEY = 'Zoho-enczapikey PHtE6r0EFLjr3jMsp0QAt/+wE8TyN40tr+hmKFMVsIgUXqMFTk0Bqdl6wDPiqU8jXPJHR/ObzN5ttLOe5+ONdGrtZG1NXmqyqK3sx/VYSPOZsbq6x00etFUdcE3aUIbvetFq0ifQvdbcNA==';


// Store the last check timestamp
let lastCheckTime = new Date();

const checkInternRequests = async () => {
  try {
    //console.log(`Checked at ${Date()}`)
    // Fetch all rows from intern_requests table that have changed since lastCheckTime
    const [internRequests] = await pool.query('SELECT * FROM intern_requests;');
    if (internRequests.length > 0) {
      lastCheckTime = new Date(); // Update the last check time

      // Fetch all intern data
      const [allInterns] = await pool.query('SELECT * FROM intern_requests');
      //console.log(allInterns)
      io.emit('internRequestsUpdate', allInterns);
    }
  } catch (error) {
    console.error('Error fetching intern requests:', error);
  }
};

// Polling every 10 seconds for changes
setInterval(checkInternRequests, 10000);


const createJob = async(jobDetails) => {
  const jobId = await pool.query('SELECT MAX(jobId) AS id FROM jobs;') 
  console.log(jobId[0][0].id)
  let createdId=0
  if(jobId[0][0].id===null){
    createdId=1
  }
  else{
    createdId=jobId[0][0].id+1
  }
  console.log(createdId)
  // Generate a unique job 
  return {
    ...jobDetails,
    jobId:createdId, // Add the job ID to the job details
  };
};
const createRequestId = async(jobDetails) => {
  const jobId = await pool.query('SELECT MAX(requestID) AS id FROM hr_requests;') 
  console.log(jobId[0][0].id)
  let createdId=0
  if(jobId[0][0].id===null){
    createdId=1
  }
  else{
    createdId=jobId[0][0].id+1
  }
  console.log(createdId)
  // Generate a unique job 
  return {
    ...jobDetails,
    requestID:createdId, // Add the job ID to the job details
  };
};

const generateStudentId = async () => {
        const jobId = await pool.query('SELECT MAX(candidateID) AS id FROM interns;')
        console.log(jobId)
        let createdId=0
        if(jobId[0][0].id===null){
          createdId=1
        }
        else{
          createdId=jobId[0][0].id+1
        }
        //const count = rows[0].count;
        //console.log(rows)
       // console.log(count)
        //const idNumber = await(createdId).toString().padStart(3, '0');
        //console.log(idNumber)
        return `RS${createdId}`;
  
};

// Email sending function
const SendEmail = async (email) => {
  const emailBody = {
    "from": { "address": "support@qtnext.com", "name": "Support" },
    "to": [{ "email_address": { "address": `${email}`  }}],
    "subject": "Account registration successful",
    "htmlbody": `<div><b> Your registration is successfully completed, Please login your account <a href="http://localhost:3000/login">here</a></b></div>`
  };
  try {
    const response = await axios.post(ZEPTOMAIL_API_URL, emailBody, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': ZEPTOMAIL_API_KEY
      }
    });
    console.log("Email sent");
  } catch (error) {
    console.log("Error sending email", error);
  }
};

const moveExpiredJobs = async () => {
  try {
    const today = new Date();
    console.log("Cron runned");
    const [expiredJobs] = await pool.query('SELECT * FROM jobs WHERE lastDate < ?', [today]);
    for (const job of expiredJobs) {
      await pool.query('INSERT INTO past_jobs SET ?', { ...job, movedOn: today });
      await pool.query('DELETE FROM jobs WHERE jobId = ?', [job.jobId]);
    }
    console.log(`${expiredJobs.length} jobs moved to PastJobs collection.`);
  } catch (error) {
    console.error('Error moving expired jobs:', error);
  }
};

cron.schedule('59 10 * * *', moveExpiredJobs);
app.put("/applications/:id/status",async(req,res)=>{
  const{status}=req.body
  const{id}=req.params
  console.log(status,id)
  try{
    const [result]=await pool.query('UPDATE applied_Students SET status=? WHERE applicationID=?',[status,id])
    console.log(result)
    res.status(200).json({message:"Status Changed Successfully"})
  }catch(err){
    console.error(err)
    res.status(500).json({message:"Server Error"})
  }
})
app.post('/apply', upload.single('resume'), async (req, res) => {
  const { fullName,jobRole, email,companyName, technology, mobileNo, gender, passedOut, experience, status } = req.body;
  //console.log(req.body)
  const resume = req.file ? req.file.buffer : null; // Get the file buffer
  console.log(resume)
  try {
    
    // Insert application into the database
    await pool.query(
      'INSERT INTO applied_Students (fullName,jobRole, email,companyName, technology, mobileNo, gender, passedOut, experience, status, resume) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)',
      [fullName,jobRole, email,companyName, technology, mobileNo, gender, passedOut, experience, status, resume]
    );
    res.status(200).json({ message: 'Application submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.get('/download-resume/:id', async (req, res) => {
  const { id } = req.params;
  console.log(req.params) // Assuming the ID is passed as a URL parameter
  console.log(id)
  try {
    // Fetch the resume from the database
    const [rows] = await pool.query('SELECT resume FROM applied_Students WHERE applicationID = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const resume = rows[0].resume;
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Set the appropriate headers for the PDF file
    res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
    
    // Send the resume as a file
    res.send(resume);
  } catch (err) {
    console.error('Error fetching resume:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.get('/applications', async (req, res) => {
  //console.log("got  here")
  const sql = 'SELECT * FROM applied_Students';

  try {
    const [rows] = await pool.execute(sql);

    // Encode binary data to base64
    const response = rows.map(row => ({
      ...row,
      resume: row.resume ? row.resume.toString('base64') : null
    }));

    res.status(200).json(response); // Send back the modified rows
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.get('/statistics/:status',async(req,res)=>{
  const {status}=req.params
  try{
    let  result;
    if(status==='applied'){
      [result]=await pool.execute('SELECT COUNT(*) as count FROM applied_Students;')

    }
    else{
      [result]=await pool.execute(`SELECT COUNT(*) as count FROM applied_Students WHERE status='${status}'`)
    }
    console.log(result)

    res.status(200).json(result[0]); // Send back the modified rows
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
})

app.get('/applications/:status', async (req, res) => {
  const{status}=req.params
  console.log("got  here")
  const sql = `SELECT * FROM applied_Students WHERE status="${status}"`;

  try {
    const [rows] = await pool.execute(sql);

    // Encode binary data to base64
    const response = rows.map(row => ({
      ...row,
      resume: row.resume ? row.resume.toString('base64') : null
    }));

    res.status(200).json(response); // Send back the modified rows
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

//HR registration
app.post("/signup-hr", async (req, res) => {
  const { fullName, email, mobileNo } = req.body;
  const errors = validationResult(req);
  
  console.log(req.body);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const [hrRequestRows] = await pool.execute(
      'SELECT * FROM hr_requests WHERE email = ? OR mobileNo = ?',
      [email, mobileNo]
    );

    const [hrRows] = await pool.execute(
      'SELECT * FROM hrs WHERE email = ? OR mobileNo = ?',
      [email, mobileNo]
    );

    if (hrRequestRows.length === 0 && hrRows.length === 0) {
      const candId = await createRequestId(req.body);
      const [result] = await pool.execute(
        'INSERT INTO hr_requests (requestID,fullName, email, mobileNo) VALUES (?,?, ?, ?)',
        [candId.requestID,fullName, email, mobileNo]
      );

      res.status(201).json({ message: 'HR registration request submitted' });
    } else {
      if (hrRows.length > 0) {
        res.status(400).json({ message: 'HR already registered, please login' });
      } else {
        res.status(400).json({ message: 'HR registration request already exists' });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});
//LOGIN API for HR
app.post("/login-hr", async (req, res) => {
  const { mobileNo } = req.body;
  const errors = validationResult(req);
  console.log(req.body);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM hrs WHERE mobileNo = ?',
      [mobileNo]
    );

    if (rows.length > 0) {
      res.status(200).json({ record: rows[0], message: 'Please Login' });
    } else {
      res.status(400).json({ error: 'HR not found, please register' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.post("/post-job", async (req, res) => {
  const {job} = req.body
  console.log(req.body)
  try {
     
    // Build the SELECT query to check for duplicates
    const [rows] = await pool.query(`
      SELECT * FROM jobs WHERE jobRole = ? AND companyName = ? AND Location = ? AND jobCategory = ? AND jobTags = ? 
      AND jobExperience = ? AND jobQualification = ? AND email = ? AND phone = ? AND postedOn = ? AND lastDate = ? 
      AND requirements = ? AND responsibilities = ? AND jobDescription = ? AND salary = ? AND applicationUrl = ? 
      AND requiredSkills = ? AND jobType = ? AND jobTitle = ?`, 
      [
        job.jobRole, job.companyName, job.Location, job.jobCategory, job.jobTags,
        job.jobExperience, job.jobQualification, job.email, job.phone, job.postedOn, job.lastDate,
        job.requirements, job.responsibilities, job.jobDescription, job.salary, job.applicationUrl,
        job.requiredSkills, job.jobType, job.jobTitle
      ]);
      console.log('INSERT INTO jobs (jobRole,companyName,Location,jobCategory,jobTags, jobExperience,jobQualification,email,phone,postedOn,lastDate, requirements,responsibilities,jobDescription ,salary,applicationUrl ,requiredSkills,jobType,jobTitle) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [
      job.jobRole, job.companyName, job.jobCity, job.jobCategory, job.jobTags,
      job.jobExperience, job.jobQualification, job.email, job.phone, job.postedOn, job.lastDate,
      job.requirements, job.responsibilities, job.jobDescription, job.salary, job.applicationUrl,
      job.requiredSkills, job.jobType, job.jobTitle
    ])
    // Check if any record matches
    if (rows.length > 0) {
      return res.status(400).json({ message: 'Duplicate job entry detected, job not posted.' });
    }
    await pool.query('INSERT INTO jobs (jobRole,companyName,Location,jobCategory,jobTags, jobExperience,jobQualification,email,phone,postedOn,lastDate, requirements,responsibilities,jobDescription ,salary,applicationUrl ,requiredSkills,jobType,jobTitle) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [
      job.jobRole, job.companyName, job.Location, job.jobCategory, job.jobTags,
      job.jobExperience, job.jobQualification, job.email, job.phone, job.postedOn, job.lastDate,
      job.requirements, job.responsibilities, job.jobDescription, job.salary, job.applicationUrl,
      job.requiredSkills, job.jobType, job.jobTitle
    ]);
    res.status(201).json({ message: 'Job posted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

//Updating existing posted job data
app.post("/update-job", async (req, res) => {
  const { jobId, changedValues } = req.body;
  console.log("req:", req.body);

  try {
    // Build the SET part of the SQL query dynamically
    const setPart = Object.keys(changedValues)
      .map(key => `${key} = ?`)
      .join(", ");

    const values = [...Object.values(changedValues), jobId];

    const [result] = await pool.query(
      `UPDATE jobs SET ${setPart} WHERE jobId = ?`,
      values
    );

    if (result.affectedRows === 1) {
      return res.status(200).json({ message: 'Job updated successfully' });
    } else {
      return res.status(400).json({ error: "Job not updated" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


app.post('/send-email', async (req, res) => {
  const { email, otp } = req.body;
  console.log(otp)
  const emailBody = {
    "from": { "address": "support@qtnext.com", "name": "Support" },
    "to": [{ "email_address": { "address": `${email}` } }],
    "subject": "Account Confirmation",
    "htmlbody": `<div><b> You otp for email verification is ${otp}</b></div>`
  };
  try {
    const response = await axios.post(ZEPTOMAIL_API_URL, emailBody, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': ZEPTOMAIL_API_KEY
      }
    });
    res.status(response.status).send(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).send(error.message);
  }
});
app.get("/fullinfo",async(req,res)=>{
    try {
       // const username = 'naveenvanamoju';
        const [user] = await pool.query('SELECT * FROM users ;');
        res.json(user);
      } catch (err) {
        res.status(500).json({ message: 'Server error' });
      }
})
app.get("/users", async (req, res) => {
  try {
    const username = 'naveenvanamoju';
    const [user] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get("/intern-requests", async (req, res) => {
  try {
    const [intern] = await pool.query('SELECT * FROM intern_requests');
    io.emit('internRequestsUpdate', intern);
    res.status(200).json(intern);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/view-jobs", async (req, res) => {
  try {
    const [jobs] = await pool.query('SELECT * FROM jobs');
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/past-jobs", async (req, res) => {
  try {
    const [jobs] = await pool.query('SELECT * FROM past_jobs');
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/hr-requests", async (req, res) => {
  try {
    const [hr] = await pool.query('SELECT * FROM hr_requests');
    res.status(200).json(hr);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/accept-interns", async (req, res) => {
  const interns = req.body;
  console.log(interns);
  const acceptedInterns = [];
  const rejectedInterns = [];

  try {
    // Fetch existing interns' emails and mobile numbers
    const [existingInterns] = await pool.query('SELECT email, mobileNo FROM interns WHERE email IN (?) OR mobileNo IN (?)', [
      interns.map(intern => intern.email),
      interns.map(intern => intern.mobileNo)
    ]);

    const existingEmails = new Set(existingInterns.map(intern => intern.email));
    const existingPhones = new Set(existingInterns.map(intern => intern.mobileNo));

    for (const intern of interns) {
      if (existingEmails.has(intern.email) || existingPhones.has(intern.mobileNo)) {
        rejectedInterns.push(intern);
        console.log("rejected:", rejectedInterns);
      } else {
        await pool.query('INSERT INTO interns (fullName, email, mobileNo, altMobileNo, domain, belongedToVasaviFoundation, address, batchNo, modeOfInternship) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
          intern.fullName,
          intern.email,
          intern.mobileNo,
          intern.altMobileNo,
          intern.domain,
          intern.belongedToVasaviFoundation,
          intern.address,
          intern.batchNo,
          intern.modeOfInternship
        ]);
        acceptedInterns.push(intern);
      }
    }

    // Combine both accepted and rejected interns to delete them from intern_requests
    const processedInterns = [...acceptedInterns, ...rejectedInterns];

    if (processedInterns.length > 0) {
      await pool.query('DELETE FROM intern_requests WHERE email IN (?) OR mobileNo IN (?)', [
        processedInterns.map(intern => intern.email),
        processedInterns.map(intern => intern.mobileNo)
      ]);
    }
    const emailPromises = acceptedInterns.map(intern => SendEmail(intern.email));
    await Promise.all(emailPromises);


    res.status(200).json({ accepted: acceptedInterns, rejected: rejectedInterns });
  } catch (error) {
    console.error('Error processing interns:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




app.post("/reject-interns", async (req, res) => {
  const candidates = req.body;
  console.log('Received candidates:', candidates);

  // Extract requestIDs from candidates and ensure there are no undefined values
  const requestIDs = candidates.map(candidate => candidate.requestID).filter(id => id != null);

  if (requestIDs.length === 0) {
    return res.status(400).json({ message: 'No valid candidates provided' });
  }

  // Prepare placeholders for SQL query
  const placeholders = requestIDs.map(() => '?').join(',');
  const sql_q = `DELETE FROM intern_requests WHERE requestID IN (${placeholders})`;

  try {
    // Log query and parameters for debugging
    console.log('SQL Query:', sql_q);
    console.log('Parameters:', requestIDs);

    const [result] = await pool.execute(sql_q, requestIDs);
    console.log('Query result:', result);

    if (result.affectedRows === requestIDs.length) {
      res.status(200).json({ message: 'All interns rejected successfully' });
    } else if (result.affectedRows > 0) {
      res.status(200).json({ message: `Rejected ${result.affectedRows} out of ${requestIDs.length} interns` });
    } else {
      res.status(500).json({ message: 'No documents matched the query' });
    }
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});








app.delete('/delete-job/:jobId', async (req, res) => {
  const{jobId}=req.params
  console.log("ON api")
  console.log(jobId)
  
  try {
    const [result] = await pool.query(`DELETE FROM jobs WHERE jobId = ${jobId}`);
    console.log(result)
    if (result.affectedRows === 1) {
      res.status(201).json({ message: 'Job deleted successfully' });
    } else {
      res.status(500).json({ message: "No documents matched the query" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.post("/save-interns", async (req, res) => {
  const jobId = req.body.jobId;
  const job = req.body;
  try {
    await pool.query('INSERT INTO intern_requests SET ?', job);
    res.status(201).json({ message: 'Intern created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});



module.exports = app;
