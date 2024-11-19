import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CreateUser = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [noHp, setNoHp] = useState('');
    const [role, setRole] = useState('kasir');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try { 
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
        }
    };

    return (
        <div>
            <div className="w-full h-[45px] mt-[50px] mb-[50px] grid grid-cols-3 justify-center">
                <button
                    onClick={() => router.push('/admin/user')}
                    className="w-[100px] bg-custom-green rounded-[5px] ms-[100px] text-white border-2 border-custom-green hover:bg-white hover:text-custom-green ease-in-out duration-300"
                >
                    Back
                </button>
                <h1 className="text-[30px] text-center">Create New User</h1>
            </div>

            <div className="w-full flex justify-center items-center">
                <div className="w-[600px] bg-custom-grey px-[50px] py-[50px] rounded-xl">
                    <form onSubmit={handleSubmit} className="flex flex-col space-y-8">
                        <div className="h-12 relative flex rounded-[5px]">
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="peer w-full outline-none bg-white px-4 rounded-[5px] focus:shadow-md text-black"
                                required
                            />
                            <label
                                className="absolute text-black top-1/2 translate-y-[-50%] left-4 px-2 peer-focus:-top-2 peer-focus:left-3 font-bold peer-focus:text-[12px] peer-focus:text-black peer-valid:-top-2 peer-valid:left-3 peer-valid:text-[12px] peer-valid:text-black duration-150"
                                htmlFor="username"
                            >
                                Username
                            </label>
                        </div>

                        <div className="h-12 relative flex rounded-[5px]">
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="peer w-full outline-none bg-white px-4 rounded-[5px] focus:shadow-md text-black"
                                required
                            />
                            <label
                                className="absolute text-black top-1/2 translate-y-[-50%] left-4 px-2 peer-focus:-top-2 peer-focus:left-3 font-bold peer-focus:text-[12px] peer-focus:text-black peer-valid:-top-2 peer-valid:left-3 peer-valid:text-[12px] peer-valid:text-black duration-150"
                                htmlFor="password"
                            >
                                Password
                            </label>
                        </div>

                        <div className="h-12 relative flex rounded-[5px]">
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="peer w-full outline-none bg-white px-4 rounded-[5px] focus:shadow-md text-black"
                                required
                            />
                            <label
                                className="absolute text-black top-1/2 translate-y-[-50%] left-4 px-2 peer-focus:-top-2 peer-focus:left-3 font-bold peer-focus:text-[12px] peer-focus:text-black peer-valid:-top-2 peer-valid:left-3 peer-valid:text-[12px] peer-valid:text-black duration-150"
                                htmlFor="email"
                            >
                                Email
                            </label>
                        </div>

                        <div className="h-12 relative flex rounded-[5px]">
                            <input
                                id="notel"
                                type="number"
                                value={noHp}
                                onChange={(e) => setNoHp(e.target.value)}
                                className="peer w-full outline-none bg-white px-4 rounded-[5px] focus:shadow-md text-black"
                                required
                            />
                            <label
                                className="absolute text-black top-1/2 translate-y-[-50%] left-4 px-2 peer-focus:-top-2 peer-focus:left-3 font-bold peer-focus:text-[12px] peer-focus:text-black peer-valid:-top-2 peer-valid:left-3 peer-valid:text-[12px] peer-valid:text-black duration-150"
                                htmlFor="notel"
                            >
                                Phone Number
                            </label>
                        </div>

                        <div className="h-12 relative flex rounded-[5px]">
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="peer w-full outline-none bg-white px-4 rounded-[5px] focus:shadow-md text-black"
                            >
                                <option value="kasir">Kasir</option>
                                <option value="admin">Admin</option>
                            </select>
                            <label
                                className="absolute text-black top-1/2 translate-y-[-50%] left-4 px-2 peer-focus:-top-2 peer-focus:left-3 font-bold peer-focus:text-[12px] peer-focus:text-black peer-valid:-top-2 peer-valid:left-3 peer-valid:text-[12px] peer-valid:text-black duration-150"
                                htmlFor="role"
                            >
                                Role
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="h-12 bg-custom-green text-white py-2 rounded-[5px] mt-4 hover:bg-white border-2 border-custom-green hover:text-custom-green ease-in-out duration-300"
                        >
                            Create User
                        </button>
                    </form>

                    {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                    {success && <p className="text-green-500 text-center mt-4">{success}</p>}
                </div>
            </div>
        </div>
    );
};

export default CreateUser;
