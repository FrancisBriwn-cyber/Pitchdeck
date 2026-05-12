import { Link } from 'react-router-dom';
import { Rocket, Wrench } from 'lucide-react';

export default function RoleSelect() {
  return (
    <div className="role-select-page">
      <div className="role-select-inner">
        <div className="form-eyebrow">Get Started</div>
        <h1 className="role-select-title">Who are you joining as?</h1>
        <p className="role-select-subtitle">
          Every week, thousands of startup ideas die in someone's notes app. PitchDeck changes that.
        </p>

        <div className="role-cards">
          <div className="role-card">
            <div className="role-card-icon"><Rocket size={28} /></div>
            <h2>Founder</h2>
            <p>You have an idea and want honest feedback from people who build things — before you commit to building it yourself.</p>
            <Link to="/founder/register" className="btn btn-primary btn-full">Join as Founder</Link>
            <div className="role-card-login">Already a member? <Link to="/login">Log in</Link></div>
          </div>

          <div className="role-card role-card-builder">
            <div className="role-card-icon"><Wrench size={28} /></div>
            <h2>Builder</h2>
            <p>You enjoy spotting good problems, giving real feedback, and finding ideas worth building before they go mainstream.</p>
            <Link to="/register" className="btn btn-primary btn-full">Join as Builder</Link>
            <div className="role-card-login">Already a member? <Link to="/login">Log in</Link></div>
          </div>
        </div>
      </div>
    </div>
  );
}
