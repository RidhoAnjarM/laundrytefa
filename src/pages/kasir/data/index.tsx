'use client'

import NavbarKasir from '@/components/navbarkasir';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Modal from '@/components/modal';
import Alert from '@/components/alert';
import { useReactToPrint } from 'react-to-print';
import { Transaksi } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Komponen Struk untuk printing (diambil dari DashboardKasir)
const Receipt = React.forwardRef<HTMLDivElement, { transaksiData: Transaksi | null }>(
  ({ transaksiData }, ref) => {
    if (!transaksiData) return null;

    return (
      <div ref={ref} className="w-[800px] h-[500px] bg-white flex flex-col">
        <div className="w-full justify-between flex pt-[30px]">
          <div className="flex">
            <p className="w-[80px] h-[80px] bg-[#E70008] rounded-full flex items-center justify-center ms-[50px]">
              <img src="../images/logo.png" alt="" className='w-[76px] h-[74px]' />
            </p>
            <h1 className='font-bold text-[#E70008] text-[24px] mt-[20px] ms-6'>MILENIAL HOTEL</h1>
          </div>
          <div className="text-[14px] font-medium me-[140px]">
            <p className='mb-3'>Bill No: {transaksiData.id || '-'}</p>
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
  const [selectedTransaksi, setSelectedTransaksi] = useState<Transaksi | null>(null);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [showModalView, setShowModalView] = useState(false);
  const [viewTransaksi, setViewTransaksi] = useState<Transaksi | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [printTransaksi, setPrintTransaksi] = useState<Transaksi | null>(null);

  const componentRef = useRef<HTMLDivElement>(null);

  // Setup react-to-print
  const handlePrint = useReactToPrint({
    documentTitle: `Struk_Laundry_${printTransaksi?.id || 'unknown'}`,
    onAfterPrint: () => {
      console.log("Printing completed");
      setPrintTransaksi(null);
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
          withCredentials: true
        });

        if (response.data && response.data.data) {
          setTransaksis(response.data.data);
        } else {
          console.error('Data kosong atau format yang tidak diharapkan');
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

  const handleUpdateStatus = async (transaksi: Transaksi) => {
    setLoading(true);
    try {
      const token = Cookies.get('token');
      if (!token) {
        console.error('Token tidak ditemukan');
        return;
      }

      const apiUrl = `${API_URL}/api/updatestatuslaundry/${transaksi.id}`;
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

      if (response.status === 200) {
        const newResponse = await axios.get(`${API_URL}/api/transaksilaundry`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true
        });

        if (newResponse.data && newResponse.data.data) {
          setTransaksis(newResponse.data.data);
          setAlert({ type: 'success', message: 'Status updated successfully!' });
        } else {
          console.error('The data is empty or in an unexpected format');
          setAlert({ type: 'error', message: 'Failed to get the latest data.' });
        }
      } else {
        console.error('Failed to update status:', response.data);
        setAlert({ type: 'error', message: 'Failed to update status.' });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setAlert({ type: 'error', message: 'An error occurred while updating the status.' });
    } finally {
      setLoading(false);
      setShowModalUpdate(false);
      setSelectedTransaksi(null);
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

  const handleViewModalOpen = (transaksi: Transaksi) => {
    setViewTransaksi(transaksi);
    setShowModalView(true);
  };

  const handleViewModalClose = () => {
    setShowModalView(false);
    setViewTransaksi(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(e.target.value);
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

  const filteredTransaksis = transaksis.filter((transaksi) => {
    const matchesSearch = transaksi.customer.toLowerCase().includes(search.toLowerCase());
    const matchesDate = dateFilter
      ? (transaksi.dateIn || "").startsWith(dateFilter)
      : true;
    const matchesStatus = transaksi.status === "proses";
    return matchesSearch && matchesDate && matchesStatus;
  }).sort((a, b) => {
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
      <NavbarKasir />
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
          <div className="w-[150px] h-[40px] bg-white rounded-[10px] text-[14px] border border-black ms-[23px] px-[19px] font-ruda font-semibold flex items-center">
            <p>in progress: {transaksis.filter((t) => t.status === 'proses').length}</p>
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
                <th className="px-4 py-3 text-left border-b text-black font-semibold uppercase text-sm tracking-wider w-[150px]">Action</th>
              </tr>
            </thead>
            <tbody className=''>
              {loading ? (
                <tr>
                  <td colSpan={7} className="border border-black p-1 text-center">
                    <div className="flex justify-center items-center">
                      <div className="w-10 h-10 border-4 border-t-custom-green border-gray-300 rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredTransaksis.length === 0 ? (
                <tr>
                  <td colSpan={7} className="border border-black p-1 text-center">No data found</td>
                </tr>
              ) : (
                filteredTransaksis.map((transaksi) => (
                  <tr key={transaksi.id} className='hover:bg-gray-50'>
                    <td className="px-4 py-3 text-[13px] text-gray-700">{transaksi.dateIn || '-'}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">{transaksi.customer || '-'}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">{transaksi.service || '-'}</td>
                    <td className={`px-4 py-3 text-[13px] text-gray-700 `}>
                      <span className={`${getDateOutClass(transaksi.dateOut)} p-2 rounded font-bold text-black`}>{transaksi.dateOut || '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">{Number(transaksi.subTotal).toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">
                      {transaksi.sisa === 0 ? 'Paid' : Number(transaksi.sisa).toLocaleString("id-ID") || '-'}
                    </td>
                    <td className="py-3 text-[13px] text-gray-700">
                      <div className="flex justify-evenly items-center w-full gap-1">
                        <button
                          onClick={() => handleViewModalOpen(transaksi)}
                          className="bg-green-500 text-white w-[40px] h-[40px] justify-center rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center text-sm"
                        >
                          <img src="../images/view.svg" alt="" />
                        </button>
                        {transaksi.status === 'selesai' ? (
                          <div className="border-2 border-green-600 hover:bg-green-700 w-[30px] h-[30px] rounded-full flex justify-center items-center hover:shadow-sm hover:shadow-black">
                            <img src="../images/check.svg" alt="" className='w-[15px] h-[15px]' />
                          </div>
                        ) : (
                          <button
                            onClick={() => handleModalOpen(transaksi)}
                            className="bg-blue-600 text-white w-[40px] h-[40px] justify-center rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center text-sm"
                          >
                            <img src="../images/update.svg" alt="" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setPrintTransaksi(transaksi);
                            setTimeout(() => triggerPrint(), 100);
                          }}
                          className="bg-gray-600 text-white w-[40px] h-[40px] justify-center rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center text-sm"
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

      <Modal isOpen={showModalUpdate} onClose={handleModalClose}>
        <div className="p-4 text-center">
          <h2 className="text-2xl mb-4 font-ruda font-extrabold text-custom-blue">Confirm Update</h2>
          <p className='text-black font-ruda text-[16px]'>Are you sure you want to update the status of this transaction to <b>Fisished</b>?</p>
          <div className="flex justify-center mt-10 gap-4">
            <button
              onClick={handleModalClose}
              className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-600 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => selectedTransaksi && handleUpdateStatus(selectedTransaksi)}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 hover:shadow-lg transition-all duration-200"
            >
              {loading ? (
                <div className="flex flex-row gap-2">
                  <div className="w-2 h-2 rounded-full bg-custom-grey animate-bounce [animation-delay:.7s]"></div>
                  <div className="w-2 h-2 rounded-full bg-custom-grey animate-bounce [animation-delay:.3s]"></div>
                  <div className="w-2 h-2 rounded-full bg-custom-grey animate-bounce [animation-delay:.7s]"></div>
                </div>
              ) : (
                "Confirm"
              )}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showModalView} onClose={handleViewModalClose}>
        <div className="py-3 ps-3 pe-1">
          <h2 className="text-2xl font-extrabold mb-4 text-center font-ruda text-black">Transaction Details</h2>
          {viewTransaksi && (
            <div className="overflow-y-auto max-h-[500px] pe-2 font-ruda text-[15px]">
              <div className="border-b pb-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-black">Date In:</span>
                  <span className="text-black">{viewTransaksi.dateIn || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-black">Time In:</span>
                  <span className="text-black">{viewTransaksi.timeIn || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-black">Date Out:</span>
                  <span className="text-black">{viewTransaksi.dateOutAktual || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-black">Time Out:</span>
                  <span className="text-black">{viewTransaksi.timeOutAktual || '-'}</span>
                </div>
              </div>
              <div className="border-b pb-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-black">Customer:</span>
                  <span className="text-black">{viewTransaksi.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-black">Phone Number:</span>
                  <span className="text-black">{viewTransaksi.noTelepon}</span>
                </div>
              </div>
              <div className="border-b pb-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-black">Item Type:</span>
                  <span className="text-black">{viewTransaksi.itemType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-black">PCS:</span>
                  <span className="text-black">{viewTransaksi.pcs}</span>
                </div>
              </div>
              <div className="border-b pb-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-black">Weight:</span>
                  <span className="text-black">{viewTransaksi.weight}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-black">Brand:</span>
                  <span className="text-black">{viewTransaksi.brand}</span>
                </div>
              </div>
              <div className="border-b pb-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-black">Color/Description:</span>
                  <span className="text-black">{viewTransaksi.color_description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-black">Remarks:</span>
                  <span className="text-black">{viewTransaksi.remarks}</span>
                </div>
              </div>
              <div className="border-b pb-2">
                <span className="font-semibold text-black">Supply Used:</span>
                {viewTransaksi.supplyUsed && Array.isArray(viewTransaksi.supplyUsed) && viewTransaksi.supplyUsed.length > 0 ? (
                  <ul className='list-disc list-inside ml-5 text-black'>
                    {viewTransaksi.supplyUsed.map((bahan, index) => (
                      <li key={index}>{bahan.namaBahan}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-black">No bahan</p>
                )}
              </div>
              <div className="border-b pb-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-black">Service:</span>
                  <span className="text-black">{viewTransaksi.service || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-black">Bill:</span>
                  <span className="text-black">Rp {Number(viewTransaksi.harga).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-black">Total:</span>
                  <span className="text-black">Rp {Number(viewTransaksi.subTotal).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-black">DP:</span>
                  <span className="text-black">Rp {Number(viewTransaksi.dp).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-black">Remainder:</span>
                  <span className="text-black">Rp {Number(viewTransaksi.sisa).toLocaleString("id-ID")}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-black">Person In Charge:</span>
                <span className="text-black">{viewTransaksi.personInCharge || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-black">Check In by:</span>
                <span className="text-black">{viewTransaksi.checkByIn || '-'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-black">Check Out by:</span>
                <span className="text-black">{viewTransaksi.checkByOut || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-black">Date Out Estimated:</span>
                <span className="text-black">{viewTransaksi.dateOut || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-black">Time Out Estimated:</span>
                <span className="text-black">{viewTransaksi.timeOut || '-'}</span>
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

      {/* Render Receipt hanya untuk printing, tidak ditampilkan di DOM */}
      <div style={{ display: 'none' }}>
        <Receipt ref={componentRef} transaksiData={printTransaksi} />
      </div>
    </div>
  );
};

export default DataLaundry;