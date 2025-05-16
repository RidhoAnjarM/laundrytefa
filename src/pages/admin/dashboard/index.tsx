'use client'

import Navbar from '@/components/navbar';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Transaksi, PendapatanPerHari } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Dashboard = () => {
  const [transaksis, setTransaksis] = useState<Transaksi[]>([]);
  const [pendapatanHariIni, setPendapatanHariIni] = useState<PendapatanPerHari | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [noData, setNoData] = useState(false);

  // Fetch transaksi untuk tabel
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
          const validTransaksis = response.data.data.filter(
            (t: Transaksi) => t.id && t.dateIn && t.customer
          );
          setTransaksis(validTransaksis);
        } else {
          setTransaksis([]);
        }
      } catch (error) {
        console.error('Error fetching transaksi:', error);
        setTransaksis([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Fetch pendapatan untuk card (hanya hari ini)
  useEffect(() => {
    const fetchPendapatanHariIni = async () => {
      setLoading(true);
      try {
        if (!API_URL) {
          console.error('API_URL is not defined in the environment variables.');
          setNoData(true);
          return;
        }

        const token = Cookies.get('token');
        if (!token) {
          console.error('Token not found');
          setNoData(true);
          return;
        }

        const today = new Date().toISOString().split('T')[0]; // Format: "2025-05-15"
        const response = await axios.get<{ data: PendapatanPerHari[] }>(
          `${API_URL}/api/pendapatan/perhari`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
            // Tidak perlu params bulan karena kita filter di frontend
          }
        );

        if (response.data && Array.isArray(response.data.data)) {
          const pendapatanHariIni = response.data.data.find(
            (item) => item.tanggal === today
          );
          setPendapatanHariIni(pendapatanHariIni || null);
          setNoData(!pendapatanHariIni);
        } else {
          setPendapatanHariIni(null);
          setNoData(true);
        }
      } catch (error) {
        console.error('Error fetching pendapatan:', error);
        setPendapatanHariIni(null);
        setNoData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPendapatanHariIni();
  }, []);

  // Hitung total transaksi berdasarkan status
  const totalProses = transaksis.filter((t) => t.status === 'proses').length;
  const totalSelesai = transaksis.filter((t) => t.status === 'selesai').length;

  // Filter transaksi untuk tabel (hanya hari ini, 10 terakhir)
  const today = new Date().toISOString().split('T')[0];
  const filteredTransaksis = transaksis
    .sort((a, b) => b.id - a.id)
    .filter((transaksi) => {
      const matchesSearch = (transaksi.customer || '').toLowerCase().includes(search.toLowerCase());
      const transaksiDate = transaksi.dateIn ? new Date(transaksi.dateIn).toISOString().split('T')[0] : null;
      return matchesSearch && transaksiDate === today;
    })
    .slice(0, 10);

  return (
    <div>
      <Navbar />
      <div className="ms-[225px] flex flex-wrap justify-center text-black">
        <div className="w-full flex justify-between pe-[20px] mx-[20px] mt-[70px]">
          {/* daily income */}
          <div className="w-[350px] h-[200px] bg-white rounded-[25px] border border-custom-green">
            <div className="mt-[40px] mx-[72px] mb-[20px]">
              <img src="../images/dailyincome.svg" alt="Pendapatan Harian" />
            </div>
            <div className="w-full flex justify-center">
              {loading ? (
                <div className="flex flex-row gap-2 mt-3">
                  <div className="w-2 h-2 rounded-full bg-custom-green animate-bounce [animation-delay:.7s]"></div>
                  <div className="w-2 h-2 rounded-full bg-custom-green animate-bounce [animation-delay:.3s]"></div>
                  <div className="w-2 h-2 rounded-full bg-custom-green animate-bounce [animation-delay:.7s]"></div>
                </div>
              ) : noData || !pendapatanHariIni ? (
                <p className="text-[28px] font-black text-custom-green font-ruda">Rp 0</p>
              ) : (
                <p className="text-[28px] font-black text-custom-green font-ruda">
                  Rp {Number(pendapatanHariIni.total_pendapatan || 0).toLocaleString('id-ID')}
                </p>
              )}
            </div>
          </div>

          {/* total transaksi */}
          <div className="w-[200px] h-[200px] bg-white rounded-[25px] border border-custom-green">
            <div className="mt-[20px] mx-[41px]">
              <img src="../images/pesan.svg" alt="Total Transaksi" />
            </div>
            <div className="w-full font-ruda text-[32px] text-custom-green font-black text-center mt-2">
              {loading ? <p>0</p> : <h2>{pendapatanHariIni ? pendapatanHariIni.total_transaksi : 0}</h2>}
            </div>
          </div>

          {/* proses */}
          <div className="w-[200px] h-[200px] bg-white rounded-[25px] border border-custom-green">
            <div className="mt-[26px] mx-[50px]">
              <img src="../images/progres.svg" alt="Proses" />
            </div>
            <div className="w-full font-ruda text-[32px] text-custom-green font-black text-center mt-2">
              {loading ? <p>0</p> : <h2>{totalProses}</h2>}
            </div>
          </div>

          {/* selesai */}
          <div className="w-[200px] h-[200px] bg-white rounded-[25px] border border-custom-green">
            <div className="mt-[14px] mx-[50px]">
              <img src="../images/completed.svg" alt="Selesai" />
            </div>
            <div className="w-full font-ruda text-[32px] text-custom-green font-black text-center mt-2">
              {loading ? <p>0</p> : <h2>{totalSelesai}</h2>}
            </div>
          </div>
        </div>

        {/* Tabel Transaksi Hari Ini */}
        <div className="w-full mt-[30px] mb-[50px] pe-[20px] mx-[20px]">
          <div className="max-h-[400px] overflow-y-auto">
            <table className="min-w-full bg-white border border-custom-gray-2 font-sans rounded-lg overflow-hidden shadow-custom-dua">
              <thead className="bg-custom-gray-1 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Item type</th>
                  <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">PCS</th>
                  <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Weight</th>
                  <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Bill</th>
                  <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-custom-gray-2">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="border border-black p-1 text-center">
                      <div className="flex justify-center items-center">
                        <div className="w-10 h-10 border-4 border-t-custom-green border-gray-300 rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredTransaksis.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="border border-black p-1 text-center">No data found</td>
                  </tr>
                ) : (
                  filteredTransaksis.map((transaksi) => (
                    <tr key={transaksi.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-[15px] text-gray-700">{transaksi.customer || '-'}</td>
                      <td className="px-4 py-3 text-[15px] text-gray-700">{transaksi.itemType || '-'}</td>
                      <td className="px-4 py-3 text-[15px] text-gray-700">{transaksi.pcs || '-'}</td>
                      <td className="px-4 py-3 text-[15px] text-gray-700">{transaksi.weight || '-'}</td>
                      <td className="px-4 py-3 text-[15px] text-gray-700">
                        Rp {parseFloat(transaksi.subTotal || '0').toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-[15px] text-gray-700">{transaksi.status || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="font-ruda text-[12px] font-bold"><b>*Last 10 transactions today*</b></p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;