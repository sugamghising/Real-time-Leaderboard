/**
 * Example App.tsx showing how to set up the context providers
 *
 * IMPORTANT: The order matters!
 * - AuthProvider must wrap SocketProvider
 * - SocketProvider depends on AuthProvider for user authentication
 */

import { AuthProvider } from "./AuthContext";
import { SocketProvider } from "./SocketContext";
// Import your main app component
// import YourMainApp from "../App";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        {/* <YourMainApp /> */}
        <div>Your App Content Here</div>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;

/**
 * Usage in components:
 *
 * import { useAuth } from './contexts/AuthContext';
 * import { useSocket } from './contexts/SocketContext';
 *
 * function MyComponent() {
 *   const { user, login, logout } = useAuth();
 *   const { connected, joinGameRoom, onLeaderboardUpdate } = useSocket();
 *
 *   // Your component logic...
 * }
 */
