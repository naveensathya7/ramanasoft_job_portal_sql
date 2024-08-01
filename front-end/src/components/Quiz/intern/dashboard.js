import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const InternDashboard = () => {
  const { user_id } = useParams();
  const [assignedQuizzes, setAssignedQuizzes] = useState([]);
  const [submittedQuizzes, setSubmittedQuizzes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/user-quizzes/${user_id}`);
        const data = await response.json();

        const assigned = data.filter(quiz => !quiz.status);
        const submitted = data.filter(quiz => quiz.status);

        setAssignedQuizzes(assigned);
        setSubmittedQuizzes(submitted);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [user_id]);

  const handleAttemptQuiz = (quizToken) => {
    const url = `/quiz/${user_id}/${quizToken}`;
    window.open(url, '_blank');
  };

  const handleViewAnalysis = (quizToken) => {
    const url = `/quiz-analysis/${user_id}/${quizToken}`;
    window.open(url, '_blank');
  };

  return (
    <div>
      <h2>Assigned Quizzes</h2>
      {assignedQuizzes.length > 0 ? (
        <div>
          <h3>Available Quizzes</h3>
          <ul>
            {assignedQuizzes.map((quiz) => (
              <li key={quiz.id}>
                <p>{quiz.quiz_name}</p>
                <button onClick={() => handleAttemptQuiz(quiz.token)}>Attempt Quiz</button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No quizzes assigned</p>
      )}

      {submittedQuizzes.length > 0 ? (
        <div>
          <h3>Your Submissions</h3>
          <ul>
            {submittedQuizzes.map((quiz) => (
              <li key={quiz.id}>
                <p>{quiz.quiz_name}</p>
                <button onClick={() => handleViewAnalysis(quiz.token)}>View Analysis</button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No quizzes submitted yet</p>
      )}
    </div>
  );
};

export default InternDashboard;
