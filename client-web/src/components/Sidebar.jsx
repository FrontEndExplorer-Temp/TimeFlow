import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    CheckSquare,
    DollarSign,
    FileText,
    Target,
    Clock,
    Briefcase,
    Bot,
    User,
    LogOut,
    Sun,
    Moon
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import { cn } from '../utils/cn';

const Sidebar = ({ isOpen, onClose }) => {
    const { logout } = useAuthStore();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
        { icon: DollarSign, label: 'Finance', path: '/finance' },
        { icon: FileText, label: 'Notes', path: '/notes' },
        { icon: Target, label: 'Habits', path: '/habits' },
        { icon: Clock, label: 'Timer', path: '/timer' },
        { icon: Briefcase, label: 'Jobs', path: '/jobs' },
        { icon: Bot, label: 'AI Assistant', path: '/ai' },
        { icon: User, label: 'Profile', path: '/profile' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={cn(
                "w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 flex items-center gap-3">
                    <img src="/icon.png" alt="TimeFlow Logo" className="w-8 h-8 rounded-xl object-cover" />
                    <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">TimeFlow</h1>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                cn(
                                    'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                                    isActive
                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                )
                            }
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    <button
                        onClick={useThemeStore.getState().toggleTheme}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                    >
                        {useThemeStore((state) => state.theme) === 'dark' ? (
                            <>
                                <Sun className="w-5 h-5 mr-3" />
                                Light Mode
                            </>
                        ) : (
                            <>
                                <Moon className="w-5 h-5 mr-3" />
                                Dark Mode
                            </>
                        )}
                    </button>

                    <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
