import Sidebar from './Sidebar';
import { useTheme } from '../../context/ThemeContext';
import { useUI } from '../../context/UIContext';
import NewIssueModal from '../issues/NewIssueModal';

const Layout = ({ currentPage, onNavigate, children }) => {
  const { toggleSidebar } = useTheme();
  const { configOpen, closeConfig } = useUI();

  return (
    <>
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
      <NewIssueModal/>
      {configOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-[500] flex items-center
                     justify-center p-4 animate-fade-up"
          onClick={e => { if (e.target === e.currentTarget) closeConfig(); }}
        >
          <div className="glass-card w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
              <span className="font-display font-bold text-[15px] text-white tracking-tight">
                Configure Workspace
              </span>
              <button className="btn btn-ghost btn-icon" onClick={closeConfig}>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="p-6 text-[12px] text-white/50">
              Configuration UI is staged for the next iteration. This is wired and ready to expand.
            </div>
            <div className="px-6 pb-6 flex justify-end">
              <button className="btn btn-primary" onClick={closeConfig}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Layout;
