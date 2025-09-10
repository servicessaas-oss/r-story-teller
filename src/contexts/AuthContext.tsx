// Compatibility layer - maps old useAuth to new useLocalAuth
// This allows existing components to work without modification
import { useLocalAuth } from './LocalAuthContext';

export const useAuth = useLocalAuth;
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // This is just a placeholder - the real provider is LocalAuthProvider in App.tsx
  return <>{children}</>;
};