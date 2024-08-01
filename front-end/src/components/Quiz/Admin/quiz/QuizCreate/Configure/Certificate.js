import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './certificate.css';

const Certificate = ({ certificateId }) => {
  const [certificateData, setCertificateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const certificateRef = useRef(null);

  useEffect(() => {
    const fetchCertificateData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/interns/${certificateId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch certificate data');
        }
        const data = await response.json();
        setCertificateData({
          ...data,
          startDate: data.startDate || '2024-01-01', // Default value
          endDate: data.endDate || '2024-06-30', // Default value
          issueDate: data.issueDate || new Date().toISOString().split('T')[0],
          ceo: data.ceo || 'Y Ramprasad',
          programManager: data.programManager || 'Rajashekhar Reddy'
        });
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCertificateData();
  }, [certificateId]);

  const downloadCertificate = () => {
    html2canvas(certificateRef.current).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('RamanaSoft_Internship_Certificate.pdf');
    });
  };

  const handleSaveClick = () => {
    // Save changes to the backend if needed
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCertificateData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!certificateData) return <div>No certificate data found</div>;

  return (
    <div>
      <h2>Certificate :</h2>
      {/* <button onClick={() => setIsEditing(!isEditing)}>{isEditing ? 'Cancel' : 'Edit'}</button> */}
 {/* <button onClick={downloadCertificate}>Download Certificate</button>
 <p></p> */}
      {isEditing ? (
        <div>
          <div className="certificate">
            <div className="header">
              <div className="logo">
                <span className="rs">RS</span>
                <span className="company-name">RamanaSoft</span>
              </div>
            </div>
            <div className="Certificate_content">
              <h1>QUIZ COMPLETION CERTIFICATE</h1>
              <p className="subtitle">This internship program certificate is proudly awarded to</p>
              <input
                type="text"
                name="name"
                value={certificateData.name}
                onChange={handleChange}
                className="recipient-name"
              />
              <div className="details">
                <p>ID No: <input type="text" name="id" value={certificateData.id} onChange={handleChange} /></p>
                {/* <p>Start Date: <input type="date" name="startDate" value={certificateData.startDate} onChange={handleChange} />&nbsp;&nbsp;&nbsp;&nbsp;
                  End Date: <input type="date" name="endDate" value={certificateData.endDate} onChange={handleChange} /></p> */}
              </div>
            </div>
            <div className="signatures">
              <div className="signature">
                <input type="text" name="ceo" value={certificateData.ceo} onChange={handleChange} />
                <p className="role">CEO</p>
              </div>
              <div className="signature">
                <input type="text" name="programManager" value={certificateData.programManager} onChange={handleChange} />
                <p className="role">PROGRAM MANAGER</p>
              </div>
            </div>
            <p className="issue-date">Date Of Issue: <input type="date" name="issueDate" value={certificateData.issueDate} onChange={handleChange} /></p>
            <div className="border-design">
              <div className="top-right"></div>
              <div className="bottom-left"></div>
            </div>
          </div>
          <button onClick={handleSaveClick}>Save</button>
          <button onClick={downloadCertificate}>Download Certificate</button>
        </div>
      ) : (
        <div ref={certificateRef} className="certificate">
          <div className="header">
            <div className="logo">
              <span className="rs">RS</span>
              <span className="company-name">RamanaSoft</span>
            </div>
          </div>
          <div className="Certificate_content">
            <h1>QUIZ COMPLETION CERTIFICATE</h1>
            <p className="subtitle">This internship program certificate is proudly awarded to</p>
            <div className="recipient-name">{certificateData.name}</div>
            <div className="details">
              <p>ID No: <span>{certificateData.id}</span></p>
              {/* <p>Start Date: <span>{certificateData.startDate}</span>&nbsp;&nbsp;&nbsp;&nbsp;End Date: <span>{certificateData.endDate}</span></p> */}
            </div>
          </div>
          <div className="signatures">
            <div className="signature">
              <p>{certificateData.ceo}</p>
              <p className="role">CEO</p>
            </div>
            <div className="signature">
              <p>{certificateData.programManager}</p>
              <p className="role">PROGRAM MANAGER</p>
            </div>
          </div>
          <p className="issue-date">Date Of Issue: {certificateData.issueDate}</p>
          <div className="border-design">
            <div className="top-right"></div>
            <div className="bottom-left"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificate;
