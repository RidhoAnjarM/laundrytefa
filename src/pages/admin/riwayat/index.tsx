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
    const [showTransaksi, setShowTransaksi] = useState(true); // State untuk kontrol tampilan
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
    const [title, setTitle] = useState("Riwayat");

    useEffect(() => {
        if (showTransaksi) {
            setTitle("Riwayat Transaksi");
        } else {
            setTitle("Riwayat Pendapatan");
        }
    }, [showTransaksi]);


    useEffect(() => {
        const fetchTransaksi = async () => {
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

                const apiUrl = `${API_URL}/api/transaksilaundry`;
                const response = await axios.get(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data && response.data.data) {
                    setTransaksis(response.data.data);
                } else {
                    console.error('Data kosong atau format yang tidak diharapkan');
                }
            } catch (error) {
                console.error('Error fetching transaksi:', error);
            }
        };

        fetchTransaksi();
    }, [API_URL]);

    useEffect(() => {
        const fetchPendapatan = async () => {
            try {
                const token = Cookies.get('token');
                const headers = { Authorization: `Bearer ${token}` };
                let response;

                switch (filterMode) {
                    case 'perhari':
                        response = await axios.get<{ data: PendapatanPerHari[] }>(
                            `${API_URL}/api/pendapatan/perhari`,
                            { headers, params: { bulan } }
                        );
                        break;
                    case 'perbulan':
                        response = await axios.get<{ data: PendapatanPerBulan[] }>(
                            `${API_URL}/api/pendapatan/perbulan`,
                            { headers, params: { tahun } }
                        );
                        break;
                    case 'pertahun':
                        response = await axios.get<{ data: PendapatanPerTahun[] }>(
                            `${API_URL}/api/pendapatan/pertahun`,
                            { headers }
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
            }
        };

        fetchPendapatan();
    }, [filterMode, tahun, bulan]);

    const handleSwitchTable = () => {
        setShowTransaksi((prev) => !prev);
    };

    const filteredTransaksis = transaksis.filter((transaksi) => {
        const matchesSearch = transaksi.customer.toLowerCase().includes(search.toLowerCase());
        const matchesDate = dateFilter ? transaksi.date.startsWith(dateFilter) : true;
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

                <div className="w-full flex justify-between px-[78px]">
                    {showTransaksi && (
                        <div className="flex items-center justify-center">
                            <input
                                type="text"
                                className="w-[230px] h-[45px] rounded-[5px] ps-[32px] text-[16px] border border-black rounded-e-none"
                                placeholder="Search ..."
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
                    )}

                    {!showTransaksi && (
                        <div className="flex">
                            <div>
                                <select
                                    value={filterMode}
                                    onChange={(e) => setFilterMode(e.target.value)}
                                    className="p-2 border border-black rounded-[5px] h-[45px] rounded-e-none"
                                >
                                    <option value="perhari">Per Hari</option>
                                    <option value="perbulan">Per Bulan</option>
                                    <option value="pertahun">Per Tahun</option>
                                </select>
                            </div>

                            {filterMode === "perbulan" && (
                                <div>
                                    <select
                                        value={tahun}
                                        onChange={(e) => setTahun(e.target.value)}
                                        className="p-2 border border-black rounded-[5px] h-[45px] rounded-s-none"
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
                    )}


                    <div className="flex items-center justify-center">
                        <button
                            onClick={handleSwitchTable}
                            className='w-[50px] h-[45px] rounded-[5px] flex items-center justify-center me-[20px] bg-custom-blue'>
                            <img src="../images/swich.svg" alt="" />
                        </button>
                    </div>
                </div>

                {showTransaksi ? (
                    <div className="w-full px-[78px] mt-[50px] mb-[50px]">
                        <table className="w-full border-collapse border-black border rounded-lg">
                            <thead className="bg-custom-grey">
                                <tr>
                                    <th className="border border-black p-2">Customer</th>
                                    <th className="border border-black p-2">Item type</th>
                                    <th className="border border-black p-2">PCS</th>
                                    <th className="border border-black p-2">Weight</th>
                                    <th className="border border-black p-2">Bill</th>
                                    <th className="border border-black p-2">Date</th>
                                    <th className="border border-black p-2">Time In</th>
                                    <th className="border border-black p-2">Time Out</th>
                                    <th className="border border-black p-2">CheckIn by</th>
                                    <th className="border border-black p-2">CheckOut by</th>
                                    <th className="border border-black p-2">Status</th>
                                    <th className="border border-black p-2 ">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransaksis.length === 0 ? (
                                    <tr>
                                        <td colSpan={12} className="border border-black p-2 text-center">No data found</td>
                                    </tr>
                                ) : (
                                    filteredTransaksis.map((transaksi) => (
                                        <tr key={transaksi.id}>
                                            <td className="border border-black p-2">{transaksi.customer}</td>
                                            <td className="border border-black p-2">{transaksi.itemType}</td>
                                            <td className="border border-black p-2">{transaksi.pcs}</td>
                                            <td className="border border-black p-2">{transaksi.weight}</td>
                                            <td className="border border-black p-2">Rp.{transaksi.harga}</td>
                                            <td className="border border-black p-2">{transaksi.date}</td>
                                            <td className="border border-black p-2">{transaksi.timeIn}</td>
                                            <td className="border border-black p-2">{transaksi.timeOut || '-'}</td>
                                            <td className="border border-black p-2">{transaksi.checkByIn}</td>
                                            <td className="border border-black p-2">{transaksi.checkByOut || '-'}</td>
                                            <td className="border border-black p-2">{transaksi.status}</td>
                                            <td className="border border-black p-2">
                                                <div className="flex justify-evenly items-center w-full">
                                                    <button
                                                        onClick={() => handleViewModalOpen(transaksi)}
                                                        className="bg-custom-blue w-[30px] h-[30px] rounded-md flex justify-center items-center hover:shadow-sm hover:shadow-black"
                                                    >
                                                        <img src="../images/view.svg" alt="" />
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


                        <table className="w-full border-collapse border-black border rounded-lg">
                            <thead className="bg-custom-grey">
                                <tr>
                                    {filterMode === 'perhari' && (
                                        <>
                                            <th className="border border-black p-2">Tanggal</th>
                                            <th className="border border-black p-2">Total Pendapatan</th>
                                            <th className="border border-black p-2">Total Transaksi</th>
                                        </>
                                    )}
                                    {filterMode === 'perbulan' && (
                                        <>
                                            <th className="border border-black p-2">Bulan</th>
                                            <th className="border border-black p-2">Total Pendapatan</th>
                                            <th className="border border-black p-2">Total Transaksi</th>
                                        </>
                                    )}
                                    {filterMode === 'pertahun' && (
                                        <>
                                            <th className="border border-black p-2">Tahun</th>
                                            <th className="border border-black p-2">Total Pendapatan</th>
                                            <th className="border border-black p-2">Total Transaksi</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {noData ? (
                                    <tr>
                                        <td colSpan={3} className="border border-black p-2 text-center">
                                            Tidak dapat menemukan data.
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
                    <h2 className="text-2xl font-bold mb-4 text-custom-blue text-center">Detail Transaksi</h2>
                    {viewTransaksi && (
                        <div>
                            <p><strong>Customer:</strong> {viewTransaksi.customer}</p>
                            <p><strong>Item Type:</strong> {viewTransaksi.itemType}</p>
                            <p><strong>PCS:</strong> {viewTransaksi.pcs}</p>
                            <p><strong>Weight:</strong> {viewTransaksi.weight}</p>
                            <p><strong>Brand:</strong> {viewTransaksi.brand}</p>
                            <p><strong>Color/Description:</strong> {viewTransaksi.color_description}</p>
                            <p><strong>Remarks:</strong> {viewTransaksi.remarks}</p>
                            <p><strong>Supply Used:</strong> {viewTransaksi.supplyUsed}</p>
                            <p><strong>Bill:</strong> Rp.{viewTransaksi.harga}</p>
                            <p><strong>Date:</strong> {viewTransaksi.date}</p>
                            <p><strong>Time In:</strong> {viewTransaksi.timeIn}</p>
                            <p><strong>Time Out:</strong> {viewTransaksi.timeOut || '-'}</p>
                            <p><strong>CheckIn by:</strong> {viewTransaksi.checkByIn}</p>
                            <p><strong>CheckOut by:</strong> {viewTransaksi.checkByOut || '-'}</p>
                            <p><strong>Person In Charge:</strong> {viewTransaksi.personInCharge}</p>
                            <p><strong>Status:</strong> {viewTransaksi.status}</p>
                        </div>
                    )}
                    <div className="mt-4 flex justify-center gap-7">
                        <button
                            onClick={handleViewModalClose}
                            className="w-[90px] h-[40px] bg-white text-custom-blue border-2 border-custom-blue hover:bg-custom-blue hover:text-white ease-in-out duration-300 flex items-center justify-center rounded-[5px]"
                        >
                            Close
                        </button>
                        <button
                            className="w-[90px] h-[40px] bg-custom-blue text-white border-2 border-custom-blue hover:bg-white hover:text-custom-blue ease-in-out duration-300 flex items-center justify-center rounded-[5px]"
                        >
                            Print
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Riwayat;