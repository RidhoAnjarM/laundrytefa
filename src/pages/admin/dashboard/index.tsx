import withAuth from "../../../hoc/withAuth";
import Navbar from '@/components/navbar';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Transaksi, PendapatanPerHari } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Dashboard = () => {
  const [transaksis, setTransaksis] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('perhari');
  const [bulan, setBulan] = useState('');
  const [pendapatanHariIni, setPendapatanHariIni] = useState<PendapatanPerHari[]>([]);
  const [noData, setNoData] = useState(false);

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
          headers: { Authorization: `Bearer ${token}` },
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
        const response = await axios.get<{ data: PendapatanPerHari[] }>(
          `${API_URL}/api/pendapatan/perhari`,
          { headers, params: { bulan }, withCredentials: true }
        );

        if (response.data && response.data.data) {
          const allData = response.data.data;

          if (filterMode === 'perhari') {
            const today = new Date().toISOString().split('T')[0];
            const dataToday = allData.filter((item) => item.tanggal === today);
            setPendapatanHariIni(dataToday);
          }

          setNoData(allData.length === 0);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setNoData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPendapatan();
  }, [filterMode, bulan]);

  const filteredTransaksis = transaksis
    .sort((a, b) => b.id - a.id)
    .filter((transaksi) => {
      const today = new Date().toISOString().split('T')[0];
      return transaksi.customer.toLowerCase().includes(search.toLowerCase()) && 
             transaksi.tanggal === today;
    })
    .slice(0, 10);

  return (
    <div>
      <Navbar />
      <div className="ms-[240px] flex flex-wrap justify-center">
        <div className="w-full flex justify-between pe-[20px] mx-[50px] mt-[70px]">
          {/* daily income */}
          <div className="w-[350px] h-[200px] bg-white rounded-[25px] border border-custom-green">
            <div className="mt-[40px] mx-[72px] mb-[20px]">
              <img src="../images/dailyincome.svg" alt="" />
            </div>

            <div className="w-full flex justify-center">
              {loading ? (
                <div className="flex flex-row gap-2 mt-3">
                  <div className="w-2 h-2 rounded-full bg-custom-green animate-bounce [animation-delay:.7s]"></div>
                  <div className="w-2 h-2 rounded-full bg-custom-green animate-bounce [animation-delay:.3s]"></div>
                  <div className="w-2 h-2 rounded-full bg-custom-green animate-bounce [animation-delay:.7s]"></div>
                </div>
              ) : noData || pendapatanHariIni.length === 0 ? (
                <p className="text-[28px] font-black text-custom-green font-ruda">Rp 0</p>
              ) : (
                <table>
                  <tbody>
                    {pendapatanHariIni.map((item, index) => (
                      <tr key={index}>
                        <td className="text-[28px] font-black text-custom-green font-ruda">Rp {parseInt(item.total_pendapatan).toLocaleString('id-ID') || '000.000.000'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* transaction */}
          <div className="w-[200px] h-[200px] bg-white rounded-[25px] border border-custom-green">
            <div className="mt-[20px] mx-[41px]">
              <img src="../images/pesan.svg" alt="" />
            </div>
            <div className="w-full font-ruda text-[32px] text-custom-green font-black text-center mt-2">
              {loading ? (
                <p>0</p>
              ) : noData || pendapatanHariIni.length === 0 ? (
                <p>0</p>
              ) : (
                <table className="w-full">
                  <tbody>
                    {pendapatanHariIni.map((item, index) => (
                      <tr key={index}>
                        <td><h2>{item.total_transaksi || '0'}</h2></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* progress */}
          <div className="w-[200px] h-[200px] bg-white rounded-[25px] border border-custom-green">
            <div className="mt-[26px] mx-[50px]">
              <img src="../images/progres.svg" alt="" />
            </div>
            <div className="w-full font-ruda text-[32px] text-custom-green font-black text-center mt-2">
              <h2>{loading ? (<span>0</span>) : transaksis.filter((t) => t.status === 'proses').length}</h2>
            </div>
          </div>

          {/* completed */}
          <div className="w-[200px] h-[200px] bg-white rounded-[25px] border border-custom-green">
            <div className="mt-[14px] mx-[50px]">
              <img src="../images/completed.svg" alt="" />
            </div>
            <div className="w-full font-ruda text-[32px] text-custom-green font-black text-center mt-2">
              <h2>{loading ? (<span>0</span>) : transaksis.filter((t) => t.status === 'selesai').length}</h2>
            </div>
          </div>
        </div>

        {/* table */}
        <div className="w-full mt-[30px] mb-[50px] pe-[20px] mx-[50px]">
          <table className="min-w-full bg-white border border-custom-gray-2 font-sans rounded-lg overflow-hidden shadow-custom-dua">
            <thead className="bg-custom-gray-1">
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
                  <tr key={transaksi.id}>
                    <td className="px-4 py-3 text-[15px] text-gray-700">{transaksi.customer}</td>
                    <td className="px-4 py-3 text-[15px] text-gray-700">{transaksi.itemType}</td>
                    <td className="px-4 py-3 text-[15px] text-gray-700">{transaksi.pcs}</td>
                    <td className="px-4 py-3 text-[15px] text-gray-700">{transaksi.weight}</td>
                    <td className="px-4 py-3 text-[15px] text-gray-700">Rp {Number(transaksi.harga).toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3 text-[15px] text-gray-700">{transaksi.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <p className="font-ruda text-[12px] font-bold"><b>*Last 10 transactions*</b></p>
        </div>
      </div>
    </div>

  );
};

export default Dashboard;
