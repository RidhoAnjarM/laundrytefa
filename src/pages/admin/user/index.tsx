import Navbar from '@/components/navbar';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { User } from '@/types';
import Cookies from 'js-cookie';
import Modal from '@/components/modal';


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

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const apiUrl = `${API_URL}/api/users`;
                const response = await axios.get(apiUrl);
                console.log('API Response:', response.data);
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [API_URL]);

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

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(search.toLowerCase());
        const matchesRole = user.role === "kasir";
        return matchesSearch && matchesRole;
    });

    return (
        <div>
            <Navbar />
            <div className="ms-[240px] flex flex-wrap justify-center">
                <div className="w-full text-center font-ruda text-[20px] font-black mt-[40px] mb-[30px]">
                    <h1>Manage Users</h1>
                </div>

                <div className="w-full flex justify-between pe-[40px] ps-[40px]">
                    <input
                        type="text"
                        className='w-[300px] h-[50px] bg-white rounded-[10px] text-[16px] border border-black font-ruda font-semibold px-[32px]'
                        placeholder='Search by Name'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <button
                        type='submit'
                        onClick={() => router.push('/admin/user/usercreate')}
                        className='w-[120px] h-[50px] bg-custom-green rounded-[10px] text-[16px] font-ruda font-semibold text-white hover:bg-green-700 transition-colors'
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
                                            <div className="w-full flex justify-evenly">
                                                <button
                                                    onClick={() => openUpdateModal(user)}
                                                    className='bg-blue-500 w-[30px] h-[30px] rounded-md flex justify-center items-center hover:shadow-sm hover:shadow-black'>
                                                    <img src="/images/update copy.svg" alt="Update" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(user)}
                                                    className='bg-red-500 w-[30px] h-[30px] rounded-md flex justify-center items-center hover:shadow-sm hover:shadow-black'>
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
                    <div className='px-5'>
                        <h2 className='mt-5 mb-10 text-center text-[28px] font-bold text-custom-blue'>User Updates</h2>

                        <div className="h-12 relative flex rounded-[5px]">
                            <input
                                id="username"
                                type="text"
                                className="peer w-full outline-none bg-white px-4 rounded-[5px] focus:shadow-md text-black border border-black"
                                value={selectedUser.username || ''}
                                onChange={(e) =>
                                    setSelectedUser({ ...selectedUser, username: e.target.value })
                                }
                            />
                            <label
                                className="absolute text-black top-1/2 translate-y-[-50%] left-4 px-2 peer-focus:-top-2 peer-focus:left-3 font-bold peer-focus:text-[12px] peer-focus:text-black peer-valid:-top-2 peer-valid:left-3 peer-valid:text-[12px] peer-valid:text-black duration-150"
                                htmlFor="username"
                            >
                                Username
                            </label>
                        </div>

                        <div className="h-12 relative flex rounded-[5px] mt-8">
                            <input
                                id='email'
                                type="email"
                                className="peer w-full outline-none bg-white px-4 rounded-[5px] focus:shadow-md text-black border border-black"
                                value={selectedUser.email || ''}
                                onChange={(e) =>
                                    setSelectedUser({ ...selectedUser, email: e.target.value })
                                }
                            />
                            <label
                                className="absolute text-black top-1/2 translate-y-[-50%] left-4 px-2 peer-focus:-top-2 peer-focus:left-3 font-bold peer-focus:text-[12px] peer-focus:text-black peer-valid:-top-2 peer-valid:left-3 peer-valid:text-[12px] peer-valid:text-black duration-150"
                                htmlFor="email"
                            >
                                Email
                            </label>
                        </div>

                        <div className="h-12 relative flex rounded-[5px] mt-8">
                            <input
                                type="text"
                                className="peer w-full outline-none bg-white px-4 rounded-[5px] focus:shadow-md text-black border border-black"
                                value={selectedUser.no_hp || ''}
                                onChange={(e) =>
                                    setSelectedUser({ ...selectedUser, no_hp: e.target.value })
                                }
                            />
                            <label
                                className="absolute text-black top-1/2 translate-y-[-50%] left-4 px-2 peer-focus:-top-2 peer-focus:left-3 font-bold peer-focus:text-[12px] peer-focus:text-black peer-valid:-top-2 peer-valid:left-3 peer-valid:text-[12px] peer-valid:text-black duration-150"
                                htmlFor="phone"
                            >
                                Phone Number
                            </label>
                        </div>

                        <div className="h-12 relative flex rounded-[5px] mt-8">
                            <input
                                type="password"
                                className="peer w-full outline-none bg-white px-4 rounded-[5px] focus:shadow-md text-black border border-black"
                                value={selectedUser.password || ''}
                                onChange={(e) =>
                                    setSelectedUser({ ...selectedUser, password: e.target.value })
                                }
                            />
                            <label
                                className="absolute text-black top-1/2 translate-y-[-50%] left-4 px-2 peer-focus:-top-2 peer-focus:left-3 font-bold peer-focus:text-[12px] peer-focus:text-black peer-valid:-top-2 peer-valid:left-3 peer-valid:text-[12px] peer-valid:text-black duration-150"
                                htmlFor="email"
                            >
                                Password
                            </label>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeUpdateModal}
                                className="ml-2 bg-white text-custom-blue border border-custom-blue px-4 py-2 rounded hover:bg-custom-blue hover:text-white ease-in-out duration-300"
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

            {isDeleteModalOpen && userToDelete && (
                <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
                    <div className="text-center">
                        <h2 className='mt-7'>Are you sure you want to delete this user?</h2>
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
                                onClick={() => handleDeleteUser(userToDelete.id)}
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
    );
};

export default Users;
