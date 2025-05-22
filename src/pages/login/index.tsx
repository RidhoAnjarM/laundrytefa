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

        // Validasi input kosong
        if (!username || !password) {
            setError('Username dan password wajib diisi.');
            setLoading(false);
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
            // Cek apakah error berasal dari respons server
            const errorMessage = error?.response?.data?.error || 'Terjadi kesalahan pada server.';
            // Tambahkan validasi spesifik untuk username atau password salah
            if (error?.response?.status === 401) {
                setError('Username atau password salah.');
            } else {
                setError(`Login gagal: ${errorMessage}`);
            }
            console.error('Login failed:', errorMessage);
        }
    };

    return (
        <div className="w-full flex justify-center">
            <div>
                <div className="w-full flex justify-center mt-[150px] mb-[38px]">
                    <img src="../images/logo.png" alt="" className='w-[96px] h-[94px] rounded-full object-cover' />
                </div>
                <h1 className="text-[24px] font-extrabold font-ruda mb-[38px] text-center text-black"> Login To Laundry </h1>
                <form onSubmit={handleLogin} className="w-full grid text-black">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-[400px] h-[50px] rounded-[10px] mb-[20px] border border-black ps-[20px] outline-custom-green"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-[400px] h-[50px] rounded-[10px] mb-[30px] border border-black ps-[20px] outline-custom-green"
                        required
                    />
                    <button
                        type="submit"
                        className="w-[400px] h-[50px] rounded-[10px] bg-custom-green text-white text-[24px] font-extrabold font-ruda hover:bg-green-700 flex justify-center items-center"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex justify-center items-center">
                                <div className="w-10 h-10 border-4 border-t-custom-green border-gray-300 rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            "Login"
                        )}
                    </button>
                    {error && <p className="text-red-500 text-center mt-[20px]">{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default Login;