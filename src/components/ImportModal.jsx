import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button } from './ui';
import { Upload, FileUp, Download, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';

const ImportModal = ({ isOpen, onClose, type, onSuccess, establishmentId, academicYearId }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [errors, setErrors] = useState([]);
    const fileInputRef = useRef(null);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFile(null);
            setErrors([]);
            setUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [isOpen]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDownloadTemplate = () => {
        let data = [];
        let filename = '';

        if (type === 'students') {
            data = [
                ['first_name', 'last_name', 'gender', 'birth_date', 'address', 'phone', 'parent_name', 'parent_phone', 'classe']
            ];
            filename = 'modele_import_eleves.xlsx';
        } else if (type === 'teachers') {
            data = [
                ['first_name', 'last_name', 'email', 'phone (optionnel)', 'address (optionnel)', 'specialty (optionnel)'],
                ['Dupont', 'Jean', 'jean.dupont@ecole.fr', '0612345678', '15 rue des Ecoles', 'Mathématiques'],
                ['Martin', 'Marie', 'marie.martin@ecole.fr', '', '', 'Français'],
                ['Bernard', 'Pierre', 'pierre.bernard@ecole.fr', '0698765432', '', 'Histoire'],
                ['Petit', 'Sophie', 'sophie.petit@ecole.fr', '', '25 avenue des Lycées', 'Anglais']
            ];
            filename = 'modele_import_enseignants.xlsx';
        } else if (type === 'subjects') {
            data = [
                ['name', 'code', 'category', 'coefficient'],
                ['Mathématiques', 'MATH', 'MATIERES SCIENTIFIQUES', 4],
                ['Français', 'FR', 'MATIERES LITTERAIRES', 4],
                ['Anglais', 'ANG', 'MATIERES LITTERAIRES', 3],
                ['Histoire - Géographie', 'HG', 'MATIERES LITTERAIRES', 3],
                ['Philosophie', 'PHILO', 'MATIERES LITTERAIRES', 3],
                ['SVT', 'SVT', 'MATIERES SCIENTIFIQUES', 3],
                ['Physique - Chimie', 'PC', 'MATIERES SCIENTIFIQUES', 3],
                ['Sciences Physiques', 'SP', 'MATIERES SCIENTIFIQUES', 3],
                ['Informatique', 'INFO', 'AUTRES MATIERES', 2],
                ['Éducation Civique et Morale', 'ECM', 'AUTRES MATIERES', 1],
                ['EPS', 'EPS', 'AUTRES MATIERES', 1],
                ['Arts Plastiques', 'ART', 'AUTRES MATIERES', 1],
                ['Musique', 'MUS', 'AUTRES MATIERES', 1],
                ['Allemand', 'ALL', 'MATIERES LITTERAIRES', 2],
                ['Espagnol', 'ESP', 'MATIERES LITTERAIRES', 2],
            ];
            filename = 'modele_import_matieres.xlsx';
        }

        const worksheet = XLSX.utils.aoa_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

        // Use XLSX.write and create a blob for download
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const handleUpload = async () => {
        if (!file) return toast.error("Veuillez sélectionner un fichier");

        setUploading(true);
        setErrors([]); // Clear previous errors
        const formData = new FormData();
        formData.append('file', file);
        formData.append('establishment_id', establishmentId);
        if (academicYearId) formData.append('academic_year_id', academicYearId);

        try {
            const endpoint = type === 'students' ? '/students/import' : type === 'teachers' ? '/users/import' : '/subjects/import';
            
            console.log('Importing to:', endpoint);
            console.log('FormData:', {
                file: file?.name,
                establishment_id: establishmentId,
                academic_year_id: academicYearId
            });
            
            const response = await api.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 30000 // 30 seconds timeout
            });
            
            console.log('Import response:', response.data);
            
            // Handle successful response with detailed info
            const data = response.data;
            let successMessage = data.message || "Importation réussie !";
            
            if (data.errors && data.errors.length > 0) {
                // Show partial success with errors
                toast.success(`${successMessage}\n${data.errors.length} erreurs détectées`);
                setErrors(data.errors);
            } else {
                toast.success(successMessage);
            }
            
            onSuccess();
            // Only close modal if no errors
            if (!data.errors || data.errors.length === 0) {
                onClose();
            }
        } catch (error) {
            console.error('Import error details:', {
                message: error.message,
                response: error.response,
                status: error.response?.status,
                data: error.response?.data
            });
            
            // Handle network errors specifically
            if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error' || !error.response) {
                const errorMsg = 'Erreur réseau: Vérifiez votre connexion internet et réessayez.';
                toast.error(errorMsg);
                setErrors([errorMsg]);
                return;
            }
            
            // Handle timeout errors
            if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
                const errorMsg = 'Délai d\'attente dépassé: Le fichier est peut-être trop volumineux.';
                toast.error(errorMsg);
                setErrors([errorMsg]);
                return;
            }
            
            // Handle HTTP errors
            if (error.response?.status === 422) {
                const validationErrors = error.response?.data?.errors || [];
                if (Array.isArray(validationErrors)) {
                    setErrors(validationErrors);
                    toast.error(`${validationErrors.length} erreurs de validation trouvées`);
                } else if (typeof validationErrors === 'object') {
                    // Convert object errors to array
                    const errorArray = Object.values(validationErrors).flat();
                    setErrors(errorArray);
                    toast.error("Le fichier contient des erreurs de validation");
                } else {
                    const errorMsg = error.response?.data?.message || "Erreurs de validation";
                    setErrors([errorMsg]);
                    toast.error(errorMsg);
                }
            } else if (error.response?.status === 413) {
                const errorMsg = 'Fichier trop volumineux: Veuillez réduire la taille du fichier.';
                toast.error(errorMsg);
                setErrors([errorMsg]);
            } else if (error.response?.status === 500) {
                const errorMsg = 'Erreur serveur: Veuillez réessayer plus tard.';
                toast.error(errorMsg);
                setErrors([errorMsg]);
            } else {
                const errorMessage = error.response?.data?.message || error.message || "Erreur lors de l'importation";
                toast.error(errorMessage);
                setErrors([errorMessage]);
            }
        } finally {
            setUploading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Importer des ${type === 'students' ? 'élèves' : type === 'teachers' ? 'enseignants' : 'matières'}`}>
            <div className="space-y-6">
                <div className="space-y-4">
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-md">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <FileUp className="h-5 w-5 text-amber-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-amber-700">
                                    {type === 'students'
                                        ? "Pour inscrire automatiquement les élèves, le nom de la colonne 'classe' doit correspondre exactement au nom dans 'Gestion des Classes'."
                                        : type === 'teachers'
                                            ? "Seuls les champs nom, prénom et email sont requis. Les autres champs (téléphone, adresse, spécialité) sont optionnels et peuvent être laissés vides."
                                            : "Veuillez respecter l'ordre des colonnes du modèle : name, code, category, coefficient."
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${file
                        ? 'border-green-500 bg-green-50 shadow-inner'
                        : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'
                        }`}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 ${file ? 'bg-green-100 text-green-600 scale-110' : 'bg-gray-100 text-gray-400'
                        }`}>
                        <Upload className="w-8 h-8" />
                    </div>

                    <p className={`text-sm font-semibold text-center transition-colors ${file ? 'text-green-700' : 'text-gray-700'}`}>
                        {file ? file.name : "Cliquez pour sélectionner un fichier"}
                    </p>

                    {file && (
                        <div className="mt-2 flex items-center gap-2 px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-bold animate-fade-in">
                            Fichier prêt pour l'importation
                        </div>
                    )}

                    {!file && <p className="text-xs text-gray-400 mt-1">Excel (.xlsx, .xls) ou CSV</p>}

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".csv, .xlsx, .xls"
                        onChange={handleFileChange}
                    />
                </div>

                {/* Validation Errors Display */}
                {errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-red-800 font-semibold">
                                <AlertCircle className="w-5 h-5" />
                                <span>Erreurs détectées ({errors.length})</span>
                            </div>
                            <button
                                onClick={() => setErrors([])}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                                Effacer
                            </button>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                            {errors.map((err, idx) => (
                                <li key={idx}>{err}</li>
                            ))}
                        </ul>
                        <p className="text-xs text-red-600 mt-2 font-medium">
                            Corrigez votre fichier Excel et réessayez. Les lignes avec erreurs n'ont pas été importées.
                        </p>
                    </div>
                )}

                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100 mt-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadTemplate();
                        }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
                    >
                        <Download className="w-4 h-4" /> Modèle Excel
                    </button>

                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleUpload();
                        }}
                        loading={uploading}
                        disabled={!file}
                        icon={FileUp}
                        className={file ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200' : ''}
                    >
                        {file ? "Lancer l'importation" : "Importer"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ImportModal;
