import NavbarKasir from '@/pages/components/navbarkasir';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Modal from '@/pages/components/modal';
import { Transaksi } from '@/types';

const DataLaundry = () => {
  const [transaksis, setTransaksis] = useState<Transaksi[]>([]);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedTransaksi, setSelectedTransaksi] = useState<Transaksi | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [showModalView, setShowModalView] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [viewTransaksi, setViewTransaksi] = useState<Transaksi | null>(null);
  const [statusFilter, setStatusFilter] = useState('');


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
          withCredentials: true
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

  const handleUpdateStatus = async (transaksi: Transaksi) => {
    if (!API_URL) {
      console.error('API_URL is not defined in the environment variables.');
      return;
    }

    try {
      const token = Cookies.get('token');
      if (!token) {
        console.error('Token tidak ditemukan');
        return;
      }

      const apiUrl = `${API_URL}/api/updatestatuslaundry/${transaksi.id}`;
      console.log('Memanggil API:', apiUrl);

      const response = await axios.put(
        apiUrl,
        {
          status: 'selesai',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true
        }
      );

      console.log('Response API:', response);

      if (response.status === 200) {
        const newResponse = await axios.get(`${API_URL}/api/transaksilaundry`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true
        });

        if (newResponse.data && newResponse.data.data) {
          setTransaksis(newResponse.data.data);
          setResultMessage('Status updated successfully!');
        } else {
          console.error('The data is empty or in an unexpected format');
          setResultMessage('Failed to get the latest data.');
        }
      } else {
        console.error('Failed to update status:', response.data);
        setResultMessage('Failed to update status.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setResultMessage('An error occurred while updating the status.');
    } finally {
      setShowModal(false);
      setShowResultModal(true);
    }
  };

  const handleModalOpen = (transaksi: Transaksi) => {
    setSelectedTransaksi(transaksi);
    setShowModalUpdate(true);
  };

  const handleModalClose = () => {
    setShowModalUpdate(false);
    setSelectedTransaksi(null);
  };


  const handleResultModalClose = () => {
    setShowModalUpdate(false);
    setShowResultModal(false);
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


  return (
    <div>
      <NavbarKasir />
      <div className="ms-[100px] flex flex-wrap justify-center">

        <div className="w-full text-[30px] h-[45px] mt-[50px] ps-[40px] mb-[30px]">
          <h1>Manage Laundry Data</h1>
        </div>

        <div className="w-full flex justify-between px-[78px]">
          <div className="flex items-center justify-center">
            <input
              type="text"
              className="w-[230px] h-[45px] rounded-[5px]  ps-[32px] text-[16px] border border-black rounded-e-none"
              placeholder="Search ..."
              value={search}
              onChange={handleSearchChange}
            />
            <div className="w-[120px] h-[45px] rounded-[5px] text-[13px] border border-black ps-2 grid rounded-s-none border-s-0">
              <p>Process: {transaksis.filter((t) => t.status === 'proses').length}</p>
              <p>Finished: {transaksis.filter((t) => t.status === 'selesai').length}</p>
            </div>

          </div>

          <div className="flex items-center justify-center">
            <p>Filter By :</p>
            <input
              type="date"
              className="w-[120px] h-[45px] rounded-[5px] p-2 text-[14px] border border-black ms-2 rounded-e-none border-e-0"
              value={dateFilter}
              onChange={handleDateChange}
            />
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="w-[120px] h-[45px] rounded-[5px] text-[14px] border border-black flex items-center px-3 rounded-s-none"
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
              <tr>
                <th className="border border-black p-2">Date</th>
                <th className="border border-black p-2">Customer</th>
                <th className="border border-black p-2">Item type</th>
                <th className="border border-black p-2">PCS</th>
                <th className="border border-black p-2">Weight</th>
                <th className="border border-black p-2">Bill</th>
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
                [...filteredTransaksis]
                  .sort((a, b) => b.id - a.id)
                  .map((transaksi) => (
                    <tr key={transaksi.id}>
                      <td className="border border-black p-2">{transaksi.date}</td>
                      <td className="border border-black p-2">{transaksi.customer}</td>
                      <td className="border border-black p-2">{transaksi.itemType}</td>
                      <td className="border border-black p-2">{transaksi.pcs}</td>
                      <td className="border border-black p-2">{transaksi.weight}</td>
                      <td className="border border-black p-2">Rp.{transaksi.harga}</td>
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
                          {transaksi.status === 'selesai' ? (
                            <div
                              className="bg-custom-green w-[30px] h-[30px] rounded-full flex justify-center items-center hover:shadow-sm hover:shadow-black pt-1"
                            >
                              <img src="../images/check.svg" alt="" />
                            </div>
                          ) : (
                            <button
                              onClick={() => handleModalOpen(transaksi)}
                              className="bg-custom-blue w-[30px] h-[30px] rounded-md flex justify-center items-center hover:shadow-sm hover:shadow-black"
                            >
                              <img src="../images/update.svg" alt="" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>

          </table>
        </div>
      </div>

      <Modal isOpen={showModalUpdate} onClose={handleModalClose}>
        <div className="p-4 text-center">
          <h2 className="text-2xl font-bold mb-4 text-custom-blue">Confirm Update</h2>
          <p>Are you sure you want to update the status of this transaction to <b>selesai</b>?</p>
          <div className="flex justify-center mt-10 gap-7">
            <button
              onClick={handleModalClose}
              className="w-[90px] h-[40px] bg-white text-custom-blue border-2 border-custom-blue hover:bg-custom-blue hover:text-white ease-in-out duration-300 flex items-center justify-center rounded-[5px]"
            >
              Cancel
            </button>
            <button
              onClick={() => selectedTransaksi && handleUpdateStatus(selectedTransaksi)}
              className="w-[90px] h-[40px] bg-custom-blue text-white border-2 border-custom-blue hover:bg-white hover:text-custom-blue ease-in-out duration-300 flex items-center justify-center rounded-[5px]"
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>


      <Modal isOpen={showResultModal} onClose={handleResultModalClose}>
        <div className="p-4 text-center">
          <h2 className="text-2xl font-bold mb-6 text-green-600">{resultMessage}</h2>
          <div className="flex justify-center mt-10">
            <button
              onClick={handleResultModalClose}
              className="w-[90px] h-[40px] bg-custom-green border-2 border-custom-green text-white rounded-[5px] hover:bg-white hover:text-custom-green ease-in-out duration-300"
            >
              OK
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showModalView} onClose={handleViewModalClose}>
        <div className="p-4 ">
          <h2 className="text-2xl font-bold mb-4 text-custom-blue text-center">Transaction Details</h2>
          {viewTransaksi && (
            <div>
              <p><strong>Customer:</strong> {viewTransaksi.customer}</p>
              <p><strong>Item Type:</strong> {viewTransaksi.itemType}</p>
              <p><strong>PCS:</strong> {viewTransaksi.pcs}</p>
              <p><strong>Weight:</strong> {viewTransaksi.weight}</p>
              <p><strong>Bill:</strong> {viewTransaksi.harga}</p>
              <p><strong>Date:</strong> {viewTransaksi.date}</p>
              <p><strong>Time In:</strong> {viewTransaksi.timeIn}</p>
              <p><strong>Time Out:</strong> {viewTransaksi.timeOut || '-'}</p>
              <p><strong>CheckIn by:</strong> {viewTransaksi.checkByIn}</p>
              <p><strong>CheckOut by:</strong> {viewTransaksi.checkByOut || '-'}</p>
              <p><strong>Status:</strong> {viewTransaksi.status}</p>
              <p><strong>Person In Charge:</strong> {viewTransaksi.personInCharge}</p>
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
              onClick={() => {
                if (viewTransaksi) {
                  const query = new URLSearchParams(viewTransaksi as Record<string, string>).toString();
                  window.open(`/struk?${query}`, '_blank');
                }
              }}
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

export default DataLaundry;
