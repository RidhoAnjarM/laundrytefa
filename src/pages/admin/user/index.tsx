import Navbar from '@/components/navbar';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { User } from '@/types';
import Cookies from 'js-cookie';
import Modal from '@/components/modal';
import CreateUserModal from './usercreate';


const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Users = () => {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/users`);
            console.log('Data dari server:', response.data);
            setUsers(response.data); 
        } catch (error) {
            console.error('Gagal ambil data user:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(search.toLowerCase());
        const matchesRole = user.role === "kasir";
        return matchesSearch && matchesRole;
    });

    const openUpdateModal = (user: User) => {
        setSelectedUser(user);
        setIsUpdateModalOpen(true);
    };

    const closeUpdateModal = () => {
        setIsUpdateModalOpen(false);
        setSelectedUser(null);
    };

    const handleUpdateUser = async (updatedUser: Partial<User>) => {
        setLoading(true);
        try {
            if (selectedUser) {
                const token = Cookies.get('token');
                if (!token) {
                    showNotification('Unauthorized: Token not found');
                    return;
                }

                const response = await axios.put(
                    `${API_URL}/api/users/${selectedUser.id}`,
                    updatedUser,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        withCredentials: true
                    }
                );

                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user.id === selectedUser.id ? { ...user, ...updatedUser } : user
                    )
                );

                showNotification('User updated successfully!');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            showNotification('Failed to update user.');
        } finally {
            closeUpdateModal();
            setLoading(false);
        }
    };

    const showNotification = (message: string) => {
        setNotificationMessage(message);
        setIsNotificationModalOpen(true);
    };

    const closeNotificationModal = () => {
        setIsNotificationModalOpen(false);
    };

    const openDeleteModal = (user: User) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
    };

    const handleDeleteUser = async (userId: number) => {
        setLoading(true);
        try {
            const token = Cookies.get('token');
            if (!token) {
                showNotification('Unauthorized: Token not found');
                return;
            }

            const userRole = Cookies.get('role');
            if (userRole !== 'admin') {
                showNotification('You are not authorized to delete users');
                return;
            }

            const response = await axios.delete(`${API_URL}/api/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true
            });

            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));

            showNotification('User deleted successfully!');
        } catch (error) {
            console.error('Error deleting user:', error);
            showNotification('Failed to delete user.');
        } finally {
            closeDeleteModal();
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="ms-[240px] flex flex-wrap justify-center text-black">
                <div className="w-full text-center font-ruda text-[20px] font-black mt-[40px] mb-[30px]">
                    <h1>Manage Users</h1>
                </div>

                <div className="w-full flex justify-between pe-[40px] ps-[20px]">
                    <input
                        type="text"
                        className='w-[300px] h-[40px] bg-white rounded-[10px] text-[14px] border border-black font-ruda font-semibold px-[20px] outline-none'
                        placeholder='search by username...'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className='w-[120px] h-[40px] bg-custom-green rounded-[10px] text-[16px] font-ruda font-semibold text-white hover:bg-green-700 transition-colors'
                    >
                        + user
                    </button>
                </div>

                <div className="w-full mt-[30px] mb-[50px] pe-[40px] ps-[20px]">
                    <table className='min-w-full bg-white border border-custom-gray-2 font-sans rounded-lg overflow-hidden' id='tabel-user'>
                        <thead className='bg-custom-gray-1'>
                            <tr>
                                <th className='px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider'>Username</th>
                                <th className='px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider'>Email</th>
                                <th className='px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider'>Phone Number</th>
                                <th className='px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider'>Action</th>
                            </tr>
                        </thead>

                        <tbody className='divide-y divide-custom-gray-2'>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="border border-black p-1 text-center">
                                        <div className="flex justify-center items-center">
                                            <div className="w-10 h-10 border-4 border-t-custom-green border-gray-300 rounded-full animate-spin"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="border border-black p-2 text-center">No data found</td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className='hover:bg-gray-50'>
                                        <td className='px-4 py-3 text-[15px] text-gray-700'>{user.username}</td>
                                        <td className='px-4 py-3 text-[15px] text-gray-700'>{user.email}</td>
                                        <td className='px-4 py-3 text-[15px] text-gray-700'>{user.no_hp}</td>
                                        <td className='px-4 py-3 text-[15px] text-gray-700'>
                                            <div className="flex items-center w-full gap-2">
                                                <button
                                                    onClick={() => openUpdateModal(user)}
                                                    className='bg-blue-500 w-[40px] h-[40px] rounded-md flex justify-center items-center hover:shadow-sm hover:shadow-black'>
                                                    <img src="/images/update copy.svg" alt="Update" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(user)}
                                                    className='bg-red-500 w-[40px] h-[40px] rounded-md flex justify-center items-center hover:shadow-sm hover:shadow-black'>
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

            {isUpdateModalOpen && selectedUser && (
                <Modal isOpen={isUpdateModalOpen} onClose={closeUpdateModal}>
                    <div className='px-5 text-black'>
                        <h2 className='text-center font-ruda text-[20px] font-black mb-[20px] text-custom-blue'>User Updates</h2>

                        <div className="mt-5">
                            <label
                                className="block font-ruda text-[14px] font-extrabold mb-2"
                                htmlFor="username"
                            >
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                className="h-[50px] w-full bg-gray-100 px-4 rounded-[10px] border border-gray-300 outline-custom-blue"
                                value={selectedUser.username || ''}
                                onChange={(e) =>
                                    setSelectedUser({ ...selectedUser, username: e.target.value })
                                }
                            />
                        </div>

                        <div className="mt-5">
                            <label
                                className="block font-ruda text-[14px] font-extrabold mb-2"
                                htmlFor="email"
                            >
                                Email
                            </label>
                            <input
                                id='email'
                                type="email"
                                className="h-[50px] w-full bg-gray-100 px-4 rounded-[10px] border border-gray-300 outline-custom-blue"
                                value={selectedUser.email || ''}
                                onChange={(e) =>
                                    setSelectedUser({ ...selectedUser, email: e.target.value })
                                }
                            />
                        </div>

                        <div className="mt-5">
                            <label
                                className="block font-ruda text-[14px] font-extrabold mb-2"
                                htmlFor="phone"
                            >
                                Phone Number
                            </label>
                            <input
                                type="text"
                                className="h-[50px] w-full bg-gray-100 px-4 rounded-[10px] border border-gray-300 outline-custom-blue"
                                value={selectedUser.no_hp || ''}
                                onChange={(e) =>
                                    setSelectedUser({ ...selectedUser, no_hp: e.target.value })
                                }
                            />
                        </div>

                        <div className="mt-5">
                            <label
                                className="block font-ruda text-[14px] font-extrabold mb-2"
                                htmlFor="email"
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                className="h-[50px] w-full bg-gray-100 px-4 rounded-[10px] border border-gray-300 outline-custom-blue"
                                value={selectedUser.password || ''}
                                onChange={(e) =>
                                    setSelectedUser({ ...selectedUser, password: e.target.value })
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
                                    handleUpdateUser({
                                        username: selectedUser.username,
                                        email: selectedUser.email,
                                        no_hp: selectedUser.no_hp,
                                        role: selectedUser.role,
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


            {isDeleteModalOpen && userToDelete && (
                <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
                   <div className="p-4 text-center text-black">
                        <h2 className="text-2xl font-extrabold mb-4 font-ruda text-red-500">Confirm Delete</h2>
                        <p className='text-[16px] text-black font-ruda'>Are you sure you want to delete this user?</p>
                        <div className="mt-9 flex justify-center gap-4">
                            <button
                                onClick={closeDeleteModal}
                                className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-600 transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteUser(userToDelete.id)}
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

            <CreateUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUserCreated={fetchUsers}
            />

        </div>
    );
};

export default Users;
