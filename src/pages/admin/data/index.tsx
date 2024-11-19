import Navbar from '@/pages/components/navbar';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Modal from '@/pages/components/modal';
import { Transaksi } from '@/types';

const DataLaundry = () => {
  const [transaksis, setTransaksis] = useState<Transaksi[]>([]);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showModalView, setShowModalView] = useState(false);
  const [viewTransaksi, setViewTransaksi] = useState<Transaksi | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [deleteTransaksiId, setDeleteTransaksiId] = useState<number | null>(null);
  const [showModalSuccess, setShowModalSuccess] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const filteredTransaksis = transaksis.filter((transaksi) => {
    const matchesSearch = transaksi.customer.toLowerCase().includes(search.toLowerCase());
    const matchesDate = dateFilter ? transaksi.date.startsWith(dateFilter) : true;
    const matchesStatus = statusFilter ? transaksi.status === statusFilter : true;
    return matchesSearch && matchesDate && matchesStatus;
  });

  const handleDeleteModalOpen = (id: number) => {
    setDeleteTransaksiId(id);
    setShowModalDelete(true);
  };

  const handleDeleteModalClose = () => {
    setDeleteTransaksiId(null);
    setShowModalDelete(false);
  };

  const handleDeleteTransaksi = async () => {
    if (!deleteTransaksiId || !API_URL) return;

    try {
      const token = Cookies.get('token');
      if (!token) {
        console.error('Token tidak ditemukan');
        return;
      }

      const apiUrl = `${API_URL}/api/transaksilaundry/${deleteTransaksiId}`;
      await axios.delete(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTransaksis((prev) => prev.filter((t) => t.id !== deleteTransaksiId));
      setDeleteTransaksiId(null);
      setShowModalDelete(false);
      setShowModalSuccess(true);
    } catch (error) {
      console.error('Error deleting transaksi:', error);
    }
  };

  const handleSuccessModalClose = () => {
    setShowModalSuccess(false);
  };



  return (
    <div>
      <Navbar />
      <div className="ms-[100px] flex flex-wrap justify-center">

        <div className="w-full text-[30px] h-[45px] mt-[50px] ps-[40px] mb-[30px]">
          <h1>Data Laundry</h1>
        </div>

        <div className="w-full flex justify-between px-[78px]">
          <div className="flex items-center justify-center">
            <input
              type="text"
              className="w-[230px] h-[45px] rounded-[5px] ps-[32px] text-[16px] border border-black rounded-e-none"
              placeholder="Search ..."
              value={search}
              onChange={handleSearchChange}
            />
            <div className="w-[120px] h-[45px] rounded-[5px] text-[13px] border border-black ps-2 grid border-s-0 rounded-s-none">
              <p>Proses: {transaksis.filter((t) => t.status === 'proses').length}</p>
              <p>Selesai: {transaksis.filter((t) => t.status === 'selesai').length}</p>
            </div>

          </div>

          <div className="flex items-center justify-center">
            <p>Filter By :</p>
            <input
              type="date"
              className="w-[120px] h-[45px] rounded-[5px] p-2 text-[14px] border border-black ms-2 rounded-e-none"
              value={dateFilter}
              onChange={handleDateChange}
            />
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="w-[120px] h-[45px] rounded-[5px] text-[14px] border border-black flex items-center px-3 border-s-0 rounded-s-none"
            >
              <option value="">Semua</option>
              <option value="proses">Proses</option>
              <option value="selesai">Selesai</option>
            </select>

          </div>

        </div>

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

                        <button
                          onClick={() => handleDeleteModalOpen(transaksi.id)}
                          className="bg-red-500 w-[30px] h-[30px] rounded-md flex justify-center items-center hover:shadow-sm hover:shadow-black"
                        >
                          <img src="../images/delete.svg" alt="" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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

      <Modal isOpen={showModalDelete} onClose={handleDeleteModalClose}>
        <div className="p-4 text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-500">Konfirmasi Hapus</h2>
          <p>Apakah Anda yakin ingin menghapus transaksi ini?</p>
          <div className="mt-9 flex justify-center gap-4">
            <button
              onClick={handleDeleteModalClose}
              className="w-[90px] h-[40px] bg-white text-red-500 border-2 border-red-500 hover:bg-red-500 hover:text-white ease-in-out duration-300 flex items-center justify-center rounded-[5px]"
            >
              Batal
            </button>
            <button
              onClick={handleDeleteTransaksi}
              className="w-[90px] h-[40px] bg-red-500 text-white border-2 border-red-500 hover:bg-white hover:text-red-500 ease-in-out duration-300 flex items-center justify-center rounded-[5px]"
            >
              Hapus
            </button>
          </div>
        </div>
      </Modal>


      <Modal isOpen={showModalSuccess} onClose={handleSuccessModalClose}>
        <div className="p-4 text-center">
          <h2 className="text-2xl font-bold mb-4 text-custom-green">Berhasil !</h2>
          <p>Transaksi berhasil dihapus.</p>
          <div className="flex w-full justify-center">
            <button
              onClick={handleSuccessModalClose}
              className="mt-4 w-[90px] h-[40px] bg-custom-green text-white border-2 border-custom-green hover:bg-white hover:text-custom-green ease-in-out duration-300 flex items-center justify-center rounded-[5px]"
            >
              OK
            </button>
          </div>
        </div>
      </Modal>


    </div>
  );
};

export default DataLaundry;
