import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Form, Button, Row, Col } from 'react-bootstrap';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaCheck, FaChevronRight, FaTimes } from 'react-icons/fa';

import { MdEdit, MdDelete } from 'react-icons/md';
import HrNavbar from '../HrNavbar/HrNavbar';
import EditJobModal from '../EditJobModal/EditJobModal';
import { RxDotFilled } from "react-icons/rx";
import { useNavigate,Link} from 'react-router-dom';
import './HrViewJobs.css';
import { FaMapMarkerAlt, FaMoneyBillWave, FaUserFriends, FaCalendarAlt,FaAngleRight } from 'react-icons/fa';

import { FcExpired } from 'react-icons/fc';

const statusInfo={'jd-received':'JD Received','profiles-sent':'Profiles sent','drive-scheduled':'Drive Scheduled','drive-done':'Drive Done','not-interested':"Not Interested"} 
const HrId="RSHR-02"
const HrViewJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [sortCriteria, setSortCriteria] = useState('');
  const navigate=useNavigate()

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (jobs.length > 0) {
      const filtered = jobs.filter(job =>
        job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.jobRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.phone.includes(searchTerm) ||
        job.jobCity.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredJobs(filtered);
    }
  }, [jobs, searchTerm]);

 

  const formatDate = (date) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
  }


  const fetchJobs = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/hr-view-jobs?hrId=${HrId}`);
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleEdit = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const handleSave = async (updatedJob) => {
    const changedValues = {};
    const originalJob = filteredJobs.find(job => updatedJob.jobId === job.jobId);
    for (let key in updatedJob) {
      if (updatedJob.hasOwnProperty(key) && originalJob.hasOwnProperty(key)) {
        if (updatedJob[key] !== originalJob[key]) {
          changedValues[key] = updatedJob[key];
        }
      }
    }
    try {
      await axios.post("http://localhost:5000/update-job", { changedValues, jobId: updatedJob.jobId });
      toast.success(`Job updated successfully`, { autoClose: 5000 });
      setShowModal(false);
      fetchJobs();
    } catch (error) {
      console.error('There was an error updating the job!', error);
      toast.error(`${error.response.data.error}`, { autoClose: 5000 });
    }
  };

  const handleDelete = async (job) => {
    try {
      console.log(job)
      await axios.delete(`http://localhost:5000/delete-job/${job.jobId}`);
      toast.success("Job deleted successfully!", { autoClose: 5000 });
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error(`There was an error deleting the job ${error}`, { autoClose: 5000 });
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSort = (criteria) => {
    const sortedJobs = [...jobs].sort((a, b) => {
      if (criteria === 'name') {
        return a.jobRole.localeCompare(b.jobRole);
      } else if (criteria === 'date') {
        return new Date(b.postedOn) - new Date(a.postedOn);
      } else if (criteria === 'company') {
        return a.companyName.localeCompare(b.companyName);
      }
      return 0;
    });
    setSortCriteria(criteria);
    setJobs(sortedJobs);
  };
/*
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
*/
console.log(jobs)

const lastDate = new Date("2024-08-27T18:30:00.000Z");
console.log(lastDate)
const currentDate = new Date();
  return (
    <div style={{ overflowY: 'scroll',height:'150vh',paddingBottom:'10px' }}>
      <HrNavbar />
      <Container className="my-4">
        <div className="d-flex flex-row justify-content-between">
          <h1 style={{ color: '#888888', fontWeight: 'bold', fontSize: '25px' }}>Available Jobs</h1>
          
        </div>
        <Form.Control
          type="text"
          placeholder="Search by name, email, or phone"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </Container>

      <Container fluid className="px-0 ml-auto mr-auto mb-5" style={{ width: '95vw', height: "100vh" }}>
        {filteredJobs.length > 0 ? (
          <Row xs={1} sm={1} md={2} lg={3} className="g-4">
            {filteredJobs.map(job => (
              
              <Col key={job.jobId}>
      <div
        className="card h-100"
        style={{
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.19)',
          borderRadius: '10px',
          padding: '5px',
        }}
        onClick={() => window.location.href = `/hr-dashboard/job/${job.jobId}`}

      >
        <div className="card-body">
          <div className="d-flex justify-content-between ">
            <div>
              <h5 className="card-title fw-bold">{job.jobTitle}</h5>
              <p className="card-subtitle mb-2 text-muted">{job.companyName}</p>
            </div>
            {new Date(job.lastDate) < currentDate && <span style={{ fontWeight: '500', color: '#fa3e4b' }}><FcExpired />Applications closed</span>}
            
          </div>

          <div className="mt-3">
            
              <p><FaMapMarkerAlt className="me-2" />Location: <span> {job.Location}</span></p>
              
            
            <div className="d-flex mb-2">
              <FaMoneyBillWave className="me-2" /> <span>CTC: {job.salary}</span>
            </div>
            <div className="d-flex mb-2">
              <FaUserFriends className="me-2" /> <span>Openings: {job.openings}</span>
            </div>
            <div className="d-flex mb-2">
              <FaCalendarAlt className="me-2" /> <span>Apply By: {formatDate(job.lastDate)}</span>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <span
              style={{
                border: '1px solid #fdf3c6',
                borderRadius: '5px',
                padding: '5px',
                fontSize: '12px',
                backgroundColor: '#fdf3c6',
                color: '#943d0e',
                fontWeight: '500',
              }}
            >
              <RxDotFilled /> {statusInfo[job.status]}
            </span>
            <a style={{textDecoration:'none',color:'#53289e',fontWeight:'500'}} href={`/hr-dashboard/job/${job.jobId}`} className="btn btn-link p-0">
              View Details<FaChevronRight className='ms-1'size={15}/>
            </a>
          </div>
        </div>
      </div>
    </Col>
              
            ))}
          </Row>
        ) : (
          <h2 className='text-center text-secondary'>No jobs to display</h2>
        )}
      </Container>
    </div>
  );
};

export default HrViewJobs;
