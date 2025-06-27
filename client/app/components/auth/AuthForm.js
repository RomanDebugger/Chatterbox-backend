'use client';
export default function AuthForm({
  activeForm, loginData, signupData, setLoginData, setSignupData,
  handleSubmit, isLoading, primaryGradient, secondaryGradient
}) {  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="username"
        value={activeForm === 'login' ? loginData.username : signupData.username}
        onChange={(e) => {
          const value = e.target.value;
          if (activeForm === 'login') {
            setLoginData({ ...loginData, username: value });
          } else {
            setSignupData({ ...signupData, username: value });
          }
        }}
        className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
        placeholder="Username"
        required
      />
      <input
        name="password"
        type="password"
        value={activeForm === 'login' ? loginData.password : signupData.password}
        onChange={(e) => {
          const value = e.target.value;
          if (activeForm === 'login') {
            setLoginData({ ...loginData, password: value });
          } else {
            setSignupData({ ...signupData, password: value });
          }
        }}
        className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
        placeholder="Password"
        required
      />
      {activeForm === 'signup' && (
        <input
          name="confirm password"
          type="password"
          value={signupData.confirmPassword}
          onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
          className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
          placeholder="Confirm password"
          required
        />
      )}
      {activeForm === 'signup' && signupData.password && signupData.confirmPassword && signupData.password !== signupData.confirmPassword && (
        <p className="text-sm text-rose-400">Password do not match</p>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 font-medium rounded-lg text-white ${
          activeForm === 'login' 
          ? `bg-gradient-to-r ${primaryGradient}` 
          : `bg-gradient-to-r ${secondaryGradient}`
        } hover:shadow-md transition-all flex items-center justify-center`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {activeForm === 'login' ? 'Logging in...' : 'Creating account...'}
          </>
        ) : (
          activeForm === 'login' ? 'Let me in! 🚪' : 'Let me cook! 🍳'
        )}
      </button>
    </form>
  );
}
