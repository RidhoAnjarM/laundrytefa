import Navbar from '@/pages/components/navbar';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import Modal from '@/pages/components/modal';
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
    const [tahun, setTahun] = useState('2024');
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
        const matchesDate = dateFilter
            ? (transaksi.dateIn || "").startsWith(dateFilter)
            : true;
        const matchesStatus = statusFilter ? transaksi.status === statusFilter : true;
        return matchesSearch && matchesDate && matchesStatus;
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
            <div className="ms-[100px] flex flex-wrap justify-center">
                <div className="w-full text-[30px] h-[45px] mt-[50px] ps-[40px] mb-[30px]">
                    <h1>{title}</h1>
                </div>
                <div className="w-full flex justify-between px-[78px]" id='filterriwayat'>
                    {showTransaksi && (
                        <div className="w-full flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    className="w-[230px] h-[45px] rounded-[5px] ps-[32px] text-[16px] border border-black rounded-e-none"
                                    placeholder="Search by Name"
                                    value={search}
                                    onChange={handleSearchChange}
                                />
                                <input
                                    type="date"
                                    className="w-[120px] h-[45px] rounded-[5px] p-2 text-[14px] border border-black border-s-0 rounded-s-none"
                                    value={dateFilter}
                                    onChange={handleDateChange}
                                />
                            </div>
                            <div className="font-bold border border-custom-blue w-[120px] h-[45px] flex items-center justify-center rounded-s-[5px]">
                                <p>To Income</p>
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
                                        className="p-2 border border-black rounded-[5px] h-[45px] rounded-e-none"
                                    >
                                        <option value="perhari">Per Day</option>
                                        <option value="perbulan">Per Month</option>
                                        <option value="pertahun">Per Year</option>
                                    </select>
                                </div>

                                {filterMode === "perbulan" && (
                                    <div>
                                        <select
                                            value={tahun}
                                            onChange={(e) => setTahun(e.target.value)}
                                            className="p-2 border border-black rounded-[5px] h-[45px] rounded-s-none border-s-0"
                                        >
                                            <option value="2030">2030</option>
                                            <option value="2029">2029</option>
                                            <option value="2028">2028</option>
                                            <option value="2027">2027</option>
                                            <option value="2026">2026</option>
                                            <option value="2025">2025</option>
                                            <option value="2024">2024</option>
                                            <option value="2023">2023</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="font-bold border border-custom-blue w-[120px] h-[45px] flex items-center justify-center rounded-s-[5px]">
                                <p>To Transaction</p>
                            </div>
                        </div>
                    )}


                    <div className="flex items-center justify-center">
                        <button
                            onClick={handleSwitchTable}
                            className='w-[50px] h-[45px] rounded-[5px] flex items-center justify-center me-[20px] bg-custom-blue rounded-s-none border border-custom-blue'>
                            <img src="../images/swich.svg" alt="" />
                        </button>
                    </div>
                </div>

                {showTransaksi ? (
                    <div className="w-full px-[78px] mt-[50px] mb-[50px]">
                        <table className="w-full border-collapse border-black border rounded-lg" id='tabel-riwayat'>
                            <thead className="bg-custom-grey">
                                <tr className='text-[14px]'>
                                    <th className="border border-black p-1">Customer</th>
                                    <th className="border border-black p-1 w-[100px]">Phone Number</th>
                                    <th className="border border-black p-1 w-[100px]">Item type</th>
                                    <th className="border border-black p-1">PCS</th>
                                    <th className="border border-black p-1">Weight</th>
                                    <th className="border border-black p-1">Bill</th>
                                    <th className="border border-black p-1">DateIn</th>
                                    <th className="border border-black p-1">Time In</th>
                                    <th className="border border-black p-1">DateOut</th>
                                    <th className="border border-black p-1">Time Out</th>
                                    <th className="border border-black p-1">CheckIn by</th>
                                    <th className="border border-black p-1">CheckOut by</th>
                                    <th className="border border-black p-1">Status</th>
                                    <th className="border border-black p-1 ">Action</th>
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
                                ) : filteredTransaksis.length === 0 ? (
                                    <tr>
                                        <td colSpan={15} className="border border-black p-1 text-center">No data found</td>
                                    </tr>
                                ) : (
                                    [...filteredTransaksis]
                                        .sort((a, b) => b.id - a.id)
                                        .map((transaksi) => (
                                            <tr key={transaksi.id} className='text-[13px]'>
                                                <td className="border border-black p-1">{transaksi.customer}</td>
                                                <td className="border border-black p-1">{transaksi.noTelepon}</td>
                                                <td className="border border-black p-1">{transaksi.itemType}</td>
                                                <td className="border border-black p-1">{transaksi.pcs}</td>
                                                <td className="border border-black p-1">{transaksi.weight}</td>
                                                <td className="border border-black p-1">Rp {Number(transaksi.harga).toLocaleString("id-ID")}</td>
                                                <td className="border border-black p-1">{transaksi.dateIn}</td>
                                                <td className="border border-black p-1">{transaksi.timeIn}</td>
                                                <td className="border border-black p-1">{transaksi.dateOut}</td>
                                                <td className="border border-black p-1">{transaksi.timeOut || '-'}</td>
                                                <td className="border border-black p-1">{transaksi.checkByIn}</td>
                                                <td className="border border-black p-1">{transaksi.checkByOut || '-'}</td>
                                                <td className="border border-black p-1">{transaksi.status}</td>
                                                <td className="border border-black p-1">
                                                    <div className="flex justify-evenly items-center w-full">
                                                        <button
                                                            onClick={() => handleViewModalOpen(transaksi)}
                                                            className="bg-custom-blue w-[30px] h-[30px] rounded-md flex justify-center items-center hover:shadow-sm hover:shadow-black"
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
                    <div className="w-full px-[78px] mt-[50px] mb-[50px]">
                        <table className="w-full border-collapse border-black border rounded-lg" id='tabel-pendapatan'>
                            <thead className="bg-custom-grey">
                                <tr>
                                    {filterMode === 'perhari' && (
                                        <>
                                            <th className="border border-black p-2">Date</th>
                                            <th className="border border-black p-2">Total Income</th>
                                            <th className="border border-black p-2">Total Transactions</th>
                                        </>
                                    )}
                                    {filterMode === 'perbulan' && (
                                        <>
                                            <th className="border border-black p-2">Month</th>
                                            <th className="border border-black p-2">Total Income</th>
                                            <th className="border border-black p-2">Total Transactions</th>
                                        </>
                                    )}
                                    {filterMode === 'pertahun' && (
                                        <>
                                            <th className="border border-black p-2">Year</th>
                                            <th className="border border-black p-2">Total Income</th>
                                            <th className="border border-black p-2">Total Transactions</th>
                                        </>
                                    )}
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
                                ) : noData ? (
                                    <tr>
                                        <td colSpan={3} className="border border-black p-2 text-center">
                                            No data found
                                        </td>
                                    </tr>
                                ) : (
                                    pendapatan.map((item, index) => {
                                        if (filterMode === 'perhari' && 'tanggal' in item) {
                                            return (
                                                <tr key={index}>
                                                    <td className="border border-black p-2">{item.tanggal}</td>
                                                    <td className="border border-black p-2">
                                                        Rp {parseInt(item.total_pendapatan).toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="border border-black p-2">{item.total_transaksi}</td>
                                                </tr>
                                            );
                                        }

                                        if (filterMode === 'perbulan' && 'bulan' in item) {
                                            return (
                                                <tr key={index}>
                                                    <td className="border border-black p-2">{item.bulan}</td>
                                                    <td className="border border-black p-2">
                                                        Rp {parseInt(item.total_pendapatan).toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="border border-black p-2">{item.total_transaksi}</td>
                                                </tr>
                                            );
                                        }

                                        if (filterMode === 'pertahun' && 'tahun' in item) {
                                            return (
                                                <tr key={index}>
                                                    <td className="border border-black p-2">{item.tahun}</td>
                                                    <td className="border border-black p-2">
                                                        Rp {parseInt(item.total_pendapatan).toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="border border-black p-2">{item.total_transaksi}</td>
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
                <div className="p-4 ">
                    <h2 className="text-2xl font-bold mb-4 text-custom-blue text-center">Transaction Details</h2>
                    {viewTransaksi && (
                        <div>
                            <p><strong>Customer:</strong> {viewTransaksi.customer}</p>
                            <p><strong>Phone Number:</strong> {viewTransaksi.noTelepon}</p>
                            <p><strong>Item Type:</strong> {viewTransaksi.itemType}</p>
                            <p><strong>PCS:</strong> {viewTransaksi.pcs}</p>
                            <p><strong>Weight:</strong> {viewTransaksi.weight}</p>
                            <p><strong>Brand:</strong> {viewTransaksi.brand}</p>
                            <p><strong>Color/Description:</strong> {viewTransaksi.color_description}</p>
                            <p><strong>Remarks:</strong> {viewTransaksi.remarks}</p>
                            <span>
                                <p className='absolute'><strong>Supply Used:</strong></p>
                                {viewTransaksi.supplyUsed && Array.isArray(viewTransaksi.supplyUsed) && viewTransaksi.supplyUsed.length > 0 ? (
                                    viewTransaksi.supplyUsed.map((bahan, index) => (
                                        <div key={index} className='ms-[110px]'>
                                            <p>- {bahan.namaBahan}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className='ms-[110px]'>No bahan</p>
                                )}</span>
                            <p><strong>Bill:</strong> Rp {Number(viewTransaksi.harga).toLocaleString("id-ID")}</p>
                            <p><strong>Service:</strong> {viewTransaksi.service || '-'}</p>
                            <p><strong>Date In:</strong> {viewTransaksi.dateIn || '-'}</p>
                            <p><strong>Time In:</strong> {viewTransaksi.timeIn || '-'}</p>
                            <p><strong>CheckIn by:</strong> {viewTransaksi.checkByIn || '-'}</p>
                            <p><strong>Date Out:</strong> {viewTransaksi.dateOut || '-'}</p>
                            <p><strong>Time Out:</strong> {viewTransaksi.timeOut || '-'}</p>
                            <p><strong>CheckOut by:</strong> {viewTransaksi.checkByOut || '-'}</p>
                            <p><strong>Person In Charge:</strong> {viewTransaksi.personInCharge || '-'}</p>
                            <p><strong>DateOut Actual:</strong> {viewTransaksi.dateOutAktual || '-'}</p>
                            <p><strong>TimeOut Actual:</strong> {viewTransaksi.timeOutAktual || '-'}</p>
                            <p><strong>Status:</strong> {viewTransaksi.status || '-'}</p>
                        </div>
                    )}
                    <div className="mt-4 flex justify-center gap-7">
                        <button
                            onClick={handleViewModalClose}
                            className="w-[90px] h-[40px] bg-white text-custom-blue border-2 border-custom-blue hover:bg-custom-blue hover:text-white ease-in-out duration-300 flex items-center justify-center rounded-[5px]"
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