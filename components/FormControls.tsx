import React from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  amharicTitle?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, amharicTitle }) => (
  <div className="bg-gray-900 text-white px-4 py-3 rounded-md mb-6 flex flex-col md:flex-row md:items-center justify-between shadow-md">
    <h2 className="text-lg font-bold uppercase tracking-wide">{title}</h2>
    {amharicTitle && <span className="text-sm text-gray-300 font-medium">{amharicTitle}</span>}
  </div>
);

export const BilingualLabel = ({ label, amharicLabel, required, error }: { label: string; amharicLabel?: string; required?: boolean; error?: string }) => (
  <div className="mb-1.5 leading-snug">
    <span className={`block text-sm font-bold ${error ? 'text-red-600' : 'text-gray-800'}`}>
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </span>
    {amharicLabel && <span className="block text-xs text-gray-500 font-medium mt-0.5">{amharicLabel}</span>}
  </div>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  amharicLabel?: string;
  containerClassName?: string;
  required?: boolean;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, amharicLabel, containerClassName, className, required, error, ...props }) => (
  <div className={`flex flex-col ${containerClassName}`}>
    <BilingualLabel label={label} amharicLabel={amharicLabel} required={required} error={error} />
    <input
      className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'
        } ${className}`}
      {...props}
    />
    {error && <p className="text-[10px] text-red-600 font-bold uppercase mt-1 animate-fadeIn">{error}</p>}
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  amharicLabel?: string;
  options: { value: string; label: string }[];
  required?: boolean;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ label, amharicLabel, options, className, required, error, ...props }) => (
  <div className="flex flex-col">
    <BilingualLabel label={label} amharicLabel={amharicLabel} required={required} error={error} />
    <div className="relative">
      <select
        className={`w-full border rounded px-3 py-2 appearance-none focus:outline-none focus:ring-2 bg-white ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'
          } ${className}`}
        {...props}
      >
        <option value="">Select... (ይምረጡ)</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className={`absolute right-3 top-3 w-4 h-4 pointer-events-none ${error ? 'text-red-500' : 'text-gray-500'}`} />
    </div>
    {error && <p className="text-[10px] text-red-600 font-bold uppercase mt-1 animate-fadeIn">{error}</p>}
  </div>
);

interface CheckboxProps {
  label: string;
  amharicLabel?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: React.ReactNode;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, amharicLabel, checked, onChange, icon }) => (
  <label className="flex items-start space-x-2 cursor-pointer group select-none p-2 rounded hover:bg-gray-50 border border-transparent hover:border-gray-200">
    <div
      className={`mt-0.5 w-5 h-5 border rounded flex-shrink-0 flex items-center justify-center transition-colors ${checked ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-400 group-hover:border-blue-500'
        }`}
      onClick={() => onChange(!checked)}
    >
      {checked && <Check className="w-3.5 h-3.5 text-white" />}
    </div>
    <div className="flex flex-col">
      <span className="text-sm text-gray-800 font-bold flex items-center gap-2">
        {icon} {label}
      </span>
      {amharicLabel && <span className="text-xs text-gray-500 font-medium">{amharicLabel}</span>}
    </div>
  </label>
);

interface RadioGroupProps {
  label: string;
  amharicLabel?: string;
  name: string;
  options: { value: string; label: string; amharicLabel?: string }[];
  value: string;
  onChange: (value: string) => void;
  row?: boolean;
  required?: boolean;
  error?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ label, amharicLabel, name, options, value, onChange, row = false, required, error }) => (
  <div className="flex flex-col">
    <BilingualLabel label={label} amharicLabel={amharicLabel} required={required} error={error} />
    <div className={`flex ${row ? 'flex-row gap-6 flex-wrap' : 'flex-col gap-3'}`}>
      {options.map((option) => (
        <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-4 h-4 focus:ring-blue-500 ${error ? 'text-red-500 border-red-500' : 'text-blue-600 border-gray-300'}`}
          />
          <div className="flex flex-col">
            <span className={`text-sm font-medium ${error ? 'text-red-700' : 'text-gray-700'}`}>{option.label}</span>
            {option.amharicLabel && <span className={`text-xs ${error ? 'text-red-400' : 'text-gray-500'}`}>{option.amharicLabel}</span>}
          </div>
        </label>
      ))}
    </div>
    {error && <p className="text-[10px] text-red-600 font-bold uppercase mt-1 animate-fadeIn">{error}</p>}
  </div>
);