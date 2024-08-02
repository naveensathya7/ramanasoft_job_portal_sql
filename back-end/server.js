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
const ZEPTOMAIL_API_KEY = 'Zoho-enczapikey PHtE6r0EFLjr3jMsp0QAt/+wE8TyN40tr+hmKFMVsIgUXqMFTk0Bqdl6wDPiqU8jXPJHR/ObzN5ttLOe5+ONdGrtZG1NXmqyqK3sx/VYSPOZsbq6x00etFUdcE3aUIbvetFq0ifQvpoolcNA==';

const query = (sql, values) => {
  return new Promise((resolve, reject) => {
    //console.log("In pool",sql,values)
    pool.query(sql, values, (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
};

// Store the last check timestamp
let lastCheckTime = new Date();

const checkInternRequests = async () => {
  try {
    //console.log(`Checked at ${Date()}`)
    // Fetch all rows from intern_requests table that have changed since lastCheckTime
    const [internRequests] = query('SELECT * FROM intern_requests;');
    if (internRequests.length > 0) {
      lastCheckTime = new Date(); // Update the last check time

      // Fetch all intern data
      const [allInterns] = await query('SELECT * FROM intern_requests');
      //console.log(allInterns)
      io.emit('internRequestsUpdate', allInterns);
    }
  } catch (error) {
    console.error('Error fetching intern requests:', error);
  }
};

// Polling every 10 seconds for changes
//setInterval(checkInternRequests, 10000);


const createJob = async(jobDetails) => {
  const jobId = await query('SELECT MAX(jobId) AS id FROM jobs;') 
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
  const jobId = await query('SELECT MAX(requestID) AS id FROM hr_requests;') 
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
        const jobId = await query('SELECT MAX(candidateID) AS id FROM interns;')
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
    const [expiredJobs] = await query('SELECT * FROM jobs WHERE lastDate < ?', [today]);
    for (const job of expiredJobs) {
      await query('INSERT INTO past_jobs SET ?', { ...job, movedOn: today });
      await query('DELETE FROM jobs WHERE jobId = ?', [job.jobId]);
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
    const [result]=await query('UPDATE applied_Students SET status=? WHERE applicationID=?',[status,id])
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
    await query(
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
    const rows = await query('SELECT resume FROM applied_Students WHERE applicationID = ?', [id]);
    
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
    const rows = await query(sql);

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
      [result]=await query('SELECT COUNT(*) as count FROM applied_Students;')

    }
    else{
      [result]=await query(`SELECT COUNT(*) as count FROM applied_Students WHERE status='${status}'`)
    }
    console.log(result.count)

    res.status(200).json(result); // Send back the modified rows
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
    const rows = await query(sql);

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
    const [hrRequestRows] = await query(
      'SELECT * FROM hr_requests WHERE email = ? OR mobileNo = ?',
      [email, mobileNo]
    );

    const [hrRows] = await query(
      'SELECT * FROM hrs WHERE email = ? OR mobileNo = ?',
      [email, mobileNo]
    );

    if (hrRequestRows.length === 0 && hrRows.length === 0) {
      const candId = await createRequestId(req.body);
      const [result] = await query(
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
    const rows = await query(
      'SELECT * FROM hrs WHERE mobileNo = ?',
      [mobileNo]
    );
    console.log(rows)

    if (rows.length > 0) {
      console.log("Entered")
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
  console.log(job)
  try {
     
    // Build the SELECT query to check for duplicates
    const rows = await query(`
      SELECT * FROM jobs WHERE jobRole = ? AND companyName = ? AND Location = ? AND jobCategory = ? AND jobTags = ? 
      AND jobExperience = ? AND jobQualification = ? AND email = ? AND phone = ? AND postedOn = ? AND lastDate = ? 
      AND requirements = ? AND responsibilities = ? AND jobDescription = ? AND salary = ? AND applicationUrl = ? 
      AND requiredSkills = ? AND jobType = ? AND jobTitle = ?`, 
      [
        job.jobRole, job.companyName, job.jobCity, job.jobCategory, job.jobTags,
        job.jobExperience, job.jobQualification, job.email, job.phone, job.postedOn, job.lastDate,
        job.requirements, job.responsibilities, job.jobDescription, job.salary, job.applicationUrl,
        job.requiredSkills, job.jobType, job.jobTitle
      ]);
      /*console.log('INSERT INTO jobs (jobRole,companyName,Location,jobCategory,jobTags, jobExperience,jobQualification,email,phone,postedOn,lastDate, requirements,responsibilities,jobDescription ,salary,applicationUrl ,requiredSkills,jobType,jobTitle) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [
      job.jobRole, job.companyName, job.jobCity, job.jobCategory, job.jobTags,
      job.jobExperience, job.jobQualification, job.email, job.phone, job.postedOn, job.lastDate,
      job.requirements, job.responsibilities, job.jobDescription, job.salary, job.applicationUrl,
      job.requiredSkills, job.jobType, job.jobTitle
    ])*/
    // Check if any record matches
    if (rows.length > 0) {
      return res.status(400).json({ message: 'Duplicate job entry detected, job not posted.' });
    }
    await query('INSERT INTO jobs (jobRole,companyName,Location,jobCategory,jobTags, jobExperience,jobQualification,email,phone,postedOn,lastDate, requirements,responsibilities,jobDescription ,salary,applicationUrl ,requiredSkills,jobType,jobTitle) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [
      job.jobRole, job.companyName, job.jobCity, job.jobCategory, job.jobTags,
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

    const result = await query(
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
        const [user] = await query('SELECT * FROM users ;');
        res.json(user);
      } catch (err) {
        res.status(500).json({ message: 'Server error' });
      }
})
app.get("/users", async (req, res) => {
  try {
    const username = 'naveenvanamoju';
    const [user] = await query('SELECT * FROM users WHERE username = ?', [username]);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get("/intern-requests", async (req, res) => {
  try {
    const intern = await query('SELECT * FROM intern_requests');
    io.emit('internRequestsUpdate', intern);
    res.status(200).json(intern);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/view-jobs", async (req, res) => {
  try {
    const jobs = await query('SELECT * FROM jobs');
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/past-jobs", async (req, res) => {
  try {
    const jobs = await query('SELECT * FROM past_jobs');
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/hr-requests", async (req, res) => {
  try {
    const [hr] = await query('SELECT * FROM hr_requests');
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
    const [existingInterns] = await query('SELECT email, mobileNo FROM interns WHERE email IN (?) OR mobileNo IN (?)', [
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
        await query('INSERT INTO interns (fullName, email, mobileNo, altMobileNo, domain, belongedToVasaviFoundation, address, batchNo, modeOfInternship) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
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
      await query('DELETE FROM intern_requests WHERE email IN (?) OR mobileNo IN (?)', [
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

    const [result] = await query(sql_q, requestIDs);
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
    const [result] = await query(`DELETE FROM jobs WHERE jobId = ${jobId}`);
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
    await query('INSERT INTO intern_requests SET ?', job);
    res.status(201).json({ message: 'Intern created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.post('/admin_login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password') {
      res.json({ success: true });
  } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});



app.get('/quizData/:token', async (req, res) => {
  const token = req.params.token;

  try {
      const [quizData] = await pool.query('SELECT pages_data FROM quiz WHERE token = ?', [token]);
      const [responsesData] = await pool.query('SELECT responses FROM responses WHERE token = ?', [token]);
      const [internData] = await pool.query('SELECT name, email FROM intern_data WHERE id = ?', [req.query.userId]);
      console.log("Quiz Data", quizData);
      if (quizData.length === 0 || responsesData.length === 0 || internData.length === 0) {
          return res.status(404).json({ message: 'Data not found' });
      }

      const pagesData = JSON.parse(quizData[0].pages_data);
      const responses = JSON.parse(responsesData[0].responses);
      const internDetails = internData[0];

      const submissionData = {
          dateSubmitted: responses.dateSubmitted,
          score: responses.score,
          duration: responses.duration,
          quizTitle: responses.quizTitle,
          quizDescription: responses.quizDescription,
          internDetails: internDetails
      };

      res.json({ pagesData, responses: responses.answers, submissionData });
  } catch (error) {
      console.error('Error fetching quiz data:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/intern-login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT id FROM intern_data WHERE mail = ? AND password = ?';
  pool.query(query, [email, password], (err, results) => {
      if (err) {
          console.error('Error checking credentials:', err);
          res.status(500).send('Error checking credentials');
          return;
      }

      if (results.length > 0) {
          const userId = results[0].id;
          res.json({ success: true, userId });
      } else {
          res.json({ success: false });
      }
  });
});

app.post('/update-quiz-status', (req, res) => {
  const { quizId, status } = req.body;
  const query = 'UPDATE quiz_data SET status = ? WHERE token = ?';

  pool.query(query, [status, quizId], (error, results) => {
      if (error) {
          console.error('Error updating quiz status', error);
          return res.status(500).json({ success: false, message: 'Failed to update quiz status' });
      }
      res.json({ success: true, message: 'Quiz status updated successfully' });
  });
});

app.post('/publish-quiz', (req, res) => {
  const { token, link } = req.body;
  const updateQuery = `
    UPDATE quiz_data
    SET status = 'Published', quiz_link = ?
    WHERE token = ?
  `;

  pool.query(updateQuery, [link, token], (err, result) => {
      if (err) {
          console.log('Error updating quiz status:', err);
          res.status(500).send('Error updating quiz status');
          return;
      }
      res.send('Quiz published and status updated');
  });
});

app.post('/assign-quiz-to-domain', (req, res) => {
  const { domain, quizId } = req.body;
  pool.query('SELECT id FROM intern_data WHERE domain = ?', [domain], (err, users) => {
      if (err) throw err;
      const userIds = users.map(user => user.id);
      const values = userIds.map(userId => [userId, quizId]);
      pool.query('INSERT INTO user_quizzes (user_id, quiz_id) VALUES ?', [values], (err, result) => {
          if (err) throw err;
          res.json({ success: true });
      });
  });
});

app.post('/assign-quiz-to-user', (req, res) => {
  const { quizId, userIds } = req.body;
  const values = userIds.map(userId => [userId, quizId]);

  pool.query('INSERT INTO user_quizzes (user_id, quiz_id) VALUES ?', [values], (err, result) => {
      if (err) {
          console.error('Error assigning quiz:', err);
          res.status(500).json({ success: false, message: 'Failed to assign quiz' });
      } else {
          res.json({ success: true, message: 'Quiz assigned successfully' });
      }
  });
});

app.get('/user-quizzes/:userId', (req, res) => {
  const { userId } = req.params;

  // Query to fetch quiz IDs and statuses for the given user
  const quizIdsQuery = `
      SELECT quiz_id, status
      FROM user_quizzes 
      WHERE user_id = ?
  `;
  pool.query(quizIdsQuery, [userId], (err, quizIdResults) => {
      if (err) {
          console.error('Error fetching quiz IDs:', err);
          res.status(500).send('Error fetching quiz IDs');
          return;
      }

      // Extract quiz IDs from results
      const quizIds = quizIdResults.map(row => row.quiz_id);
      const statuses = quizIdResults.reduce((acc, row) => {
          acc[row.quiz_id] = row.status;
          return acc;
      }, {});

      if (quizIds.length === 0) {
          res.json([]);
          return;
      }
      const quizzesQuery = `
          SELECT * 
          FROM quiz_data 
          WHERE token IN (?)
      `;
      pool.query(quizzesQuery, [quizIds], (err, quizzesResults) => {
          if (err) {
              console.error('Error fetching quizzes:', err);
              res.status(500).send('Error fetching quizzes');
              return;
          }

          // Add the status to each quiz object
          const quizzesWithStatus = quizzesResults.map(quiz => ({
              ...quiz,
              status: statuses[quiz.token] || null // Use the status from the earlier query
          }));

          res.json(quizzesWithStatus);
      });
  });
});

app.get('/quiz_data/:token', (req, res) => {
  const { token } = req.params;

  const quizQuery = `
      SELECT 
          uq.quiz_id, 
          uq.user_id, 
          uq.status,
          i.name AS user_name, 
          i.mail AS user_email, 
          i.domain AS user_domain
      FROM user_quizzes uq
      JOIN intern_data i ON uq.user_id = i.id
      WHERE uq.quiz_id = ?
  `;

  pool.query(quizQuery, [token], (err, quizResults) => {
      if (err) {
          console.error('Error fetching quiz data:', err);
          res.status(500).send('Error fetching quiz data');
          return;
      }

      if (quizResults.length === 0) {
          res.status(404).send('Quiz not found');
          return;
      }

      res.json(quizResults);
  });
});

app.post('/submit-quiz', async (req, res) => {
  try {
    const { userId, token, responses, startTime, endTime, duration } = req.body;

    const existingSubmission = await pool.query(
      'SELECT * FROM responses WHERE user_id = ? AND token = ?',
      [userId, token]
    );

    if (existingSubmission.length > 0) {
      return res.status(400).json({ message: 'Quiz already submitted.' });
    }

    await pool.query(
      'INSERT INTO responses (user_id, token, responses, start_time, end_time, duration) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, token, JSON.stringify(responses), startTime, endTime, duration]
    );
    
    res.status(200).json({ message: 'Quiz submitted successfully.' });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: 'Error submitting quiz' });
  }
});



app.post('/submit-response', (req, res) => {
  const { userId, quizId, responses } = req.body;

  const query = 'INSERT INTO response (user_id, quiz_id, question_id, answer) VALUES ?';
  const values = responses.map(response => [userId, quizId, response.questionId, response.answer]);

  pool.query(query, [values], (err, results) => {
      if (err) {
          console.error('Error saving responses:', err);
          res.status(500).send('Error saving responses');
          return;
      }
      res.json({ success: true });
  });
});

// Update quiz status in user_quizzes table
app.put('/update-user-quiz-status/:userId/:quizId', (req, res) => {
  const { userId, quizId } = req.params;
  const query = 'UPDATE user_quizzes SET status = ? WHERE user_id = ? AND quiz_id = ?';
  
  // Set the status to true (or false if that's the desired behavior)
  const status = true;

  pool.query(query, [status, userId, quizId], (error, results) => {
      if (error) {
          console.error('Error updating quiz status:', error);
          res.status(500).json({ error: 'An error occurred while updating the quiz status' });
      } else {
          res.status(200).json({ message: 'Quiz status updated successfully' });
      }
  });
});
app.get('/quiz-responses/:token', (req, res) => {
  const { token } = req.params;

  const query = `
  SELECT 
      q.pages_data,
      r.id AS response_id,
      r.token,
      r.responses,
      r.start_time,
      r.end_time,
      r.duration,
      i.name AS user_name,
      i.mail AS user_email,
      i.domain,
      res.score,
      res.grade
  FROM responses r
  JOIN intern_data i ON r.user_id = i.id
  LEFT JOIN (
      SELECT quiz_token, user_id, score, grade
      FROM results
      WHERE (quiz_token, user_id, id) IN (
          SELECT quiz_token, user_id, MAX(id)
          FROM results
          GROUP BY quiz_token, user_id
      )
  ) res ON r.token = res.quiz_token AND i.id = res.user_id
  JOIN quiz q ON r.token = q.token
  WHERE r.token = ?
  `;

  pool.query(query, [token], (err, results) => {
    if (err) {
      console.error('Error fetching quiz responses:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'No responses found for this quiz' });
    }

    const formattedResults = results.map(row => ({
      pages_data: JSON.parse(row.pages_data),
      user_name: row.user_name,
      user_email: row.user_email,
      domain: row.domain,
      start_time: row.start_time,
      end_time: row.end_time,
      duration: row.duration,
      score: row.score,
      grade: row.grade,
      responses: JSON.parse(row.responses)
    }));
    
    res.json({
      token: token,
      responses: formattedResults,
      pages_data: JSON.parse(results[0].pages_data) 
    });
  });
});


app.post('/addFolder', (req, res) => {
  const { folder } = req.body;
  const query = 'INSERT INTO quiz_data (folder_name) VALUES (?)';
  pool.query(query, [folder], (err, result) => {
      if (err) {
          console.error('Error adding folder:', err);
          res.status(500).send('Failed to add folder');
          return;
      }
      res.status(200).send('Folder added successfully');
  });
});

app.post('/addSubfolder', (req, res) => {
  const { folder, subfolder } = req.body;
  const query = 'INSERT INTO quiz_data (folder_name, subfolder_name) VALUES (?, ?)';
  pool.query(query, [folder, subfolder], (err, result) => {
      if (err) {
          console.error('Error adding subfolder:', err);
          res.status(500).send('Failed to add subfolder');
          return;
      }
      res.status(200).send('Subfolder added successfully');
  });
});

app.post('/addQuiz', (req, res) => {
  const { folder, subfolder, quiz, type, token } = req.body;
  const query = 'INSERT INTO quiz_data (folder_name, subfolder_name, quiz_name, quiz_type, token) VALUES (?, ?, ?, ?, ?)';
  pool.query(query, [folder, subfolder, quiz, type, token], (err, result) => {
      if (err) {
          console.error('Error adding quiz:', err);
          res.status(500).send('Failed to add quiz');
          return;
      }
      res.status(200).send('Quiz added successfully');
  });
});

app.get('/getData', (req, res) => {
  const query = 'SELECT * FROM quiz_data';
  pool.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching data:', err);
          res.status(500).send('Failed to fetch data');
          return;
      }
      res.status(200).json(results);
  });
});

app.get('/get-quiz/:token', (req, res) => {
  const { token } = req.params;
  const query = 'SELECT * FROM quiz WHERE token = ?';
  pool.query(query, [token], (err, results) => {
      if (err) {
          console.error('Error fetching quiz:', err);
          res.status(500).send('Failed to fetch quiz');
          return;
      }
      if (results.length === 0) {
          res.status(404).send('Quiz not found');
          return;
      }
      res.status(200).json(results[0]);
  });
});


app.get('/calculate-results/:quizToken/:userId', (req, res) => {
  const { quizToken, userId } = req.params;

  const correctAnswersQuery = `
      SELECT pages_data 
      FROM quiz 
      WHERE token = ?
  `;

  const studentResponsesQuery = `
      SELECT responses 
      FROM responses 
      WHERE token = ? AND user_id = ?
  `;

  const existingResultQuery = `
      SELECT * 
      FROM results 
      WHERE user_id = ? AND quiz_token = ?
  `;

  const insertResultQuery = `
      INSERT INTO results (user_id, quiz_token, score, grade)
      VALUES (?, ?, ?, ?)
  `;

  const updateResultQuery = `
      UPDATE results 
      SET score = ?, grade = ?
      WHERE user_id = ? AND quiz_token = ?
  `;

  pool.query(correctAnswersQuery, [quizToken], (err, result) => {
      if (err) throw err;

      const correctAnswers = JSON.parse(result[0].pages_data);
      pool.query(studentResponsesQuery, [quizToken, userId], (err, result) => {
          if (err) throw err;

          const studentResponses = JSON.parse(result[0].responses);
          let score = 0;
          let totalQuestions = 0;

          correctAnswers.forEach(page => {
              page.question_list.forEach(question => {
                  totalQuestions += 1;
                  const studentResponse = studentResponses.find(response => response.questionText === question.question_text);
                  if (studentResponse && studentResponse.answer === question.correct_answer) {
                      score += 1;
                  }
              });
          });

          const percentage = (score / totalQuestions) * 100;

          let grade;
          if (percentage >= 90) {
              grade = 'A';
          } else if (percentage >= 80) {
              grade = 'B';
          } else if (percentage >= 70) {
              grade = 'C';
          } else if (percentage >= 60) {
              grade = 'D';
          } else {
              grade = 'F';
          }

          pool.query(existingResultQuery, [userId, quizToken], (err, result) => {
              if (err) throw err;

              if (result.length > 0) {
                  // Update existing result
                  pool.query(updateResultQuery, [score, grade, userId, quizToken], (err) => {
                      if (err) throw err;
                      res.json({ score, grade });
                  });
              } else {
                  // Insert new result
                  pool.query(insertResultQuery, [userId, quizToken, score, grade], (err) => {
                      if (err) throw err;
                      res.json({ score, grade });
                  });
              }
          });
      });
  });
});

app.get('/quiz-analysis/:userId/:quizToken', (req, res) => {
  const { userId, quizToken } = req.params;

  const analysisQuery = `
      SELECT responses.responses, responses.start_time, responses.end_time, responses.duration, results.score, results.grade, quiz.pages_data
      FROM responses
      INNER JOIN results ON responses.user_id = results.user_id AND responses.token = results.quiz_token
      INNER JOIN quiz ON responses.token = quiz.token
      WHERE responses.user_id = ? AND responses.token = ?
  `;

  pool.query(analysisQuery, [userId, quizToken], (err, results) => {
      if (err) {
          console.error('Error fetching quiz analysis:', err);
          return res.status(500).json({ error: 'An error occurred while fetching quiz analysis' });
      }

      if (results.length === 0) {
          return res.status(404).json({ error: 'Analysis not found' });
      }

      const responseData = results[0];
      let responses, pagesData;
      try {
          responses = JSON.parse(responseData.responses);
          pagesData = responseData.pages_data ? JSON.parse(responseData.pages_data) : [];
      } catch (parseError) {
          console.error('Error parsing JSON data:', parseError);
          return res.status(500).json({ error: 'Error parsing quiz data' });
      }
      if (!Array.isArray(pagesData) || pagesData.length === 0) {
          console.error('pagesData is not in the expected format');
          return res.status(500).json({ error: 'Invalid quiz data structure' });
      }

      const flattenedQuestions = pagesData.flatMap(page => page.question_list || []);

      responses.forEach(response => {
          const matchingQuestion = flattenedQuestions.find(question => 
              question && question.question_text.trim() === response.questionText.trim()
          );
          
          if (matchingQuestion) {
              response.correct_answer = matchingQuestion.correct_answer;
              response.is_correct = response.answer === matchingQuestion.correct_answer;
          } else {
              console.warn(`No matching question found for: "${response.questionText}"`);
              response.correct_answer = 'Not found';
              response.is_correct = false;
          }
      });

      res.json({
          responses,
          start_time: responseData.start_time,
          end_time: responseData.end_time,
          duration: responseData.duration,
          score: responseData.score,
          grade: responseData.grade
      });
  });
});

app.post('/save-questions', (req, res) => {
  const { token, no_of_pages, pages_data } = req.body;
  if (!token || !no_of_pages || !pages_data) {
      return res.status(400).send('Missing required fields');
  }

  const checkQuery = 'SELECT COUNT(*) AS count FROM quiz WHERE token = ?';
  pool.query(checkQuery, [token], (err, result) => {
      if (err) {
          console.error('Error checking token existence:', err);
          return res.status(500).send('Error checking token existence');
      }

      const rowExists = result[0].count > 0;

      if (rowExists) {
          const updateQuery = 'UPDATE quiz SET no_of_pages = ?, pages_data = ? WHERE token = ?';
          pool.query(updateQuery, [no_of_pages, pages_data, token], (err, result) => {
              if (err) {
                  console.error('Error updating questions:', err);
                  return res.status(500).send('Error updating questions');
              }
              res.status(200).send('Questions updated successfully');
          });
      } else {
          const insertQuery = 'INSERT INTO quiz (token, no_of_pages, pages_data) VALUES (?, ?, ?)';
          pool.query(insertQuery, [token, no_of_pages, pages_data], (err, result) => {
              if (err) {
                  console.error('Error inserting questions:', err);
                  return res.status(500).send('Error inserting questions');
              }
              res.status(200).send('Questions added successfully');
          });
      }
  });
});

app.get('/grades', (req, res) => {
  const query = 'SELECT * FROM grades';
  pool.query(query, (err, results) => {
      if (err) throw err;
      res.json(results);
  });
});

app.post('/upload-data', (req, res) => {
  const { token, no_of_pages, pages_data } = req.body;

  const query = 'INSERT INTO quiz (token, no_of_pages, pages_data) VALUES (?, ?, ?)';
  const params = { token, no_of_pages, pages_data };

  pool.query(query, params, (err, result) => {
      if (err) {
          return res.status(500).send(err);
      }
      res.status(200).send('Bulk questions uploaded successfully');
  });
});

const validateToken = (token) => {
  return new Promise((resolve, reject) => {
      const query = 'SELECT 1 FROM quiz WHERE token = ?';
      pool.query(query, [token], (err, results) => {
          if (err) return reject(err);
          resolve(results.length > 0);
      });
  });
};

app.get('/quiz-options/:token', async (req, res) => {
  const { token } = req.params;
  try {
      const query = 'SELECT * FROM quiz WHERE token = ?';
      pool.query(query, [token], (err, results) => {
          if (err) {
              console.error('Error fetching quiz options:', err);
              return res.status(500).json({ error: 'Error fetching quiz options' });
          }
          if (results.length > 0) {
              const quizOptions = {
                  timeLimit: results[0].time_limit || '',
                  scheduleQuizFrom: results[0].schedule_quiz_from || '',
                  scheduleQuizTo: results[0].schedule_quiz_to || '',
                  qns_per_page: results[0].no_of_qns_per_page || '',
                  randomizeQuestions: results[0].randomize_questions || false,
                  confirmBeforeSubmission: results[0].confirm_before_submission || false,
                  showResultsAfterSubmission: results[0].show_results_after_submission || false,
                  showAnswersAfterSubmission: results[0].show_answers_after_submission || false,
              };
              return res.status(200).json(quizOptions);
          } else {
              return res.status(200).json({});
          }
      });
  } catch (error) {
      console.error('Error fetching quiz options:', error);
      res.status(500).json({ error: 'Error fetching quiz options' });
  }
});


app.post('/quiz-options', async (req, res) => {
  const {
      token,
      timeLimit,
      scheduleQuizFrom,
      scheduleQuizTo,
      qns_per_page,
      randomizeQuestions,
      confirmBeforeSubmission,
      showResultsAfterSubmission,
      showAnswersAfterSubmission,
  } = req.body;

  try {
      const tokenExists = await validateToken(token);

      const query = tokenExists
          ? `UPDATE quiz SET
              time_limit = ?, schedule_quiz_from = ?, schedule_quiz_to = ?, no_of_qns_per_page = ?,
              randomize_questions = ?, confirm_before_submission = ?, show_results_after_submission = ?, show_answers_after_submission = ?
              WHERE token = ?`
          : `INSERT INTO quiz (
              token, time_limit, schedule_quiz_from, schedule_quiz_to, no_of_qns_per_page,
              randomize_questions, confirm_before_submission, show_results_after_submission, show_answers_after_submission
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const values = tokenExists
          ? [timeLimit, scheduleQuizFrom, scheduleQuizTo, qns_per_page, randomizeQuestions, confirmBeforeSubmission, showResultsAfterSubmission, showAnswersAfterSubmission, token]
          : [token, timeLimit, scheduleQuizFrom, scheduleQuizTo, qns_per_page, randomizeQuestions, confirmBeforeSubmission, showResultsAfterSubmission, showAnswersAfterSubmission];

      pool.query(query, values, (err, results) => {
          if (err) {
              console.error(`Error ${tokenExists ? 'updating' : 'inserting'} quiz options:`, err);
              return res.status(500).json({ error: `Error ${tokenExists ? 'updating' : 'inserting'} quiz options` });
          }
          res.status(200).json({ message: `Quiz options ${tokenExists ? 'updated' : 'saved'} successfully` });
      });
  } catch (error) {
      console.error('Error validating token:', error);
      res.status(500).json({ error: 'Error validating token' });
  }
});

app.get('/getAllData', async(req, res) => {
  const query = 'SELECT * FROM quiz_data';
  await pool.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching data:', err);
          res.status(500).send('Failed to fetch data');
          return;
      }
      res.status(200).json(results);
  });
});

app.put('/renameQuiz', (req, res) => {
  const { token } = req.params;
  const { newName } = req.body;
  const query = 'UPDATE quiz_data SET quiz_name = ? WHERE token = ?';
  pool.query(query, [newName, token], (err, result) => {
      if (err) {
          console.error('Error renaming quiz:', err);
          res.status(500).send('Failed to rename quiz');
          return;
      }
      res.status(200).send('Quiz renamed successfully');
  });
});

app.delete('/deleteQuiz/:token', (req, res) => {
  const { token } = req.params;
  const query = 'DELETE FROM quiz_data WHERE token = ?';
  pool.query(query, [token], (err, result) => {
      if (err) {
          console.error('Error deleting quiz:', err);
          res.status(500).send('Failed to delete quiz');
          return;
      }
      res.status(200).send('Quiz deleted successfully');
  });
});

app.get('/domains', (req, res) => {
  const query = 'SELECT DISTINCT domain FROM intern_data';
  pool.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching domains:', err);
          res.status(500).send('Error fetching domains');
          return;
      }
      res.status(200).json(results);
  });
});

app.get('/interns', (req, res) => {
  const query = 'SELECT id, name, mail, domain FROM intern_data';
  pool.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching interns:', err);
          res.status(500).send('Error fetching interns');
          return;
      }
      res.json(results);
  });
});


app.get('/interns/:id', (req, res) => {
  const query = 'SELECT id, name, mail, domain FROM intern_data WHERE id = ?';
  pool.query(query, [req.params.id], (err, results) => {
      if (err) {
          console.error('Error fetching intern:', err);
          res.status(500).send('Error fetching intern data');
          return;
      }
      if (results.length === 0) {
          res.status(404).send('Intern not found');
          return;
      }
      res.json(results[0]);
  });
});

app.get('/submissions', (req, res) => {
  const query = 'SELECT * FROM intern_data ORDER BY domain';
  pool.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching data:', err);
          res.status(500).send('Error fetching data');
          return;
      }
      res.status(200).json(results);
  });
});