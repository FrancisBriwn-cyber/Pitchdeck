import { Link } from 'react-router-dom';

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
            <div className="role-card-icon">🚀</div>
            <h2>Founder</h2>
            <p>You have a startup idea and want structured feedback from real builders to validate and improve it.</p>
            <Link to="/founder/register" className="btn btn-primary btn-full">Join as Founder</Link>
            <div className="role-card-login">Already a member? <Link to="/founder/login">Log in</Link></div>
          </div>

          <div className="role-card role-card-builder">
            <div className="role-card-icon">🔧</div>
            <h2>Builder</h2>
            <p>You want to discover early-stage ideas, share your expertise, and find projects worth building.</p>
            <Link to="/builder/register" className="btn btn-primary btn-full">Join as Builder</Link>
            <div className="role-card-login">Already a member? <Link to="/builder/login">Log in</Link></div>
          </div>
        </div>
      </div>
    </div>
  );
}
