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

    // Fetch assignments and periods on load
    useEffect(() => {
        const fetchInitialData = async () => {
            if (!user?.id) return;
            try {
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
                if (mappedAssignments.length > 0) {
                    setSelectedAssignment(mappedAssignments[0]);
                }

                // Fetch periods
                const periodRes = await api.get('/periods');
                setPeriods(periodRes.data);
                if (periodRes.data.length > 0) {
                    setSelectedPeriod(periodRes.data[0].id);
                }
            } catch (err) {
                console.error("Error fetching initial data", err);
                toast.error("Erreur chargement données");
            }
        };
        fetchInitialData();
    }, [user?.id]);

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
                        interro: g.interro_avg !== null ? String(g.interro_avg) : '',
                        devoir: g.devoir_avg !== null ? String(g.devoir_avg) : '',
                        compo: g.compo_grade !== null ? String(g.compo_grade) : ''
                    };
                });

                const mappedStudents = studentsRes.data.map(s => ({
                    id: s.id,
                    name: `${s.last_name} ${s.first_name}`,
                    matricule: s.registration_number,
                    grades: gradesMap[s.id] || { interro: '', devoir: '', compo: '' }
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
        const assign = assignments.find(a => a.id === assignmentId);
        setSelectedAssignment(assign);
    };

    const handleGradeChange = (studentId, type, value) => {
        if (value !== '' && (isNaN(value) || value < 0 || value > 20)) return;

        setStudents(prev => prev.map(s =>
            s.id === studentId ? { ...s, grades: { ...s.grades, [type]: value } } : s
        ));
    };

    const calculateAverage = (grades) => {
        const { interro, devoir, compo } = grades;
        if (!interro || !devoir || !compo) return '-';

        const avg = (parseFloat(interro) * 0.25) + (parseFloat(devoir) * 0.25) + (parseFloat(compo) * 0.5);
        return avg.toFixed(2);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const promises = students.map(student => {
                // Only save if at least one grade is entered
                if (!student.grades.interro && !student.grades.devoir && !student.grades.compo) {
                    return Promise.resolve();
                }
                return api.post('/grades', {
                    student_id: student.id,
                    subject_id: selectedAssignment?.subject_id,
                    period_id: selectedPeriod,
                    interro_avg: student.grades.interro ? parseFloat(student.grades.interro) : null,
                    devoir_avg: student.grades.devoir ? parseFloat(student.grades.devoir) : null,
                    compo_grade: student.grades.compo ? parseFloat(student.grades.compo) : null
                });
            });

            await Promise.allSettled(promises);
            toast.success('Notes enregistrées avec succès !');
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors de la sauvegarde');
        } finally {
            setLoading(false);
        }
    };

    const handleCSVUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            try {
                await api.post(`/grades/upload?class_id=${selectedAssignment?.class_id}&period_id=${selectedPeriod}&subject_id=${selectedAssignment?.subject_id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success(`Fichier "${file.name}" importé avec succès !`);
            } catch (err) {
                toast.error("Erreur lors de l'import : " + err.message);
            }
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Saisie des Notes</h1>
                    {selectedAssignment && (
                        <p className="text-gray-500 mt-1">
                            Classe: {selectedAssignment.class_name} • Matière: {selectedAssignment.subject_name} •
                            {periods.find(p => p.id === selectedPeriod)?.name || 'Période'}
                        </p>
                    )}
                </div>
                <div className="flex gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".csv"
                        onChange={handleCSVUpload}
                    />
                    <Button variant="outline" icon={Upload} onClick={() => fileInputRef.current?.click()}>
                        Importer CSV
                    </Button>
                    <Button icon={Save} loading={loading} onClick={handleSave}>
                        Sauvegarder
                    </Button>
                </div>
            </div>

            {/* Filters Card */}
            <Card padding="sm" className="bg-gray-50/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un élève..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select
                        label="Cours"
                        options={assignments.map(a => ({ value: a.id, label: `${a.class_name} - ${a.subject_name}` }))}
                        value={selectedAssignment?.id || ''}
                        onChange={(e) => handleAssignmentChange(e.target.value)}
                    />
                    <Select
                        label="Période"
                        options={periods.map(p => ({ value: p.id, label: p.name }))}
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                    />
                </div>
            </Card>

            {/* Spreadsheet / Table */}
            <Card className="overflow-hidden border-none shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">#</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom & Prénoms</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider bg-blue-50/30 w-32">Interro (25%)</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider bg-indigo-50/30 w-32">Devoir (25%)</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider bg-purple-50/30 w-32">Compo (50%)</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Moyenne</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {students.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map((student, idx) => {
                                const avg = calculateAverage(student.grades);
                                const isComplete = student.grades.interro && student.grades.devoir && student.grades.compo;

                                return (
                                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 text-sm text-gray-400 font-mono italic">{idx + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{student.name}</span>
                                                <span className="text-xs text-gray-400">{student.matricule}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 bg-blue-50/10">
                                            <input
                                                type="text"
                                                className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-center text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                placeholder="--"
                                                value={student.grades.interro}
                                                onChange={(e) => handleGradeChange(student.id, 'interro', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 bg-indigo-50/10">
                                            <input
                                                type="text"
                                                className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-center text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                                placeholder="--"
                                                value={student.grades.devoir}
                                                onChange={(e) => handleGradeChange(student.id, 'devoir', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 bg-purple-50/10">
                                            <input
                                                type="text"
                                                className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-center text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                                placeholder="--"
                                                value={student.grades.compo}
                                                onChange={(e) => handleGradeChange(student.id, 'compo', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-sm font-bold ${avg !== '-' ? (parseFloat(avg) >= 10 ? 'text-emerald-600' : 'text-red-600') : 'text-gray-300'}`}>
                                                {avg}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {isComplete ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                                            ) : (
                                                <div className="w-2 h-2 rounded-full bg-gray-200 mx-auto" />
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Footer Info */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3 text-blue-700">
                    <Info className="w-5 h-5" />
                    <p className="text-sm font-medium">
                        Toutes les modifications sont sauvegardées localement en temps réel. N'oubliez pas de cliquer sur "Sauvegarder" pour valider.
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-sm">
                        <span className="text-gray-500">Saisies effectuées: </span>
                        <span className="font-bold text-blue-700">12 / 15</span>
                    </div>
                    <div className="h-6 w-px bg-blue-200" />
                    <div className="text-sm">
                        <span className="text-gray-500">Moyenne Classe: </span>
                        <span className="font-bold text-blue-700">13.42</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default GradeEntry;
