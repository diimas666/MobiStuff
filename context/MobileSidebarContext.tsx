'use client';
import { createContext, useContext, useState } from 'react';

type SidebarContextType = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export function MobileSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <SidebarContext.Provider value={{ isOpen, open, close }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useMobileSidebar() {
  const context = useContext(SidebarContext);
  if (!context)
    throw new Error(
      'useMobileSidebar must be used within MobileSidebarProvider'
    );
  return context;
}
