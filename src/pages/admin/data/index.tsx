'use client'

import Navbar from '@/components/navbar';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Modal from '@/components/modal';
import { Transaksi } from '@/types';
import { useReactToPrint } from 'react-to-print';
import Alert from '@/components/alert';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Komponen Receipt (sama seperti sebelumnya)
const Receipt = React.forwardRef<HTMLDivElement, { transaksiData: Transaksi | null }>(
  ({ transaksiData }, ref) => {
    if (!transaksiData) return null;

    return (
      <div ref={ref} className="w-[800px] h-[500px] bg-white flex flex-col">
        <div className="w-full justify-between flex pt-[30px]">
          <div className="flex">
            <p className="w-[80px] h-[80px] bg-[#E70008] rounded-full flex items-center justify-center ms-[50px]">
              <img src="../images/logo.png" alt="" className="w-[76px] h-[74px]" />
            </p>
            <h1 className="font-bold text-[#E70008] text-[24px] mt-[20px] ms-6">MILENIAL HOTEL</h1>
          </div>
          <div className="text-[14px] font-medium me-[140px]">
            <p className="mb-3">Bill No: {transaksiData.id || '-'}</p>
            <p>Tgl.Masuk: {transaksiData.dateIn || '-'}</p>
            <p>Waktu Masuk: {transaksiData.timeIn || '-'}</p>
            <p>Tgl.Keluar: {transaksiData.dateOut || '-'}</p>
            <p className="mt-[10px]">Nama: {transaksiData.customer || '-'}</p>
            <p>Telepon: {transaksiData.noTelepon || '-'}</p>
          </div>
        </div>

        <div className="w-full px-[50px] mt-[4px] flex-1">
          <table className="w-full">
            <thead>
              <tr className="bg-custom-grey">
                <th className="border border-black">Item Tipe</th>
                <th className="border border-black">Jasa</th>
                <th className="border border-black w-[100px]">KG</th>
                <th className="border border-black w-[70px]">PCS</th>
                <th className="border border-black w-[150px]">Harga</th>
                <th className="border border-black w-[150px]">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-center">
                <td className="border border-black">{transaksiData.itemType || '-'}</td>
                <td className="border border-black">{transaksiData.service || '-'}</td>
                <td className="border border-black">{transaksiData.weight || '-'}</td>
                <td className="border border-black">{transaksiData.pcs || '-'}</td>
                <td className="border border-black">Rp {Number(transaksiData.harga).toLocaleString("id-ID")}</td>
                <td className="border border-black">Rp {Number(transaksiData.harga).toLocaleString("id-ID")}</td>
              </tr>
              <tr className="text-center">
                <td className="border border-black p-3"></td>
                <td className="border border-black"></td>
                <td className="border border-black"></td>
                <td className="border border-black"></td>
                <td className="border border-black"></td>
                <td className="border border-black"></td>
              </tr>
              <tr className="text-center">
                <td className="border border-black p-3"></td>
                <td className="border border-black"></td>
                <td className="border border-black"></td>
                <td className="border border-black"></td>
                <td className="border border-black"></td>
                <td className="border border-black"></td>
              </tr>
              <tr className="text-center">
                <td className="border border-black" colSpan={5}>Layanan</td>
                <td className="border border-black">Rp {Number(transaksiData.biayaLayanan).toLocaleString("id-ID")}</td>
              </tr>
              <tr className="text-center">
                <td className="border border-black" colSpan={5}>Total</td>
                <td className="border border-black">Rp {Number(transaksiData.subTotal).toLocaleString("id-ID")}</td>
              </tr>
            </tbody>
          </table>
          <div className="w-full flex justify-end my-2">
            <div className="flex gap-4">
              <p>Dp = Rp {Number(transaksiData.dp).toLocaleString("id-ID")}</p>
              <p>Sisa = Rp {Number(transaksiData.sisa).toLocaleString("id-ID")}</p>
            </div>
          </div>
          <div className="w-full flex justify-between px-[100px]">
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
      </div>
    );
  }
);
Receipt.displayName = 'Receipt';

const DataLaundry = () => {
  const [transaksis, setTransaksis] = useState<Transaksi[]>([]);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showModalView, setShowModalView] = useState(false);
  const [viewTransaksi, setViewTransaksi] = useState<Transaksi | null>(null);
  const [statusFilter, setStatusFilter] = useState('process');
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [deleteTransaksiId, setDeleteTransaksiId] = useState<number | null>(null);
  const [showModalSuccess, setShowModalSuccess] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [printTransaksi, setPrintTransaksi] = useState<Transaksi | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const componentRef = useRef<HTMLDivElement>(null);

  // Fungsi untuk mengonversi status backend ke frontend
  const mapStatusToFrontend = (backendStatus: string | null | undefined): string => {
    switch (backendStatus) {
      case 'selesai':
        return 'finished';
      case 'proses':
        return 'process';
      default:
        return '-';
    }
  };

  // Fungsi untuk mengonversi status frontend ke backend
  const mapStatusToBackend = (frontendStatus: string): string | null => {
    switch (frontendStatus) {
      case 'finished':
        return 'selesai';
      case 'process':
        return 'proses';
      case '':
        return null;
      default:
        return null;
    }
  };

  // Setup react-to-print
  const handlePrint = useReactToPrint({
    documentTitle: `Struk_Laundry_${printTransaksi?.id || 'unknown'}`,
    onAfterPrint: () => {
      console.log("Printing completed");
      setPrintTransaksi(null);
      setAlert({ type: 'success', message: 'Receipt printed successfully!' });
    },
    onPrintError: (error) => {
      console.error("Print error:", error);
      setAlert({ type: 'error', message: 'Failed to print receipt. Please try again.' });
    },
  });

  const triggerPrint = () => {
    if (componentRef.current) {
      console.log("Attempting to print...");
      handlePrint(() => componentRef.current);
    } else {
      console.error("Print component is not available");
      setAlert({ type: 'error', message: 'Failed to print receipt. Please try again.' });
    }
  };

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

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

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

  const filteredTransaksis = transaksis
    .filter((transaksi) => {
      const matchesSearch = transaksi.customer.toLowerCase().includes(search.toLowerCase());
      const matchesDate = dateFilter
        ? (transaksi.dateIn || "").startsWith(dateFilter)
        : true;
      const matchesStatus = statusFilter
        ? transaksi.status === mapStatusToBackend(statusFilter)
        : true;
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
      <div className="ms-[240px] flex flex-wrap justify-center text-black">
        <div className="w-full text-center font-ruda text-[20px] font-black mt-[40px] mb-[30px]">
          <h1>Manage Laundry Data</h1>
        </div>

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <div className="w-full flex justify-between pe-[20px]">
          <div className="flex items-center justify-center">
            <input
              type="text"
              className="w-[300px] h-[40px] bg-white rounded-[10px] text-[14px] border border-black font-ruda font-semibold px-[20px] outline-none"
              placeholder="search by name..."
              value={search}
              onChange={handleSearchChange}
            />
            <input
              type="date"
              className="w-[150px] h-[40px] bg-white rounded-[10px] text-[14px] border border-black ms-[23px] px-3 font-ruda font-semibold"
              value={dateFilter}
              onChange={handleDateChange}
            />
          </div>

          <div className="flex items-center justify-center">
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="w-[110px] h-[40px] bg-white rounded-[10px] text-[15px] border border-black ms-[23px] px-[10px] font-ruda font-semibold flex items-center"
            >
              <option value="finished">Finished</option>
              <option value="process">Process</option>
              <option value="">All</option>
            </select>

            <div className="w-[150px] h-[50px] bg-white rounded-[10px] text-[14px] border border-black ms-[23px] px-[19px] font-ruda font-semibold flex items-center">
              <div>
                <p>Process: {transaksis.filter((t) => t.status === 'proses').length}</p>
                <p>Finished: {transaksis.filter((t) => t.status === 'selesai').length}</p>
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
                <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Service</th>
                <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">DateOut<br />(estimated)</th>
                <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Total</th>
                <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Remainder</th>
                <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider">Status</th>
                <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider w-[150px]">Action</th>
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
              ) : filteredTransaksis.length === 0 ? (
                <tr>
                  <td colSpan={8} className="border border-black p-1 text-center">No data found</td>
                </tr>
              ) : (
                filteredTransaksis.map((transaksi) => (
                  <tr key={transaksi.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-[13px] text-gray-700">{transaksi.dateIn || '-'}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">{transaksi.customer || '-'}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">{transaksi.service || '-'}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">
                      <span className={`${getDateOutClass(transaksi.dateOut)} p-2 rounded font-bold`}>{transaksi.dateOut || '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">Rp {Number(transaksi.subTotal).toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">
                      Rp {transaksi.sisa === 0 ? 'Paid' : Number(transaksi.sisa).toLocaleString("id-ID") || '-'}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">{mapStatusToFrontend(transaksi.status)}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">
                      <div className="flex justify-evenly items-center w-full gap-2">
                        <button
                          onClick={() => handleViewModalOpen(transaksi)}
                          className="bg-green-600 text-white w-[40px] h-[40px] justify-center rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center text-sm"
                        >
                          <img src="../images/view.svg" alt="" />
                        </button>
                        <button
                          onClick={() => handleDeleteModalOpen(transaksi.id)}
                          className="bg-red-500 text-white w-[40px] h-[40px] justify-center rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center text-sm"
                        >
                          <img src="../images/delete.svg" alt="" />
                        </button>
                        <button
                          onClick={() => {
                            setPrintTransaksi(transaksi);
                            setTimeout(() => triggerPrint(), 100);
                          }}
                          className="bg-gray-500 text-white w-[40px] h-[40px] justify-center rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center text-sm"
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
        <div className="py-3 ps-3 pe-1 text-black">
          <h2 className="text-2xl font-extrabold mb-4 text-center font-ruda text-black">Transaction Details</h2>
          {viewTransaksi && (
            <div className="overflow-y-auto max-h-[500px] pe-2 font-ruda text-[15px]">
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
                  <ul className="list-disc list-inside ml-5">
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
                  <span className="font-semibold">DP (Down Payment):</span>
                  <span>Rp {Number(viewTransaksi.dp).toLocaleString("id-ID")}</span>
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
              className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-600 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showModalDelete} onClose={handleDeleteModalClose}>
        <div className="p-4 text-center text-black">
          <h2 className="text-2xl font-extrabold mb-4 font-ruda text-red-500">Confirm Delete</h2>
          <p className='text-[16px] text-black font-ruda'>Are you sure you want to delete this transaction?</p>
          <div className="mt-9 flex justify-center gap-4">
            <button
              onClick={handleDeleteModalClose}
              className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-600 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                setLoading(true);
                await handleDeleteTransaksi();
                setLoading(false);
              }}
              className={`px-6 py-2 ${loading ? 'bg-red-500' : 'bg-red-500'} text-white font-semibold rounded-full hover:bg-red-600 hover:shadow-lg transition-all duration-200`}
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
        <div className="p-4 text-center text-black">
          <h2 className="text-2xl font-bold mb-4 font-ruda text-custom-green ">Notification!</h2>
          <p className='text-black text-[16px] font-ruda'>Transaction successfully deleted.</p>
          <div className="flex w-full justify-center mt-4">
            <button
              onClick={handleSuccessModalClose}
              className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-600 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      <div style={{ display: 'none' }}>
        <Receipt ref={componentRef} transaksiData={printTransaksi} />
      </div>
    </div>
  );
};

export default DataLaundry;