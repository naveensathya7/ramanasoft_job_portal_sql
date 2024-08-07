// StudentDetails.js
import React, { useEffect, useState } from 'react';
import { Container, Col, Table, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaFilePdf } from 'react-icons/fa';

const CompanyData = () => {
  const { companyID } = useParams();
  const [studentData, setStudentData] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchStudentData();
    fetchAppliedJobs();
  }, [companyID]);

  const fetchStudentData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/company-history/?companyID=${companyID}`);
      setStudentData(response.data);
    } catch (error) {
      console.error('Error fetching student data', error);
      setErrorMsg('No data found for the student.');
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/company-history/${companyID}`);
      setAppliedJobs(response.data);
    } catch (error) {
      console.error('Error fetching applied jobs', error);
      setErrorMsg('No applied jobs found for the student.');
    }
  };

  const handleResumeDownload = (applicationId) => {
    // Handle resume download logic here
    console.log('Download resume for application ID:', applicationId);
  };
  console.log(appliedJobs)
  return (
    <Container className='mt-4'>
      <h2>Student data</h2>
      {studentData ? (
        <Col lg={10} sm={12} xs={12} className='mt-4'>
          <Table responsive bordered className="table">
            <thead style={{backgroundColor:'green'}}>
              <tr style={{backgroundColor:'blue'}}>
                <th style={{backgroundColor:'#1b74a8',color:'white'}}>CompanyID</th>
                <th style={{backgroundColor:'#1b74a8',color:'white'}}>Company Name</th>
                <th style={{backgroundColor:'#1b74a8',color:'white'}}>HR Name</th>
                <th style={{backgroundColor:'#1b74a8',color:'white'}}>Email</th>
                <th style={{backgroundColor:'#1b74a8',color:'white'}}>Phone</th>
                <th style={{backgroundColor:'#1b74a8',color:'white'}}>publishedHr</th>
                <th style={{backgroundColor:'#1b74a8',color:'white'}}>Website</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{studentData.companyID}</td>
                <td>{studentData.companyName}</td>
                <td>{studentData.hrName}</td>
                <td>{studentData.email}</td>
                <td>{studentData.mobileNo}</td>
                <td>{studentData.publishedHr}</td>
                <td>{studentData.website}</td>
              </tr>
            </tbody>
          </Table>
        </Col>
      ) : (
        errorMsg && <Alert variant="danger">{errorMsg}</Alert>
      )}
      <h3>Job Applications</h3>

      {appliedJobs.length > 0 ? (
        <Col lg={10} sm={12} xs={12} className='mt-4'>
          <Table responsive bordered style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ backgroundColor: '#416cb0', color: '#ffffff', border: '1px solid black', padding: '8px' }}>Job ID</th>
                <th style={{ backgroundColor: '#416cb0', color: '#ffffff', border: '1px solid black', padding: '8px' }}>Job Title</th>
                <th style={{ backgroundColor: '#416cb0', color: '#ffffff', border: '1px solid black', padding: '8px' }}>job Qualification</th>
                <th style={{ backgroundColor: '#416cb0', color: '#ffffff', border: '1px solid black', padding: '8px' }}>Status</th>
                <th style={{ backgroundColor: '#416cb0', color: '#ffffff', border: '1px solid black', padding: '8px' }}>Job Description</th>
                <th style={{ backgroundColor: '#416cb0', color: '#ffffff', border: '1px solid black', padding: '8px' }}>Salary</th>
              </tr>
            </thead>
            <tbody>
              {appliedJobs.map(job => (
                <tr key={job.jobId}>
                  <td>{job.jobId}</td>
                  <td>{job.jobTitle}</td>
                  <td>{job.jobQualification}</td>
                  <td>{job.status}</td>
                  <td>{job.jobDescription}</td>
                  <td>{job.salary}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      ) : (
        errorMsg && <Alert variant="danger">{errorMsg}</Alert>
      )}
    </Container>
  );
};

export default CompanyData;
