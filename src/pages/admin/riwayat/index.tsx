'use client'

import Navbar from '@/components/navbar';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Modal from '@/components/modal';
import { Transaksi, PendapatanPerHari, PendapatanPerBulan, PendapatanPerTahun } from '@/types';
import { useReactToPrint } from 'react-to-print';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Komponen IncomeReceipt (bahasa Indonesia)
const IncomeReceipt = React.forwardRef<
  HTMLDivElement,
  {
    pendapatanData: PendapatanPerHari[] | PendapatanPerBulan[] | PendapatanPerTahun[] | PendapatanPerHari | PendapatanPerBulan | PendapatanPerTahun;
    filterMode: string;
    bulan?: string;
    tahun?: string;
  }
>(({ pendapatanData, filterMode, bulan, tahun }, ref) => {
  const getTitle = () => {
    if (filterMode === 'perhari') {
      if (!Array.isArray(pendapatanData) && 'tanggal' in pendapatanData) {
        return `Laporan Pendapatan Harian - ${pendapatanData.tanggal}`;
      }
      return `Laporan Pendapatan Harian - ${bulan ? getMonthName(parseInt(bulan)) : 'Semua Tanggal'}`;
    }
    if (filterMode === 'perbulan') {
      if (!Array.isArray(pendapatanData) && 'bulan' in pendapatanData) {
        return `Laporan Pendapatan Bulanan - ${getMonthName(pendapatanData.bulan)} ${tahun || ''}`;
      }
      return `Laporan Pendapatan Bulanan - ${tahun || 'Semua Tahun'}`;
    }
    if (filterMode === 'pertahun') {
      if (!Array.isArray(pendapatanData) && 'tahun' in pendapatanData) {
        return `Laporan Pendapatan Tahunan - ${pendapatanData.tahun}`;
      }
      return 'Laporan Pendapatan Tahunan';
    }
    return '';
  };

  const getMonthName = (monthNum: number) => {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return monthNames[monthNum - 1] || '-';
  };

  const getDayName = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', { weekday: 'long' });
    } catch {
      return '-';
    }
  };

  const dataArray = Array.isArray(pendapatanData) ? pendapatanData : [pendapatanData];
  const totalPendapatan = dataArray.reduce((sum, item) => sum + Number(item.total_pendapatan || 0), 0);
  const totalTransaksi = dataArray.reduce((sum, item) => sum + Number(item.total_transaksi || 0), 0);

  return (
    <div ref={ref} className="w-[800px] bg-white flex flex-col p-6">
      <div className="w-full flex justify-between items-center mb-6">
        <div className="flex items-center">
          <p className="w-[80px] h-[80px] bg-[#E70008] rounded-full flex items-center justify-center">
            <img src="../images/logo.png" alt="Logo" className="w-[76px] h-[74px]" />
          </p>
          <h1 className="font-bold text-[#E70008] text-[24px] ml-6">MILENIAL HOTEL</h1>
        </div>
        <div className="text-[14px] font-medium">
          <p>{getTitle()}</p>
          <p>Tanggal Cetak: {new Date().toLocaleDateString('id-ID')}</p>
        </div>
      </div>

      <div className="w-full flex-1">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-custom-grey">
              {filterMode === 'perhari' && (
                <>
                  <th className="border border-black p-2 text-left">Tanggal</th>
                  <th className="border border-black p-2 text-left">Hari</th>
                  <th className="border border-black p-2 text-right">Total Pendapatan</th>
                  <th className="border border-black p-2 text-right">Total Transaksi</th>
                </>
              )}
              {filterMode === 'perbulan' && (
                <>
                  <th className="border border-black p-2 text-left">Bulan</th>
                  <th className="border border-black p-2 text-right">Total Pendapatan</th>
                  <th className="border border-black p-2 text-right">Total Transaksi</th>
                </>
              )}
              {filterMode === 'pertahun' && (
                <>
                  <th className="border border-black p-2 text-left">Tahun</th>
                  <th className="border border-black p-2 text-right">Total Pendapatan</th>
                  <th className="border border-black p-2 text-right">Total Transaksi</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {dataArray.map((item, index) => {
              if ('tanggal' in item && filterMode === 'perhari') {
                return (
                  <tr key={index}>
                    <td className="border border-black p-2">{item.tanggal || '-'}</td>
                    <td className="border border-black p-2">{getDayName(item.tanggal)}</td>
                    <td className="border border-black p-2 text-right">
                      Rp {Number(item.total_pendapatan || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="border border-black p-2 text-right">{item.total_transaksi || 0}</td>
                  </tr>
                );
              }
              if ('bulan' in item && filterMode === 'perbulan') {
                return (
                  <tr key={index}>
                    <td className="border border-black p-2">{getMonthName(item.bulan)}</td>
                    <td className="border border-black p-2 text-right">
                      Rp {Number(item.total_pendapatan || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="border border-black p-2 text-right">{item.total_transaksi || 0}</td>
                  </tr>
                );
              }
              if ('tahun' in item && filterMode === 'pertahun') {
                return (
                  <tr key={index}>
                    <td className="border border-black p-2">{item.tahun || '-'}</td>
                    <td className="border border-black p-2 text-right">
                      Rp {Number(item.total_pendapatan || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="border border-black p-2 text-right">{item.total_transaksi || 0}</td>
                  </tr>
                );
              }
              return null;
            })}
            <tr className="font-bold">
              <td className="border border-black p-2" colSpan={filterMode === 'perhari' ? 2 : 1}>
                Total
              </td>
              <td className="border border-black p-2 text-right">
                Rp {Number(totalPendapatan).toLocaleString('id-ID')}
              </td>
              <td className="border border-black p-2 text-right">{totalTransaksi}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="w-full flex justify-between mt-6 px-[100px]">
        <div className="text-center">
          <p>Penerima</p>
          <hr className="border border-black w-[150px] mt-[62px]" />
        </div>
        <div className="text-center">
          <p>Hormat Kami</p>
          <hr className="border border-black w-[150px] mt-[62px]" />
        </div>
      </div>
    </div>
  );
});
IncomeReceipt.displayName = 'IncomeReceipt';

const History = () => {
  const [showTransactions, setShowTransactions] = useState(true);
  const [transactions, setTransactions] = useState<Transaksi[]>([]);
  const [income, setIncome] = useState<PendapatanPerHari[] | PendapatanPerBulan[] | PendapatanPerTahun[]>([]);
  const [showModalView, setShowModalView] = useState(false);
  const [viewTransaction, setViewTransaction] = useState<Transaksi | null>(null);
  const [filterMode, setFilterMode] = useState('perhari');
  const [year, setYear] = useState('2025');
  const [month, setMonth] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [search, setSearch] = useState('');
  const [noData, setNoData] = useState(false);
  const [title, setTitle] = useState('Transaction History');
  const [loading, setLoading] = useState<boolean>(true);
  const [printIncome, setPrintIncome] = useState<
    PendapatanPerHari[] | PendapatanPerBulan[] | PendapatanPerTahun[] | PendapatanPerHari | PendapatanPerBulan | PendapatanPerTahun | null
  >(null);

  const incomeRef = useRef<HTMLDivElement>(null);

  // Type guard untuk pendapatan
  const isPendapatanPerHariArray = (data: any[]): data is PendapatanPerHari[] => {
    return data.every(item => 'tanggal' in item);
  };

  const isPendapatanPerBulanArray = (data: any[]): data is PendapatanPerBulan[] => {
    return data.every(item => 'bulan' in item);
  };

  const isPendapatanPerTahunArray = (data: any[]): data is PendapatanPerTahun[] => {
    return data.every(item => 'tahun' in item);
  };

  // Fungsi untuk mengonversi status backend ke frontend
  const mapStatusToFrontend = (backendStatus: string | null | undefined): string => {
    switch (backendStatus) {
      case 'selesai':
        return 'Finished';
      case 'proses':
        return 'In Progress';
      default:
        return '-';
    }
  };

  // Setup react-to-print untuk pendapatan
  const handlePrintIncome = useReactToPrint({
    documentTitle: `Laporan_Pendapatan_${filterMode}_${new Date().toISOString().split('T')[0]}`,
    onAfterPrint: () => {
      console.log('Printing income completed');
      setPrintIncome(null);
    },
    onPrintError: (error) => {
      console.error('Print income error:', error);
    },
  });

  const triggerPrintIncome = () => {
    if (incomeRef.current) {
      console.log('Attempting to print income...');
      handlePrintIncome(() => incomeRef.current);
    } else {
      console.error('Income print component is not available');
    }
  };

  useEffect(() => {
    if (showTransactions) {
      setTitle('Transaction History');
    } else {
      setTitle('Income History');
    }
  }, [showTransactions]);

  useEffect(() => {
    const fetchTransactions = async () => {
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
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        if (response.data && Array.isArray(response.data.data)) {
          const validTransactions = response.data.data.filter((t: Transaksi) => t.id && t.customer);
          setTransactions(validTransactions);
        } else {
          console.error('The data is empty or in an unexpected format');
          setTransactions([]);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    const fetchIncome = async () => {
      setLoading(true);
      try {
        const token = Cookies.get('token');
        if (!token) {
          console.error('Token not found');
          setNoData(true);
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };
        let response;

        switch (filterMode) {
          case 'perhari':
            response = await axios.get<{ data: PendapatanPerHari[] }>(
              `${API_URL}/api/pendapatan/perhari`,
              { headers, params: { bulan: month }, withCredentials: true }
            );
            break;
          case 'perbulan':
            response = await axios.get<{ data: PendapatanPerBulan[] }>(
              `${API_URL}/api/pendapatan/perbulan`,
              { headers, params: { tahun: year }, withCredentials: true }
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

        if (response.data && Array.isArray(response.data.data)) {
          setIncome(response.data.data);
          setNoData(response.data.data.length === 0);
        } else {
          setIncome([]);
          setNoData(true);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setNoData(true);
        setIncome([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIncome();
  }, [filterMode, year, month]);

  const handleSwitchTable = () => {
    setShowTransactions((prev) => !prev);
  };

  const handleViewModalOpen = (transaction: Transaksi) => {
    setViewTransaction(transaction);
    setShowModalView(true);
  };

  const handleViewModalClose = () => {
    setShowModalView(false);
    setViewTransaction(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(e.target.value);
  };

  const getDayName = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } catch {
      return '-';
    }
  };

  const getMonthName = (monthNum: number) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[monthNum - 1] || '-';
  };

  const getDateOutClass = (dateOut: string | null) => {
    if (!dateOut) {
      console.warn('dateOut is null or empty');
      return '';
    }

    const dateOutObj = new Date(dateOut);
    if (isNaN(dateOutObj.getTime())) {
      console.warn(`Invalid date format for dateOut: ${dateOut}`);
      return '';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateOutNormalized = new Date(dateOutObj.getFullYear(), dateOutObj.getMonth(), dateOutObj.getDate());

    // Hitung perbedaan hari
    const timeDiff = dateOutNormalized.getTime() - today.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (dayDiff > 7) {
      // Jauh di masa depan (> 7 hari): Hijau tua
      return 'bg-green-800';
    } else if (dayDiff > 0) {
      // Dekat di masa depan (1-7 hari): Hijau muda
      return 'bg-green-300';
    } else if (dayDiff === 0) {
      // Hari ini: Kuning
      return 'bg-yellow-500';
    } else if (dayDiff >= -7) {
      // Lewat 1-7 hari: Merah muda
      return 'bg-red-300';
    } else {
      // Lewat lebih dari 7 hari: Merah tua
      return 'bg-red-800';
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = !search || transaction.customer?.toLowerCase().includes(search.toLowerCase());
    const matchesDate = !dateFilter || transaction.dateIn === dateFilter;
    return matchesSearch && matchesDate;
  });

  const filteredIncome = income.filter((item) => {
    if (filterMode !== 'perhari' || !('tanggal' in item)) return true;
    const matchesDate = !dateFilter || item.tanggal === dateFilter;
    const matchesMonth = !month || new Date(item.tanggal).getMonth() + 1 === parseInt(month);
    return matchesDate && matchesMonth;
  });

  // Fungsi untuk menangani Print All
  const handlePrintAll = () => {
    if (filterMode === 'perhari' && isPendapatanPerHariArray(filteredIncome)) {
      setPrintIncome(filteredIncome as PendapatanPerHari[]);
    } else if (filterMode === 'perbulan' && isPendapatanPerBulanArray(filteredIncome)) {
      setPrintIncome(filteredIncome as PendapatanPerBulan[]);
    } else if (filterMode === 'pertahun' && isPendapatanPerTahunArray(filteredIncome)) {
      setPrintIncome(filteredIncome as PendapatanPerTahun[]);
    }
    setTimeout(() => triggerPrintIncome(), 100);
  };

  return (
    <div>
      <Navbar />
      <div className="ms-[240px] flex flex-wrap justify-center text-black">
        <div className="w-full text-center font-ruda text-[20px] font-black mt-[40px] mb-[30px]">
          <h1>{title}</h1>
        </div>

        <div className="w-full flex justify-between pe-[20px]" id="filter-history">
          {showTransactions && (
            <div className="w-full flex justify-between items-center">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search by customer name"
                  value={search}
                  onChange={handleSearchChange}
                  className="w-[200px] h-[40px] bg-white rounded-[10px] text-[14px] border border-black px-3 font-ruda font-semibold"
                />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={handleDateFilterChange}
                  className="w-[150px] h-[40px] bg-white rounded-[10px] text-[14px] border border-black px-3 font-ruda font-semibold"
                />
              </div>
              <button
                onClick={handleSwitchTable}
                className="w-[150px] h-[50px] rounded-[10px] flex items-center justify-center bg-custom-blue hover:bg-blue-600 transition-colors"
              >
                <div className="text-white font-extrabold font-ruda text-[15px]">
                  <p>To Income</p>
                  <img src="../images/swich.svg" alt="Switch" className="w-[20px] mx-auto" />
                </div>
              </button>
            </div>
          )}

          {!showTransactions && (
            <div className="w-full flex justify-between items-center">
              <div className="flex items-center justify-center gap-3">
                <select
                  value={filterMode}
                  onChange={(e) => setFilterMode(e.target.value)}
                  className="w-[150px] h-[40px] bg-white rounded-[10px] text-[16px] border border-black px-3 font-ruda font-semibold outline-none"
                >
                  <option value="perhari">Daily</option>
                  <option value="perbulan">Monthly</option>
                  <option value="pertahun">Yearly</option>
                </select>
                {filterMode === 'perhari' && (
                  <>
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={handleDateFilterChange}
                      className="w-[150px] h-[40px] bg-white rounded-[10px] text-[14px] border border-black px-3 font-ruda font-semibold"
                    />
                  </>
                )}
                {filterMode === 'perbulan' && (
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-[100px] h-[40px] bg-white rounded-[10px] text-[16px] border border-black px-3 font-ruda font-semibold outline-none"
                  >
                    <option value="2030">2030</option>
                    <option value="2029">2029</option>
                    <option value="2028">2028</option>
                    <option value="2027">2027</option>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                )}
              </div>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handlePrintAll}
                  className="bg-gray-500 text-white w-[40px] h-[40px] rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center"
                  disabled={loading || noData || filteredIncome.length === 0}
                >
                  <img src="../images/print.svg" alt="Print" />
                </button>
                <button
                  onClick={handleSwitchTable}
                  className="w-[150px] h-[50px] rounded-[10px] flex items-center justify-center bg-custom-blue hover:bg-blue-600 transition-colors"
                >
                  <div className="text-white font-extrabold font-ruda text-[15px]">
                    <p>To Transaction</p>
                    <img src="../images/swich.svg" alt="Switch" className="w-[20px] mx-auto" />
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {showTransactions ? (
          <div className="w-full mt-[30px] mb-[50px] pe-[20px]">
            <table
              className="min-w-full bg-white border border-custom-gray-2 font-sans rounded-lg overflow-hidden"
              id="table-transactions"
            >
              <thead className="bg-custom-gray-1 sticky top-0">
                <tr className="text-[14px]">
                  <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">
                    Date In
                  </th>
                  <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">
                    Service
                  </th>
                  <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">
                    Date Out
                  </th>
                  <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">
                    Remainder
                  </th>
                  <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-custom-gray-2">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="border border-black p-1 text-center">
                      <div className="flex justify-center items-center">
                        <div className="w-10 h-10 border-4 border-t-custom-green border-gray-300 rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="border border-black p-1 text-center">No data found</td>
                  </tr>
                ) : (
                  filteredTransactions
                    .sort((a, b) => b.id - a.id)
                    .map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-[13px] text-gray-700">{transaction.dateIn || '-'}</td>
                        <td className="px-4 py-3 text-[13px] text-gray-700">{transaction.customer || '-'}</td>
                        <td className="px-4 py-3 text-[13px] text-gray-700">{transaction.service || '-'}</td>
                        <td className="px-4 py-3 text-[13px] text-gray-700">
                          <span className={`${getDateOutClass(transaction.dateOut)} p-2 rounded font-bold`}>
                            {transaction.dateOut || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-700">
                          Rp {Number(transaction.subTotal || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-700">
                          {transaction.sisa === 0 ? 'Paid' : `Rp ${Number(transaction.sisa || 0).toLocaleString('id-ID')}`}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-700">{mapStatusToFrontend(transaction.status)}</td>
                        <td className="px-4 py-3 text-[13px] text-gray-700">
                          <div className="flex justify-evenly items-center w-full">
                            <button
                              onClick={() => handleViewModalOpen(transaction)}
                              className="bg-green-600 text-white w-[40px] h-[40px] justify-center rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center text-sm"
                            >
                              <img src="../images/view.svg" alt="View" />
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
            <table
              className="min-w-full bg-white border border-custom-gray-2 font-sans rounded-lg overflow-hidden"
              id="table-income"
            >
              <thead className="bg-custom-grey">
                <tr>
                  {filterMode === 'perhari' && (
                    <>
                      <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">
                        Total Income
                      </th>
                      <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">
                        Total Transactions
                      </th>
                      <th className="px-4 py-3 text-left BADborder-b text-black font-semibold uppercase text-sm tracking-wider">
                        Action
                      </th>
                    </>
                  )}
                  {filterMode === 'perbulan' && (
                    <>
                      <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">
                        Month
                      </th>
                      <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">
                        Total Income
                      </th>
                      <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">
                        Total Transactions
                      </th>
                      <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">
                        Action
                      </th>
                    </>
                  )}
                  {filterMode === 'pertahun' && (
                    <>
                      <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">
                        Year
                      </th>
                      <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">
                        Total Income
                      </th>
                      <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">
                        Total Transactions
                      </th>
                      <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">
                        Action
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-custom-gray-2">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="border border-black p-1 text-center">
                      <div className="flex justify-center items-center">
                        <div className="w-10 h-10 border-4 border-t-custom-green border-gray-300 rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredIncome.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="border border-black p-1 text-center">
                      No data found
                    </td>
                  </tr>
                ) : (
                  filteredIncome
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
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-[15px] text-gray-700">
                              {item.tanggal} ({getDayName(item.tanggal)})
                            </td>
                            <td className="px-4 py-3 text-[15px] text-gray-700">
                              Rp {Number(item.total_pendapatan || 0).toLocaleString('id-ID')}
                            </td>
                            <td className="px-4 py-3 text-[15px] text-gray-700">{item.total_transaksi || 0}</td>
                            <td className="px-4 py-3 text-[15px] text-gray-700">
                              <button
                                onClick={() => {
                                  setPrintIncome(item);
                                  setTimeout(() => triggerPrintIncome(), 100);
                                }}
                                className="bg-gray-500 text-white w-[40px] h-[40px] rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center"
                              >
                                <img src="../images/print.svg" alt="Print" />
                              </button>
                            </td>
                          </tr>
                        );
                      }
                      if ('bulan' in item && filterMode === 'perbulan') {
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-[15px] text-gray-700">{getMonthName(item.bulan)}</td>
                            <td className="px-4 py-3 text-[15px] text-gray-700">
                              Rp {Number(item.total_pendapatan || 0).toLocaleString('id-ID')}
                            </td>
                            <td className="px-4 py-3 text-[15px] text-gray-700">{item.total_transaksi || 0}</td>
                            <td className="px-4 py-3 text-[15px] text-gray-700">
                              <button
                                onClick={() => {
                                  setPrintIncome(item);
                                  setTimeout(() => triggerPrintIncome(), 100);
                                }}
                                className="bg-gray-500 text-white w-[40px] h-[40px] rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center"
                              >
                                <img src="../images/print.svg" alt="Print" />
                              </button>
                            </td>
                          </tr>
                        );
                      }
                      if ('tahun' in item && filterMode === 'pertahun') {
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-[15px] text-gray-700">{item.tahun}</td>
                            <td className="px-4 py-3 text-[15px] text-gray-700">
                              Rp {Number(item.total_pendapatan || 0).toLocaleString('id-ID')}
                            </td>
                            <td className="px-4 py-3 text-[15px] text-gray-700">{item.total_transaksi || 0}</td>
                            <td className="px-4 py-3 text-[15px] text-gray-700">
                              <button
                                onClick={() => {
                                  setPrintIncome(item);
                                  setTimeout(() => triggerPrintIncome(), 100);
                                }}
                                className="bg-gray-500 text-white w-[40px] h-[40px] rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center"
                              >
                                <img src="../images/print.svg" alt="Print" />
                              </button>
                            </td>
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

        <Modal isOpen={showModalView} onClose={handleViewModalClose}>
          <div className="py-3 ps-3 pe-1 text-black">
            <h2 className="text-2xl font-extrabold mb-4 text-center font-ruda text-black">Transaction Details</h2>
            {viewTransaction && (
              <div className="overflow-y-auto max-h-[500px] pe-2 font-ruda text-[15px]">
                <div className="border-b pb-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Date In:</span>
                    <span>{viewTransaction.dateIn || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Time In:</span>
                    <span>{viewTransaction.timeIn || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Date Out:</span>
                    <span>{viewTransaction.dateOutAktual || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Time Out:</span>
                    <span>{viewTransaction.timeOutAktual || '-'}</span>
                  </div>
                </div>
                <div className="border-b pb-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Customer:</span>
                    <span>{viewTransaction.customer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Phone Number:</span>
                    <span>{viewTransaction.noTelepon}</span>
                  </div>
                </div>
                <div className="border-b pb-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Item Type:</span>
                    <span>{viewTransaction.itemType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">PCS:</span>
                    <span>{viewTransaction.pcs}</span>
                  </div>
                </div>
                <div className="border-b pb-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Weight:</span>
                    <span>{viewTransaction.weight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Brand:</span>
                    <span>{viewTransaction.brand}</span>
                  </div>
                </div>
                <div className="border-b pb-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Color/Description:</span>
                    <span>{viewTransaction.color_description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Remarks:</span>
                    <span>{viewTransaction.remarks}</span>
                  </div>
                </div>
                <div className="border-b pb-2">
                  <span className="font-semibold">Supply Used:</span>
                  {viewTransaction.supplyUsed && Array.isArray(viewTransaction.supplyUsed) && viewTransaction.supplyUsed.length > 0 ? (
                    <ul className="list-disc list-inside ml-5">
                      {viewTransaction.supplyUsed.map((bahan, index) => (
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
                    <span>{viewTransaction.service || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Bill:</span>
                    <span>Rp {Number(viewTransaction.harga).toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Total:</span>
                    <span>Rp {Number(viewTransaction.subTotal).toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">DP (Down Payment):</span>
                    <span>Rp {Number(viewTransaction.dp).toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Remainder:</span>
                    <span>Rp {Number(viewTransaction.sisa).toLocaleString("id-ID")}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Person In Charge:</span>
                  <span>{viewTransaction.personInCharge || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Check In by:</span>
                  <span>{viewTransaction.checkByIn || '-'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold">Check Out by:</span>
                  <span>{viewTransaction.checkByOut || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Date Out Estimated:</span>
                  <span>{viewTransaction.dateOut || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Time Out Estimated:</span>
                  <span>{viewTransaction.timeOut || '-'}</span>
                </div>
              </div>
            )}
            <div className="mt-2 flex justify-center">
              <button
                onClick={() => {
                  setViewTransaction(null);
                  handleViewModalClose();
                }}
                className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-600 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>

        <div style={{ display: 'none' }}>
          <IncomeReceipt
            ref={incomeRef}
            pendapatanData={printIncome || []}
            filterMode={filterMode}
            bulan={month}
            tahun={year}
          />
        </div>
      </div>
    </div>
  );
};

export default History;