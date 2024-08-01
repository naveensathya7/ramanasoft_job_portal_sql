import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './1.css';

const SubmissionsList = () => {
  const [submissions, setSubmissions] = useState([]);
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('');

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await axios.get('http://localhost:5000/domains');
        setDomains(response.data);
      } catch (error) {
        console.error('Error fetching domains', error);
      }
    };

    fetchDomains();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/interns');
        setSubmissions(response.data);
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };

    fetchData();
  }, []);

  const handleDomainChange = (e) => {
    setSelectedDomain(e.target.value);
  };

  const filteredSubmissions = selectedDomain
    ? submissions.filter((submission) => submission.domain === selectedDomain)
    : submissions;

  return (
    <div>
      <h2>Intern Data</h2>
      <div>
        <label htmlFor="domain">Filter by Domain:</label>
        <select id="domain" value={selectedDomain} onChange={handleDomainChange}>
          <option value="">All Domains</option>
          {domains.map((domainObj) => (
            <option key={domainObj.domain} value={domainObj.domain}>
              {domainObj.domain}
            </option>
          ))}
        </select>
      </div>
      <table className='Details_table'>
        <thead className='Details_thead'>
          <tr className='Details_tr'>
            <th className='Details_th'>ID</th>
            <th className='Details_th'>Name</th>
            <th className='Details_th'>Email</th>
            <th className='Details_th'>Domain</th>
          </tr>
        </thead>
        <tbody className='Details_tbody'>
          {filteredSubmissions.map((submission) => (
            <tr key={submission.id} className='Details_tr'>
              <td className='Details_td'>{submission.id}</td>
              <td className='Details_td'>{submission.name}</td>
              <td className='Details_td'>{submission.mail}</td>
              <td className='Details_td'>{submission.domain}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubmissionsList;