import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/pages/LandingPage';
import SurveyPage from './components/pages/SurveyPage';
import ThankYouPage from './components/pages/ThankYouPage';
import AdminLogin from './components/pages/AdminLogin';
import AdminDashboard from './components/pages/AdminDashboard';
import AdminSurveyCreate from './components/pages/AdminSurveyCreate';
import AdminSurveyDetail from './components/pages/AdminSurveyDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/survey/:id" element={<SurveyPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/surveys/new" element={<AdminSurveyCreate />} />
        <Route path="/admin/surveys/:id" element={<AdminSurveyDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;