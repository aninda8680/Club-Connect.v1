// src/pages/NotAuthorized.tsx
export default function NotAuthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-red-500">🚫 Not Authorized</h1>
        <p className="text-slate-300">You don't have permission to access this page.</p>
      </div>
    </div>
  );
}
