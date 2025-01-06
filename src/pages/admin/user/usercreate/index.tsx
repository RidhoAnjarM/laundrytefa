import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Alert from '@/components/alert';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CreateUser = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [noHp, setNoHp] = useState('');
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
            const role = 'kasir';
            await axios.post(
                `${API_URL}/api/register`,
                { username, password, email, no_hp: noHp, role },
                {
                    withCredentials: true,
                }
            );

            setSuccess('User created successfully!');
            setTimeout(() => router.push('/admin/user'), 2000);
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
                    onClick={() => router.push('/admin/user')}
                    className="w-[100px] h-[50px] bg-custom-green rounded-[10px] text-[16px] font-ruda font-semibold text-white hover:bg-green-700 transition-colors ms-[100px]"
                >
                    Back
                </button>
                <h1 className="text-[30px] text-center">Create New User</h1>
            </div>
            <div className="absolute flex justify-center -mt-[45px] w-full z-30">
                {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
                {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
            </div>
            <div className="w-full flex justify-center items-center">
                <div className="w-[600px] bg-white p-[50px] rounded-[25px] shadow-lg">
                    <form onSubmit={handleSubmit} className="">
                        <div>
                            <label
                                className="flex font-ruda ms-[40px] mb-[5px] font-extrabold text-[14px] mt-3"
                                htmlFor="username"
                            >
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="h-[50px] w-full peer outline-none bg-custom-gray-1 px-4 focus:shadow-md text-black rounded-[10px] border border-custom-gray-2 font-sans"
                                required
                                autoComplete="off"
                            />
                        </div>

                        <div>
                            <label
                                className="flex font-ruda ms-[40px] mb-[5px] font-extrabold text-[14px] mt-3"
                                htmlFor="password"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-[50px] w-full peer outline-none bg-custom-gray-1 px-4 focus:shadow-md text-black rounded-[10px] border border-custom-gray-2 font-sans"
                                required
                                autoComplete="off"
                            />
                        </div>

                        <div>
                            <label
                                className="flex font-ruda ms-[40px] mb-[5px] font-extrabold text-[14px] mt-3"
                                htmlFor="email"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-[50px] w-full peer outline-none bg-custom-gray-1 px-4 focus:shadow-md text-black rounded-[10px] border border-custom-gray-2 font-sans"
                                required
                                autoComplete="off"
                            />
                        </div>

                        <div>
                            <label
                                className="flex font-ruda ms-[40px] mb-[5px] font-extrabold text-[14px] mt-3"
                                htmlFor="notel"
                            >
                                Phone Number
                            </label>
                            <input
                                id="notel"
                                type="number"
                                value={noHp}
                                onChange={(e) => setNoHp(e.target.value)}
                                className="h-[50px] w-full peer outline-none bg-custom-gray-1 px-4 focus:shadow-md text-black rounded-[10px] border border-custom-gray-2 font-sans"
                                required
                                autoComplete="off"
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

export default CreateUser;
