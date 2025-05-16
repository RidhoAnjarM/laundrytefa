'use client'

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
            <div className="fixed bg-custom-green h-[calc(100vh-20px)] w-[200px] flex flex-col items-center justify-between rounded-[10px] m-[10px] py-[50px]">
                <div className="">
                    <img src="../images/logo.png" alt="" className='w-[80px] ' />
                </div>

                <div className="flex flex-wrap items-center w-full justify-center">
                    <div className="relative group w-full flex justify-center ">
                        <button
                            onClick={() => router.push("/kasir/dashboard")}
                            className={`w-[175px] h-[53px] rounded-[15px] bg-custom-green flex font-ruda text-[18px] font-extrabold text-white items-center transition duration-300 hover:bg-white hover:bg-opacity-45  ${router.pathname === '/kasir/dashboard' ? 'bg-white bg-opacity-45' : ''}`}>
                            <img src="../images/dashboard.svg" alt="" className='ms-[19px] me-[15px]' /> <span>Dashboard</span>
                        </button>
                    </div>

                    <div className="relative group w-full flex justify-center mt-[20px]">
                        <button
                            onClick={() => router.push("/kasir/data")}
                            className={`w-[175px] h-[53px] rounded-[15px] bg-custom-green flex font-ruda text-[18px] font-extrabold text-white items-center transition duration-300 hover:bg-white hover:bg-opacity-45   ${router.pathname === '/kasir/data' ? 'bg-white bg-opacity-45' : ''}`}>
                            <img src="../images/datalaundry.svg" alt="" className='ms-[23px] me-[19px]' /> <span>History</span>
                        </button>
                    </div>

                    <div className="relative group w-full flex justify-center mt-[20px]">
                        <button
                            onClick={() => router.push("/kasir/bahan")}
                            className={`w-[175px] h-[53px] rounded-[15px] bg-custom-green flex font-ruda text-[18px] font-extrabold text-white items-center transition duration-300 hover:bg-white hover:bg-opacity-45   ${router.pathname === '/kasir/bahan' ? 'bg-white bg-opacity-45' : ''}`}>
                            <img src="../images/box.svg" alt="" className='ms-[23px] me-[19px]' /> <span>Supply</span>
                        </button>
                    </div>
                </div>

                <div className="w-[100px] relative group flex justify-center bg-white rounded-[15px] bg-opacity-15 text-[14px] text-white hover:bg-opacity-45">
                    <button
                        onClick={handleLogout}
                        className=" w-[100px] h-[40px] flex items-center justify-center font-ruda rounded-[15px] transition duration-300 gap-2">
                        <img src="../images/logout.svg" alt="" /> <span>Logout</span>
                    </button>
                </div>
            </div>

            <Modal isOpen={showLogoutModal} onClose={cancelLogout}>
                <div className="p-4 text-center">
                    <div className="flex justify-center items-center mb-4">
                        <h2 className="text-[20px] font-bold text-black">Confirm Logout!</h2>
                    </div>
                    <div className="text-center">
                        <p className="text-[16px] text-black mb-6">
                            Are you sure you want to leave?
                        </p>
                    </div>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={cancelLogout}
                            className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-600 transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmLogout}
                            className="px-6 py-2 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 hover:shadow-lg transition-all duration-200 flex items-center justify-center"
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