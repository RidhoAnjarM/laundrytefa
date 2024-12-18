import React, { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { deleteCookie } from 'cookies-next';
import Modal from '../modal';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const NavbarKasir = () => {
    const router = useRouter();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleConfirmLogout = async () => {
        setLoading(true);
        try {
            await axios.delete(`${API_URL}/api/logout`, {
                withCredentials: true,
            });

            deleteCookie('token');

            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const cancelLogout = () => {
        setShowLogoutModal(false);
    };

    return (
        <div className='relative'>
            <div className="fixed bg-custom-grey shadow-lg h-screen w-[100px] flex flex-col items-center justify-between py-4">
                <ul className="flex flex-wrap items-center w-full justify-center">

                    <li className="relative group w-full flex justify-center mt-[230px]">
                        <button
                            onClick={() => router.push("/kasir/dashboard")}
                            className={`w-[53px] h-[53px] rounded-full bg-custom-green flex flex-col items-center justify-center py-4 transition duration-300 hover:shadow-custom ${router.pathname === '/kasir/dashboard' ? 'shadow-custom' : ''}`}>
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
                            onClick={() => router.push("/kasir/data")}
                            className={`w-[53px] h-[53px] rounded-full bg-custom-green flex flex-col items-center justify-center py-4 transition duration-300 hover:shadow-custom ${router.pathname === '/kasir/data' ? 'shadow-custom' : ''}`}>
                            <img src="../images/datalaundry.svg" alt="" />
                        </button>
                        <div className="absolute left-[110px] top-3 hidden h-[30px]  bg-custom-green shadow-lg opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:flex  items-center px-3 rounded-sm justify-center">
                            <div className="absolute top-2 -left-4  h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-custom-green"></div>
                            <ul className="flex text-nowrap text-white">
                                <li>
                                    <p>Laundry Data</p>
                                </li>
                            </ul>
                        </div>
                    </li>

                    <li className="relative group w-full flex justify-center mt-[58px]">
                        <button
                            onClick={() => router.push("/kasir/bahan")}
                            className={`w-[53px] h-[53px] rounded-full bg-custom-green flex flex-col items-center justify-center py-4 transition duration-300 hover:shadow-custom ${router.pathname === '/kasir/bahan' ? 'shadow-custom' : ''}`}>
                            <img src="../images/box.svg" alt="" />
                        </button>
                        <div className="absolute left-[110px] top-3 hidden h-[30px]  bg-custom-green shadow-lg opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:flex  items-center px-3 rounded-sm justify-center">
                            <div className="absolute top-2 -left-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-custom-green"></div>
                            <ul className="flex text-nowrap text-white">
                                <li>
                                    <p>Supply</p>
                                </li>
                            </ul>
                        </div>
                    </li>

                    <li className="w-full relative group flex justify-center mt-[150px]">
                        <button
                            onClick={handleLogout}
                            className=" w-[53px] h-[53px] flex flex-col items-center justify-center py-4 transition duration-300">
                            <img src="../images/logout.svg" alt="" />
                        </button>
                    </li>
                </ul>
            </div>

            <Modal isOpen={showLogoutModal} onClose={cancelLogout}>
                <div className="p-4 text-center">
                    <h2 className="text-lg mb-4 font-bold text-center">Confirm Logout!</h2>
                    <p>Are you sure you want to leave?</p>
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={cancelLogout}
                            className="px-4 py-2 border border-red-500 text-red-500 rounded-md mr-2 hover:bg-red-500 hover:text-white ease-in-out duration-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmLogout}
                            className="px-4 py-2 bg-red-500 text-white rounded-md border border-red-500 hover:bg-white hover:text-red-500 ease-in-out duration-300"
                        >
                            {loading ? (
                                <div className="flex flex-row gap-2">
                                    <div className="w-2 h-2 rounded-full bg-custom-grey animate-bounce [animation-delay:.7s]"></div>
                                    <div className="w-2 h-2 rounded-full bg-custom-grey animate-bounce [animation-delay:.3s]"></div>
                                    <div className="w-2 h-2 rounded-full bg-custom-grey animate-bounce [animation-delay:.7s]"></div>
                                </div>
                            ) : (
                                "Logout"
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default NavbarKasir