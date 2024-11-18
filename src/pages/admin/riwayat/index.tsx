import Navbar from '@/pages/components/navbar';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Transaksi } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Income = {
    bulan?: number;
    tahun: number;
    total_pendapatan: string;
    total_transaksi: number;
};

const Riwayat = () => {
    const router = useRouter();
    const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
    const [incomeData, setIncomeData] = useState<Income[]>([]);
    const [filteredTransaksis, setFilteredTransaksis] = useState<Transaksi[]>([]);
    const [filterDate, setFilterDate] = useState<string>('');
    const [filterYear, setFilterYear] = useState<string>('');
    const [filterMonth, setFilterMonth] = useState<string>('');
    const [showIncome, setShowIncome] = useState(false);


    useEffect(() => {
        const fetchTransaksi = async () => {
            try {
                const token = Cookies.get('token');
                if (!token) {
                    console.error('Token tidak ditemukan');
                    return;
                }

                const apiUrl = `${API_URL}/api/transaksilaundry`;
                const response = await axios.get(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data && response.data.data) {
                    setTransaksi(response.data.data);
                    setFilteredTransaksis(response.data.data);
                } else {
                    console.error('Data transaksi kosong atau format yang tidak diharapkan');
                }
            } catch (error) {
                console.error('Error fetching transaksi:', error);
            }
        };

        fetchTransaksi();
    }, [API_URL]);

    useEffect(() => {
        const fetchIncome = async () => {
            try {
                const token = Cookies.get('token');
                if (!token) {
                    console.error('Token tidak ditemukan');
                    return;
                }

                let url = `${API_URL}/api/pendapatan`;
                if (filterYear && filterMonth) {
                    url = `${url}/perbulan?tahun=${filterYear}&bulan=${filterMonth}`;
                } else if (filterYear) {
                    url = `${url}/pertahun?tahun=${filterYear}`;
                }

                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data && response.data.data) {
                    setIncomeData(response.data.data);
                } else {
                    console.error('Data pendapatan kosong atau format yang tidak diharapkan');
                }
            } catch (error) {
                console.error('Error fetching income data:', error);
            }
        };

        fetchIncome();
    }, [filterYear, filterMonth, API_URL]);

    const toggleTable = () => setShowIncome((prevState) => !prevState);

    return (
        <div>
            <Navbar />
            <div className="ms-[100px] flex flex-wrap justify-center">
                <div className="w-full text-[30px] h-[45px] mt-[50px] ps-[40px] mb-[30px]">
                    <h1> {showIncome ? 'Income History' : 'Transaction History'}</h1>
                </div>

                <div className="w-full flex justify-between px-[78px]">
                    <div className="flex items-center">
                        {showIncome ? (
                            <>
                                <p>Filter By :</p>
                                <input
                                    type="number"
                                    placeholder="Year"
                                    value={filterYear}
                                    onChange={(e) => setFilterYear(e.target.value)}
                                    className="w-[100px] h-[45px] rounded-[5px] bg-custom-grey p-3 text-[16px] border border-black ms-2"
                                />
                                <select
                                    value={filterMonth}
                                    onChange={(e) => setFilterMonth(e.target.value)}
                                    className="w-[150px] h-[45px] rounded-[5px] bg-custom-grey p-3 text-[16px] border border-black ms-2"
                                >
                                    <option value="">All Months</option>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                        </option>
                                    ))}
                                </select>
                            </>
                        ) : (
                            <>
                                <p>Filter By :</p>
                                <input
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    className="w-[150px] h-[45px] rounded-[5px] bg-custom-grey p-3 text-[16px] border border-black ms-2"
                                />
                            </>
                        )}
                    </div>
                    <div className="flex">
                        <button
                            onClick={toggleTable}
                            className="w-[150px] h-[45px] bg-custom-blue rounded-[10px] text-[16px] text-white me-4 flex items-center justify-center gap-3 font-bold"
                        >
                            <img src="../images/swich.svg" alt="" />
                            <span>{showIncome ? 'Transaction' : 'Income'}</span>
                        </button>
                        <button
                            className="w-[150px] h-[45px] bg-custom-green rounded-[10px] text-[16px] text-white me-4 flex items-center justify-center gap-3 font-bold"
                        >
                            <img src="../images/print.svg" alt="" />
                            <span>Print</span>
                        </button>
                    </div>
                </div>

                <div className="w-full px-[78px] mt-[50px]">
                    {showIncome ? (
                        <table className="w-full border-collapse border-black border rounded-lg">
                            <thead className="bg-custom-grey">
                                <tr>
                                    <th className="border border-black p-2">Month</th>
                                    <th className="border border-black p-2">Year</th>
                                    <th className="border border-black p-2">Total Income</th>
                                    <th className="border border-black p-2">Total Transactions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incomeData.map((income, index) => (
                                    <tr key={index}>
                                        <td className="border border-black p-2">{income.bulan || '-'}</td>
                                        <td className="border border-black p-2">{income.tahun}</td>
                                        <td className="border border-black p-2">{income.total_pendapatan}</td>
                                        <td className="border border-black p-2">{income.total_transaksi}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full border-collapse border-black border rounded-lg">
                            <thead className="bg-custom-grey">
                                <tr>
                                    <th className="border border-black p-2">Customer</th>
                                    <th className="border border-black p-2">Item type</th>
                                    <th className="border border-black p-2">PCS</th>
                                    <th className="border border-black p-2">Weight</th>
                                    <th className="border border-black p-2">Color/Description</th>
                                    <th className="border border-black p-2">Brand</th>
                                    <th className="border border-black p-2">Care Instruction</th>
                                    <th className="border border-black p-2">Remarks</th>
                                    <th className="border border-black p-2">Person In Charge</th>
                                    <th className="border border-black p-2">Supply Used</th>
                                    <th className="border border-black p-2">Check By In</th>
                                    <th className="border border-black p-2">Time In</th>
                                    <th className="border border-black p-2">Check By Out</th>
                                    <th className="border border-black p-2">Time Out</th>
                                    <th className="border border-black p-2">Date</th>
                                    <th className="border border-black p-2">Status</th>
                                    <th className="border border-black p-2">Bill</th>
                                    <th className="border border-black p-2 w-[150px]">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransaksis.map((transaksi) => (
                                    <tr key={transaksi.id}>
                                        <td className="border border-black p-2">{transaksi.customer}</td>
                                        <td className="border border-black p-2">{transaksi.itemType}</td>
                                        <td className="border border-black p-2">{transaksi.pcs}</td>
                                        <td className="border border-black p-2">{transaksi.weight}</td>
                                        <td className="border border-black p-2">{transaksi.color_description}</td>
                                        <td className="border border-black p-2">{transaksi.brand}</td>
                                        <td className="border border-black p-2">{transaksi.care_instruction}</td>
                                        <td className="border border-black p-2">{transaksi.remarks}</td>
                                        <td className="border border-black p-2">{transaksi.personInCharge}</td>
                                        <td className="border border-black p-2">{transaksi.supplyUsed}</td>
                                        <td className="border border-black p-2">{transaksi.checkByIn}</td>
                                        <td className="border border-black p-2">{transaksi.timeIn}</td>
                                        <td className="border border-black p-2">{transaksi.checkByOut}</td>
                                        <td className="border border-black p-2">{transaksi.timeOut}</td>
                                        <td className="border border-black p-2">{transaksi.date}</td>
                                        <td className="border border-black p-2">{transaksi.status}</td>
                                        <td className="border border-black p-2">{transaksi.harga}</td>
                                        <td className="border p-2 flex justify-evenly">
                                            <button className="bg-blue-500 w-[30px] h-[30px] rounded-md flex justify-center items-center hover:shadow-sm hover:shadow-black">
                                                <img src="../images/update.svg" alt="edit" />
                                            </button>
                                            <button className="bg-red-500 w-[30px] h-[30px] rounded-md flex justify-center items-center hover:shadow-sm hover:shadow-black">
                                                <img src="../images/delete.svg" alt="delete" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Riwayat;
