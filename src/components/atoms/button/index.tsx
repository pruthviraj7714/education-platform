import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: 'filled' | 'outlined';
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'filled',
  ...rest
}) => {
  const baseStyles =
    'font-medium py-3 px-4 text-[14px] rounded-[8px] transition duration-300 ease-in-out';
  const filledStyles = 'bg-primary hover:bg-orange-600 text-primary-light';
  const outlinedStyles =
    'bg-transparent border border-primary hover:bg-primary text-primary hover:text-white';

  return (
    <button
      className={`${baseStyles} ${variant === 'outlined' ? outlinedStyles : filledStyles
        } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
