import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import ChatPage from '@/app/Pages/ChatPage';

export default function Chat() {
  return (
    <ProtectedRoute>
      <ChatPage />
    </ProtectedRoute>
  );
}