import { ReactNode, HTMLAttributes } from 'react';

interface ContainerProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

const Container = ({ children, className = '', ...props }: ContainerProps) => {
  return (
    <div
      {...props}
      className={`max-w-screen-xl w-full mx-auto px-4 ${className}`}
    >
      {children}
    </div>
  );
};

export default Container;
