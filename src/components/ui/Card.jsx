import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
    children,
    className = '',
    hover = false,
    padding = 'md',
    ...props
}) => {
    const paddingClasses = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    const Component = hover ? motion.div : 'div';
    const motionProps = hover ? {
        whileHover: { y: -2, boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' },
        transition: { duration: 0.2 }
    } : {};

    return (
        <Component
            className={`
        bg-white rounded-xl border border-gray-200 shadow-sm
        ${paddingClasses[padding]}
        ${className}
      `}
            {...motionProps}
            {...props}
        >
            {children}
        </Component>
    );
};

const CardHeader = ({ children, className = '' }) => (
    <div className={`mb-4 ${className}`}>
        {children}
    </div>
);

const CardTitle = ({ children, className = '' }) => (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
        {children}
    </h3>
);

const CardDescription = ({ children, className = '' }) => (
    <p className={`text-sm text-gray-500 mt-1 ${className}`}>
        {children}
    </p>
);

const CardContent = ({ children, className = '' }) => (
    <div className={className}>
        {children}
    </div>
);

const CardFooter = ({ children, className = '' }) => (
    <div className={`mt-4 pt-4 border-t border-gray-100 ${className}`}>
        {children}
    </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
