import React, { useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const QuizCreationPage = () => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([{ text: '', correct: false }]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };

  const handleCorrectChange = (index) => {
    const newOptions = options.map((option, i) => ({
      ...option,
      correct: i === index ? !option.correct : option.correct,
    }));
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { text: '', correct: false }]);
  };

  const saveQuestion = () => {
    const questionData = {
      question,
      options,
    };
    console.log(questionData);
    // Send questionData to backend API to save the question
  };

  return (
    <div>
      <h2>Create/Edit Question</h2>
      <CKEditor
        editor={ClassicEditor}
        data={question}
        onChange={(event, editor) => {
          const data = editor.getData();
          setQuestion(data);
        }}
      />
      <div>
        <h3>Options</h3>
        {options.map((option, index) => (
          <div key={index}>
            <input
              type="text"
              value={option.text}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
            />
            <input
              type="checkbox"
              checked={option.correct}
              onChange={() => handleCorrectChange(index)}
            />
            Correct
          </div>
        ))}
        <button onClick={addOption}>Add Option</button>
      </div>
      <button onClick={saveQuestion}>Save Question</button>
    </div>
  );
};

export default QuizCreationPage;
