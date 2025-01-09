import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Alert from '@/components/alert';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const SupplyCreate = () => {
    const [namabahan, setNamaBahan] = useState('');
    const [stokawal, setStok] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await axios.post(
                `${API_URL}/api/bahan`,
                { namaBahan: namabahan, stokAwal: parseInt(stokawal) },
                {
                    withCredentials: true,
                }
            );

            setSuccess('Supply created successfully!');
            setTimeout(() => router.push('/admin/bahan'), 2000);
        } catch (error: any) {
            const errorMessage = error?.response?.data?.error || 'An error occurred on the server.';
            console.error('Create user failed:', errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="w-full h-[45px] mt-[50px] mb-[50px] grid grid-cols-3 justify-center">
                <button
                    onClick={() => router.push('/admin/bahan')}
                    className="w-[100px] h-[50px] bg-custom-green rounded-[10px] text-[16px] font-ruda font-semibold text-white hover:bg-green-700 transition-colors ms-[100px]"
                >
                    Back
                </button>
                <div className="w-full text-center font-ruda text-[20px] font-black mt-[40px] mb-[30px]">
                    <h1>Create New Supply</h1>
                </div>
            </div>

            <div className="absolute flex justify-center -mt-[45px] w-full z-30">
                {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
                {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
            </div>

            <div className="w-full flex justify-center items-center">
                <div className="w-[600px] bg-white p-[50px] rounded-[25px] shadow-lg">
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label
                                className="flex font-ruda ms-[40px] mb-[5px] font-extrabold text-[14px] mt-3"
                                htmlFor="bahan"
                            >
                                Supply Name
                            </label>
                            <input
                                id="bahan"
                                type="text"
                                value={namabahan}
                                onChange={(e) => setNamaBahan(e.target.value)}
                                className="h-[50px] w-full peer outline-none bg-custom-gray-1 px-4 focus:shadow-md text-black rounded-[10px] border border-custom-gray-2 font-sans"
                                required
                                autoComplete='off'
                            />
                        </div>

                        <div>
                            <label
                                className="flex font-ruda ms-[40px] mb-[5px] font-extrabold text-[14px]"
                                htmlFor="stok"
                            >
                                stok
                            </label>
                            <input
                                id="stok"
                                type="number"
                                value={stokawal}
                                onChange={(e) => setStok(e.target.value)}
                                className="h-[50px] w-full peer outline-none bg-custom-gray-1 px-4 focus:shadow-md text-black rounded-[10px] border border-custom-gray-2 font-sans"
                                required
                                autoComplete='off'
                            />
                        </div>
                        <button
                            type="submit"
                            className="h-[50px] w-full bg-custom-green text-white flex items-center justify-center rounded-[10px] mt-7 hover:bg-green-700 transition-colors"
                        >
                            {loading ? (
                                <div className="flex flex-row gap-2">
                                    <div className="w-2 h-2 rounded-full bg-custom-grey animate-bounce [animation-delay:.7s]"></div>
                                    <div className="w-2 h-2 rounded-full bg-custom-grey animate-bounce [animation-delay:.3s]"></div>
                                    <div className="w-2 h-2 rounded-full bg-custom-grey animate-bounce [animation-delay:.7s]"></div>
                                </div>
                            ) : (
                                "Create"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SupplyCreate;
