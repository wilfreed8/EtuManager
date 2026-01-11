import React from 'react';

const StatCard = ({ label, value, unit, subtext, icon, type }) => {
    if (type === 'highlight') {
        return (
            <div className="relative overflow-hidden bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-100 flex flex-col justify-between group h-52">
                <div className="relative z-10 flex justify-between items-start">
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                        {icon}
                    </div>
                    <span className="text-white/70 text-sm font-semibold uppercase tracking-wider">{label}</span>
                </div>
                <div className="relative z-10">
                    <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black">{value}</span>
                        {unit && <span className="text-xl font-bold opacity-80">{unit}</span>}
                    </div>
                    <p className="text-white/80 mt-1 font-medium">{subtext}</p>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 group-hover:scale-110 transition-transform duration-500 delay-75"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col justify-between h-52 group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div className={`p-2.5 rounded-xl ${type === 'alert' ? 'bg-orange-50' : 'bg-blue-50'}`}>
                    {icon}
                </div>
                <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider">{label}</span>
            </div>
            <div>
                <div className="flex items-center gap-3">
                    <span className="text-5xl font-extrabold text-slate-900 tracking-tight">{value}</span>
                    {type === 'alert' && (
                        <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wide">
                            {subtext}
                        </span>
                    )}
                </div>
                {type !== 'alert' && <p className="text-slate-400 mt-1 font-medium">{subtext}</p>}
            </div>
        </div>
    );
};

export default StatCard;
