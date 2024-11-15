import React from 'react';
import { useFormContext } from 'react-hook-form';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    name: string;
    label?: string;
    className?: string;
}

const Input: React.FC<InputProps> = ({ name, label, className = '', ...rest }) => {
    const { register } = useFormContext();

    return (
        <div>
            {label && (
                <label
                    htmlFor={name}
                    className="block text-[16px] mb-[8px] font-medium text-[#191919]/70"
                >
                    {label}
                </label>
            )}
            <input
                id={name}
                className={`w-full px-5 py-5 border border-[#F1F1F3] rounded-[8px] placeholder:text-[#B3B3B3] font-normal leading-[21px] bg-[#FCFCFD] focus:outline-none ${className}`}
                {...register(name)}
                {...rest}
            />
        </div>
    );
};

export default Input;
