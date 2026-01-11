import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Upload,
    Save,
    Search,
    Info,
    CheckCircle2
} from 'lucide-react';
import { Card, Button, Select } from '../components/ui';
import api from '../lib/api';
import { toast } from 'react-hot-toast';

const GradeEntry = ({ user }) => {
    const [students, setStudents] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const [numInterros, setNumInterros] = useState(2);
    const [selectedClass, setSelectedClass] = useState('');
    const [activePeriod, setActivePeriod] = useState(null);
    const isAdmin = ['PROVISEUR', 'CENSEUR', 'ADMIN', 'SUPER_ADMIN'].includes(user?.role);

    // Fetch assignments and periods on load
    useEffect(() => {
        const fetchInitialData = async () => {
            if (!user?.id) return;
            try {
                // Fetch active period first
                const activeRes = await api.get('/active-period');
                setActivePeriod(activeRes.data);
                if (activeRes.data) {
                    setSelectedPeriod(activeRes.data.id);
                }

                // Fetch teacher assignments
                const assignRes = await api.get(`/teachers/my-assignments?user_id=${user.id}`);
                const mappedAssignments = assignRes.data.map(a => ({
                    id: a.id,
                    class_id: a.class_id,
                    class_name: a.class_name,
                    subject_id: a.subject_id,
                    subject_name: a.subject_name,
                }));
                setAssignments(mappedAssignments);

                // Check URL params
                const params = new URLSearchParams(window.location.search);
                const classId = params.get('class_id');
                const subjectId = params.get('subject_id');

                if (classId) {
                    setSelectedClass(classId);
                    if (subjectId) {
                        const found = mappedAssignments.find(a => a.class_id === classId && a.subject_id === subjectId);
                        if (found) setSelectedAssignment(found);
                    } else {
                        const firstForClass = mappedAssignments.find(a => a.class_id === classId);
                        if (firstForClass) setSelectedAssignment(firstForClass);
                    }
                } else if (mappedAssignments.length > 0) {
                    setSelectedClass(mappedAssignments[0].class_id);
                    setSelectedAssignment(mappedAssignments[0]);
                }

                // Fetch all periods (for admin toggle)
                const periodRes = await api.get('/periods');
                setPeriods(periodRes.data);

            } catch (err) {
                console.error("Error fetching initial data", err);
                toast.error("Erreur chargement données");
            }
        };
        fetchInitialData();
    }, [user?.id]);

    // Update assignment when class changes
    const onClassChange = (classId) => {
        setSelectedClass(classId);
        const firstForClass = assignments.find(a => String(a.class_id) === String(classId));
        setSelectedAssignment(firstForClass);
    };

    // Fetch students and their existing grades when assignment or period changes
    useEffect(() => {
        const fetchStudentsWithGrades = async () => {
            if (!selectedAssignment || !selectedPeriod) return;
            setLoading(true);
            try {
                // Fetch students for the class
                const studentsRes = await api.get(`/students?class_id=${selectedAssignment.class_id}`);

                // Fetch existing grades for this class/subject/period
                const gradesRes = await api.get(`/grades?subject_id=${selectedAssignment.subject_id}&period_id=${selectedPeriod}`);
                const gradesMap = {};
                gradesRes.data.forEach(g => {
                    gradesMap[g.student_id] = {
                        interro1: '',
                        interro2: '',
                        interro3: '',
                        db_interro_avg: g.interro_avg,
                        devoir: g.devoir_avg !== null ? String(g.devoir_avg) : '',
                        compo: g.compo_grade !== null ? String(g.compo_grade) : '',
                    };
                });

                const mappedStudents = studentsRes.data.map(s => ({
                    id: s.id,
                    name: `${s.last_name} ${s.first_name}`,
                    matricule: s.registration_number,
                    avatar: s.avatar,
                    grades: gradesMap[s.id] || { interro1: '', interro2: '', interro3: '', db_interro_avg: null, devoir: '', compo: '' }
                }));
                setStudents(mappedStudents);

            } catch (err) {
                console.error("Failed to fetch students", err);
                toast.error("Erreur chargement élèves");
            } finally {
                setLoading(false);
            }
        };
        fetchStudentsWithGrades();
    }, [selectedAssignment, selectedPeriod]);

    const handleAssignmentChange = (assignmentId) => {
        const assign = assignments.find(a => String(a.id) === String(assignmentId));
        setSelectedAssignment(assign);
    };

    const handleGradeChange = (studentId, type, value) => {
        if (value !== '' && (isNaN(value) || value < 0 || value > 20)) return;

        setStudents(prev => prev.map(s =>
            s.id === studentId ? { ...s, grades: { ...s.grades, [type]: value } } : s
        ));
    };

    const calculateInterroAverage = (grades) => {
        const checkValues = [grades.interro1, grades.interro2];
        if (numInterros === 3) checkValues.push(grades.interro3);

        const values = checkValues.filter(v => v !== '');
        if (values.length === 0) return grades.db_interro_avg !== null ? parseFloat(grades.db_interro_avg).toFixed(1) : '-';
        const sum = values.reduce((acc, val) => acc + parseFloat(val), 0);
        return (sum / values.length).toFixed(1);
    };

    const calculateGlobalAverage = (grades) => {
        const interroAvg = calculateInterroAverage(grades);
        const { devoir, compo } = grades;
        if (interroAvg === '-' || !devoir || !compo) return '-';

        // Poids: Interro 1, Devoir 2, Compo 3
        const avg = (parseFloat(interroAvg) * 1 + parseFloat(devoir) * 2 + parseFloat(compo) * 3) / 6;
        return avg.toFixed(1);
    };

    const handleSave = async (isFinal = false) => {
        setLoading(true);
        try {
            const promises = students.map(student => {
                const interroAvg = calculateInterroAverage(student.grades);
                const globalAvg = calculateGlobalAverage(student.grades);

                if (interroAvg === '-' && !student.grades.devoir && !student.grades.compo) {
                    return Promise.resolve();
                }

                return api.post('/grades', {
                    student_id: student.id,
                    subject_id: selectedAssignment?.subject_id,
                    period_id: selectedPeriod,
                    interro_avg: interroAvg !== '-' ? parseFloat(interroAvg) : null,
                    devoir_avg: student.grades.devoir ? parseFloat(student.grades.devoir) : null,
                    compo_grade: student.grades.compo ? parseFloat(student.grades.compo) : null,
                    period_avg: globalAvg !== '-' ? parseFloat(globalAvg) : null
                });
            });

            await Promise.allSettled(promises);
            toast.success(isFinal ? 'Notes validées !' : 'Brouillon enregistré');
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors de la sauvegarde');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadTemplate = () => {
        const headers = ["Matricule", "Nom", "Prénom", "Int 1", "Int 2", "Int 3", "Devoir", "Composition"];
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `modele_notes_${selectedAssignment?.class_name || 'classe'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5 } }
    };

    const classesList = [...new Set(assignments.map(a => a.class_id))].map(cid => {
        const a = assignments.find(as => as.class_id === cid);
        return { id: cid, name: a.class_name };
    });

    const subjectsForClass = assignments.filter(a => String(a.class_id) === String(selectedClass));

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 max-w-7xl mx-auto pb-24"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Saisie des notes</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 font-medium italic">
                        <span className="text-blue-600 font-bold">Accueil</span> / <span>Classes</span> / <span>{selectedAssignment?.class_name || '...'}</span> / <span className="text-gray-900 font-bold">{selectedAssignment?.subject_name || '...'}</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" icon={Upload} className="bg-white font-bold border-gray-200" onClick={handleDownloadTemplate}>
                        Modèle CSV
                    </Button>
                    <Button icon={Upload} className="bg-white text-gray-700 border-gray-200 font-bold" onClick={() => fileInputRef.current?.click()}>
                        Importer CSV
                    </Button>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".csv" />
                </div>
            </div>

            {/* Selectors Bar */}
            <Card className="p-4 rounded-3xl border-none shadow-xl shadow-gray-100 flex flex-wrap items-center gap-4 bg-white/80 backdrop-blur-md">
                <div className="w-48">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-1 tracking-widest">Classe</p>
                    <select
                        value={selectedClass}
                        onChange={(e) => onClassChange(e.target.value)}
                        className="w-full h-11 px-4 bg-gray-50 border-none rounded-2xl text-sm font-black text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                    >
                        {classesList.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="w-48">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-1 tracking-widest">Matière</p>
                    <select
                        value={selectedAssignment?.id || ''}
                        onChange={(e) => handleAssignmentChange(e.target.value)}
                        className="w-full h-11 px-4 bg-gray-50 border-none rounded-2xl text-sm font-black text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                    >
                        {subjectsForClass.map(s => (
                            <option key={s.id} value={s.id}>{s.subject_name}</option>
                        ))}
                    </select>
                </div>
                <div className="w-48">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-1 tracking-widest">Période</p>
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        disabled={!isAdmin}
                        className="w-full h-11 px-4 bg-gray-50 border-none rounded-2xl text-sm font-black text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50 cursor-pointer"
                    >
                        {periods.map(p => (
                            <option key={p.id} value={p.id}>{p.name} {!isAdmin && p.id === activePeriod?.id ? '(Verrouillé)' : ''}</option>
                        ))}
                    </select>
                </div>
            </Card>

            {/* Main Spreadsheet Card */}
            <Card className="p-0 border-none shadow-2xl shadow-gray-200/40 rounded-3xl overflow-hidden ring-1 ring-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                <th rowSpan="2" className="px-8 py-5 text-left font-black text-gray-400 uppercase tracking-widest text-[10px] w-64">ÉLÈVE</th>
                                <th colSpan={numInterros + 1} className="px-6 py-4 text-center font-black text-blue-600 uppercase tracking-widest text-[10px] border-l border-gray-100 bg-blue-50/20">
                                    <div className="flex items-center justify-center gap-2">
                                        INTERROGATIONS
                                        {numInterros < 3 && (
                                            <button
                                                onClick={() => setNumInterros(prev => prev + 1)}
                                                className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm"
                                            >
                                                +
                                            </button>
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-center font-black text-indigo-600 uppercase tracking-widest text-[10px] border-l border-gray-100 bg-indigo-50/20">DEVOIRS</th>
                                <th className="px-6 py-4 text-center font-black text-purple-600 uppercase tracking-widest text-[10px] border-l border-gray-100 bg-purple-50/20">COMPO</th>
                                <th className="px-6 py-4 text-center font-black text-gray-600 uppercase tracking-widest text-[10px] border-l border-gray-100 bg-gray-50/50">MOYENNE</th>
                            </tr>
                            <tr className="bg-white border-b border-gray-100">
                                <th className="px-4 py-2 font-black text-gray-400 uppercase text-[9px] border-l border-gray-50">Int 1</th>
                                <th className="px-4 py-2 font-black text-gray-400 uppercase text-[9px] border-l border-gray-50">Int 2</th>
                                {numInterros === 3 && (
                                    <th className="px-4 py-2 font-black text-gray-400 uppercase text-[9px] border-l border-gray-50">Int 3</th>
                                )}
                                <th className="px-4 py-2 font-black text-blue-600 uppercase text-[9px] border-l border-blue-100 bg-blue-50/40 italic">Moy. Int</th>
                                <th className="px-4 py-3 font-black text-indigo-600 uppercase text-[9px] border-l border-gray-50">Note</th>
                                <th className="px-4 py-3 font-black text-purple-600 uppercase text-[9px] border-l border-gray-50">Note</th>
                                <th className="px-4 py-3 font-black text-gray-600 uppercase text-[9px] border-l border-gray-100 italic">Trimestrielle</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map((student) => {
                                const interroAvg = calculateInterroAverage(student.grades);
                                const globalAvg = calculateGlobalAverage(student.grades);

                                return (
                                    <tr key={student.id} className="hover:bg-blue-50/10 transition-colors group">
                                        <td className="px-8 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white shadow-sm overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform">
                                                    {student.avatar ? (
                                                        <img src={student.avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-black text-xs">
                                                            {student.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 leading-none">{student.name}</p>
                                                    <p className="text-[10px] font-black text-gray-300 mt-1 uppercase tracking-tight">ID: {student.matricule}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-2 py-4 border-l border-gray-50">
                                            <input
                                                type="text"
                                                className="w-12 h-10 mx-auto block bg-white border border-gray-100 rounded-xl text-center font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm group-hover:border-blue-200 transition-all"
                                                placeholder="-"
                                                value={student.grades.interro1}
                                                onChange={(e) => handleGradeChange(student.id, 'interro1', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-2 py-4 border-l border-gray-50">
                                            <input
                                                type="text"
                                                className="w-12 h-10 mx-auto block bg-white border border-gray-100 rounded-xl text-center font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm group-hover:border-blue-200 transition-all"
                                                placeholder="-"
                                                value={student.grades.interro2}
                                                onChange={(e) => handleGradeChange(student.id, 'interro2', e.target.value)}
                                            />
                                        </td>
                                        {numInterros === 3 && (
                                            <td className="px-2 py-4 border-l border-gray-50">
                                                <input
                                                    type="text"
                                                    className="w-12 h-10 mx-auto block bg-white border border-gray-100 rounded-xl text-center font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm group-hover:border-blue-200 transition-all font-outfit"
                                                    placeholder="-"
                                                    value={student.grades.interro3}
                                                    onChange={(e) => handleGradeChange(student.id, 'interro3', e.target.value)}
                                                />
                                            </td>
                                        )}
                                        <td className="px-4 py-4 border-l border-blue-100 bg-blue-50/20 text-center font-black text-sm italic">
                                            <span className={`${interroAvg !== '-' ? (parseFloat(interroAvg) >= 10 ? 'text-blue-600' : 'text-red-500') : 'text-gray-300'}`}>
                                                {interroAvg}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 border-l border-gray-50 bg-indigo-50/5">
                                            <input
                                                type="text"
                                                className="w-14 h-10 mx-auto block bg-white border border-gray-100 rounded-xl text-center font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm group-hover:border-indigo-200 transition-all"
                                                placeholder="-"
                                                value={student.grades.devoir}
                                                onChange={(e) => handleGradeChange(student.id, 'devoir', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-4 border-l border-gray-50 bg-purple-50/5">
                                            <input
                                                type="text"
                                                className="w-14 h-10 mx-auto block bg-white border border-gray-100 rounded-xl text-center font-bold text-gray-700 focus:ring-2 focus:ring-purple-500 outline-none shadow-sm group-hover:border-purple-200 transition-all"
                                                placeholder="-"
                                                value={student.grades.compo}
                                                onChange={(e) => handleGradeChange(student.id, 'compo', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-8 py-4 border-l border-gray-50 text-center bg-gray-50/10">
                                            <span className={`text-lg font-black tracking-tight ${globalAvg !== '-' ? (parseFloat(globalAvg) >= 10 ? 'text-blue-600' : 'text-red-500') : 'text-gray-200'}`}>
                                                {globalAvg}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Sticky/Bottom Footer */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50">
                <div className="flex items-center gap-4 text-gray-400">
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                        <Info className="w-5 h-5 text-gray-300" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Dernière sauvegarde</p>
                        <p className="text-sm font-bold text-gray-600">Automatique à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <Button
                        variant="outline"
                        className="flex-1 md:flex-none font-bold py-3.5 px-8 rounded-2xl border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                        onClick={() => handleSave(false)}
                        loading={loading}
                    >
                        Sauvegarder brouillon
                    </Button>
                    <Button
                        icon={CheckCircle2}
                        className="flex-1 md:flex-none font-black py-4 px-10 rounded-2xl shadow-xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 transform hover:scale-105 active:scale-95 transition-all"
                        onClick={() => handleSave(true)}
                        loading={loading}
                    >
                        Valider les notes
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

export default GradeEntry;
