import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Alert from '@/pages/components/alert';

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
                    className="w-[100px] bg-custom-green rounded-[5px] ms-[100px] text-white border-2 border-custom-green hover:bg-white hover:text-custom-green ease-in-out duration-300"
                >
                    Back
                </button>
                <h1 className="text-[30px] text-center">Create New Supply</h1>
            </div>

            <div className="absolute flex justify-center -mt-[45px] w-full z-30">
                {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
                {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
            </div>

            <div className="w-full flex justify-center items-center">
                <div className="w-[600px] bg-custom-grey px-[50px] py-[50px] rounded-xl">
                    <form onSubmit={handleSubmit} className="flex flex-col space-y-8">
                        <div className="h-12 relative flex rounded-[5px]">
                            <input
                                id="username"
                                type="text"
                                value={namabahan}
                                onChange={(e) => setNamaBahan(e.target.value)}
                                className="peer w-full outline-none bg-white px-4 rounded-[5px] focus:shadow-md text-black"
                                required
                                autoComplete='off'
                            />
                            <label
                                className="absolute text-black top-1/2 translate-y-[-50%] left-4 px-2 peer-focus:-top-2 peer-focus:left-3 font-bold peer-focus:text-[12px] peer-focus:text-black peer-valid:-top-2 peer-valid:left-3 peer-valid:text-[12px] peer-valid:text-black duration-150"
                                htmlFor="username"
                            >
                                Supply Name
                            </label>
                        </div>

                        <div className="h-12 relative flex rounded-[5px]">
                            <input
                                id="password"
                                type="number"
                                value={stokawal}
                                onChange={(e) => setStok(e.target.value)}
                                className="peer w-full outline-none bg-white px-4 rounded-[5px] focus:shadow-md text-black"
                                required
                                autoComplete='off'
                            />
                            <label
                                className="absolute text-black top-1/2 translate-y-[-50%] left-4 px-2 peer-focus:-top-2 peer-focus:left-3 font-bold peer-focus:text-[12px] peer-focus:text-black peer-valid:-top-2 peer-valid:left-3 peer-valid:text-[12px] peer-valid:text-black duration-150"
                                htmlFor="password"
                            >
                                stok
                            </label>
                        </div>
                        <button
                            type="submit"
                            className="h-12 bg-custom-green text-white py-2 rounded-[5px] mt-4 hover:bg-white border-2 border-custom-green hover:text-custom-green ease-in-out duration-300 flex items-center justify-center"
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
