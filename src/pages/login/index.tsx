import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        setLoading(true);
        e.preventDefault();
        setError(null);

        if (!username || !password) {
            setError('Username dan password wajib diisi.');
            return;
        }

        try {
            const response = await axios.post(
                `${API_URL}/api/login`,
                { username, password },
                { withCredentials: true }
            );

            setLoading(false);

            const { token, user } = response.data;
            const role = user.role;

            console.log('Token:', token);

            Cookies.set('token', token, { expires: 5, secure: process.env.NODE_ENV === 'production' });
            Cookies.set('role', role, { expires: 5, secure: process.env.NODE_ENV === 'production' });

            if (role === 'admin') {
                router.push('/admin/dashboard');
            } else if (role === 'kasir') {
                router.push('/kasir/dashboard');
            } else {
                setError('Role tidak dikenali!');
            }
        } catch (error: any) {
            setLoading(false);
            const errorMessage = error?.response?.data?.error || 'Terjadi kesalahan pada server.';
            console.error('Login failed:', errorMessage);
            setError(`Login gagal: ${errorMessage}`);
        }
    };

    return (
        <div className="w-full flex justify-center items-center">
            <div className="w-[757px] h-[612px] flex-wrap justify-center items-center">
                <div className="mt-[50px] mb-[38px] w-full flex justify-center">
                    <p className="w-[100px] h-[100px] bg-[#E70008] rounded-full flex items-center justify-center">
                        <img src="../images/logo.png" alt="" className='w-[96px] h-[94px]' />
                    </p>
                </div>
                <div className="w-full mb-[38px] justify-center flex">
                    <h1 className="text-[24px] font-extrabold">Login To Laundry</h1>
                </div>
                <div className="w-full flex justify-center">
                    <form onSubmit={handleLogin} className="w-full flex-wrap justify-center px-[128px]">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-[500px] h-[60px] rounded-[10px] mb-[50px] border-2 border-black ps-[30px]"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-[500px] h-[60px] rounded-[10px] mb-[50px] border-2 border-black ps-[30px]"
                            required
                        />
                        <button
                            type="submit"
                            className="w-[500px] h-[60px] rounded-[10px] bg-custom-green text-white text-[24px] font-extrabold hover:bg-white border-2 border-custom-green hover:text-custom-green ease-in-out duration-300 flex justify-center items-center"
                        >
                            {loading ? (
                                <div className="flex flex-row gap-2">
                                    <div className="w-4 h-4 rounded-full bg-custom-grey animate-bounce [animation-delay:.7s]"></div>
                                    <div className="w-4 h-4 rounded-full bg-custom-grey animate-bounce [animation-delay:.3s]"></div>
                                    <div className="w-4 h-4 rounded-full bg-custom-grey animate-bounce [animation-delay:.7s]"></div>
                                </div>
                            ) : (
                                "Login"
                            )}
                        </button>
                        {error && <p className="text-red-500 text-center mb-[20px]">{error}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
