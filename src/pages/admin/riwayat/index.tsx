import Navbar from '@/components/navbar';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import Modal from '@/components/modal';
import { Transaksi, PendapatanPerHari, PendapatanPerBulan, PendapatanPerTahun } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Riwayat = () => {
    const router = useRouter();
    const [showTransaksi, setShowTransaksi] = useState(true);
    const [transaksis, setTransaksis] = useState<Transaksi[]>([]);
    const [pendapatan, setPendapatan] = useState<PendapatanPerHari[] | PendapatanPerBulan[] | PendapatanPerTahun[]>([]);
    const [search, setSearch] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [showModalView, setShowModalView] = useState(false);
    const [viewTransaksi, setViewTransaksi] = useState<Transaksi | null>(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [filterMode, setFilterMode] = useState('perhari');
    const [tahun, setTahun] = useState('2025');
    const [bulan, setBulan] = useState('');
    const [noData, setNoData] = useState(false);
    const [title, setTitle] = useState("Transaction History");
    const [loading, setLoading] = useState<boolean>(true);


    useEffect(() => {
        if (showTransaksi) {
            setTitle("Transaction History");
        } else {
            setTitle("Income History");
        }
    }, [showTransaksi]);


    useEffect(() => {
        const fetchTransaksi = async () => {
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

                const apiUrl = `${API_URL}/api/transaksilaundry`;
                const response = await axios.get(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                });

                if (response.data && response.data.data) {
                    setTransaksis(response.data.data);
                } else {
                    console.error('The data is empty or in an unexpected format');
                }
            } catch (error) {
                console.error('Error fetching transaksi:', error);
            } finally {
                setLoading(false);
            }
        };


        fetchTransaksi();
    }, [API_URL]);

    useEffect(() => {
        const fetchPendapatan = async () => {
            setLoading(true);
            try {
                const token = Cookies.get('token');
                const headers = { Authorization: `Bearer ${token}` };
                let response;

                switch (filterMode) {
                    case 'perhari':
                        response = await axios.get<{ data: PendapatanPerHari[] }>(
                            `${API_URL}/api/pendapatan/perhari`,
                            { headers, params: { bulan }, withCredentials: true }
                        );
                        break;
                    case 'perbulan':
                        response = await axios.get<{ data: PendapatanPerBulan[] }>(
                            `${API_URL}/api/pendapatan/perbulan`,
                            { headers, params: { tahun }, withCredentials: true }
                        );
                        break;
                    case 'pertahun':
                        response = await axios.get<{ data: PendapatanPerTahun[] }>(
                            `${API_URL}/api/pendapatan/pertahun`,
                            { headers, withCredentials: true }
                        );
                        break;
                    default:
                        return;
                }

                if (response.data && response.data.data) {
                    setPendapatan(response.data.data);
                    setNoData(response.data.data.length === 0);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setNoData(true);
            } finally {
                setLoading(false);
            }
        };


        fetchPendapatan();
    }, [filterMode, tahun, bulan]);

    const handleSwitchTable = () => {
        setShowTransaksi((prev) => !prev);
    };

    const filteredTransaksis = transaksis.filter((transaksi) => {
        const matchesSearch = transaksi.customer.toLowerCase().includes(search.toLowerCase());
        const matchesDate = dateFilter ? (transaksi.dateIn || "").startsWith(dateFilter) : true;
        const matchesStatus = statusFilter ? transaksi.status === statusFilter : true;
        const today = new Date().toISOString().split('T')[0];
        const transaksiDate = transaksi.dateIn.split('T')[0];

        return matchesSearch && matchesDate && matchesStatus && transaksiDate === today;
    });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateFilter(e.target.value);
    };

    const handleViewModalOpen = (transaksi: Transaksi) => {
        setViewTransaksi(transaksi);
        setShowModalView(true);
    };

    const handleViewModalClose = () => {
        setShowModalView(false);
        setViewTransaksi(null);
    };

    return (
        <div>
            <Navbar />
            <div className="ms-[240px] flex flex-wrap justify-center">
                <div className="w-full text-center font-ruda text-[20px] font-black mt-[40px] mb-[30px]">
                    <h1>{title}</h1>
                </div>
                <div className="w-full flex justify-between pe-[20px]" id='filterriwayat'>
                    {showTransaksi && (
                        <div className="w-full flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    className="w-[300px] h-[50px] bg-white rounded-[10px] text-[16px] border border-black font-ruda font-semibold px-[32px]"
                                    placeholder="search . . ."
                                    value={search}
                                    onChange={handleSearchChange}
                                />
                                <input
                                    type="date"
                                    className="w-[150px] h-[50px] bg-white rounded-[10px] text-[14px] border border-black ms-[23px] px-3 font-ruda font-semibold"
                                    value={dateFilter}
                                    onChange={handleDateChange}
                                />
                            </div>
                            <div className="flex items-center justify-center">
                                <button
                                    onClick={handleSwitchTable}
                                    className='w-[150px] h-[50px] rounded-[10px] flex items-center justify-center bg-custom-blue hover:bg-blue-600 transition-colors'>
                                    <div className="text-white font-extrabold font-ruda text-[15px]">
                                        <p>To income</p>
                                        <img src="../images/swich.svg" alt="" className='w-[20px] mx-auto' />
                                    </div>
                                </button>
                            </div>
                        </div>

                    )}

                    {!showTransaksi && (
                        <div className="w-full flex justify-between items-center">
                            <div className="flex items-center justify-center">
                                <div>
                                    <select
                                        value={filterMode}
                                        onChange={(e) => setFilterMode(e.target.value)}
                                        className="w-[150px] h-[50px] bg-white rounded-[10px] text-[16px] border border-black px-3 font-ruda font-semibold"
                                    >
                                        <option value="perhari">PerDay</option>
                                        <option value="perbulan">PerMonth</option>
                                        <option value="pertahun">PerYear</option>
                                    </select>
                                </div>

                                {filterMode === "perbulan" && (
                                    <div>
                                        <select
                                            value={tahun}
                                            onChange={(e) => setTahun(e.target.value)}
                                            className="w-[100px] h-[50px] bg-white rounded-[10px] text-[16px] border border-black ms-[23px] px-3 font-ruda font-semibold"
                                        >
                                            <option value="2030">2030</option>
                                            <option value="2029">2029</option>
                                            <option value="2028">2028</option>
                                            <option value="2027">2027</option>
                                            <option value="2026">2026</option>
                                            <option value="2025">2025</option>
                                            <option value="2024">2024</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center justify-center">
                                <button
                                    onClick={handleSwitchTable}
                                    className='w-[150px] h-[50px] rounded-[10px] flex items-center justify-center bg-custom-blue hover:bg-blue-600 transition-colors'>
                                    <div className="text-white font-extrabold font-ruda text-[15px]">
                                        <p>To transaction</p>
                                        <img src="../images/swich.svg" alt="" className='w-[20px] mx-auto' />
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {showTransaksi ? (
                    <div className="w-full mt-[30px] mb-[50px] pe-[20px]">
                        <table className="min-w-full bg-white border border-custom-gray-2 font-sans rounded-lg overflow-hidden" id='tabel-riwayat'>
                            <thead className="bg-custom-gray-1">
                                <tr className='text-[14px]'>
                                    <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">DateIn</th>
                                    <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Customer</th>
                                    <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Phone Number</th>
                                    <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Item type</th>
                                    <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">PCS</th>
                                    <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Weight</th>
                                    <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Bill</th>
                                    <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">DateOut</th>
                                    <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">CheckIn by</th>
                                    <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">CheckOut by</th>
                                    <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-custom-gray-2'>
                                {loading ? (
                                    <tr>
                                        <td colSpan={15} className="border border-black p-1 text-center">
                                            <div className="flex justify-center items-center">
                                                <div className="w-10 h-10 border-4 border-t-custom-green border-gray-300 rounded-full animate-spin"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredTransaksis.length === 0 ? (
                                    <tr>
                                        <td colSpan={15} className="border border-black p-1 text-center">No data found</td>
                                    </tr>
                                ) : (
                                    [...filteredTransaksis]
                                        .sort((a, b) => b.id - a.id)
                                        .map((transaksi) => (
                                            <tr key={transaksi.id} className='hover:bg-gray-50'>
                                                <td className="px-4 py-3 text-[13px] text-gray-700">{transaksi.dateIn}</td>
                                                <td className="px-4 py-3 text-[13px] text-gray-700">{transaksi.customer}</td>
                                                <td className="px-4 py-3 text-[13px] text-gray-700">{transaksi.noTelepon}</td>
                                                <td className="px-4 py-3 text-[13px] text-gray-700">{transaksi.itemType}</td>
                                                <td className="px-4 py-3 text-[13px] text-gray-700">{transaksi.pcs}</td>
                                                <td className="px-4 py-3 text-[13px] text-gray-700">{transaksi.weight}</td>
                                                <td className="px-4 py-3 text-[13px] text-gray-700">Rp {Number(transaksi.harga).toLocaleString("id-ID")}</td>
                                                <td className="px-4 py-3 text-[13px] text-gray-700">{transaksi.dateOut}</td>
                                                <td className="px-4 py-3 text-[13px] text-gray-700">{transaksi.checkByIn}</td>
                                                <td className="px-4 py-3 text-[13px] text-gray-700">{transaksi.checkByOut || '-'}</td>
                                                <td className="px-4 py-3 text-[13px] text-gray-700">{transaksi.status}</td>
                                                <td className="px-4 py-3 text-[13px] text-gray-700">
                                                    <div className="flex justify-evenly items-center w-full">
                                                        <button
                                                            onClick={() => handleViewModalOpen(transaksi)}
                                                            className="bg-green-500 text-white w-[40px] h-[40px] justify-center rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center text-sm"
                                                        >
                                                            <img src="../images/view copy.svg" alt="" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="w-full mt-[30px] mb-[50px] pe-[20px]">
                        <table className="min-w-full bg-white border border-custom-gray-2 font-sans rounded-lg overflow-hidden" id='tabel-pendapatan'>
                            <thead className="bg-custom-grey">
                                <tr>
                                    {filterMode === 'perhari' && (
                                        <>
                                            <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Date</th>
                                            <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Total Income</th>
                                            <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Total Transactions</th>
                                        </>
                                    )}
                                    {filterMode === 'perbulan' && (
                                        <>
                                            <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Month</th>
                                            <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Total Income</th>
                                            <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Total Transactions</th>
                                        </>
                                    )}
                                    {filterMode === 'pertahun' && (
                                        <>
                                            <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Year</th>
                                            <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Total Income</th>
                                            <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Total Transactions</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-custom-gray-2'>
                                {loading ? (
                                    <tr>
                                        <td colSpan={3} className="border border-black p-1 text-center">
                                            <div className="flex justify-center items-center">
                                                <div className="w-10 h-10 border-4 border-t-custom-green border-gray-300 rounded-full animate-spin"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : noData ? (
                                    <tr>
                                        <td colSpan={3} className="border border-black p-1 text-center">
                                            No data found
                                        </td>
                                    </tr>
                                ) : (
                                    [...pendapatan]
                                        .sort((a, b) => {
                                            if (filterMode === 'perhari') {
                                                if ('tanggal' in a && 'tanggal' in b) {
                                                    return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
                                                }
                                            }
                                            if (filterMode === 'perbulan') {
                                                if ('bulan' in a && 'bulan' in b) {
                                                    return b.bulan - a.bulan;
                                                }
                                            }
                                            if (filterMode === 'pertahun') {
                                                if ('tahun' in a && 'tahun' in b) {
                                                    return b.tahun - a.tahun;
                                                }
                                            }
                                            return 0;
                                        })
                                        .map((item, index) => {
                                            if ('tanggal' in item && filterMode === 'perhari') {
                                                return (
                                                    <tr key={index} className='hover:bg-gray-50'>
                                                        <td className="px-4 py-3 text-[15px] text-gray-700">{item.tanggal}</td>
                                                        <td className="px-4 py-3 text-[15px] text-gray-700">
                                                            Rp {parseInt(item.total_pendapatan).toLocaleString('id-ID')}
                                                        </td>
                                                        <td className="px-4 py-3 text-[15px] text-gray-700">{item.total_transaksi}</td>
                                                    </tr>
                                                );
                                            }

                                            if ('bulan' in item && filterMode === 'perbulan') {
                                                return (
                                                    <tr key={index} className='hover:bg-gray-50'>
                                                        <td className="px-4 py-3 text-[15px] text-gray-700">{item.bulan}</td>
                                                        <td className="px-4 py-3 text-[15px] text-gray-700">
                                                            Rp {parseInt(item.total_pendapatan).toLocaleString('id-ID')}
                                                        </td>
                                                        <td className="px-4 py-3 text-[15px] text-gray-700">{item.total_transaksi}</td>
                                                    </tr>
                                                );
                                            }

                                            if ('tahun' in item && filterMode === 'pertahun') {
                                                return (
                                                    <tr key={index} className='hover:bg-gray-50'>
                                                        <td className="px-4 py-3 text-[15px] text-gray-700">{item.tahun}</td>
                                                        <td className="px-4 py-3 text-[15px] text-gray-700">
                                                            Rp {parseInt(item.total_pendapatan).toLocaleString('id-ID')}
                                                        </td>
                                                        <td className="px-4 py-3 text-[15px] text-gray-700">{item.total_transaksi}</td>
                                                    </tr>
                                                );
                                            }

                                            return null;
                                        })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal isOpen={showModalView} onClose={handleViewModalClose}>
                <div className="py-3 ps-3 pe-1">
                    <h2 className="text-2xl font-bold mb-4 text-center text-custom-blue">Transaction Receipt</h2>
                    {viewTransaksi && (
                        <div className="overflow-y-auto max-h-[500px] pe-2">
                            <div className="border-b pb-2">
                                <div className="flex justify-between">
                                    <span className="font-semibold">Date In:</span>
                                    <span>{viewTransaksi.dateIn || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold">Time In:</span>
                                    <span>{viewTransaksi.timeIn || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold">Date Out:</span>
                                    <span>{viewTransaksi.dateOutAktual || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold">Time Out:</span>
                                    <span>{viewTransaksi.timeOutAktual || '-'}</span>
                                </div>
                            </div>
                            <div className="border-b pb-2">
                                <div className="flex justify-between">
                                    <span className="font-semibold">Customer:</span>
                                    <span>{viewTransaksi.customer}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold">Phone Number:</span>
                                    <span>{viewTransaksi.noTelepon}</span>
                                </div>
                            </div>
                            <div className="border-b pb-2">
                                <div className="flex justify-between">
                                    <span className="font-semibold">Item Type:</span>
                                    <span>{viewTransaksi.itemType}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold">PCS:</span>
                                    <span>{viewTransaksi.pcs}</span>
                                </div>
                            </div>
                            <div className="border-b pb-2">
                                <div className="flex justify-between">
                                    <span className="font-semibold">Weight:</span>
                                    <span>{viewTransaksi.weight}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold">Brand:</span>
                                    <span>{viewTransaksi.brand}</span>
                                </div>
                            </div>
                            <div className="border-b pb-2">
                                <div className="flex justify-between">
                                    <span className="font-semibold">Color/Description:</span>
                                    <span>{viewTransaksi.color_description}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold">Remarks:</span>
                                    <span>{viewTransaksi.remarks}</span>
                                </div>
                            </div>
                            <div className="border-b pb-2">
                                <span className="font-semibold">Supply Used:</span>
                                {viewTransaksi.supplyUsed && Array.isArray(viewTransaksi.supplyUsed) && viewTransaksi.supplyUsed.length > 0 ? (
                                    <ul className='list-disc list-inside ml-5'>
                                        {viewTransaksi.supplyUsed.map((bahan, index) => (
                                            <li key={index}>{bahan.namaBahan}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No bahan</p>
                                )}
                            </div>
                            <div className="border-b pb-2">
                                <div className="flex justify-between">
                                    <span className="font-semibold">Service:</span>
                                    <span>{viewTransaksi.service || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold">Bill:</span>
                                    <span>Rp {Number(viewTransaksi.harga).toLocaleString("id-ID")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold">Total:</span>
                                    <span>Rp {Number(viewTransaksi.subTotal).toLocaleString("id-ID")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold">Remainder:</span>
                                    <span>Rp {Number(viewTransaksi.sisa).toLocaleString("id-ID")}</span>
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Person In Charge:</span>
                                <span>{viewTransaksi.personInCharge || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Check In by:</span>
                                <span>{viewTransaksi.checkByIn || '-'}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-semibold">Check Out by:</span>
                                <span>{viewTransaksi.checkByOut || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Date Out Estimated:</span>
                                <span>{viewTransaksi.dateOut || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Time Out Estimated:</span>
                                <span>{viewTransaksi.timeOut || '-'}</span>
                            </div>
                        </div>
                    )}
                    <div className="mt-2 flex justify-center">
                        <button
                            onClick={() => {
                                setViewTransaksi(null);
                                handleViewModalClose();
                            }}
                            className="w-[90px] h-[40px] bg-custom-blue text-white rounded-md hover:bg-blue-600 transition duration-300"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Riwayat;