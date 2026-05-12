import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/Toast';

const Feed           = lazy(() => import('./pages/Feed'));
const SinglePitch    = lazy(() => import('./pages/SinglePitch'));
const Search         = lazy(() => import('./pages/Search'));
const AuthPage       = lazy(() => import('./pages/AuthPage'));
const FounderRegister= lazy(() => import('./pages/FounderRegister'));
const OAuthCallback  = lazy(() => import('./pages/OAuthCallback'));
const CreatePitch    = lazy(() => import('./pages/CreatePitch'));
const EditPitch      = lazy(() => import('./pages/EditPitch'));
const UserProfile    = lazy(() => import('./pages/UserProfile'));

function PageLoader() {
  return <div className="loading"><div className="spinner" /></div>;
}

export default function App() {
  return (
    <>
      <Navbar />
      <ToastContainer />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/pitches/:id" element={<SinglePitch />} />
          <Route path="/search" element={<Search />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="/users/:id" element={<UserProfile />} />

          {/* Unified auth — single login and register route */}
          <Route path="/login"    element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />

          {/* Full founder onboarding (2-step profile) */}
          <Route path="/founder/register" element={<FounderRegister />} />

          <Route path="/pitches/new" element={
            <ProtectedRoute><CreatePitch /></ProtectedRoute>
          } />
          <Route path="/pitches/:id/edit" element={
            <ProtectedRoute><EditPitch /></ProtectedRoute>
          } />
        </Routes>
      </Suspense>
      <Footer />
    </>
  );
}
