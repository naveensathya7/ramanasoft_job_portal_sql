import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const QuizTaking = () => {
  const [quizData, setQuizData] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const { token } = useParams();

  useEffect(() => {
    if (token) {
      fetch(`http://localhost:5000/get-quiz/${token}`)
        .then(response => response.json())
        .then(data => setQuizData(data))
        .catch(error => console.error('Error fetching quiz data:', error));
    }
  }, [token]);

  const handleResponseChange = (questionIndex, answer) => {
    setResponses({
      ...responses,
      [questionIndex]: answer,
    });
  };

  const handleSubmit = () => {
    fetch(`http://localhost:5000/submit-quiz/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        responses,
        startTime: new Date(),
        endTime: new Date(),
      }),
    })
      .then(response => response.json())
      .then(data => console.log('Submission successful', data))
      .catch(error => console.error('Error submitting quiz:', error));
  };

  if (!quizData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="quiz-taking-container">
      <h2>Take Quiz</h2>
      <div className="page-container">
        {quizData[currentPageIndex]?.question_list.map((q, questionIndex) => (
          <div key={questionIndex} className="question">
            <div className="question-text">{q.question_text}</div>
            <div className="options">
              {q.options_list.map((option, optionIndex) => (
                <label key={optionIndex}>
                  <input
                    type="radio"
                    name={`question-${questionIndex}`}
                    value={option.text}
                    onChange={() => handleResponseChange(questionIndex, option.text)}
                  />
                  {option.text}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="controls">
        <button onClick={() => setCurrentPageIndex(currentPageIndex - 1)} disabled={currentPageIndex === 0}>Previous</button>
        <button onClick={() => setCurrentPageIndex(currentPageIndex + 1)} disabled={currentPageIndex === quizData.length - 1}>Next</button>
        {currentPageIndex === quizData.length - 1 && (
          <button onClick={handleSubmit}>Submit</button>
        )}
      </div>
    </div>
  );
};

export default QuizTaking;
