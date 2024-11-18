import React from 'react'
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL;


const Navbar = () => {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await axios.delete(`${API_URL}/api/logout`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            localStorage.removeItem('token');

            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div>
            <div className="fixed bg-custom-grey shadow-lg h-screen w-[100px] flex flex-col items-center justify-between py-4">
                <ul className="flex flex-wrap items-center w-full justify-center">

                    <li className="relative group w-full flex justify-center mt-[150px]">
                        <button
                            onClick={() => router.push("/admin/dashboard")}
                            className={`w-[53px] h-[53px] rounded-full bg-custom-green flex flex-col items-center justify-center py-4 transition duration-300 hover:shadow-custom ${router.pathname === '/admin/dashboard' ? 'shadow-custom' : ''}`}>
                            <img src="../images/dashboard.svg" alt="" />
                        </button>
                        <div className="absolute left-[110px] top-3 hidden h-[30px]  bg-custom-green shadow-lg opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:flex flex-col items-center px-3 rounded-sm justify-center">
                            <div className="absolute top-2 -left-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-custom-green"></div>
                            <ul className="flex flex-col text-white">
                                <li>
                                    <p>Dashboard</p>
                                </li>
                            </ul>
                        </div>
                    </li>

                    <li className="relative group w-full flex justify-center mt-[58px]">
                        <button
                            onClick={() => router.push("/admin/user")}
                            className={`w-[53px] h-[53px] rounded-full bg-custom-green flex flex-col items-center justify-center py-4 transition duration-300 hover:shadow-custom ${router.pathname === '/admin/user' ? 'shadow-custom' : ''}`}>
                            <img src="../images/user.svg" alt="" />
                        </button>
                        <div className="absolute left-[110px] top-3 hidden h-[30px]  bg-custom-green shadow-lg opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:flex flex-col items-center px-3 rounded-sm justify-center">
                            <div className="absolute top-2 -left-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-custom-green"></div>
                            <ul className="flex flex-col text-white">
                                <li>
                                    <p>User</p>
                                </li>
                            </ul>
                        </div>
                    </li>

                    <li className="relative group w-full flex justify-center mt-[58px]">
                        <button
                            onClick={() => router.push("/admin/riwayat")}
                            className={`w-[53px] h-[53px] rounded-full bg-custom-green flex flex-col items-center justify-center py-4 transition duration-300 hover:shadow-custom ${router.pathname === '/admin/riwayat' ? 'shadow-custom' : ''}`}>
                            <img src="../images/history.svg" alt="" />
                        </button>
                        <div className="absolute left-[110px] top-3 hidden h-[30px]  bg-custom-green shadow-lg opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:flex flex-col items-center px-3 rounded-sm justify-center">
                            <div className="absolute top-2 -left-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-custom-green"></div>
                            <ul className="flex flex-col text-white">
                                <li>
                                    <p>History</p>
                                </li>
                            </ul>
                        </div>
                    </li>

                    <li className="relative group w-full flex justify-center mt-[58px]">
                        <button
                            onClick={() => router.push("/admin/data")}
                            className={`w-[53px] h-[53px] rounded-full bg-custom-green flex flex-col items-center justify-center py-4 transition duration-300 hover:shadow-custom ${router.pathname === '/admin/data' ? 'shadow-custom' : ''}`}>
                            <img src="../images/datalaundry.svg" alt="" />
                        </button>
                        <div className="absolute left-[110px] top-3 hidden h-[30px]  bg-custom-green shadow-lg opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:flex  items-center px-3 rounded-sm justify-center">
                            <div className="absolute top-2 -left-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-custom-green"></div>
                            <ul className="flex text-nowrap text-white">
                                <li>
                                    <p>Data Laundry</p>
                                </li>
                            </ul>
                        </div>
                    </li>

                    <li className="w-full relative group flex justify-center mt-[120px]">
                        <button
                            onClick={handleLogout}
                            className=" w-[53px] h-[53px] flex flex-col items-center justify-center py-4 transition duration-300">
                            <img src="../images/logout.svg" alt="" />
                        </button>
                    </li>
                </ul>
            </div>

        </div>

    )
}

export default Navbar