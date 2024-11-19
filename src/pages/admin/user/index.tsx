import Navbar from '@/pages/components/navbar';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { User } from '@/types';
import Cookies from 'js-cookie';
import Modal from '@/pages/components/modal';


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

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const apiUrl = `${API_URL}/api/users`;
                const response = await axios.get(apiUrl);
                console.log('API Response:', response.data);
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, [API_URL]);

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(search.toLowerCase())
    );

    const openUpdateModal = (user: User) => {
        setSelectedUser(user);
        setIsUpdateModalOpen(true);
    };

    const closeUpdateModal = () => {
        setIsUpdateModalOpen(false);
        setSelectedUser(null);
    };

    const handleUpdateUser = async (updatedUser: Partial<User>) => {
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
            });

            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));

            showNotification('User deleted successfully!');
        } catch (error) {
            console.error('Error deleting user:', error);
            showNotification('Failed to delete user.');
        } finally {
            closeDeleteModal();
        }
    };



    return (
        <div>
            <Navbar />
            <div className="ms-[100px] flex flex-wrap justify-center">

                <div className="w-full text-[30px] h-[45px] mt-[50px] ps-[40px] mb-[30px]">
                    <h1>User</h1>
                </div>

                <div className="w-full flex justify-between px-[78px]">
                    <div className="">
                        <input
                            type="text"
                            className='w-[230px] h-[45px] rounded-[5px]  ps-[32px] text-[16px] border border-black me-[30px]'
                            placeholder='Search...'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="">
                        <button
                            type='submit'
                            onClick={() => router.push('/admin/user/usercreate')}
                            className='w-[100px] h-[45px] bg-custom-green rounded-[5px] text-[18px] text-white font-bold hover:bg-white hover:border hover:border-custom-green hover:text-custom-green ease-in-out duration-300'
                        >
                            + user
                        </button>
                    </div>
                </div>

                <div className="w-full px-[78px] mt-[50px]">
                    <table className='w-full border-collapse border-black border rounded-lg'>
                        <thead className='bg-custom-grey'>
                            <tr>
                                <th className='border border-black p-2'>Username</th>
                                <th className='border border-black p-2'>Email</th>
                                <th className='border border-black p-2'>Password</th>
                                <th className='border border-black p-2'>Phone Number</th>
                                <th className='border border-black p-2'>Role</th>
                                <th className='border border-black p-2 w-[100px]'>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                        {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="border border-black p-2 text-center">No data found</td>
                                </tr>
                            ) : (
                            filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td className='border border-black p-2'>{user.username}</td>
                                    <td className='border border-black p-2'>{user.email}</td>
                                    <td className='border border-black p-2'>{'**********'}</td> 
                                    <td className='border border-black p-2'>{user.no_hp}</td>
                                    <td className='border border-black p-2'>{user.role}</td>
                                    <td className='border border-black p-2'>
                                        <div className="w-full flex justify-evenly">
                                            <button
                                                onClick={() => openUpdateModal(user)}
                                                className='bg-blue-500 w-[30px] h-[30px] rounded-md flex justify-center items-center hover:shadow-sm hover:shadow-black'>
                                                <img src="/images/update.svg" alt="Update" />
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
                    <div>
                        <h2>Update User</h2>
                        <input
                            type="text"
                            className="w-full mb-4 p-2 border rounded"
                            value={selectedUser.username || ''}
                            onChange={(e) =>
                                setSelectedUser({ ...selectedUser, username: e.target.value })
                            }
                            placeholder="Username"
                        />
                        <input
                            type="email"
                            className="w-full mb-4 p-2 border rounded"
                            value={selectedUser.email || ''}
                            onChange={(e) =>
                                setSelectedUser({ ...selectedUser, email: e.target.value })
                            }
                            placeholder="Email"
                        />
                        <input
                            type="text"
                            className="w-full mb-4 p-2 border rounded"
                            value={selectedUser.no_hp || ''}
                            onChange={(e) =>
                                setSelectedUser({ ...selectedUser, no_hp: e.target.value })
                            }
                            placeholder="Phone Number"
                        />
                        <input
                            type="password"
                            className="w-full mb-4 p-2 border rounded"
                            value={selectedUser.password || ''}
                            onChange={(e) =>
                                setSelectedUser({ ...selectedUser, password: e.target.value })
                            }
                            placeholder="Password"
                        />

                        <div className="mb-4">
                            <label className="block mb-2" htmlFor="role">Role</label>
                            <select
                                id="role"
                                className="w-full p-2 border rounded"
                                value={selectedUser.role || ''}
                                onChange={(e) =>
                                    setSelectedUser({ ...selectedUser, role: e.target.value })
                                }
                            >
                                <option value="admin">Admin</option>
                                <option value="kasir">Kasir</option>
                            </select>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() =>
                                    handleUpdateUser({
                                        username: selectedUser.username,
                                        email: selectedUser.email,
                                        no_hp: selectedUser.no_hp,
                                        role: selectedUser.role,
                                    })
                                }
                                className="bg-custom-green text-white px-4 py-2 rounded"
                            >
                                Update
                            </button>
                            <button
                                onClick={closeUpdateModal}
                                className="ml-2 bg-gray-400 text-white px-4 py-2 rounded"
                            >
                                Cancel
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
                        <h2>Berhasil !</h2>
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
                        <h2>Are you sure you want to delete this user?</h2>
                        <p className="mb-4">
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-center">
                            <button
                                onClick={() => handleDeleteUser(userToDelete.id)}
                                className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                            >
                                Delete
                            </button>
                            <button
                                onClick={closeDeleteModal}
                                className="bg-gray-400 text-white px-4 py-2 rounded"
                            >
                                Cancel
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
                        <h2>Success!</h2>
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

        </div>
    );
};

export default Users;
