export default function AuthScreen({ 
  activeTab, 
  setActiveTab, 
  loginForm, 
  loginErrors, 
  handleLoginFormChange, 
  handleLoginSubmit,
  signupForm,
  signupErrors,
  handleSignupFormChange,
  handleSignupSubmit
}) {
  return (
    <div className="auth-container">
      <div className="auth-tabs">
        <button 
          className={activeTab === "login" ? "active" : ""} 
          onClick={() => setActiveTab("login")}
        >
          Login
        </button>
        <button 
          className={activeTab === "signup" ? "active" : ""} 
          onClick={() => setActiveTab("signup")}
        >
          Signup
        </button>
      </div>

      {activeTab === "login" && (
        <form className="auth-box" onSubmit={handleLoginSubmit}>
          <h2>Admin Login</h2>
          <div className="form-group">
            <input 
              type="email" 
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) => handleLoginFormChange("email", e.target.value)}
              className={loginErrors.email ? "input-error" : ""}
            />
            {loginErrors.email && <span className="error-message">{loginErrors.email}</span>}
          </div>
          <div className="form-group">
            <input 
              type="password" 
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => handleLoginFormChange("password", e.target.value)}
              className={loginErrors.password ? "input-error" : ""}
            />
            {loginErrors.password && <span className="error-message">{loginErrors.password}</span>}
          </div>
          <button type="submit" className="btn-submit">Login</button>
        </form>
      )}

      {/* Signup form goes here (similar structure to the login above, just using signup props) */}
      {activeTab === "signup" && (
         <form className="auth-box" onSubmit={handleSignupSubmit}>
           {/* ... paste the rest of your signup form JSX here, keeping your exact handleSignupFormChange logic */}
         </form>
      )}
    </div>
  );
}