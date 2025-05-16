'use client'

import Navbar from '@/components/navbar';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Bahan } from '@/types';
import Cookies from 'js-cookie';
import Modal from '@/components/modal';
import SupplyCreateModal from './create';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Supply = () => {
    const router = useRouter();
    const [bahans, setBahan] = useState<Bahan[]>([]);
    const [search, setSearch] = useState('');
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedBahan, setSelectedBahan] = useState<Bahan | null>(null);
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [bahanToDelete, setBahanToDelete] = useState<Bahan | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchBahan = async () => {
        setLoading(true);
        try {
            if (!API_URL) {
                console.error('API_URL ga ada di env.');
                return;
            }

            const token = Cookies.get('token');
            if (!token) {
                console.error('Token ga ketemu.');
                return;
            }

            const response = await axios.get(`${API_URL}/api/bahan`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            });

            if (response.data && response.data.data) {
                setBahan(response.data.data);
            } else {
                console.error('Data kosong atau formatnya aneh.');
            }
        } catch (error) {
            console.error('Gagal ambil data bahan:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBahan();
    }, []);

    const filteredBahan = bahans.filter((bahan) =>
        (bahan.namaBahan ?? "").toLowerCase().includes(search.toLowerCase())
    );

    const handleUpdateBahan = async (updatedBahan: Partial<Bahan>) => {
        setLoading(true);
        try {
            if (selectedBahan) {
                const token = Cookies.get('token');
                if (!token) {
                    showNotification('Unauthorized: Token not found');
                    return;
                }

                const response = await axios.put(
                    `${API_URL}/api/bahan/${selectedBahan.id}`,
                    updatedBahan,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        withCredentials: true
                    }
                );

                setBahan(prevBahans =>
                    prevBahans.map(bahan =>
                        bahan.id === selectedBahan.id ? { ...bahan, ...updatedBahan } : bahan
                    )
                );

                showNotification('supply updated successfully!');
            }
        } catch (error) {
            console.error('Error updating supply:', error);
            showNotification('Failed to update supply.');
        } finally {
            closeUpdateModal();
            setLoading(false);
        }
    };

    const openDeleteModal = (bahan: Bahan) => {
        setBahanToDelete(bahan);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setBahanToDelete(null);
    };

    const handleDeleteBahan = async (bahanId: number) => {
        setLoading(true);
        try {
            const token = Cookies.get('token');
            if (!token) {
                showNotification('Unauthorized: Token not found');
                return;
            }

            const userRole = Cookies.get('role');
            if (userRole !== 'admin') {
                showNotification('You are not authorized to delete supply');
                return;
            }

            const response = await axios.delete(`${API_URL}/api/bahan/${bahanId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true
            });

            setBahan(prevBahans => prevBahans.filter(bahan => bahan.id !== bahanId));

            showNotification('Supply deleted successfully!');
        } catch (error) {
            console.error('Error deleting supply:', error);
            showNotification('Failed to delete supply.');
        } finally {
            closeDeleteModal();
            setLoading(false);
        }
    };

    const openUpdateModal = (bahan: Bahan) => {
        setSelectedBahan(bahan);
        setIsUpdateModalOpen(true);
    };

    const closeUpdateModal = () => {
        setIsUpdateModalOpen(false);
        setSelectedBahan(null);
    };

    const showNotification = (message: string) => {
        setNotificationMessage(message);
        setIsNotificationModalOpen(true);
    };

    const closeNotificationModal = () => {
        setIsNotificationModalOpen(false);
    };


    return (
        <div>
            <Navbar />
            <div className="ms-[240px] flex flex-wrap justify-center text-black">
                <div className="w-full text-center font-ruda text-[20px] font-black mt-[40px] mb-[30px]">
                    <h1>Manage Supply Used</h1>
                </div>

                <div className="w-full flex justify-between pe-[40px] ps-[20px]">
                    <input
                        type="text"
                        className="w-[300px] h-[40px] bg-white rounded-[10px] text-[14px] border border-black font-ruda font-semibold px-[20px] outline-none"
                        placeholder="search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button
                        type='submit'
                        onClick={() => setIsModalOpen(true)}
                        className='w-[120px] h-[40px] bg-custom-green rounded-[10px] text-[16px] font-ruda font-semibold text-white hover:bg-green-700 transition-colors'
                    >
                        + supply
                    </button>
                </div>

                <div className="w-full mt-[30px] mb-[50px] pe-[40px] ps-[20px]">
                    <table className="min-w-full bg-white border border-custom-gray-2 font-sans rounded-lg overflow-hidden">
                        <thead className="bg-custom-gray-1">
                            <tr>
                                <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">ID</th>
                                <th className='px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider'>Supply</th>
                                <th className='px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider'>Initial Stock</th>
                                <th className='px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider'>Final Stock</th>
                                <th className='px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider'>Action</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-custom-gray-2'>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="border border-black p-1 text-center">
                                        <div className="flex justify-center items-center">
                                            <div className="w-10 h-10 border-4 border-t-custom-green border-gray-300 rounded-full animate-spin"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredBahan.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="border border-black p-1 text-center">No data found</td>
                                </tr>
                            ) : (
                                filteredBahan.map(bahan => (
                                    <tr key={bahan.id} className='hover:bg-gray-50'>
                                        <td className="px-4 py-3 text-[15px] text-gray-700">{bahan.id}</td>
                                        <td className="px-4 py-3 text-[15px] text-gray-700">{bahan.namaBahan}</td>
                                        <td className="px-4 py-3 text-[15px] text-gray-700">{bahan.stokAwal}</td>
                                        <td className="px-4 py-3 text-[15px] text-gray-700">{bahan.stokAkhir}</td>
                                        <td className="px-4 py-3 text-[15px] text-gray-700">
                                            <div className="flex items-center w-full gap-2">
                                                <button
                                                    onClick={() => openUpdateModal(bahan)}
                                                    className="bg-blue-500 w-[40px] h-[40px] rounded-md flex justify-center items-center hover:shadow-sm hover:shadow-black">
                                                    <img src="/images/update copy.svg" alt="Update" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(bahan)}
                                                    className="bg-red-500 w-[40px] h-[40px] rounded-md flex justify-center items-center hover:shadow-sm hover:shadow-black">
                                                    <img src="/images/delete.svg" alt="Delete" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


            {isUpdateModalOpen && selectedBahan && (
                <Modal isOpen={isUpdateModalOpen} onClose={closeUpdateModal}>
                    <div className='px-5 text-black'>
                        <h2 className='text-center font-ruda text-[20px] font-black mb-[20px] text-custom-blue'>Supply Updates</h2>

                        <div className='mt-5'>
                            <label
                                className="block font-ruda text-[14px] font-extrabold mb-2"
                                htmlFor="supply"
                            >
                                Supply Name
                            </label>
                            <input
                                id="supply"
                                type="text"
                                className="h-[50px] w-full bg-gray-100 px-4 rounded-[10px] border border-gray-300 outline-custom-blue"
                                value={selectedBahan.namaBahan || ''}
                                onChange={(e) =>
                                    setSelectedBahan({ ...selectedBahan, namaBahan: e.target.value })
                                }
                            />
                        </div>

                        <div className='mt-5'>
                            <label
                                className="block font-ruda text-[14px] font-extrabold mb-2"
                                htmlFor="stok"
                            >
                                Stock
                            </label>
                            <input
                                id='stok'
                                type="number"
                                className="h-[50px] w-full bg-gray-100 px-4 rounded-[10px] border border-gray-300 outline-custom-blue"
                                value={selectedBahan.stokAwal || ''}
                                onChange={(e) =>
                                    setSelectedBahan({ ...selectedBahan, stokAwal: parseInt(e.target.value) || 0 })
                                }
                            />
                        </div>

                        <div className='mt-5'>
                            <label
                                className="block font-ruda text-[14px] font-extrabold mb-2"
                                htmlFor="stokakhir"
                            >
                                Final Stock
                            </label>
                            <input
                                id='stokakhir'
                                type="number"
                                className="h-[50px] w-full bg-gray-100 px-4 rounded-[10px] border border-gray-300 outline-custom-blue"
                                value={selectedBahan.stokAkhir || ''}
                                onChange={(e) =>
                                    setSelectedBahan({ ...selectedBahan, stokAkhir: parseInt(e.target.value) || 0 })
                                }
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={closeUpdateModal}
                                className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-600 transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() =>
                                    handleUpdateBahan({
                                        namaBahan: selectedBahan.namaBahan,
                                        stokAwal: selectedBahan.stokAwal,
                                        stokAkhir: selectedBahan.stokAkhir,
                                    })
                                }
                                className="px-6 py-2 bg-custom-blue text-white font-semibold rounded-full hover:bg-blue-600 hover:shadow-lg transition-all duration-200"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    'Update'
                                )}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {isDeleteModalOpen && bahanToDelete && (
                <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
                    <div className="p-4 text-center text-black">
                        <h2 className="text-2xl font-extrabold mb-4 font-ruda text-red-500">Confirm Delete</h2>
                        <p className='text-[16px] text-black font-ruda'>Are you sure you want to delete this supply?</p>
                        <div className="mt-9 flex justify-center gap-4">
                            <button
                                onClick={closeDeleteModal}
                                className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-600 transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteBahan(bahanToDelete.id)}
                                className="px-6 py-2 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 hover:shadow-lg transition-all duration-200"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    'Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {isNotificationModalOpen && (
                <Modal
                    isOpen={isNotificationModalOpen}
                    onClose={closeNotificationModal}
                >
                    <div className="p-4 text-center text-black">
                        <h2 className="text-2xl font-bold mb-4 font-ruda text-custom-green ">Notification!</h2>
                        <p className='text-black text-[16px] font-ruda'>{notificationMessage}</p>
                        <div className="flex w-full justify-center mt-4">
                            <button
                                onClick={closeNotificationModal}
                                className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-600 transition-all duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            <SupplyCreateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSupplyCreated={fetchBahan}
            />
        </div>
    )
}

export default Supply