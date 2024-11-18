import Navbar from '@/pages/components/navbar';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { User } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Users = () => {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState('');

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
                            className='w-[250px] h-[45px] rounded-full bg-custom-grey ps-[32px] text-[16px] border border-black focus:border-custom-green'
                            placeholder='Search...'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)} 
                        />
                    </div>
                    <div className="">
                        <button
                            type='submit'
                            onClick={() => router.push('/admin/user/usercreate')}
                            className='w-[150px] h-[45px] bg-custom-green rounded-[10px] text-[18px] text-white font-bold hover:bg-white hover:border hover:border-custom-green hover:text-custom-green ease-in-out duration-300'
                        >
                            New User
                        </button>
                    </div>
                </div>

                <div className="w-full px-[78px] mt-[50px]">
                    <table className='w-full border-collapse border-black border rounded-lg'>
                        <thead className='bg-custom-grey'>
                            <tr>
                                <th className='border border-black p-2'>Username</th>
                                <th className='border border-black p-2'>Email</th>
                                <th className='border border-black p-2'>Phone Number</th>
                                <th className='border border-black p-2'>Role</th>
                                <th className='border border-black p-2 w-[100px]'>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td className='border border-black p-2'>{user.username}</td>
                                    <td className='border border-black p-2'>{user.email}</td>
                                    <td className='border border-black p-2'>{user.no_hp}</td>
                                    <td className='border border-black p-2'>{user.role}</td>
                                    <td className='border border-black p-2'>
                                        <div className="w-full flex justify-evenly">
                                            {/* button edit */}
                                            <button
                                                onClick={() => router.push(`/admin/user/userupdate/${user.id}`)}
                                                className='bg-blue-500 w-[30px] h-[30px] rounded-md flex justify-center items-center hover:shadow-sm hover:shadow-black'>
                                                <img src="/images/update.svg" alt="Update" />
                                            </button>
                                            {/* button hapus */}
                                            <button
                                                className='bg-red-500 w-[30px] h-[30px] rounded-md flex justify-center items-center hover:shadow-sm hover:shadow-black'>
                                                <img src="/images/delete.svg" alt="Delete" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Users;
