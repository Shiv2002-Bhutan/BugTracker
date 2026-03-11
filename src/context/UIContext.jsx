import { createContext, useContext, useMemo, useState } from 'react';

const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
  const [newIssueOpen, setNewIssueOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [issueRefreshKey, setIssueRefreshKey] = useState(0);

  const value = useMemo(() => ({
    newIssueOpen,
    configOpen,
    issueRefreshKey,
    openNewIssue: () => setNewIssueOpen(true),
    closeNewIssue: () => setNewIssueOpen(false),
    openConfig: () => setConfigOpen(true),
    closeConfig: () => setConfigOpen(false),
    bumpIssueRefresh: () => setIssueRefreshKey(k => k + 1)
  }), [newIssueOpen, configOpen, issueRefreshKey]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
};
