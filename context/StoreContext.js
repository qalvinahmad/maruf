import { createContext, useContext, useState } from 'react';

const StoreContext = createContext({
  getCachedItems: () => null,
  setCachedItems: () => null,
  clearCache: () => null
});

export function StoreProvider({ children }) {
  const [cache, setCache] = useState(new Map());

  const getCachedItems = (key) => {
    return cache.get(key);
  };

  const setCachedItems = (key, data) => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.set(key, data);
      return newCache;
    });
  };

  const clearCache = () => {
    setCache(new Map());
  };

  const value = {
    getCachedItems,
    setCachedItems,
    clearCache
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => {
  const context = useContext(StoreContext);
  return context;
};
