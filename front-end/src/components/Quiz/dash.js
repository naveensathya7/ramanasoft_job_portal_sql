import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faChevronDown, faTimes } from '@fortawesome/free-solid-svg-icons';
import './dash.css';

const FolderTable = () => {
    const [folders, setFolders] = useState({
        React: { subfolders: [] },
        Python: { subfolders: []},
        Java: { subfolders: [] },
        Testing: { subfolders: [] },
        JS: { subfolders: [] }
    });

    const [newFolder, setNewFolder] = useState('');
    const [newSubfolder, setNewSubfolder] = useState('');
    const [newQuiz, setNewQuiz] = useState('');
    const [openFolders, setOpenFolders] = useState({});
    const [showFolderInput, setShowFolderInput] = useState(false);
    const [showSubfolderInput, setShowSubfolderInput] = useState(null);
    const [showQuizInput, setShowQuizInput] = useState(null);
    const [error, setError] = useState('');

    const addFolder = async () => {
        if (newFolder.trim() !== '') {
            setFolders({ ...folders, [newFolder]: { subfolders: [] } });
            setNewFolder('');
            setShowFolderInput(false);
            try {
                await fetch('http://localhost:5000/addFolder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ folder: newFolder }),
                });
            } catch (error) {
                console.error('Error adding folder:', error);
                setError('Failed to add folder');
            }
        }
    };

    const addSubfolder = async (folder) => {
        if (newSubfolder.trim() !== '') {
            setFolders({
                ...folders,
                [folder]: {
                    ...folders[folder],
                    subfolders: [...folders[folder].subfolders, { name: newSubfolder, quizzes: [] }]
                }
            });
            setNewSubfolder('');
            setShowSubfolderInput(null);
            try {
                await fetch('http://localhost:5000/addSubfolder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ folder, subfolder: newSubfolder }),
                });
            } catch (error) {
                console.error('Error adding subfolder:', error);
                setError('Failed to add subfolder');
            }
        }
    };

    const addQuiz = async (folder, subfolder) => {
        if (newQuiz.trim() !== '') {
            const updatedSubfolders = folders[folder].subfolders.map((sf) => {
                if (sf.name === subfolder) {
                    return { ...sf, quizzes: [...sf.quizzes, newQuiz] };
                }
                return sf;
            });

            setFolders({
                ...folders,
                [folder]: {
                    ...folders[folder],
                    subfolders: updatedSubfolders
                }
            });
            setNewQuiz('');
            setShowQuizInput(null);
            try {
                await fetch('http://localhost:5000/addQuiz', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ folder, subfolder, quiz: newQuiz }),
                });
            } catch (error) {
                console.error('Error adding quiz:', error);
                setError('Failed to add quiz');
            }
        }
    };

    const toggleFolder = (folder) => {
        setOpenFolders(prevState => ({ ...prevState, [folder]: !prevState[folder] }));
    };

    return (
        <div className="container">
            <div className="input-container">
                {showFolderInput ? (
                    <>
                        <input
                            type="text"
                            className="folder-input"
                            value={newFolder}
                            onChange={(e) => setNewFolder(e.target.value)}
                            placeholder="New folder name"
                        />
                        <button className="add-folder-button" onClick={addFolder}>
                            Add
                        </button>
                        <button className="cancel-button" onClick={() => setShowFolderInput(false)}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </>
                ) : (
                    <button className="add-folder-icon" onClick={() => setShowFolderInput(true)}>
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                )}
            </div>
            <div className="folder-list">
                {Object.keys(folders).map((folder, index) => (
                    <div key={index} className="folder-item">
                        <div className="folder-header" onClick={() => toggleFolder(folder)}>
                            {folder}
                            <FontAwesomeIcon icon={openFolders[folder] ? faChevronDown : faPlus} className="toggle-icon" />
                        </div>
                        {openFolders[folder] && (
                            <div className="subfolder-list">
                                {folders[folder].subfolders.map((subfolder, subIndex) => (
                                    <div key={subIndex} className="subfolder-item">
                                        <div className="subfolder-header" onClick={() => setShowQuizInput(`${folder}-${subfolder.name}`)}>
                                            {subfolder.name}
                                            <FontAwesomeIcon icon={faPlus} className="toggle-icon" />
                                        </div>
                                        <div className="quiz-list">
                                            {subfolder.quizzes.map((quiz, quizIndex) => (
                                                <div key={quizIndex} className="quiz-item">
                                                    {quiz}
                                                </div>
                                            ))}
                                            {showQuizInput === `${folder}-${subfolder.name}` && (
                                                <div className="input-container">
                                                    <input
                                                        type="text"
                                                        className="quiz-input"
                                                        value={newQuiz}
                                                        onChange={(e) => setNewQuiz(e.target.value)}
                                                        placeholder="New quiz name"
                                                    />
                                                    <button className="add-quiz-button" onClick={() => addQuiz(folder, subfolder.name)}>
                                                        Add
                                                    </button>
                                                    <button className="cancel-button" onClick={() => setShowQuizInput(null)}>
                                                        <FontAwesomeIcon icon={faTimes} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {showSubfolderInput === folder ? (
                                    <div className="input-container">
                                        <input
                                            type="text"
                                            className="subfolder-input"
                                            value={newSubfolder}
                                            onChange={(e) => setNewSubfolder(e.target.value)}
                                            placeholder="New subfolder name"
                                        />
                                        <button className="add-subfolder-button" onClick={() => addSubfolder(folder)}>
                                            Add
                                        </button>
                                        <button className="cancel-button" onClick={() => setShowSubfolderInput(null)}>
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    </div>
                                ) : (
                                    <button className="add-subfolder-icon" onClick={() => setShowSubfolderInput(folder)}>
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default FolderTable;
