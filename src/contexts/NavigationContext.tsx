import { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationState {
  scrollPositions: Record<string, number>;
  filters: Record<string, any>;
  searchTerms: Record<string, string>;
  breadcrumbs: Array<{ label: string; onClick?: () => void }>;
}

interface NavigationContextType {
  navigationState: NavigationState;
  updateScrollPosition: (section: string, position: number) => void;
  updateFilters: (section: string, filters: any) => void;
  updateSearchTerm: (section: string, term: string) => void;
  updateBreadcrumbs: (breadcrumbs: Array<{ label: string; onClick?: () => void }>) => void;
  getScrollPosition: (section: string) => number;
  getFilters: (section: string) => any;
  getSearchTerm: (section: string) => string;
  clearSectionState: (section: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    scrollPositions: {},
    filters: {},
    searchTerms: {},
    breadcrumbs: [{ label: 'Dashboard', onClick: undefined }]
  });

  const updateScrollPosition = (section: string, position: number) => {
    setNavigationState(prev => ({
      ...prev,
      scrollPositions: { ...prev.scrollPositions, [section]: position }
    }));
  };

  const updateFilters = (section: string, filters: any) => {
    setNavigationState(prev => ({
      ...prev,
      filters: { ...prev.filters, [section]: filters }
    }));
  };

  const updateSearchTerm = (section: string, term: string) => {
    setNavigationState(prev => ({
      ...prev,
      searchTerms: { ...prev.searchTerms, [section]: term }
    }));
  };

  const updateBreadcrumbs = (breadcrumbs: Array<{ label: string; onClick?: () => void }>) => {
    setNavigationState(prev => ({
      ...prev,
      breadcrumbs
    }));
  };

  const getScrollPosition = (section: string) => navigationState.scrollPositions[section] || 0;

  const getFilters = (section: string) => navigationState.filters[section] || {};

  const getSearchTerm = (section: string) => navigationState.searchTerms[section] || '';

  const clearSectionState = (section: string) => {
    setNavigationState(prev => ({
      ...prev,
      scrollPositions: { ...prev.scrollPositions, [section]: 0 },
      filters: { ...prev.filters, [section]: {} },
      searchTerms: { ...prev.searchTerms, [section]: '' }
    }));
  };

  return (
    <NavigationContext.Provider value={{
      navigationState,
      updateScrollPosition,
      updateFilters,
      updateSearchTerm,
      updateBreadcrumbs,
      getScrollPosition,
      getFilters,
      getSearchTerm,
      clearSectionState
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}