import React from 'react';
import { Users, MapPin, ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const ClassCard = ({ classData }) => {
    const isCompleted = classData.status === 'completed';

    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col h-full hover:shadow-lg hover:border-blue-100 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">{classData.name}</h3>
                    <p className="text-slate-400 text-sm font-medium">{classData.subject}</p>
                </div>
                <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-500'}`}>
                    {classData.statusIcon}
                </div>
            </div>

            <div className="flex-1 space-y-5">
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-[11px] uppercase tracking-widest font-black">
                        <span className="text-slate-400">Grading Progress</span>
                        <span className={isCompleted ? "text-green-500" : "text-orange-500"}>
                            {isCompleted ? "Completed" : `${classData.progress}%`}
                        </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.3)]'}`}
                            style={{ width: `${classData.progress}%` }}
                        ></div>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                        {isCompleted ? "All grades submitted" : `${classData.studentsGraded}/${classData.totalStudents} students graded`}
                    </p>
                </div>

                <div className="flex items-center gap-4 text-slate-500 font-bold">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                        <Users size={14} className="text-slate-400" />
                        <span className="text-xs">{classData.totalStudents}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                        <MapPin size={14} className="text-slate-400" />
                        <span className="text-xs">{classData.room}</span>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <Link to={`/grades?class_id=${classData.class_id}&subject_id=${classData.subject_id}`}>
                    {classData.status === 'completed' ? (
                        <button className="w-full py-3.5 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
                            View Class
                        </button>
                    ) : (
                        <button className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                            {classData.status === 'pending' ? (
                                <>
                                    Continue Grading <ArrowRight size={16} />
                                </>
                            ) : (
                                <>
                                    Start Grading <Play size={14} fill="currentColor" />
                                </>
                            )}
                        </button>
                    )}
                </Link>
            </div>
        </div>
    );
};

export default ClassCard;
