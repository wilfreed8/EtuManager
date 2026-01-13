import React from 'react';
import { motion } from 'framer-motion';

const DonutChart = ({
    percentage = 0,
    size = 120,
    strokeWidth = 12,
    primaryColor = '#3b82f6',
    secondaryColor = '#e5e7eb',
    label,
    sublabel
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    {/* Background Circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke={secondaryColor}
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress Circle */}
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke={primaryColor}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    />
                </svg>

                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        className="text-2xl font-bold text-gray-900"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {percentage}%
                    </motion.span>
                    {sublabel && (
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                            {sublabel}
                        </span>
                    )}
                </div>
            </div>

            {label && (
                <p className="mt-3 text-sm font-medium text-gray-700">{label}</p>
            )}
        </div>
    );
};

export default DonutChart;
