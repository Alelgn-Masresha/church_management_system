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

const BilingualLabel = ({ label, amharicLabel }: { label: string; amharicLabel?: string }) => (
  <div className="mb-1.5 leading-snug">
    <span className="block text-sm font-bold text-gray-800">{label}</span>
    {amharicLabel && <span className="block text-xs text-gray-500 font-medium mt-0.5">{amharicLabel}</span>}
  </div>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  amharicLabel?: string;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({ label, amharicLabel, containerClassName, className, ...props }) => (
  <div className={`flex flex-col ${containerClassName}`}>
    <BilingualLabel label={label} amharicLabel={amharicLabel} />
    <input
      className={`border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${className}`}
      {...props}
    />
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  amharicLabel?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, amharicLabel, options, className, ...props }) => (
  <div className="flex flex-col">
    <BilingualLabel label={label} amharicLabel={amharicLabel} />
    <div className="relative">
      <select
        className={`w-full border border-gray-300 rounded px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${className}`}
        {...props}
      >
        <option value="">Select... (ይምረጡ)</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
    </div>
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
      className={`mt-0.5 w-5 h-5 border rounded flex-shrink-0 flex items-center justify-center transition-colors ${
        checked ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-400 group-hover:border-blue-500'
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
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ label, amharicLabel, name, options, value, onChange, row = false }) => (
  <div className="flex flex-col">
    <BilingualLabel label={label} amharicLabel={amharicLabel} />
    <div className={`flex ${row ? 'flex-row gap-6 flex-wrap' : 'flex-col gap-3'}`}>
      {options.map((option) => (
        <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <div className="flex flex-col">
             <span className="text-sm font-medium text-gray-700">{option.label}</span>
             {option.amharicLabel && <span className="text-xs text-gray-500">{option.amharicLabel}</span>}
          </div>
        </label>
      ))}
    </div>
  </div>
);