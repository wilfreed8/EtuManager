import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatsCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendLabel,
    variant = 'default',
    className = ''
}) => {
    const variants = {
        default: 'bg-white',
        primary: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
        success: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white',
        warning: 'bg-gradient-to-br from-amber-500 to-amber-600 text-white',
    };

    const isPositive = trend > 0;
    const isNegative = trend < 0;
    const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
        rounded-xl border border-gray-200 p-6 shadow-sm
        ${variants[variant]}
        ${className}
      `}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className={`text-sm font-medium ${variant === 'default' ? 'text-gray-500' : 'text-white/80'}`}>
                        {title}
                    </p>
                    <motion.p
                        className={`mt-2 text-3xl font-bold ${variant === 'default' ? 'text-gray-900' : 'text-white'}`}
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    >
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </motion.p>

                    {trend !== undefined && (
                        <div className={`mt-2 flex items-center gap-1 text-sm ${variant === 'default'
                                ? isPositive ? 'text-emerald-600' : isNegative ? 'text-red-600' : 'text-gray-500'
                                : 'text-white/80'
                            }`}>
                            <TrendIcon className="w-4 h-4" />
                            <span>{isPositive ? '+' : ''}{trend}%</span>
                            {trendLabel && <span className="text-gray-400 ml-1">{trendLabel}</span>}
                        </div>
                    )}
                </div>

                {Icon && (
                    <div className={`p-3 rounded-lg ${variant === 'default' ? 'bg-blue-50' : 'bg-white/20'
                        }`}>
                        <Icon className={`w-6 h-6 ${variant === 'default' ? 'text-blue-600' : 'text-white'}`} />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default StatsCard;
