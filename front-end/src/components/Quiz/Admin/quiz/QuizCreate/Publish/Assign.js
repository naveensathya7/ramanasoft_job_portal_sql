import React, { useState } from 'react';

const AssignQuiz = () => {
  const [userId, setUserId] = useState('');
  const [quizToken, setQuizToken] = useState('');

  const handleAssign = () => {
    fetch('http://localhost:5000/assign-quiz-to-domain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, quizToken }),
    })
      .then(response => response.json())
      .then(data => console.log('Quiz assigned successfully', data))
      .catch(error => console.error('Error assigning quiz:', error));
  };

  return (
    <div className="assign-quiz">
      <h2>Assign Quiz</h2>
      <input
        type="text"
        placeholder="User ID"
        value={userId}
        onChange={e => setUserId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Quiz Token"
        value={quizToken}
        onChange={e => setQuizToken(e.target.value)}
      />
      <button onClick={handleAssign}>Assign</button>
    </div>
  );
};

export default AssignQuiz;
