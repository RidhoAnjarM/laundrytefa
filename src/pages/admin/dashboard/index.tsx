import Navbar from '@/pages/components/navbar';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Transaksi, PendapatanResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const decodeToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1]; 
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload); 
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

const Dashboard = () => {
  const [transaksis, setTransaksis] = useState<Transaksi[]>([]);
  const [search, setSearch] = useState('');
  const [pendapatan, setPendapatan] = useState<PendapatanResponse | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
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

        const decodedToken = decodeToken(token);
        if (decodedToken && decodedToken.role) {
          setRole(decodedToken.role);
        } else {
          console.error('Role tidak ditemukan dalam token');
          return;
        }

        const transaksiResponse = await axios.get(`${API_URL}/api/transaksilaundry`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (transaksiResponse.data && transaksiResponse.data.data) {
          const sortedTransaksis = transaksiResponse.data.data.sort(
            (a: Transaksi, b: Transaksi) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setTransaksis(sortedTransaksis);
        } else {
          console.error('Data transaksi kosong atau format yang tidak diharapkan');
        }

        if (decodedToken.role === 'admin') {
          const pendapatanResponse = await axios.get(`${API_URL}/api/pendapatan/perbulan?tahun=2024`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (pendapatanResponse.data) {
            setPendapatan({
              total_pendapatan: pendapatanResponse.data.total_pendapatan,
              total_transaksi: pendapatanResponse.data.total_transaksi,
            });
          } else {
            console.error('Data pendapatan kosong atau format yang tidak diharapkan');
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const filteredTransaksis = transaksis
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
            <div className="w-full text-center">
              <h2 className='text-[30px] text-custom-green font-extrabold mb-[40px]'>ORDERAN TERAKHIR</h2>
            </div>

            <div className="w-full">
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
                  {filteredTransaksis.length === 0 ? (
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
                        <td className="border border-black p-2">Rp.{transaksi.harga}</td>
                        <td className="border border-black p-2">{transaksi.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
                <p><b>*10 transaksi terakhir*</b></p>
            </div>
          </div>

          {/* Pendapatan dan laporan */}
          <div className="grid">
            <div className="w-[366px] h-[276px] rounded-[10px] bg-custom-grey overflow-hidden">
              <div className="w-full h-[86px] bg-custom-green text-white text-[30px] flex items-center ps-[30px] font-light">
                <h2>PENDAPATAN</h2>
              </div>
              {role === 'admin' ? (
                pendapatan ? (
                  <div className="w-full h-full pt-[75px] ps-[40px] text-[30px] text-custom-green font-bold">
                    <h2>Rp {pendapatan.total_pendapatan.toLocaleString('id-ID')}</h2>
                  </div>
                ) : (
                  <div className="w-full h-full pt-[75px] ps-[40px] text-[20px] text-red-500">
                    <h3>Loading pendapatan...</h3>
                  </div>
                )
              ) : (
                <div className="w-full h-full pt-[75px] ps-[40px] text-[20px] text-red-500">
                  <h3>Tidak dapat menampilkan pendapatan</h3>
                </div>
              )}
            </div>

            <div className="w-[366px] h-[276px] rounded-[10px] bg-custom-grey overflow-hidden mt-[20px]">
              <div className="w-full h-[86px] bg-custom-green text-white text-[30px] flex items-center ps-[30px] font-light">
                <h2>LAPORAN</h2>
              </div>
              <div className="w-full h-full pt-[50px] ps-[40px] text-[20px] text-custom-green font-light">
                {role === 'admin' ? (
                  pendapatan && pendapatan.total_transaksi ? (
                    <h2>Total Transaksi : {pendapatan.total_transaksi}</h2>
                  ) : (
                    <h2>Total Transaksi : 0</h2>
                  )
                ) : (
                  <div className="w-full h-full pt-[75px] ps-[40px] text-[20px] text-red-500">
                    <h3>Tidak dapat menampilkan transaksi</h3>
                  </div>
                )}
                <h2>Dalam Proses    : {transaksis.filter((t) => t.status === 'proses').length} </h2>
                <h2>Pesanan Selesai : {transaksis.filter((t) => t.status === 'selesai').length}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
