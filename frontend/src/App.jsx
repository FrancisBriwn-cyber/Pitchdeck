import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/Toast';

import Feed from './pages/Feed';
import SinglePitch from './pages/SinglePitch';
import Search from './pages/Search';
import RoleSelect from './pages/RoleSelect';
import FounderLogin from './pages/FounderLogin';
import FounderRegister from './pages/FounderRegister';
import BuilderLogin from './pages/BuilderLogin';
import BuilderRegister from './pages/BuilderRegister';
import OAuthCallback from './pages/OAuthCallback';
import CreatePitch from './pages/CreatePitch';
import EditPitch from './pages/EditPitch';
import UserProfile from './pages/UserProfile';

export default function App() {
  return (
    <>
      <Navbar />
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/pitches/:id" element={<SinglePitch />} />
        <Route path="/search" element={<Search />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        <Route path="/users/:id" element={<UserProfile />} />

        {/* Role selector */}
        <Route path="/join" element={<RoleSelect />} />

        {/* Founder auth */}
        <Route path="/founder/login" element={<FounderLogin />} />
        <Route path="/founder/register" element={<FounderRegister />} />

        {/* Builder auth */}
        <Route path="/builder/login" element={<BuilderLogin />} />
        <Route path="/builder/register" element={<BuilderRegister />} />

        {/* Protected */}
        <Route path="/pitches/new" element={
          <ProtectedRoute><CreatePitch /></ProtectedRoute>
        } />
        <Route path="/pitches/:id/edit" element={
          <ProtectedRoute><EditPitch /></ProtectedRoute>
        } />
      </Routes>
      <Footer />
    </>
  );
}
