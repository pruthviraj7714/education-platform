import React from 'react';
import { Select as AntSelect } from 'antd';

const { Option } = AntSelect;

interface OptionType {
    value: string | number;
    label: string;
}

interface SelectProps {
    name: string;
    label?: string;
    options: OptionType[];
    placeholder?: string;
    value?: string | number;  // Optional in case value is controlled externally
    onChange: (value: string | number) => void;  // Matches AntD onChange signature
    className?: string;
}

const Select: React.FC<SelectProps> = ({ label, options, placeholder, value, onChange, className }) => {
    return (
        <div>
            {label && (
                <label className="block text-[16px] mb-[8px] font-medium text-[#191919]/70">
                    {label}
                </label>
            )}
            <AntSelect
                value={value}
                onChange={onChange}  // Directly pass value, matching AntD's onChange
                placeholder={placeholder}
                className={`w-full rounded-[8px] min-h-[60px] bg-[#FCFCFD] ${className}`}
            >
                {options.map(option => (
                    <Option key={option.value} value={option.value}>
                        {option.label}
                    </Option>
                ))}
            </AntSelect>
        </div>
    );
};

export default Select;
