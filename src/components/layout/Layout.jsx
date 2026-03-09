import Sidebar from './Sidebar';
import { useTheme } from '../../context/ThemeContext';

const Layout = ({ currentPage, onNavigate, children }) => {
  const { toggleSidebar } = useTheme();

  return (
    <div className="flex min-h-screen relative z-10">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />

      {/* Mobile hamburger */}
      <button
        onClick={toggleSidebar}
        aria-label="Toggle menu"
        className="fixed top-4 left-4 z-[200] lg:hidden
                   flex items-center justify-center p-2 rounded-lg
                   bg-white/[0.06] border border-white/[0.09] backdrop-blur-glass
                   hover:bg-white/[0.10] transition-colors"
      >
        <svg className="w-4.5 h-4.5 text-white/70" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* Main content */}
      <main className="flex-1 ml-0 lg:ml-[240px] p-6 lg:p-8 pt-16 lg:pt-8 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default Layout;