import withAuth from "../../../hoc/withAuth";
import Navbar from '@/pages/components/navbar';
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
    .sort((a, b) => b.id - a.id) // Sort by ID, latest first
    .filter((transaksi) => transaksi.customer.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 10);

  return (
    <div>
      <Navbar />
      <div className="ms-[100px] flex flex-wrap justify-center">
        <div className="w-full text-[30px] h-[45px] mt-[50px] ps-[40px] mb-[30px]">
          <h1>Dashboard</h1>
        </div>

        <div className="w-full flex justify-between px-[70px]">
          <div className="w-[850px]">
            <h2 className="text-[30px] text-custom-green font-semibold mb-[40px] text-center">LAST TRANSACTION</h2>
            <table className="w-full border-collapse border-black border rounded-lg">
              <thead className="bg-custom-grey">
                <tr>
                  <th className="border border-black p-2">Customer</th>
                  <th className="border border-black p-2">Item type</th>
                  <th className="border border-black p-2">PCS</th>
                  <th className="border border-black p-2">Weight</th>
                  <th className="border border-black p-2">Bill</th>
                  <th className="border border-black p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="border border-black p-2 text-center">
                      <div className="flex justify-center items-center">
                        <div className="w-10 h-10 border-4 border-t-custom-green border-gray-300 rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredTransaksis.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="border border-black p-2 text-center">No data found</td>
                  </tr>
                ) : (
                  filteredTransaksis.map((transaksi) => (
                    <tr key={transaksi.id}>
                      <td className="border border-black p-2">{transaksi.customer}</td>
                      <td className="border border-black p-2">{transaksi.itemType}</td>
                      <td className="border border-black p-2">{transaksi.pcs}</td>
                      <td className="border border-black p-2">{transaksi.weight}</td>
                      <td className="border border-black p-2">Rp {Number(transaksi.harga).toLocaleString("id-ID")}</td>
                      <td className="border border-black p-2">{transaksi.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <p><b>*Last 10 transactions*</b></p>
          </div>

          <div className="grid gap-5">
            <div className="w-[366px] h-[276px] rounded-[10px] bg-custom-grey overflow-hidden">
              <div className="w-full h-[86px] bg-custom-green text-white text-[30px] flex items-center ps-[30px] font-light">
                <h2>INCOME</h2>
              </div>
              <div className="p-5">
                <p className="text-center font-semibold text-[13px] text-custom-green">Current Daily Income</p>
                {loading ? (
                  <div className="flex flex-row gap-2 ms-[50px] mt-[60px]">
                    <div className="w-2 h-2 rounded-full bg-custom-green animate-bounce [animation-delay:.7s]"></div>
                    <div className="w-2 h-2 rounded-full bg-custom-green animate-bounce [animation-delay:.3s]"></div>
                    <div className="w-2 h-2 rounded-full bg-custom-green animate-bounce [animation-delay:.7s]"></div>
                    <div className="w-2 h-2 rounded-full bg-custom-green animate-bounce [animation-delay:.7s]"></div>
                    <div className="w-2 h-2 rounded-full bg-custom-green animate-bounce [animation-delay:.7s]"></div>
                    <div className="w-2 h-2 rounded-full bg-custom-green animate-bounce [animation-delay:.7s]"></div>
                  </div>
                ) : noData ? (
                  <p className="text-[28px] font-bold text-custom-green">Rp 000.000.000</p>
                ) : (
                  <table className="w-full ms-[30px] mt-[40px]">
                    <tbody>
                      {pendapatanHariIni.map((item, index) => (
                        <tr key={index}>
                          <td className="text-[28px] font-bold text-custom-green">Rp {parseInt(item.total_pendapatan).toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="w-[366px] h-[276px] rounded-[10px] bg-custom-grey overflow-hidden">
              <div className="w-full h-[86px] bg-custom-green text-white text-[30px] flex items-center ps-[30px] font-light">
                <h2>REPORT</h2>
              </div>
              <div className="p-5 text-[20px] text-custom-green font-light">
                <div className="mt-5">
                  {loading ? (
                    <p>Today's Transaction: 0</p>
                  ) : noData ? (
                    <p>Today's Transaction: 0</p>
                  ) : (
                    <table className="w-full">
                      <tbody>
                        {pendapatanHariIni.map((item, index) => (
                          <tr key={index}>
                            <td><h2>Today's Transaction: {item.total_transaksi}</h2></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <h2>In The Process: {loading ? (<span>0</span>) : transaksis.filter((t) => t.status === 'proses').length}</h2>
                <h2>Completed Order: {loading ? (<span>0</span>) : transaksis.filter((t) => t.status === 'selesai').length}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
