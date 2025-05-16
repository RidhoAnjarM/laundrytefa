'use client'

import { useEffect, useState } from 'react';
import axios from 'axios';
import Alert from '@/components/alert';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface SupplyCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSupplyCreated: () => void;
}

const SupplyCreateModal: React.FC<SupplyCreateModalProps> = ({ isOpen, onClose, onSupplyCreated }) => {
    const [namabahan, setNamaBahan] = useState('');
    const [stokawal, setStok] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState(false);
    const [renderModal, setRenderModal] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setRenderModal(true);
            setTimeout(() => setIsVisible(true), 10);
        } else {
            setIsVisible(false);
            const timeout = setTimeout(() => setRenderModal(false), 300);
            return () => clearTimeout(timeout);
        }
    }, [isOpen]);

    // Fungsi buat reset input
    const resetForm = () => {
        setNamaBahan('');
        setStok('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await axios.post(
                `${API_URL}/api/bahan`,
                { namaBahan: namabahan, stokAwal: parseInt(stokawal) },
                { withCredentials: true }
            );

            setSuccess('Bahan berhasil dibuat!');
            onSupplyCreated();
            resetForm();
            setTimeout(() => {
                setSuccess(null);
                onClose();
            }, 2000);
        } catch (error: any) {
            const errorMessage = error?.response?.data?.error || 'Ada error di server.';
            console.error('Gagal bikin bahan:', errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Ubah onClose biar reset form juga
    const handleClose = () => {
        resetForm(); 
        onClose();
    };
    if (!renderModal) return null;

    return (
        <div className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}>
            {/* Alert */}
            {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
            <div className={`relative w-[600px] p-[50px] text-black bg-white rounded-lg transform transition-transform duration-300 ${isVisible ? "translate-y-0 scale-100" : "translate-y-10 scale-95"}`}>

                <button
                    className="absolute top-4 right-6 text-gray-500 hover:text-gray-800 text-[30px]"
                    onClick={onClose}
                >
                    &times;
                </button>

                <h1 className="text-center font-ruda text-[20px] font-black mb-[20px]">
                    Create New Suply
                </h1>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div>
                        <label className="block font-ruda text-[14px] font-extrabold mb-2" htmlFor="bahan">
                            Suply name
                        </label>
                        <input
                            id="bahan"
                            type="text"
                            value={namabahan}
                            onChange={(e) => setNamaBahan(e.target.value)}
                            className="h-[50px] w-full bg-gray-100 px-4 rounded-[10px] border border-gray-300 outline-custom-green"
                            required
                            autoComplete='off'
                        />
                    </div>

                    <div>
                        <label className="block font-ruda text-[14px] font-extrabold mb-2" htmlFor="stok">
                            Stok
                        </label>
                        <input
                            id="stok"
                            type="number"
                            value={stokawal}
                            onChange={(e) => setStok(e.target.value)}
                            className="h-[50px] w-full bg-gray-100 px-4 rounded-[10px] border border-gray-300 outline-custom-green"
                            required
                            autoComplete='off'
                        />
                    </div>

                    <button
                        type="submit"
                        className="h-[50px] w-full bg-custom-green text-white font-bold rounded-[10px] mt-7 hover:bg-green-700 transition"
                    >
                        {loading ? 'Processing...' : 'Create'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SupplyCreateModal;