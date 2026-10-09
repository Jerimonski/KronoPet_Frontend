import "./App.css"
import { NotificationProvider } from "./core/hooks/useNotification"
import { AuthProvider } from "./features/auth/context/AuthContext"
import AppRouter from "./routes/AppRouter"
import ErrorBoundary from "./shared/components/ErrorBoundary"

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </NotificationProvider>
    </ErrorBoundary>
  )
}

export default App
