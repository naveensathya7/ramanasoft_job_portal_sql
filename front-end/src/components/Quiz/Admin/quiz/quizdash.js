/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faChevronDown, faTimes, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { v4 as uuidv4 } from 'uuid';
import './quizdash.css';
import { Link, useNavigate } from 'react-router-dom';
import HrNavbar from '../../../HrNavbar/HrNavbar';

const QuizDash = () => {
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [folders, setFolders] = useState({});
    const [newFolder, setNewFolder] = useState('');
    const [newSubfolder, setNewSubfolder] = useState('');
    const [newQuiz, setNewQuiz] = useState('');
    const [quizType, setQuizType] = useState('');
    const [openFolders, setOpenFolders] = useState({});
    const [showFolderInput, setShowFolderInput] = useState(false);
    const [showSubfolderInput, setShowSubfolderInput] = useState(null);
    const [selectedSubfolder, setSelectedSubfolder] = useState(null);
    const [showQuizInputs, setShowQuizInputs] = useState(false);
    const [error, setError] = useState('');
    const [renameQuiz, setRenameQuiz] = useState({ token: '', name: '' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const togglePanel = () => {
        setIsPanelOpen(!isPanelOpen);
    };

    const fetchData = async () => {
        try {
            const response = await fetch('http://localhost:5000/getAllData');
            const data = await response.json();
            const organizedData = organizeData(data);
            setFolders(organizedData);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to fetch data');
        }
    };

    const organizeData = (data) => {
        const organized = {};
        data.forEach(item => {
            if (!organized[item.folder_name]) {
                organized[item.folder_name] = { subfolders: [] };
            }
            if (item.subfolder_name) {
                const subfolderIndex = organized[item.folder_name].subfolders.findIndex(sf => sf.name === item.subfolder_name);
                if (subfolderIndex === -1) {
                    organized[item.folder_name].subfolders.push({
                        name: item.subfolder_name,
                        quizzes: item.quiz_name ? [{ name: item.quiz_name, type: item.quiz_type, token: item.token }] : []
                    });
                } else {
                    if (item.quiz_name) {
                        organized[item.folder_name].subfolders[subfolderIndex].quizzes.push({ name: item.quiz_name, type: item.quiz_type, token: item.token });
                    }
                }
            }
        });
        return organized;
    };

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

    const handleAddQuizClick = () => {
        setShowQuizInputs(true);
    };

    const addQuiz = async (folder, subfolder) => {
        if (newQuiz.trim() !== '' && quizType !== '') {
            const token = uuidv4();
            const updatedSubfolders = folders[folder].subfolders.map((sf) => {
                if (sf.name === subfolder) {
                    return { ...sf, quizzes: [...sf.quizzes, { name: newQuiz, type: quizType, token }] };
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
            setQuizType('');
            setShowQuizInputs(false);
            try {
                await fetch('http://localhost:5000/addQuiz', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ folder, subfolder, quiz: newQuiz, type: quizType, token }),
                });
            } catch (error) {
                console.error('Error adding quiz:', error);
                setError('Failed to add quiz');
            }
            navigate(`/edit/create/${token}`);
        }
    };

    const toggleFolder = (folder) => {
        setOpenFolders(prevState => ({ ...prevState, [folder]: !prevState[folder] }));
    };

    const handleSubfolderClick = (folder, subfolder) => {
        setSelectedSubfolder({ folder, subfolder });
    };

    const handlePreviewClick = (quizToken) => {
        const url = `/preview/${quizToken}`;
        window.open(url, '_blank');
    };

    const handleRenameQuiz = (quizToken) => {
        const quiz = folders[selectedSubfolder.folder].subfolders
            .find(sf => sf.name === selectedSubfolder.subfolder)
            .quizzes.find(q => q.token === quizToken);

        setRenameQuiz({ token: quizToken, name: quiz.name });
    };

    const handleRenameChange = (e) => {
        setRenameQuiz({ ...renameQuiz, name: e.target.value });
    };

    const handleRenameSubmit = async (e) => {
        e.preventDefault();
        const updatedSubfolders = folders[selectedSubfolder.folder].subfolders.map((sf) => {
            if (sf.name === selectedSubfolder.subfolder) {
                return {
                    ...sf,
                    quizzes: sf.quizzes.map((q) => (q.token === renameQuiz.token ? { ...q, name: renameQuiz.name } : q))
                };
            }
            return sf;
        });

        setFolders({
            ...folders,
            [selectedSubfolder.folder]: {
                ...folders[selectedSubfolder.folder],
                subfolders: updatedSubfolders
            }
        });

        setRenameQuiz({ token: '', name: '' });

        try {
            await fetch('http://localhost:5000/renameQuiz', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: renameQuiz.token, name: renameQuiz.name }),
            });
        } catch (error) {
            console.error('Error renaming quiz:', error);
            setError('Failed to rename quiz');
        }
    };

    const Modal = ({ message, onClose }) => {
        if (!message) return null;

        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <p>{message}</p>
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        );
    };

    const handleDeleteQuiz = async (quizToken) => {
        const updatedSubfolders = folders[selectedSubfolder.folder].subfolders.map((sf) => {
            if (sf.name === selectedSubfolder.subfolder) {
                return {
                    ...sf,
                    quizzes: sf.quizzes.filter((q) => q.token !== quizToken)
                };
            }
            return sf;
        });

        setFolders({
            ...folders,
            [selectedSubfolder.folder]: {
                ...folders[selectedSubfolder.folder],
                subfolders: updatedSubfolders
            }
        });

        try {
            await fetch(`http://localhost:5000/deleteQuiz/${quizToken}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        } catch (error) {
            console.error('Error deleting quiz:', error);
            setError('Failed to delete quiz');
        }
    };

    const handleDropdownSelect = (option, quizToken) => {
        switch (option) {
            case 'rename':
                handleRenameQuiz(quizToken);
                break;
            case 'delete':
                handleDeleteQuiz(quizToken);
                break;
            default:
                break;
        }
    };

    return (
        <><HrNavbar/>
<div className="Quiz_content">
        <div className="quiz-container">
            <div className={`left-panel ${isPanelOpen ? 'open' : 'closed'}`}>
                <button className="toggle-button" onClick={togglePanel}>
                    <FontAwesomeIcon icon={isPanelOpen ? faChevronLeft : faChevronRight} />
                </button>
                <ul className="folder-list">
                    {Object.keys(folders).map((folder, index) => (
                        <li key={index} className="folder-item">
                            <div className="folder-header" onClick={() => toggleFolder(folder)}>
                                {folder}
                                <FontAwesomeIcon icon={openFolders[folder] ? faChevronDown : faPlus} className="toggle-icon" />
                            </div>
                            {openFolders[folder] && (
                                <ul className="subfolder-list">
                                    {folders[folder].subfolders.map((subfolder, subIndex) => (
                                        <li key={subIndex} className="subfolder-item">
                                            <div className="subfolder-header" onClick={() => handleSubfolderClick(folder, subfolder.name)}>
                                                {subfolder.name}
                                            </div>
                                        </li>
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
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
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
            </div>
            <div className="right-panel">
                {selectedSubfolder ? (
                    <div className="content-display">
                        <h3>{selectedSubfolder.folder}/{selectedSubfolder.subfolder}</h3>
                        <div className="input-container">
                            {showQuizInputs ? (
                                <>
                                    <select className="quiz-type-select" value={quizType} onChange={(e) => setQuizType(e.target.value)}>
                                        <option className='QuizOption' value="">Quiz Type</option>
                                        <option className='QuizOption' value="live">Live</option>
                                        <option className='QuizOption' value="static">Static</option>
                                    </select>
                                    {quizType && (
                                        <>
                                            <input
                                                type="text"
                                                className="quiz-input"
                                                value={newQuiz}
                                                onChange={(e) => setNewQuiz(e.target.value)}
                                                placeholder="New quiz name"
                                            />
                                            <button className="add-quiz-button" onClick={() => addQuiz(selectedSubfolder.folder, selectedSubfolder.subfolder)}>
                                                Add Quiz
                                            </button>
                                            <button className="cancel-button" onClick={() => setShowQuizInputs(false)}>
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        </>
                                    )}
                                </>
                            ) : (
                                <button className="add-quiz-plus-icon" onClick={handleAddQuizClick}>
                                    <FontAwesomeIcon icon={faPlus} />
                                    New Quiz
                                </button>
                            )}
                        </div>
                        <table className="quiz-table">
                            <tbody className='Quiz_Table_Body'>
                                {folders[selectedSubfolder.folder].subfolders
                                    .find(sf => sf.name === selectedSubfolder.subfolder)
                                    .quizzes.map((quiz, index) => (
                                        <tr key={index}>
                                            <td>
                                                {renameQuiz.token === quiz.token ? (
                                                    <form onSubmit={handleRenameSubmit}>
                                                        <input
                                                            type="text"
                                                            value={renameQuiz.name}
                                                            onChange={handleRenameChange}
                                                            onBlur={() => setRenameQuiz({ token: '', name: '' })}
                                                            autoFocus
                                                        />
                                                    </form>
                                                ) : (
                                                    <Link className='quiz-link' to={`/edit/create/${quiz.token}`} >
                                                        {quiz.name}
                                                    </Link>
                                                )}
                                            </td>
                                            <td className='table-set-2'>{quiz.type}</td>
                                            <td>{quiz.status}</td>
                                            <td>
                                                <button onClick={() => handlePreviewClick(quiz.token)}>
                                                    Preview
                                                </button>
                                                <div className="dropdown">
                                                    <button className="dropbtn">Options</button>
                                                    <div className="dropdown-content">
                                                        <button onClick={() => handleDropdownSelect('rename', quiz.token)}>Rename</button>
                                                        <button onClick={() => handleDropdownSelect('delete', quiz.token)}>Delete</button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="content-display">

                        <div class="card_container">
                            <div class="row">
                                <div class="col-md-8 col-sm-12 col-xs-12 our-clinic">
                                    <div class="row welcome-left">
                                        <div class="col-md-6 col-sm-6 col-xs-6">
                                            <div class="other-services-block">
                                                <div class="services-block-icon">
                                                    <i class="fa fa-folder"></i>
                                                </div>
                                                <div class="other-services-content">
                                                    <h5>Groups Created</h5>
                                                    <p>Dolor sit amet consecdi pisicing eliamsed do eiusmod tempornu</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-6 col-sm-6 col-xs-6">
                                            <div class="other-services-block">
                                                <div class="services-block-icon">
                                                    <i class="fa fa-users"></i>
                                                </div>
                                                <div class="other-services-content">
                                                    <h5>Quizzes Created </h5>
                                                    <p>Dolor sit amet consecdi pisicing eliamsed do eiusmod tempornu</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-6 col-sm-6 col-xs-6">
                                            <div class="other-services-block">
                                                <div class="services-block-icon">
                                                    <i class="fa  fa-list-alt"></i>
                                                </div>
                                                <div class="other-services-content">
                                                    <h5>Analyze Quizzes</h5>
                                                    <p>Dolor sit amet consecdi pisicing eliamsed do eiusmod tempornu</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-6 col-sm-6 col-xs-6">
                                            <div class="other-services-block">
                                                <div class="services-block-icon">
                                                    <i class="fa fa-calendar"></i>
                                                </div>
                                                <div class="other-services-content">
                                                    <h5>Student Analysis</h5>
                                                    <p>Dolor sit amet consecdi pisicing eliamsed do eiusmod tempornu</p>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                )}
            </div>
            {error && <p className="error">{error}</p>}
        </div>
        </div>
        </>
        
    );
};

export default QuizDash;
