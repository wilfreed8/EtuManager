import { useState, useRef } from 'react';
import { Modal, Button } from './ui';
import { Upload, FileUp, Download } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';

const ImportModal = ({ isOpen, onClose, type, onSuccess, establishmentId }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

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
                ['first_name', 'last_name', 'email', 'phone', 'address', 'specialty']
            ];
            filename = 'modele_import_enseignants.xlsx';
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
        const formData = new FormData();
        formData.append('file', file);
        formData.append('establishment_id', establishmentId);

        try {
            const endpoint = type === 'students' ? '/students/import' : '/users/import';
            await api.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Importation réussie !");
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Erreur lors de l'importation");
        } finally {
            setUploading(false);
            setFile(null);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Importer des ${type === 'students' ? 'élèves' : 'enseignants'}`}>
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
                                        : "Veuillez respecter l'ordre des colonnes du modèle."
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
