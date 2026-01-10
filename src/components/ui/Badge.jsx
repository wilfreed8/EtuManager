const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    pending: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
};

const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
};

const Badge = ({
    children,
    variant = 'default',
    size = 'md',
    dot = false,
    className = ''
}) => {
    return (
        <span
            className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
        >
            {dot && (
                <span className={`w-1.5 h-1.5 rounded-full ${variant === 'success' ? 'bg-emerald-500' :
                        variant === 'danger' ? 'bg-red-500' :
                            variant === 'warning' ? 'bg-amber-500' :
                                variant === 'pending' ? 'bg-orange-500' :
                                    variant === 'completed' ? 'bg-green-500' :
                                        variant === 'primary' ? 'bg-blue-500' :
                                            'bg-gray-500'
                    }`} />
            )}
            {children}
        </span>
    );
};

export default Badge;
