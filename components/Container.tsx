import { ReactNode, HTMLAttributes } from 'react';

interface ContainerProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

const Container = ({ children, ...props }: ContainerProps) => {
  return (
    <main {...props} className="max-w-7xl mx-auto flex items-center justify-between px-4 h-20 relative bg-gray-50">
      {children}
    </main>
  );
};

export default Container;
