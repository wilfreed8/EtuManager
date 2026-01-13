import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({
    label,
    options = [],
    error,
    icon: Icon,
    placeholder = 'Sélectionner...',
    className = '',
    children,
    ...props
}, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <Icon className="w-5 h-5" />
                    </div>
                )}
                <select
                    ref={ref}
                    className={`
            w-full px-4 py-2.5 rounded-lg border bg-white appearance-none
            transition-all duration-200 cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${Icon ? 'pl-10' : ''}
            ${error
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 hover:border-gray-400'
                        }
            ${className}
          `}
                    {...props}
                >
                    {children ? (
                        children
                    ) : (
                        <React.Fragment>
                            <option value="" disabled>{placeholder}</option>
                            {options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </React.Fragment>
                    )}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <ChevronDown className="w-5 h-5" />
                </div>
            </div>
            {error && (
                <p className="mt-1.5 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
});

Select.displayName = 'Select';

export default Select;
