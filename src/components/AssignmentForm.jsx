import { useState, useEffect } from 'react';
import { Select, Button } from '../components/ui';
import { Plus, BookOpen, X } from 'lucide-react';
import api from '../lib/api';

const AssignmentForm = ({ teacher, onSuccess, assignmentData, setAssignmentData, handleAddAssignment }) => {
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [classRes, subjectRes] = await Promise.all([
                    api.get('/classes/'),
                    api.get('/subjects/')
                ]);

                setClasses(classRes.data.map(c => ({ value: c.id, label: c.name })));
                setSubjects(subjectRes.data.map(s => ({ value: s.id, label: s.name })));
            } catch (error) {
                console.error("Error fetching form data", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                    label="Matière"
                    options={subjects}
                    placeholder="Sélectionner..."
                    value={assignmentData.subject_id}
                    onChange={(e) => setAssignmentData({ ...assignmentData, subject_id: e.target.value })}
                />
                <Select
                    label="Classe"
                    options={classes}
                    placeholder="Sélectionner..."
                    value={assignmentData.class_id}
                    onChange={(e) => setAssignmentData({ ...assignmentData, class_id: e.target.value })}
                />
            </div>
            <Button icon={Plus} className="w-full" onClick={handleAddAssignment}>Ajouter l'assignation</Button>

            <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Assignations actuelles</h4>
                <div className="space-y-2">
                    {(teacher?.assignments || []).map((as, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <BookOpen className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-gray-700">{as}</span>
                            </div>
                            <button className="text-gray-400 hover:text-red-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AssignmentForm;
