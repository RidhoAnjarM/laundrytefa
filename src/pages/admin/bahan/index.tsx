import Navbar from '@/pages/components/navbar';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Bahan } from '@/types';
import Cookies from 'js-cookie';
import Modal from '@/pages/components/modal';

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

    useEffect(() => {
        const fetchBahan = async () => {
            setLoading(true);
            try {
                if (!API_URL) {
                    console.error('API_URL is not defined in the environment variables.');
                    return;
                }

                const token = Cookies.get('token');
                if (!token) {
                    console.error('Token tidak ditemukan');
                    return;
                }

                const apiUrl = `${API_URL}/api/bahan`;
                const response = await axios.get(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                });

                if (response.data && response.data.data) {
                    setBahan(response.data.data);
                } else {
                    console.error('The data is empty or in an unexpected format');
                }
            } catch (error) {
                console.error('Error fetching Supply:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBahan();
    }, [API_URL]);

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

    const filteredBahan = bahans.filter((bahan) =>
        (bahan.namaBahan ?? "").toLowerCase().includes(search.toLowerCase())
    );

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
            <div className="ms-[100px] flex flex-wrap justify-center">
                <div className="w-full text-[30px] h-[45px] mt-[50px] ps-[40px] mb-[30px]">
                    <h1>Manage Supply Used</h1>
                </div>

                <div className="w-full flex justify-between px-[78px]">
                    <div className="flex">
                        <input
                            type="text"
                            className='w-[230px] h-[45px] rounded-[5px]  ps-[32px] text-[16px] border border-black'
                            placeholder='Search. . .'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="">
                        <button
                            type='submit'
                            onClick={() => router.push('/admin/bahan/create')}
                            className='w-[100px] h-[45px] bg-custom-green rounded-[5px] text-[18px] text-white font-bold hover:bg-white hover:border hover:border-custom-green hover:text-custom-green ease-in-out duration-300'
                        >
                            + supply
                        </button>
                    </div>
                </div>

                <div className="w-full px-[78px] mt-[50px] mb-[50px]">
                    <table className='w-full border-collapse border-black border rounded-lg' id='tabel-bahan'>
                        <thead className='bg-custom-grey'>
                            <tr className='text-[14px]'>
                                <th className='border border-black p-1'>Id</th>
                                <th className='border border-black p-1'>Supply</th>
                                <th className='border border-black p-1'>StokAwal</th>
                                <th className='border border-black p-1'>StokAkhir</th>
                                <th className='border border-black p-1 w-[100px]'>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={15} className="border border-black p-1 text-center">
                                        <div className="flex justify-center items-center">
                                            <div className="w-10 h-10 border-4 border-t-custom-green border-gray-300 rounded-full animate-spin"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredBahan.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="border border-black p-2 text-center">No data found</td>
                                </tr>
                            ) : (
                                filteredBahan.map(bahan => (
                                    <tr key={bahan.id}>
                                        <td className="border border-black p-1">{bahan.id}</td>
                                        <td className="border border-black p-1">{bahan.namaBahan}</td>
                                        <td className="border border-black p-1">{bahan.stokAwal}</td>
                                        <td className="border border-black p-1">{bahan.stokAkhir}</td>
                                        <td className="border border-black p-1">
                                            <div className="flex justify-evenly items-center w-full gap-2">
                                                <button
                                                    onClick={() => openUpdateModal(bahan)}
                                                    className="bg-blue-500 w-[30px] h-[30px] rounded-md flex justify-center items-center hover:shadow-sm hover:shadow-black">
                                                    <img src="/images/update copy.svg" alt="Update" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(bahan)}
                                                    className="bg-red-500 w-[30px] h-[30px] rounded-md flex justify-center items-center hover:shadow-sm hover:shadow-black">
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
                    <div className='px-5'>
                        <h2 className='mt-5 mb-10 text-center text-[28px] font-bold text-custom-blue'>Supply Updates</h2>

                        <div className="h-12 relative flex rounded-[5px]">
                            <input
                                id="supply"
                                type="text"
                                className="peer w-full outline-none bg-white px-4 rounded-[5px] focus:shadow-md text-black border border-black"
                                value={selectedBahan.namaBahan || ''}
                                onChange={(e) =>
                                    setSelectedBahan({ ...selectedBahan, namaBahan: e.target.value })
                                }
                            />
                            <label
                                className="absolute text-black top-1/2 translate-y-[-50%] left-4 px-2 peer-focus:-top-2 peer-focus:left-3 font-bold peer-focus:text-[12px] peer-focus:text-black peer-valid:-top-2 peer-valid:left-3 peer-valid:text-[12px] peer-valid:text-black duration-150"
                                htmlFor="supply"
                            >
                                Supply Name
                            </label>
                        </div>

                        <div className="h-12 relative flex rounded-[5px] mt-8">
                            <input
                                id='stok'
                                type="number"
                                className="peer w-full outline-none bg-white px-4 rounded-[5px] focus:shadow-md text-black border border-black"
                                value={selectedBahan.stokAwal || ''}
                                onChange={(e) =>
                                    setSelectedBahan({ ...selectedBahan, stokAwal: parseInt(e.target.value) || 0 })
                                }
                            />
                            <label
                                className="absolute text-black top-1/2 translate-y-[-50%] left-4 px-2 peer-focus:-top-2 peer-focus:left-3 font-bold peer-focus:text-[12px] peer-focus:text-black peer-valid:-top-2 peer-valid:left-3 peer-valid:text-[12px] peer-valid:text-black duration-150"
                                htmlFor="stok"
                            >
                                Stok
                            </label>
                        </div>

                        <div className="h-12 relative flex rounded-[5px] mt-8">
                            <input
                                id='stokakhir'
                                type="number"
                                className="peer w-full outline-none bg-white px-4 rounded-[5px] focus:shadow-md text-black border border-black"
                                value={selectedBahan.stokAkhir || ''}
                                onChange={(e) =>
                                    setSelectedBahan({ ...selectedBahan, stokAkhir: parseInt(e.target.value) || 0 })
                                }
                            />
                            <label
                                className="absolute text-black top-1/2 translate-y-[-50%] left-4 px-2 peer-focus:-top-2 peer-focus:left-3 font-bold peer-focus:text-[12px] peer-focus:text-black peer-valid:-top-2 peer-valid:left-3 peer-valid:text-[12px] peer-valid:text-black duration-150"
                                htmlFor="stokakhir"
                            >
                                Stok Akhir
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={closeUpdateModal}
                                className="ml-2 bg-white text-custom-blue border border-custom-blue px-4 py-2 rounded hover:bg-custom-blue hover:text-white ease-in-out duration-300"
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
                                className="bg-custom-blue text-white px-4 py-2 rounded border border-custom-blue hover:bg-white hover:text-custom-blue ease-in-out duration-300"
                            >
                                {loading ? (
                                    <div className="flex flex-row gap-2">
                                        <div className="w-2 h-2 rounded-full bg-custom-grey animate-bounce [animation-delay:.7s]"></div>
                                        <div className="w-2 h-2 rounded-full bg-custom-grey animate-bounce [animation-delay:.3s]"></div>
                                        <div className="w-2 h-2 rounded-full bg-custom-grey animate-bounce [animation-delay:.7s]"></div>
                                    </div>
                                ) : (
                                    "Update"
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
                    <div className="text-center">
                        <h2>Succeed !</h2>
                        <p className="mb-4">{notificationMessage}</p>
                        <button
                            onClick={closeNotificationModal}
                            className="bg-custom-green text-white px-4 py-2 rounded"
                        >
                            OK
                        </button>
                    </div>
                </Modal>
            )}

            {isDeleteModalOpen && bahanToDelete && (
                <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
                    <div className="text-center">
                        <h2 className='mt-7'>Are you sure you want to delete this supply?</h2>
                        <p className="mb-7">
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-center">
                            <button
                                onClick={closeDeleteModal}
                                className="bg-white text-red-500 px-4 py-2 rounded mr-2 border border-red-500 hover:bg-red-500 hover:text-white ease-in-out duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteBahan(bahanToDelete.id)}
                                className="bg-red-500 text-white px-5 py-2 rounded border border-red-500 hover:bg-white hover:text-red-500 ease-in-out duration-300"
                            >
                                {loading ? (
                                    <div className="flex flex-row gap-2">
                                        <div className="w-2 h-2 rounded-full bg-custom-grey animate-bounce [animation-delay:.7s]"></div>
                                        <div className="w-2 h-2 rounded-full bg-custom-grey animate-bounce [animation-delay:.3s]"></div>
                                        <div className="w-2 h-2 rounded-full bg-custom-grey animate-bounce [animation-delay:.7s]"></div>
                                    </div>
                                ) : (
                                    "Delete"
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
                    <div className="text-center">
                        <h2 className='text-[24px] text-custom-blue font-bold'>Notification!</h2>
                        <p className="mb-7 mt-7">{notificationMessage}</p>
                        <button
                            onClick={closeNotificationModal}
                            className="bg-custom-blue text-white w-[100px] h-[40px] rounded-[5px] border border-custom-blue hover:bg-white hover:text-custom-blue ease-in-out duration-300"
                        >
                            OK
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    )
}

export default Supply