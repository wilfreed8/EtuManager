import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Download,
    Search,
    FileDown,
} from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../components/ui';
import api from '../lib/api';
import { toast } from 'react-hot-toast';

// Mock data for students in a class with averages
const classStudents = [
    { id: 1, name: 'ADJO Koffi', matricule: 'REG-001', average: 14.50, rank: '3e', status: 'ready' },
    { id: 2, name: 'BELLO Sarah', matricule: 'REG-002', average: 16.75, rank: '1er', status: 'ready' },
    { id: 3, name: 'DOSSOU Marc', matricule: 'REG-003', average: 11.20, rank: '12e', status: 'pending' },
    { id: 4, name: 'KEITA Fatou', matricule: 'REG-004', average: 15.10, rank: '2e', status: 'ready' },
    { id: 5, name: 'LAWSON Paul', matricule: 'REG-005', average: 9.45, rank: '15e', status: 'ready' },
    { id: 6, name: 'MENSAH Jean', matricule: 'REG-006', average: 12.80, rank: '8e', status: 'ready' },
];

const ReportCardGenerator = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('T1');
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [downloadingBulk, setDownloadingBulk] = useState(false);

    // Fetch classes
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await api.get('/classes/');
                setClasses(res.data);
                if (res.data.length > 0) setSelectedClass(res.data[0].id);
            } catch (err) {
                console.error(err);
                toast.error("Erreur chargement classes");
            }
        };
        fetchClasses();
    }, []);

    // Fetch students when filters change
    useEffect(() => {
        const fetchStudents = async () => {
            if (!selectedClass) return;
            setLoading(true);
            try {
                // Fetch students for the class
                const response = await api.get(`/students/?class_id=${selectedClass}`);

                // For demonstration, since calculating ALL averages on the fly can be slow,
                // we might want a separate "stats" endpoint or just show students and "Ready" if they have grades.
                // For now, let's map them. We don't have the average readily available in the student list.
                // We'd need to fetch that or just assume "Ready" for UI demo.
                // Or: api.get('/bulletins/preview?class_id=...') could be better.

                // Simplified: Just list students. 
                const mapped = response.data.map(s => ({
                    id: s.id,
                    name: `${s.last_name} ${s.first_name}`,
                    matricule: s.registration_number,
                    status: 'ready', // Assume ready for now, or check via another call
                    average: 0, // Placeholder
                    rank: '-'
                }));
                setStudents(mapped);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [selectedClass, selectedPeriod]);

    const handleDownloadBulk = async () => {
        if (!selectedClass) return;
        setDownloadingBulk(true);
        try {
            // Trigger download via window.open or blob
            // Using api.get with responseType blob
            const response = await api.get(`/bulletins/download-bulk/${selectedClass}?period_id=${selectedPeriod}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `bulletins_${selectedClass}.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Téléchargement démarré");
        } catch (err) {
            console.error(err);
            toast.error("Erreur téléchargement");
        } finally {
            setDownloadingBulk(false);
        }
    };

    const handleDownloadIndividual = async (studentId) => {
        try {
            const response = await api.get(`/bulletins/download-single/${studentId}?period_id=${selectedPeriod}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `bulletin_${studentId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(err);
            toast.error("Impossible de télécharger le bulletin (pas de notes ?)");
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
                    <h1 className="text-2xl font-bold text-gray-900">Centre de Bulletins</h1>
                    <p className="text-gray-500 mt-1">Générez et téléchargez les bulletins de notes par classe.</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        icon={FileDown}
                        loading={downloadingBulk}
                        onClick={handleDownloadBulk}
                    >
                        Télécharger Tout (ZIP)
                    </Button>
                </div>
            </div>

            {/* Control Card */}
            <Card className="bg-white">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Select
                        label="Classe"
                        options={classes.map(c => ({ value: c.id, label: c.name }))}
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    />
                    <Select
                        label="Période"
                        options={[{ value: 'T1', label: '1er Trimestre' }, { value: 'T2', label: '2ème Trimestre' }]}
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                    />
                    <div className="md:col-span-2">
                        <Input
                            label="Rechercher un élève"
                            placeholder="Nom ou Matricule..."
                            icon={Search}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </Card>

            {/* Students Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Élève</th>
                                <th className="px-6 py-4">Matricule</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-gray-900">{student.name}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-gray-400 font-mono">{student.matricule}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                icon={Download}
                                                onClick={() => handleDownloadIndividual(student.id)}
                                            >
                                                Télécharger
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                                        Aucun élève trouvé dans cette classe.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </motion.div>
    );
};

export default ReportCardGenerator;
