import Navbar from '@/components/navbar';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Modal from '@/components/modal';
import { Transaksi } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const DataLaundry = () => {
  const [transaksis, setTransaksis] = useState<Transaksi[]>([]);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showModalView, setShowModalView] = useState(false);
  const [viewTransaksi, setViewTransaksi] = useState<Transaksi | null>(null);
  const [statusFilter, setStatusFilter] = useState('selesai');
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [deleteTransaksiId, setDeleteTransaksiId] = useState<number | null>(null);
  const [showModalSuccess, setShowModalSuccess] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

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
      } finally {
        setLoading(false);
      }
    };

    fetchTransaksi();
  }, [API_URL]);

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
    setViewTransaksi(null);
    setShowModalView(false);
  };

  const handleDeleteModalOpen = (id: number) => {
    setDeleteTransaksiId(id);
    setShowModalDelete(true);
  };

  const handleDeleteModalClose = () => {
    setDeleteTransaksiId(null);
    setShowModalDelete(false);
  };

  const handleSuccessModalClose = () => {
    setShowModalSuccess(false);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const getDateOutClass = (dateOut: string | null) => {
    if (!dateOut) return '';

    const dateOutObj = new Date(dateOut);
    const today = new Date();
    const timeDiff = dateOutObj.getTime() - today.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (dayDiff > 0) {
      return 'bg-green-800';
    } else if (dayDiff === 0) {
      return 'bg-yellow-500';
    } else if (dayDiff >= -5) {
      return 'bg-green-300';
    } else {
      return 'bg-red-500';
    }
  };

  const filteredTransaksis = transaksis
    .filter((transaksi) => {
      const matchesSearch = transaksi.customer.toLowerCase().includes(search.toLowerCase());
      const matchesDate = dateFilter
        ? (transaksi.dateIn || "").startsWith(dateFilter)
        : true;
      const matchesStatus = statusFilter ? transaksi.status === statusFilter : true;
      return matchesSearch && matchesDate && matchesStatus;
    })
    .sort((a, b) => {
      if (a.service === "Express" && b.service !== "Express") {
        return -1;
      }
      if (a.service !== "Express" && b.service === "Express") {
        return 1;
      }
      return b.id - a.id;
    });

  return (
    <div>
      <Navbar />
      <div className="ms-[240px] flex flex-wrap justify-center">
        <div className="w-full text-center font-ruda text-[20px] font-black mt-[40px] mb-[30px]">
          <h1>Manage Laundry Data</h1>
        </div>

        <div className="w-full flex justify-between pe-[20px]">
          <div className="flex items-center justify-center">
            <input
              type="text"
              className="w-[300px] h-[50px] bg-white rounded-[10px] text-[16px] border border-black font-ruda font-semibold px-[32px]"
              placeholder="search . . ."
              value={search}
              onChange={handleSearchChange}
            />
            <input
              type="date"
              className="w-[150px] h-[50px] bg-white rounded-[10px] text-[14px] border border-black ms-[23px] px-3 font-ruda font-semibold"
              value={dateFilter}
              onChange={handleDateChange}
            />
          </div>

          <div className="flex items-center justify-center">
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="w-[110px] h-[50px] bg-white rounded-[10px] text-[15px] border border-black ms-[23px] px-[10px] font-ruda font-semibold flex items-center"
            >
              <option value="selesai">finished</option>
              <option value="proses">process</option>
              <option value="">all</option>
            </select>

            <div className="w-[150px] h-[50px] bg-white rounded-[10px] text-[14px] border border-black ms-[23px] px-[19px] font-ruda font-semibold flex items-center">
              <div>
                <p>process: {transaksis.filter((t) => t.status === 'proses').length}</p>
                <p>finished: {transaksis.filter((t) => t.status === 'selesai').length}</p>
              </div>
            </div>
          </div>

        </div>

        <div className="w-full mt-[30px] mb-[50px] pe-[20px]">
          <table className="min-w-full bg-white border border-custom-gray-2 font-sans rounded-lg overflow-hidden">
            <thead className="bg-custom-gray-1">
              <tr>
                <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">DateIn</th>
                <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Phone Number</th>
                <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Item type</th>
                <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">PCS</th>
                <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Weight</th>
                <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Bill</th>
                <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Service</th>
                <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">DateOut<br />(estimated)</th>
                <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Remainder</th>
                <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-custom-gray-2'>
              {loading ? (
                <tr>
                  <td colSpan={11} className="border border-black p-1 text-center">
                    <div className="flex justify-center items-center">
                      <div className="w-10 h-10 border-4 border-t-custom-green border-gray-300 rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredTransaksis.length === 0 ? (
                <tr>
                  <td colSpan={11} className="border border-black p-1 text-center">No data found</td>
                </tr>
              ) : (
                filteredTransaksis.map((transaksi) => (
                  <tr key={transaksi.id} className='hover:bg-gray-50'>
                    <td className="px-4 py-3 text-[13px] text-gray-700">{transaksi.dateIn || '-'}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">{transaksi.customer || '-'}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">{transaksi.noTelepon || '-'}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">{transaksi.itemType || '-'}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">{transaksi.pcs || '-'}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">{transaksi.weight || '-'}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">{Number(transaksi.harga).toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">{transaksi.service || '-'}</td>
                    <td className={`px-4 py-3 text-[13px] text-gray-700 `}>
                      <span className={`${getDateOutClass(transaksi.dateOut)} p-2 rounded font-bold`}>{transaksi.dateOut || '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">
                      {transaksi.sisa === 0 ? 'Paid' : Number(transaksi.sisa).toLocaleString("id-ID") || '-'}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">
                      <div className="flex justify-evenly items-center w-full gap-2">

                        <button
                          onClick={() => handleViewModalOpen(transaksi)}
                          className="bg-green-500 text-white w-[40px] h-[40px] justify-center rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center text-sm"
                        >
                          <img src="../images/view.svg" alt="" />
                        </button>

                        <button
                          onClick={() => handleDeleteModalOpen(transaksi.id)}
                          className="bg-red-500 w-[40px] h-[40px] rounded-md flex justify-center items-center hover:shadow-sm hover:shadow-black"
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
                          className="bg-custom-blue w-[40px] h-[40px] rounded-md flex justify-center items-center hover:shadow-sm hover:shadow-black"
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
        <div className="py-3 ps-3 pe-1">
          <h2 className="text-2xl font-bold mb-4 text-center text-custom-blue">Transaction Receipt</h2>
          {viewTransaksi && (
            <div className="overflow-y-auto max-h-[500px] pe-2">
              <div className="border-b pb-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Date In:</span>
                  <span>{viewTransaksi.dateIn || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Time In:</span>
                  <span>{viewTransaksi.timeIn || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Date Out:</span>
                  <span>{viewTransaksi.dateOutAktual || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Time Out:</span>
                  <span>{viewTransaksi.timeOutAktual || '-'}</span>
                </div>
              </div>
              <div className="border-b pb-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Customer:</span>
                  <span>{viewTransaksi.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Phone Number:</span>
                  <span>{viewTransaksi.noTelepon}</span>
                </div>
              </div>
              <div className="border-b pb-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Item Type:</span>
                  <span>{viewTransaksi.itemType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">PCS:</span>
                  <span>{viewTransaksi.pcs}</span>
                </div>
              </div>
              <div className="border-b pb-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Weight:</span>
                  <span>{viewTransaksi.weight}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Brand:</span>
                  <span>{viewTransaksi.brand}</span>
                </div>
              </div>
              <div className="border-b pb-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Color/Description:</span>
                  <span>{viewTransaksi.color_description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Remarks:</span>
                  <span>{viewTransaksi.remarks}</span>
                </div>
              </div>
              <div className="border-b pb-2">
                <span className="font-semibold">Supply Used:</span>
                {viewTransaksi.supplyUsed && Array.isArray(viewTransaksi.supplyUsed) && viewTransaksi.supplyUsed.length > 0 ? (
                  <ul className='list-disc list-inside ml-5'>
                    {viewTransaksi.supplyUsed.map((bahan, index) => (
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
                  <span>{viewTransaksi.service || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Bill:</span>
                  <span>Rp {Number(viewTransaksi.harga).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Total:</span>
                  <span>Rp {Number(viewTransaksi.subTotal).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Remainder:</span>
                  <span>Rp {Number(viewTransaksi.sisa).toLocaleString("id-ID")}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Person In Charge:</span>
                <span>{viewTransaksi.personInCharge || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Check In by:</span>
                <span>{viewTransaksi.checkByIn || '-'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">Check Out by:</span>
                <span>{viewTransaksi.checkByOut || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Date Out Estimated:</span>
                <span>{viewTransaksi.dateOut || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Time Out Estimated:</span>
                <span>{viewTransaksi.timeOut || '-'}</span>
              </div>
            </div>
          )}
          <div className="mt-2 flex justify-center">
            <button
              onClick={() => {
                setViewTransaksi(null);
                handleViewModalClose();
              }}
              className="w-[90px] h-[40px] bg-custom-blue text-white rounded-md hover:bg-blue-600 transition duration-300"
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
              className="w-[90px] h-[40px] bg-white text-red-500 border-2 border-red-500 hover:bg-gray-200 ease-in-out duration-300 flex items-center justify-center rounded-[5px]"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                setLoading(true);
                await handleDeleteTransaksi();
                setLoading(false);
              }}
              className={`w-[90px] h-[40px] ${loading ? 'bg-red-500' : 'bg-red-500'} text-white hover:bg-red-700 ease-in-out duration-300 flex items-center justify-center rounded-[5px]`}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                'Delete'
              )}
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
              className="mt-4 w-[90px] h-[40px] bg-custom-green text-white hover:bg-green-700 ease-in-out duration-300 flex items-center justify-center rounded-[5px]"
            >
              OKE
            </button>
          </div>
        </div>
      </Modal>


    </div>
  );
};

export default DataLaundry;
