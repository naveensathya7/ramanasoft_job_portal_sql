import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Hire from './components/Hire';
import StaffHire from './components/StaffHire';
import Registration from './components/Registration';
import RegistrationRequests  from './components/RegistrationRequests/RegistrationRequests';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login';
import DashBoard from './components/DashBoard';
import HrDashBoard from './components/HRDashboard/HrDashboard';
import HrRegistration from './components/HrRegistration/HrRegistration';
import HrLogin from './components/HrLogin';
import PostJobs from './components/HrPostJobs/HrPostJobs';
import HrRegistrationRequests from './components/HrRegistrationRequests/HrRegistrationRequests';
import HrProfile from './components/HrProfile/HrProfile';
import 'bootstrap/dist/css/bootstrap.min.css';
import HrViewJobs from './components/HrViewJobs/HrViewJobs';
import HrPastJobs from './components/HrPastJobs/HrPastJobs';
import StudentsApplied from './components/StudentsApplied';
import StudentsQualified from './components/StudentsQualified'
import StudentsPlaced from './components/StudentsPlaced';
import StudentsNotPlaced from './components/StudentsNotPlaced'
import CreateDash from './components/Quiz/Admin/quiz/QuizCreate/CreateDash';
import QuizCreationPage from './components/Quiz/editor';
import HomePage from './components/Quiz/home/home';
import AdminLogin from './components/Quiz/login/admin_login';
import InternLogin from './components/Quiz/login/intern_login';
import AdminDash from './components/Quiz/Admin/dashboard';
import PreviewQuiz from './components/Quiz/Admin/quiz/preview/preview';
import SubmissionsList from './components/Quiz/Admin/interns_data/formdetails';
import AssignQuiz from './components/Quiz/Admin/quiz/QuizCreate/Publish/Assign';
import InternDashboard from './components/Quiz/intern/dashboard';
import QuizAttempt from './components/Quiz/Admin/quiz/QuizAttempt';
import QuizResults from './components/Quiz/Admin/results';
import ResponsePage from './components/Quiz/Admin/quiz/QuizCreate/Analyze/ResponsePage';
import UserQuizAnalysis from './components/Quiz/intern/userAnalyze';
import QuizDash from './components/Quiz/Admin/quiz/quizdash';

const hrDetails = {
  companyName: 'Ramanasoft',
  email: 'naveensathya.vanamoju@gmail.com',
  phone: '09515982621',
  jobTitle: 'Associate Software Engineer',
  // Add more details as needed
};


function App() {
  return (
    <div className=''>
       <BrowserRouter>
       <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/about' element={<About/>}/>
        <Route path='/contact' element={<Contact/>}/>
        <Route path='/hire' element={<Hire/>}/>
        <Route path='/about-staff-hiring' element={<StaffHire/>}/>
        <Route path='/registration' element={<Registration/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/dashboard' element={<DashBoard/>}/>
        <Route path='/hr-dashboard' element={<HrDashBoard/>}/>
        <Route path='/hr-registration' element={<HrRegistration/>}/>
        <Route path='/hr-login' element={<HrLogin/>}/>
        <Route path="/hr-dashboard/registration-requests" element={<RegistrationRequests/>}/>
        <Route path="/hr-dashboard/post-jobs" element={<PostJobs/>}/>
        <Route path="/hr-dashboard/past-jobs" element={<HrPastJobs/>}/>
        <Route path="/hr-dashboard/view-jobs" element={<HrViewJobs/>}/>
        <Route path="/superadmin-dashboard/hr-requests" element={<HrRegistrationRequests/>}/>
        <Route path="/hr-dashboard/profile" element={<HrProfile hrDetails={hrDetails}/>}/>
        <Route path="/hr-dashboard/students-applied" element={<StudentsApplied/>} />
        <Route path="/hr-dashboard/students-qualified" element={<StudentsQualified/>} />
        <Route path="/hr-dashboard/students-placed" element={<StudentsPlaced/>} />
       <Route path="/hr-dashboard/students-not-placed" element={<StudentsNotPlaced/>} />
       <Route path = "/hr-dashboard/quiz" element ={< QuizDash />} />

        {/*<Route path="/hr-dashboard/hr-leads" element={<HrLeads/>} />
        <Route path="/hr-dashboard/hr-confirmed-leads" element={<HrConfirmedLeads/>} />
        <Route path="/hr-dashboard/recruiters" element={<Recruiters/>} />
        <Route path="/hr-dashboard/not-interested-hrs" element={<NotInterestedHrs/>} />*/}
       </Routes>
       <Routes path = "/quiz/*">
       <Route path='/edit/*'>
            <Route path='create/:token' element={<CreateDash defaultTab="Create" />} />
            <Route path='configure/:token' element={<CreateDash defaultTab="Configure" />} />
            <Route path='publish/:token' element={<CreateDash defaultTab="Publish" />} />
            <Route path='preview/:token' element={<CreateDash defaultTab="Preview" />} />
            <Route path='analyze/:token' element={<CreateDash defaultTab="Analyze" />} />
          </Route>
          <Route path="results/:quizToken/:userId" element={<QuizResults />} />
          <Route path='quizze/:token' element={<PreviewQuiz />} />
          <Route path="quiz/:user_id/:token" element={<QuizAttempt />} />
          <Route path='preview/:token' element={<PreviewQuiz />} />
          <Route path='editor' element={<QuizCreationPage />} />
          <Route path='/' element={<QuizDash />} />
          <Route path='login/*'>
            <Route path='admin' element={<AdminLogin />} />
            <Route path='intern-login' element={<InternLogin />} />
          </Route>
          <Route path='admin/*'>
            <Route path='dashboard' element = {<AdminDash />} />
          </Route>
          <Route path='admin/dashboard?option02' element = {<SubmissionsList />} />
          <Route path='assign' element={<AssignQuiz />} />
          <Route path='intern/dashboard/:user_id' element={<InternDashboard />} />
          <Route path='responses' element={<ResponsePage />} />
          <Route path='quiz-analysis/:userId/:quizToken' element={<UserQuizAnalysis />} />
       </Routes>
       
       </BrowserRouter>
       <ToastContainer autoClose={5000}/>
    </div>
  );
}

export default App;
