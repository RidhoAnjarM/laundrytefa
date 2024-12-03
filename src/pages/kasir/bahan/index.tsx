import NavbarKasir from '@/components/navbarkasir';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bahan } from '@/types';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Supply = () => {
    const [bahans, setBahan] = useState<Bahan[]>([]);
    const [search, setSearch] = useState('');
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
                    console.error('Token not found');
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

    const filteredBahan = bahans.filter((bahan) =>
        (bahan.namaBahan ?? "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <NavbarKasir />
            <div className="ms-[100px] flex flex-wrap justify-center">
                <div className="w-full text-[30px] h-[45px] mt-[50px] ps-[40px] mb-[30px]">
                    <h1>Manage Supply Used</h1>
                </div>

                <div className="w-full flex justify-start px-[78px]">
                    <div className="flex">
                        <input
                            type="text"
                            className='w-[230px] h-[45px] rounded-[5px]  ps-[32px] text-[16px] border border-black'
                            placeholder='Search. . .'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="w-full px-[78px] mt-[50px] mb-[50px]">
                    <table className=' border-collapse border-black border rounded-lg w-[600px]' id='tabel-bahan-kasir'>
                        <thead className='bg-custom-grey'>
                            <tr className='text-[14px]'>
                                <th className='border border-black p-1'>Supply</th>
                                <th className='border border-black p-1'>Stok</th>
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
                                        <td className="border border-black p-1">{bahan.namaBahan}</td>
                                        <td className="border border-black p-1">{bahan.stokAkhir}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Supply