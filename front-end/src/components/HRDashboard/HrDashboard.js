import React, { useMemo,useEffect, useState } from 'react';
import { useNavigate,useLocation,Link } from 'react-router-dom';
import { Card, Button, Container, Row, Col,Table,Form,Dropdown,DropdownButton } from 'react-bootstrap';

import { IoPersonAddSharp } from "react-icons/io5";
import { FaChevronCircleRight, FaCheck, FaTimes, FaUserTie,FaSearch,FaFilePdf} from "react-icons/fa";
import { useTable, useSortBy, useGlobalFilter, usePagination } from 'react-table';

import HrNavbar from '../HrNavbar/HrNavbar';
import axios from 'axios';
import './HrDashboard.css';
//import { isTransparent } from 'html2canvas/dist/types/css/types/color';
const filteredCandidates=[{_id:'587345874',fullName:'Naveen',email:'naveensathya.vanamoju@gmail.com',mobileNo:'9515982621',batchNo:'08',domain:'MERN stack'}]
//const filteredCandidates=[]

const HrId="RSHR-02"
const HrPortal = () => {

  const location = useLocation();
  
  const HrId="RSHR-02"
  const [statistics, setStatistics] = useState([
    { title: 'Total Students Applied', value: 0, link: '/hr-dashboard/students-applied', color: '#37a6b8', element: IoPersonAddSharp },
    { title: 'Total Students Qualified', value: 0, link: '/hr-dashboard/students/qualified', color: '#e8c93f', element: FaCheck },
    { title: 'Total Students Placed', value: 0, link: '/hr-dashboard/students/placed', color: '#21bf40', element: FaUserTie },
    { title: 'Total Students Not Placed', value: 0, link: '/hr-dashboard/students/not-placed', color: '#f73643', element: FaTimes },
    { title: 'Total Students Not Attended', value: 0, link: '/hr-dashboard/students/not-attended', color: '#838485', element: IoPersonAddSharp },
    { title: 'Total Students Not Interested', value: 0, link: '/hr-dashboard/students/not-interested', color: '#21bf40', element: FaCheck },
    { title: 'Not Eligible', value: 0, link: '/hr-dashboard/students/not-eligible', color: '#3377f5', element: FaUserTie },
    { title: 'Eligible/ Profile Sent', value: 0, link: '/hr-dashboard/students/eligible', color: '#49494a', element: FaTimes }
  ]);

  const [hrStatistics, setHrStatistics] = useState([
    { title: 'Hr Leads', value: 0, link: '/hr-dashboard/hr-leads', color: '#37a6b8', element: IoPersonAddSharp },
    { title: 'JD received', value: 0, link: '/hr-dashboard/jd-received', color: '#e8c93f', element: FaCheck },
    { title: 'Profiles  Sent', value: 0, link: '/hr-dashboard/companies/profiles-sent', color: '#21bf40', element: FaUserTie },
    { title: 'Drive Scheduled', value: 0, link: '/hr-dashboard/companies/drive-scheduled', color: '#f73643', element: FaTimes },
    
    { title: 'Drive Done/Offer received', value: 0, link: '/hr-dashboard/companies/drive-done', color: '#21bf40', element: FaCheck },
    {title:'Not interested HRs',value:0,link:'/hr-dashboard/companies/not-interested',color:'#21bf40',element:FaUserTie}
    
  ]);
  const tabs=[{id:'studentsPanel',text:'Students panel'},{id:'HRsPanel',text:'HR panel'},{id:'applicantsHistory',text:'Applicants History'}]
  const [activeTab,setActiveTab]=useState(tabs[0].id)
  const [data, setData] = useState([]);
  const[searchTerm,setSearchTerm]=useState('')
  const [candidate,setCandidateData]=useState({})
  const navigate = useNavigate();
  const [errorMsg,setErrMsg]=useState(false)
  const [dropdownValue, setDropdownValue] = useState('selectCriteria');
  const[stuDat,setSt]=useState({})

    const handleSelect = (e) => {
        setDropdownValue(e);
    };

    

  useEffect(() => {
    // Fetch data from the backend API
    

    fetchData();
  }, [candidate]);

  useEffect(()=>{
    const active=sessionStorage.getItem('activeTab')
    if(!active){
      setActiveTab(tabs[0].id)
    }
    else{
      setActiveTab(active)
    }
    console.log("Active tab",active)
  })

  const fetchData = async () => {
    console.log("Applied")
    try {
      const response = await axios.get(`http://localhost:5000/hr-job-applicant-history/?candidateId=${candidate.candidateID}&hrId=${HrId}`);
      console.log("Applicant data",response.data) // Adjust the URL as needed
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  console.log("Applications",data)
  useEffect(() => {
    const fetchStatistics = async () => {
      try {/*
        const [
          { data: applied },
          { data: qualified },
          { data: placed },
          { data: notPlaced },
          { data: notAttended },
          { data: confirmedLeads },
          { data: recruiters },
          { data: notInterestedHrs }
        ] = await Promise.all([
          axios.get(`http://localhost:5000/hr-statistics/?status=applied&hrId=${HrId}`),
          axios.get('http://localhost:5000/hr-statistics/qualified'),
          axios.get('http://localhost:5000/hr-statistics/placed'),
          axios.get('http://localhost:5000/hr-statistics/not-placed'),
          axios.get('http://localhost:5000/hr-statistics/not-attended'),
          axios.get('http://localhost:5000/hr-statistics/not-interested'),
          axios.get('http://localhost:5000/hr-statistics/not-eligible'),
          axios.get('http://localhost:5000/hr-statistics/eligible')
        ]);*/
        console.log("Doing apis")
        const appliedResponse = await axios.get(`http://localhost:5000/hr-statistics/?status=applied&hrId=${HrId}`);
const qualifiedResponse = await axios.get(`http://localhost:5000/hr-statistics/?status=qualified&hrId=${HrId}`);
const placedResponse = await axios.get(`http://localhost:5000/hr-statistics/?status=placed&hrId=${HrId}`);
const notPlacedResponse = await axios.get(`http://localhost:5000/hr-statistics/?status=not-placed&hrId=${HrId}`);
const notAttendedResponse = await axios.get(`http://localhost:5000/hr-statistics/?status=not-attended&hrId=${HrId}`);
const confirmedLeadsResponse = await axios.get(`http://localhost:5000/hr-statistics/?status=not-interested&hrId=${HrId}`);
const recruitersResponse = await axios.get(`http://localhost:5000/hr-statistics/?status=not-eligible&hrId=${HrId}`);
const notInterestedHrsResponse = await axios.get(`http://localhost:5000/hr-statistics/?status=eligible&hrId=${HrId}`);
        console.log("Done apis")
        console.log("Applied data",qualifiedResponse.data.count)
        setSt(appliedResponse)
        setStatistics(prevStats => prevStats.map(stat => {
          
          switch (stat.title) {
            case 'Total Students Applied':
              return { ...stat, value: appliedResponse.data.count };
            case 'Total Students Qualified':
              return { ...stat, value: qualifiedResponse.data.count };
            case 'Total Students Placed':
              return { ...stat, value: placedResponse.data.count };
            case 'Total Students Not Placed':
              return { ...stat, value: notPlacedResponse.data.count };
            case 'Total Students Not Attended':
              return { ...stat, value: notAttendedResponse.data.count };
            case 'Total Students Not Interested':
              return { ...stat, value: confirmedLeadsResponse.data.count };
            case 'Not Eligible':
              return { ...stat, value: recruitersResponse.data.count };
            case 'Eligible/ Profile Sent':
              return { ...stat, value: notInterestedHrsResponse.data.count };
            default:
              return stat;
          }
        }));
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };
    const jobStatistics = async () => {
      try {
        const HrLeadsResponse = await axios.get(`http://localhost:5000/hr-job-statistics/?status=hr-leads&hrId=${HrId}`);
const JdReceivedResponse = await axios.get(`http://localhost:5000/hr-job-statistics/?status=jd-received&hrId=${HrId}`);
const profilesSentResponse = await axios.get(`http://localhost:5000/hr-job-statistics/?status=profile-sent&hrId=${HrId}`);
const driveScheduledResponse = await axios.get(`http://localhost:5000/hr-job-statistics/?status=drive-scheduled&hrId=${HrId}`);
const driveDoneResponse = await axios.get(`http://localhost:5000/hr-job-statistics/?status=drive-done&hrId=${HrId}`);
const notInterestedResponse = await axios.get(`http://localhost:5000/hr-job-statistics/?status=not-interested&hrId=${HrId}`);

    
        setHrStatistics(prevStats =>
          prevStats.map(stat => {
            switch (stat.title) {
              case 'Hr Leads':
                return { ...stat, value: HrLeadsResponse.data.count };
              case 'JD received':
                return { ...stat, value: JdReceivedResponse.data.count };
              case 'Profiles Sent':
                return { ...stat, value: profilesSentResponse.data.count };
              case 'Drive Scheduled':
                return { ...stat, value: driveScheduledResponse.data.count };
              case 'Drive Done/Offer received':
                return { ...stat, value: driveDoneResponse.data.count };
              case 'Not interested HRs':
                return { ...stat, value: notInterestedResponse.data.count };
              default:
                return stat;
            }
          })
        );
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };
    

    fetchStatistics();
    jobStatistics();
  }, [navigate]);
  const activeTabToggle=(id)=>{
    console.log(activeTab===id)
    sessionStorage.setItem("activeTab",id)
    setActiveTab(id)
  }
  
  const memoColumns = useMemo(() => [
    
    { Header: 'Full Name', accessor: 'fullName' },
    { Header: 'Contact Number', accessor: 'mobileNo' },
    { Header: 'Email', accessor: 'email' },
    { Header: 'Job Role', accessor: 'jobRole',
      Cell: ({ row }) => (
        <Link style={{textDecoration:'none',color:'#53289e',fontWeight:'500'}} to={`/hr-dashboard/job/${row.original.JobId}`}>
          {row.original.jobRole}
        </Link>
      )
     },
    { Header: 'Company Name', accessor: 'companyName' },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: ({ value }) => {
        let color;
        switch (value) {
          case 'In progress':
            color = 'yellow';
            break;
          case 'Qualified':
            color = 'green';
            break;
          case 'Not Qualified':
            color = 'red';
            break;
          default:
            color = 'blue';
        }
        return <span style={{ color ,fontWeight:'600'}}>{value}</span>;
      }
    },
    { Header: 'Y.O.P', accessor: 'passedOut' },
    { Header: 'Gender', accessor: 'gender' },
    { Header: 'Experience', accessor: 'experience' },
    { Header: 'Resume', accessor: 'resume', disableSortBy: true }
  ], [data]);

  const memoData = useMemo(() => data, [data]);
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    setGlobalFilter,
    state,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize
  } = useTable(
    { columns: memoColumns, data: memoData, initialState: { pageSize: 10 } },
    useGlobalFilter,
    useSortBy,
    usePagination
  );
  const handleMoreInfo = (link) => {
    console.log("event clicked")
    navigate(link);
  };

  const switchRenderTabs=()=>{
    switch(activeTab){
      case 'studentsPanel':
        return renderStudentsPanel()
      case 'HRsPanel':
        return renderHRPanel()
      case 'applicantsHistory':
        return renderApplicantHistory()    
    }
  }
  
  const handleResumeDownload = async (applicationId) => {
    try {
      console.log("Id:", applicationId);
      // Send request to backend with applicationId
      const response = await axios({
        url: `http://localhost:5000/download-resume/${applicationId.applicationID}`, // Update the endpoint to match your backend
        method: 'GET',
        responseType: 'blob', // Important for handling binary data
      });

      // Create a blob URL from the response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `resume-${applicationId.fullName}.pdf`; // Set a default file name
      document.body.appendChild(link);
      link.click(); // Trigger the download
      link.remove(); // Clean up
    } catch (error) {
      console.error('Error downloading the file:', error);
    }
  };

  const onClickSearch=async()=>{
    if(searchTerm!==''){
      const  searchQuery=`${dropdownValue}=${searchTerm}`
       const response=await axios.get(`http://localhost:5000/applicant-history/?${searchQuery}`)
       console.log("Response:",response)
       if (Object.keys(response.data).length!==0){
        setCandidateData(response.data)
        setErrMsg(false)
       fetchData()
       }
       else{
        setErrMsg(true);
        setCandidateData({})
        setData([])
       }
       
    }
  }
  console.log("Students",statistics)
  const renderApplicantHistory=()=>{

    return(
      <Row className=' d-flex flex-column align-items-center' >
        <Col lg={2} sm={6} xs={6}>
        <h3>Applicants Search</h3>
        </Col>
        <Col lg={8} sm={12} xs={12} style={{ backgroundColor: '#ffffff', padding: '0', borderRadius: '5px', display: 'flex', flexDirection: 'row',height:'40px' }}>
        <select
        style={{width:'30%',height:'40px',borderRadius:'5px 0px 0px 5px',border:'none',outline:'none'}}
          value={dropdownValue}
          onChange={(e) => setDropdownValue(e.target.value)}
        >
          <option value="selectCriteria">Select criteria</option>
          <option value="candidateID">Candidate ID</option>
          <option value="fullName">Full Name</option>
          <option value="email">Email</option>
          <option value="mobileNumber">Phone</option>
          
              
             
        </select>
            <input
                style={{ border: 'none', backgroundColor: '#ffffff', width: '60%', borderRadius: '0', marginRight: '0px',height:'40px',outline:'none' }}
                onChange={(e) => setSearchTerm(e.target.value)}
                type="search"
            />
            <Button
                onClick={onClickSearch}
                style={{ border:'none',backgroundColor: 'transparent', padding: '0', marginLeft: '0px',marginRight:'0px', width: '10%',textAlign:'right' }}
            >
                <FaSearch bold style={{ margin: '0', marginBottom: '5px', color: "#ffffff", width: '100%',color:'blue' }} />
            </Button>
        </Col>
        {Object.keys(candidate).length>0 &&(<Col lg={10} sm={12} xs={12} className='mt-4'>
        <Table responsive bordered className="table" >
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
              
                <tr key={candidate.candidateID}>
                  <td>{candidate.candidateID}</td>
                  <td>{candidate.fullName}</td>
                  <td>{candidate.email}</td>
                  <td>{candidate.mobileNo}</td>
                  <td>{candidate.domain}</td>
                  <td>{candidate.batchNo}</td>
                  
                </tr>
             
            </tbody>
            
          </Table>
          </Col>
          )}
          {errorMsg&&(<Col lg={10} sm={12} xs={12}><p style={{width:'100%',textAlign:'center',marginTop:'10px'}}>No data Found</p></Col>)}
        
        
        
        
        
        {data.length>0&&(<Col Col lg={10} sm={12} xs={12} className='mt-4' >
        <table responseive bordered {...getTableProps()} style={{ borderCollapse: 'collapse',width:'100%' }}>
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())} style={{ backgroundColor: '#416cb0', color: '#ffffff', border: '1px solid black', padding: '8px' }}>
                    {column.render('Header')}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? ' 🔽'
                          : ' 🔼'
                        : ''}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          
          <tbody {...getTableBodyProps()}>
              {page.map(row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => (
                    <td
                      {...cell.getCellProps()}
                      style={{ border: '1px solid black', padding: '8px', cursor: cell.column.id === 'resume' ? 'pointer' : 'default',backgroundColor:'#ffffff'}}
                      onClick={() => {
                        if (cell.column.id === 'resume') {
                          const applicationId = row.original;
                          handleResumeDownload(applicationId);
                        }
                      }}
                    >
                      {cell.column.id === 'resume' ? (
                        <div className='text-align-center d-flex flex-row justify-content-center'>
                          <FaFilePdf color='#2a97eb' />
                        </div>
                      ) : (
                        cell.render('Cell')
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        
        

        </table>
        </Col>)}
        {(Object.keys(candidate).length>0 && data.length==0)&&(<Col lg={10} sm={12} xs={12}><p style={{width:'100%',textAlign:'center',marginTop:'10px'}}>No jobs applied</p></Col>)}
        
      </Row>
    )
  }

  const renderStudentsPanel=()=>{
    return(
      <Row>
          
      {statistics.map((stat, index) => (
        <Col key={index} md={6} lg={3} className="mb-4 pb-0" style={{ borderRadius: '10px' }}>
          <Card className="pb-0 mb-0" style={{ backgroundColor: `${stat.color}`, border: 'none', borderRadius: '5px' }}>
            <div className='d-flex flex-row justify-content-between mt-2 mb-3 '>
              <div>
                <Card.Title style={{ fontSize: '30px', color: '#ffffff', fontWeight: 'bold', marginLeft: '10px' }}>{stat.value}</Card.Title>
                <Card.Text style={{ color: '#ffffff', marginLeft: '10px' }}>
                  {stat.title}
                </Card.Text>
              </div>
              {React.createElement(stat.element, {
                key: index,
                style: { alignSelf: 'center', color: '#000000', opacity: '0.2', marginRight: '15px' },
                size: 40
              })}
            </div>
            <Button className='mb-0 w-100 ' style={{ backgroundColor: '#000000', border: "none", borderRadius: '0px 0px 5px 5px', opacity: '0.3' }} onClick={() => handleMoreInfo(stat.link)}>More Info <FaChevronCircleRight className='mb-1' size={20} /></Button>
          </Card>
        </Col>
      ))}
    </Row>
    )
  }

  const renderHRPanel=()=>{
    

    return(
      <Row>
          
          {hrStatistics.map((stat, index) => (
            <Col key={index} md={6} lg={3} className="mb-4 pb-0" style={{ borderRadius: '10px' }}>
              <Card className="pb-0 mb-0" style={{ backgroundColor: `${stat.color}`, border: 'none', borderRadius: '5px' }}>
                <div className='d-flex flex-row justify-content-between mt-2 mb-3 '>
                  <div>
                    <Card.Title style={{ fontSize: '30px', color: '#ffffff', fontWeight: 'bold', marginLeft: '10px' }}>{stat.value}</Card.Title>
                    <Card.Text style={{ color: '#ffffff', marginLeft: '10px' }}>
                      {stat.title}
                    </Card.Text>
                  </div>
                  {React.createElement(stat.element, {
                    key: index,
                    style: { alignSelf: 'center', color: '#000000', opacity: '0.2', marginRight: '15px' },
                    size: 40
                  })}
                </div>
                <Button className='mb-0 w-100 ' style={{ backgroundColor: '#000000', border: "none", borderRadius: '0px 0px 5px 5px', opacity: '0.3' }} onClick={() => handleMoreInfo(stat.link)}>More Info <FaChevronCircleRight className='mb-1' size={20} /></Button>
              </Card>
            </Col>
          ))}
        </Row>
    )
  }

  return (
    <div style={{ backgroundColor: '#e9ebf0', zIndex: 2, height: '100vh' }}>
      <HrNavbar />
      <Container fluid className="my-4">
        
        <Row style={{marginBottom:'10px',boxShadow:' 0 2px 2px #00378a'}}>
          {tabs.map(tab=>(
            <Col  xs={3}
            sm={2}
            md={2}
            lg={2} style={{borderBottom:'none',border:activeTab===tab.id?'2px solid #00378a':'',borderRadius:'8px 8px 0px 0px',backgroundColor: activeTab === tab.id ? '#3c6eba' : 'transparent'}} ><button id={tab.id} className='tab-btns' style={{background:'transparent',color:activeTab === tab.id ? '#ffffff' : '#2c2f33'}} onClick={()=>activeTabToggle(tab.id)}>{tab.text}</button></Col>
          ))}
          
          {/*<Col  sm={1} lg={3} style={{backgroundColor:'transparent'}}><button className='tab-btns' style={{background:'transparent'}}>HRs panel</button></Col>
          <Col  sm={1} lg={3} style={{backgroundColor:'transparent'}}><button className='tab-btns' style={{background:'transparent'}}>Applicants History</button></Col>*/}
        </Row>
        {switchRenderTabs()}
        
      </Container>
    </div>
  );
};

export default HrPortal;
