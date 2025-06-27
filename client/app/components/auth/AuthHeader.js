'use client';
import Logo from '../Logo';

 const AuthHeader = ({ primaryGradient }) => {
  return (
    <div className="text-center mb-8">
      <Logo className="w-16 h-16 mx-auto mb-4" />
      <h1 className={`text-4xl font-bold mb-2 bg-gradient-to-r ${primaryGradient} bg-clip-text text-transparent`}>
        Chatterbox
      </h1>
      <p className="text-slate-300 font-mono">"Chat or are we cooked? 💀"</p>
      <p className="text-slate-400 text-sm mt-1 font-mono">no emails, just vibes</p>
    </div>
  );
}
export default AuthHeader;