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
        <div className="min-h-screen bg-gray-100">
            <NavbarKasir />
            <div className="ms-[240px] flex flex-wrap justify-center">
                <div className="w-full text-center font-ruda text-[20px] font-black mt-[40px] mb-[30px]">
                    <h1>Manage Supply Used</h1>
                </div>

                <div className="w-full ps-[20px]">
                    <input
                        type="text"
                        className="w-[300px] h-[50px] bg-white rounded-[10px] text-[16px] border border-black font-ruda font-semibold px-[32px]"
                        placeholder="search . . ."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="w-full mt-[30px] mb-[50px] pe-[40px] ps-[20px]">
                    <table className="min-w-full bg-white border border-custom-gray-2 font-sans rounded-lg overflow-hidden">
                        <thead className="bg-custom-gray-1">
                            <tr>
                                <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Supply</th>
                                <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Stock</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-custom-gray-2'>
                            {loading ? (
                                <tr>
                                    <td colSpan={2} className="border border-black p-1 text-center">
                                        <div className="flex justify-center items-center">
                                            <div className="w-10 h-10 border-4 border-t-custom-green border-gray-300 rounded-full animate-spin"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredBahan.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className="border border-black p-1 text-center">No data found</td>
                                </tr>
                            ) : (
                                filteredBahan.map(bahan => (
                                    <tr key={bahan.id}>
                                        <td className="px-4 py-3 text-[15px] text-gray-700">{bahan.namaBahan}</td>
                                        <td className="px-4 py-3 text-[15px] text-gray-700">{bahan.stokAkhir}</td>
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