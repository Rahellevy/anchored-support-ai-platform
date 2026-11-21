import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { RequireDisclosure } from './components/RequireDisclosure'
import { useAuth } from './hooks/useAuth'
import { AdminLayout } from './pages/AdminLayout'
import { AlertsPage } from './pages/AlertsPage'
import { ConversationPage } from './pages/ConversationPage'
import { KnowledgeBaseDocumentPage } from './pages/KnowledgeBaseDocumentPage'
import { KnowledgeBasePage } from './pages/KnowledgeBasePage'
import { LoginPage } from './pages/LoginPage'
import { MonitoringPage } from './pages/MonitoringPage'
import { PatientChatPage } from './pages/PatientChatPage'
import { PatientDisclosurePage } from './pages/PatientDisclosurePage'
import { PatientHomePage } from './pages/PatientHomePage'
import { RedFlagRulesPage } from './pages/RedFlagRulesPage'
import { TherapistDashboardPage } from './pages/TherapistDashboardPage'
import { TherapistLayout } from './pages/TherapistLayout'
import { UsersPage } from './pages/UsersPage'
import { homePathFor } from './utils/homePath'

/**
 * Every URL in the app.
 *
 * Nesting works in two layers:
 *  - ProtectedRoute checks the user's role, then renders its child route.
 *  - A layout (TherapistLayout, AdminLayout) draws the header + banner, and the matched
 *    page renders inside it. So pages only contain their own content.
 *
 * To add a page: create it in src/pages/, then add a <Route> inside the right layout.
 */
export function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Therapist portal */}
            <Route element={<ProtectedRoute allow={['Therapist']} />}>
                <Route path="/therapist" element={<TherapistLayout />}>
                    <Route index element={<TherapistDashboardPage />} />
                    <Route path="alerts" element={<AlertsPage />} />
                    <Route path="conversations/:conversationId" element={<ConversationPage />} />
                </Route>
            </Route>

            {/* Admin portal */}
            <Route element={<ProtectedRoute allow={['Admin']} />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="users" replace />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="rules" element={<RedFlagRulesPage />} />
                    <Route path="knowledge-base" element={<KnowledgeBasePage />} />
                    <Route path="knowledge-base/new" element={<KnowledgeBaseDocumentPage />} />
                    <Route path="knowledge-base/:documentId" element={<KnowledgeBaseDocumentPage />} />
                    <Route path="monitoring" element={<MonitoringPage />} />
                </Route>
            </Route>

            {/* Patient portal: disclosure first, then everything else */}
            <Route element={<ProtectedRoute allow={['Patient']} />}>
                <Route path="/patient/welcome" element={<PatientDisclosurePage />} />
                <Route element={<RequireDisclosure />}>
                    <Route path="/patient" element={<PatientHomePage />} />
                    <Route path="/patient/chat" element={<PatientChatPage />} />
                </Route>
            </Route>

            {/* Any other URL: send the user to their home page (or the login page) */}
            <Route path="*" element={<HomeRedirect />} />
        </Routes>
    )
}

function HomeRedirect() {
    const { user, isLoading } = useAuth()
    if (isLoading) return null
    return <Navigate to={(user && homePathFor(user)) ?? '/login'} replace />
}
