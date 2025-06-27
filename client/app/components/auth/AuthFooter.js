'use client';
export default function AuthFooter({ activeForm }) {
  return (
    <div className="mt-6 text-center">
      <p className="text-slate-500 text-xs font-mono">
        {activeForm === 'login' 
          ? '"forgot password? skill issue much?"'
          : '"we don\'t track you (much)"'}
      </p>
    </div>
  );
}
