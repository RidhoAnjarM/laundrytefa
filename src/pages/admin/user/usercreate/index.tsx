import { useEffect, useState } from 'react';
import axios from 'axios';
import Alert from '@/components/alert';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserCreated: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onUserCreated }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [noHp, setNoHp] = useState('');
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
        setUsername('');
        setPassword('');
        setEmail('');
        setNoHp('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const role = 'kasir';
            await axios.post(
                `${API_URL}/api/register`,
                { username, password, email, no_hp: noHp, role },
                { withCredentials: true }
            );

            setSuccess('User Created!');
            onUserCreated();
            resetForm();  
            setTimeout(() => {
                setSuccess(null);
                onClose();
            }, 2000);
        } catch (error: any) {
            const errorMessage = error?.response?.data?.error || 'Ada error di server.';
            console.error('Gagal bikin user:', errorMessage);
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
            <div className={`relative w-[600px] p-[50px] text-black bg-white rounded-lg transform transition-transform duration-300 ${isVisible ? "translate-y-0 scale-100" : "translate-y-10 scale-95"}`}>
                {/* Alert */}
                {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
                {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

                <button
                    className="absolute top-4 right-6 text-gray-500 hover:text-gray-800 text-[30px]"
                    onClick={handleClose}
                >
                    &times;
                </button>

                <h1 className="text-center font-ruda text-[20px] font-black mb-[20px]" >
                    Create New User
                </h1>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div>
                        <label className="block font-ruda text-[14px] font-extrabold mb-2" htmlFor="username" >
                            Username
                        </label>
                        < input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="h-[50px] w-full bg-gray-100 px-4 rounded-[10px] border border-gray-300 outline-custom-green"
                            required
                            autoComplete='off'
                        />
                    </div>

                    <div>
                        <label className="block font-ruda text-[14px] font-extrabold mb-2" htmlFor="password" >
                            Password
                        </label>
                        < input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-[50px] w-full bg-gray-100 px-4 rounded-[10px] border border-gray-300 outline-custom-green"
                            required
                            autoComplete='off'
                        />
                    </div>

                    <div>
                        <label className="block font-ruda text-[14px] font-extrabold mb-2" htmlFor="email" >
                            Email
                        </label>
                        < input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-[50px] w-full bg-gray-100 px-4 rounded-[10px] border border-gray-300 outline-custom-green"
                            required
                            autoComplete='off'
                        />
                    </div>

                    < div >
                        <label className="block font-ruda text-[14px] font-extrabold mb-2" htmlFor="notel" >
                            Phone Number
                        </label>
                        < input
                            id="notel"
                            type="number"
                            value={noHp}
                            onChange={(e) => setNoHp(e.target.value)}
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

export default CreateUserModal;
