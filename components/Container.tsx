import { ReactNode, HTMLAttributes } from 'react';

interface ContainerProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

const Container = ({ children, className = '', ...props }: ContainerProps) => {
  return (
    <div {...props} className={`mx-auto w-full max-w-[1320px] px-4 sm:px-6 ${className}`}>
      {children}
    </div>
  );
};

export default Container;
