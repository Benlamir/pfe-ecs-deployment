import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface RoleGuardProps {
    allowedRoles?: string[];
}

export function RoleGuard({ allowedRoles }: RoleGuardProps) {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
        return <Navigate to="/403" replace />;
    }

    return <Outlet />;
}
