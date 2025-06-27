'use client';
export default function AuthToggle({ activeForm, setActiveForm, primaryGradient, secondaryGradient }) {
  return (
    <div className="flex bg-slate-700/50 rounded-lg p-1 mb-6">
      <button 
        className={`flex-1 py-2 rounded-md transition-all ${
          activeForm === 'login' 
          ? `bg-gradient-to-r ${primaryGradient} text-white shadow-md` 
          : 'text-slate-300 hover:text-white'
        }`}
        onClick={() => setActiveForm('login')}
      >
        Login
      </button>
      <button 
        className={`flex-1 py-2 rounded-md transition-all ${
          activeForm === 'signup' 
          ? `bg-gradient-to-r ${secondaryGradient} text-white shadow-md` 
          : 'text-slate-300 hover:text-white'
        }`}
        onClick={() => setActiveForm('signup')}
      >
        Sign Up
      </button>
    </div>
  );
}
