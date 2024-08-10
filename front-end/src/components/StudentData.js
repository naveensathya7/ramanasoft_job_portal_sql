// StudentDetails.js
import React, { useEffect, useState } from 'react';
import { Container, Col, Table, Alert } from 'react-bootstrap';
import { useParams ,Link} from 'react-router-dom';
import axios from 'axios';
import { FaFilePdf } from 'react-icons/fa';

const StudentDetails = () => {
  const { candidateID } = useParams();
  const [studentData, setStudentData] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchStudentData();
    fetchAppliedJobs();
  }, [candidateID]);
  const HrId='RSHR-02'
  const fetchStudentData = async () => {
    try {
      
      
      const response = await axios.get(`http://localhost:5000/applicant-history/?candidateID=${candidateID}`);
      setStudentData(response.data);
      console.log("Stud",response.data)
      
      
    } catch (error) {
      console.error('Error fetching student data', error);
      setErrorMsg('No data found for the student.');
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/hr-job-applicant-history/?candidateId=${candidateID}&hrId=${HrId}`);
      setAppliedJobs(response.data);
      if(response.data.length>0){
        setErrorMsg('')
      }else{
        setErrorMsg('No job applications found for the student.');
      }
    } catch (error) {
      console.error('Error fetching applied jobs', error);
      setErrorMsg('No applied jobs found for the student.');
    }
  };

  const handleResumeDownload = (applicationId) => {
    // Handle resume download logic here
    console.log('Download resume for application ID:', applicationId);
  };
  console.log(errorMsg,appliedJobs)
  return (
    <Container className='mt-4'>
      <h2>Student data</h2>
      {studentData ? (
        <Col lg={10} sm={12} xs={12} className='mt-4'>
          <Table responsive bordered className="table">
            <thead style={{backgroundColor:'green'}}>
              <tr style={{backgroundColor:'blue'}}>
                <th style={{backgroundColor:'#1b74a8',color:'white'}}>CandidateID</th>
                <th style={{backgroundColor:'#1b74a8',color:'white'}}>Name</th>
                <th style={{backgroundColor:'#1b74a8',color:'white'}}>Email</th>
                <th style={{backgroundColor:'#1b74a8',color:'white'}}>Phone</th>
                <th style={{backgroundColor:'#1b74a8',color:'white'}}>Domain</th>
                <th style={{backgroundColor:'#1b74a8',color:'white'}}>Batch</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{studentData.candidateID}</td>
                <td>{studentData.fullName}</td>
                <td>{studentData.email}</td>
                <td>{studentData.mobileNo}</td>
                <td>{studentData.domain}</td>
                <td>{studentData.batchNo}</td>
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
                <th style={{ backgroundColor: '#416cb0', color: '#ffffff', border: '1px solid black', padding: '8px' }}>Company</th>
                <th style={{ backgroundColor: '#416cb0', color: '#ffffff', border: '1px solid black', padding: '8px' }}>Application Date</th>
                <th style={{ backgroundColor: '#416cb0', color: '#ffffff', border: '1px solid black', padding: '8px' }}>Status</th>
                <th style={{ backgroundColor: '#416cb0', color: '#ffffff', border: '1px solid black', padding: '8px' }}>Resume</th>
              </tr>
            </thead>
            <tbody>
              {appliedJobs.map(job => (
                <tr key={job.jobID}>
                  <td>{job.jobID}</td>
                  <td><Link to={`/hr-dashboard/job/${job.jobID}`}>{job.jobRole}</Link></td>
                  <td>{job.companyName}</td>
                  <td>{job.applicationDate}</td>
                  <td>{job.status}</td>
                  <td
                    style={{ border: '1px solid black', padding: '8px', cursor: 'pointer', backgroundColor:'#ffffff' }}
                    onClick={() => handleResumeDownload(job.applicationId)}
                  >
                    <div className='text-align-center d-flex flex-row justify-content-center'>
                      <FaFilePdf color='#2a97eb' />
                    </div>
                  </td>
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

export default StudentDetails;
