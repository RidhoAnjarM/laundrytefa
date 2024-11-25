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
          withCredentials: true,
        });

        if (response.data && response.data.data) {
          setTransaksis(response.data.data);
        } else {
          console.error('The data is empty or in an unexpected format');
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
        console.error('Token not found');
        return;
      }

      const apiUrl = `${API_URL}/api/transaksilaundry/${deleteTransaksiId}`;
      await axios.delete(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
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
          <h1>Manage Laundry Data</h1>
        </div>

        <div className="w-full flex justify-between px-[78px]">
          <div className="flex items-center justify-center">
            <input
              type="text"
              className="w-[230px] h-[45px] rounded-[5px] ps-[32px] text-[16px] border border-black rounded-e-none"
              placeholder="Search by Name"
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
              <option value="">All</option>
              <option value="proses">Process</option>
              <option value="selesai">Finished</option>
            </select>

          </div>

        </div>

        <div className="w-full px-[78px] mt-[50px] mb-[50px]">
          <table className="w-full border-collapse border-black border rounded-lg">
            <thead className="bg-custom-grey">
              <tr className='text-[14px]'>
                <th className="border border-black p-1">Customer</th>
                <th className="border border-black p-1 w-[100px]">Phone Number</th>
                <th className="border border-black p-1">Item type</th>
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
              {filteredTransaksis.length === 0 ? (
                <tr>
                  <td colSpan={14} className="border border-black p-1 text-center">No data found</td>
                </tr>
              ) : (
                [...filteredTransaksis]
                  .sort((a, b) => b.id - a.id)
                  .map((transaksi) => (
                    <tr key={transaksi.id} className='text-[12px]'>
                      <td className="border border-black p-1">{transaksi.customer}</td>
                      <td className="border border-black p-1">{transaksi.noTelepon}</td>
                      <td className="border border-black p-1">{transaksi.itemType}</td>
                      <td className="border border-black p-1">{transaksi.pcs}</td>
                      <td className="border border-black p-1">{transaksi.weight}</td>
                      <td className="border border-black p-1">Rp.{transaksi.harga}</td>
                      <td className="border border-black p-1">{transaksi.dateIn}</td>
                      <td className="border border-black p-1">{transaksi.timeIn}</td>
                      <td className="border border-black p-1">{transaksi.dateOut}</td>
                      <td className="border border-black p-1">{transaksi.timeOut || '-'}</td>
                      <td className="border border-black p-1">{transaksi.checkByIn}</td>
                      <td className="border border-black p-1">{transaksi.checkByOut || '-'}</td>
                      <td className="border border-black p-1">{transaksi.status}</td>
                      <td className="border border-black p-1">
                        <div className="flex justify-evenly items-center w-full gap-2">

                          <button
                            onClick={() => handleViewModalOpen(transaksi)}
                            className="w-[30px] h-[30px] rounded-md border-2 border-custom-blue flex justify-center items-center hover:shadow-sm hover:shadow-black"
                          >
                            <img src="../images/view.svg" alt="" />
                          </button>

                          <button
                            onClick={() => handleDeleteModalOpen(transaksi.id)}
                            className="bg-red-500 w-[30px] h-[30px] rounded-md flex justify-center items-center hover:shadow-sm hover:shadow-black"
                          >
                            <img src="../images/delete.svg" alt="" />
                          </button>
                          <button
                            onClick={() => {
                              if (transaksi) {
                                const query = new URLSearchParams(transaksi as Record<string, string>).toString();
                                window.open(`/struk?${query}`, '_blank');
                              }
                            }}
                            className="bg-custom-blue w-[30px] h-[30px] rounded-md flex justify-center items-center hover:shadow-sm hover:shadow-black"
                          >
                            <img src="../images/print.svg" alt="" />
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
              <p><strong>Supply Used:</strong> {viewTransaksi.supplyUsed}</p>
              <p><strong>Bill:</strong> Rp.{viewTransaksi.harga}</p>
              <p><strong>Date In:</strong> {viewTransaksi.dateIn}</p>
              <p><strong>Time In:</strong> {viewTransaksi.timeIn}</p>
              <p><strong>Date Out:</strong> {viewTransaksi.dateOut}</p>
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

          </div>
        </div>
      </Modal>

      <Modal isOpen={showModalDelete} onClose={handleDeleteModalClose}>
        <div className="p-4 text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-500">Confirm Delete</h2>
          <p>Are you sure you want to delete this transaction?</p>
          <div className="mt-9 flex justify-center gap-4">
            <button
              onClick={handleDeleteModalClose}
              className="w-[90px] h-[40px] bg-white text-red-500 border-2 border-red-500 hover:bg-red-500 hover:text-white ease-in-out duration-300 flex items-center justify-center rounded-[5px]"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteTransaksi}
              className="w-[90px] h-[40px] bg-red-500 text-white border-2 border-red-500 hover:bg-white hover:text-red-500 ease-in-out duration-300 flex items-center justify-center rounded-[5px]"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>


      <Modal isOpen={showModalSuccess} onClose={handleSuccessModalClose}>
        <div className="p-4 text-center">
          <h2 className="text-2xl font-bold mb-4 text-custom-green">Succeed !</h2>
          <p>Transaction successfully deleted.</p>
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
