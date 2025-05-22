'use client'

import React, { useState, useEffect, useRef } from "react";
import NavbarKasir from "@/components/navbarkasir";
import axios from "axios";
import Cookies from "js-cookie";
import Modal from "@/components/modal";
import Alert from "@/components/alert";
import { useReactToPrint } from "react-to-print";
import { Bahan, FormData, AddedBahan } from "@/types";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Komponen Struk terpisah untuk printing
const Receipt = React.forwardRef<HTMLDivElement, { transaksiData: any }>(
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
            <p className='mb-3'>Bill No: {transaksiData.noBill || '-'}</p>
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

const DashboardKasir = () => {
  const [formData, setFormData] = useState<FormData>({
    customer: "",
    noTelepon: "",
    itemType: "",
    pcs: "",
    weight: "",
    brand: "",
    color_description: "",
    remarks: "",
    service: "",
    care_instruction: "",
    personInCharge: "",
    harga: "",
    dateOut: "",
    timeOut: "",
  });

  const [bahanOptions, setBahan] = useState<Bahan[]>([]);
  const [selectedBahan, setSelectedBahan] = useState<string>("");
  const [addedBahan, setAddedBahan] = useState<AddedBahan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenStok, setIsModalOpenStok] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [dp, setDp] = useState<string>("");
  const [total, setTotal] = useState<number>(0);
  const [isClosing, setIsClosing] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [transaksiData, setTransaksiData] = useState<any>(null);

  const componentRef = useRef<HTMLDivElement>(null);

  // Gunakan useReactToPrint dengan konfigurasi yang benar
  const handlePrint = useReactToPrint({
    documentTitle: `Struk_Laundry_${transaksiData?.noBill || 'unknown'}`,
    onAfterPrint: () => {
      console.log("Printing completed");
      setAlert(null);
      setTransaksiData(null); // Reset transaksiData setelah print
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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");

      const formattedDateOut = formData.dateOut
        ? new Date(formData.dateOut).toISOString().split("T")[0]
        : null;

      const formattedTimeOut = formData.timeOut || null;

      const dateIn = new Date().toISOString().split("T")[0];

      const timeIn = new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const dpValue = dp ? parseInt(dp.replace(/[^0-9]/g, ""), 10) : 0;

      const hargaNumeric = parseInt(formData.harga.replace(/[^0-9]/g, ""), 10);
      const biayaLayanan = Math.floor(hargaNumeric * 0.21); // Bulatkan ke bilangan bulat
      const subTotal = Math.floor(hargaNumeric + biayaLayanan); // Bulatkan ke bilangan bulat
      const sisa = subTotal - dpValue; // Gunakan subTotal yang sudah bulat

      const cleanData = {
        ...formData,
        dateOut: formattedDateOut,
        timeOut: formattedTimeOut,
        dateIn: dateIn,
        timeIn: timeIn,
        harga: hargaNumeric,
        biayaLayanan,
        subTotal,
        sisa,
        dp: dpValue,
        supplyUsed: addedBahan,
      };

      const response = await axios.post(
        `${API_URL}/api/transaksilaundry`,
        cleanData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      setLoading(false);

      const noBill = response.data.data.transaksi.id;
      const newTransaksiData = {
        noBill,
        customer: cleanData.customer,
        noTelepon: cleanData.noTelepon,
        service: cleanData.service,
        pcs: cleanData.pcs,
        weight: cleanData.weight,
        harga: cleanData.harga,
        dateIn: cleanData.dateIn,
        timeIn: cleanData.timeIn,
        dateOut: cleanData.dateOut || "",
        biayaLayanan: cleanData.biayaLayanan,
        subTotal: cleanData.subTotal,
        dp: dpValue,
        sisa: cleanData.sisa,
        itemType: cleanData.itemType,
      };

      setTransaksiData(newTransaksiData);

      setFormData({
        customer: "",
        noTelepon: "",
        itemType: "",
        pcs: "",
        weight: "",
        brand: "",
        color_description: "",
        remarks: "",
        service: "",
        care_instruction: "",
        personInCharge: "",
        harga: "",
        dateOut: "",
        timeOut: "",
      });

      setAddedBahan([]);
      setDp("");
      setTotal(0);
      setIsModalOpen(false);
      setAlert({ type: "success", message: "Transaction created successfully!" });

      // Langsung print setelah transaksi sukses
      setTimeout(() => {
        triggerPrint();
      }, 100); // Delay kecil untuk memastikan componentRef ter-render
    } catch (error: any) {
      setLoading(false);
      console.error("Error saat membuat transaksi:", error.response || error.message);
      setAlert({
        type: "error",
        message: "An error occurred while creating a transaction. Please try again.",
      });
    }
  };

  useEffect(() => {
    const fetchBahan = async () => {
      try {
        if (!API_URL) {
          console.error("API_URL is not defined in the environment variables.");
          return;
        }

        const token = Cookies.get("token");
        if (!token) {
          console.error("Token tidak ditemukan");
          return;
        }

        const apiUrl = `${API_URL}/api/bahan`;
        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        if (response.data && response.data.data) {
          setBahan(response.data.data);
        } else {
          console.error("The data is empty or in an unexpected format");
        }
      } catch (error) {
        console.error("Error fetching Supply:", error);
      }
    };

    fetchBahan();
  }, []);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === "harga") {
      const numericValue = value.replace(/[^0-9]/g, "");
      const formattedValue = numericValue
        ? `Rp ${parseInt(numericValue).toLocaleString("id-ID")}`
        : "";
      setFormData((prevData) => ({ ...prevData, [id]: formattedValue }));

      const hargaNumeric = parseInt(numericValue, 10);
      const subtotal = hargaNumeric * 0.21;
      setTotal(hargaNumeric ? Math.floor(hargaNumeric + subtotal) : 0); // Bulatkan ke bilangan bulat
    } else if (id === "dp") {
      const numericValue = value.replace(/[^0-9]/g, "");
      const dpNumeric = parseInt(numericValue, 10) || 0;

      // Check if dp exceeds total
      if (dpNumeric > total && total > 0) {
        setIsModalOpenStok(true);
        setModalMessage(`Down payment cannot exceed total amount of Rp ${total.toLocaleString("id-ID")}.`);
        setDp(total ? `Rp ${total.toLocaleString("id-ID")}` : "");
      } else {
        const formattedValue = numericValue
          ? `Rp ${parseInt(numericValue).toLocaleString("id-ID")}`
          : "";
        setDp(formattedValue);
      }
    } else if (id === "dateOut" || id === "timeOut") {
      setFormData((prevData) => ({ ...prevData, [id]: value }));
    } else {
      setFormData((prevData) => ({ ...prevData, [id]: value }));
    }
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      service: value,
      timeOut: value === "Express" ? prevData.timeOut : "",
    }));
  };

  const handleTambah = () => {
    if (selectedBahan) {
      const bahanToAdd = bahanOptions.find(
        (bahan) => bahan.id.toString() === selectedBahan
      );

      if (bahanToAdd) {
        if (bahanToAdd.stokAkhir === 0) {
          setIsModalOpenStok(true);
          setModalMessage(`Supply ${bahanToAdd.namaBahan} is out of stock.`);
          return;
        }

        if (addedBahan.some((bahan) => bahan.bahanId === bahanToAdd.id)) {
          setIsModalOpenStok(true);
          setModalMessage(`Supply ${bahanToAdd.namaBahan} has already been added.`);
          return;
        }

        setAddedBahan((prev) => [...prev, { bahanId: bahanToAdd.id }]);
        setSelectedBahan("");
      } else {
        setIsModalOpenStok(true);
        setModalMessage("Selected supply is invalid.");
      }
    } else {
      setIsModalOpenStok(true);
      setModalMessage("Please select a supply.");
    }
  };

  const handleHapus = (id: number) => {
    setAddedBahan(addedBahan.filter((bahan) => bahan.bahanId !== id));
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
    }, 300);
  };

  return (
    <div>
      <NavbarKasir />
      <div className="ms-[210px] flex flex-wrap justify-center z-0 text-black">
        <div className="w-full text-center font-ruda text-[20px] font-black mt-[40px] mb-[30px]">
          <h1>Transaction Form</h1>
        </div>

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <div className="w-[1000px] mb-[100px] px-[85px] py-[70px] bg-white rounded-[30px] shadow-lg">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setIsModalOpen(true);
            }}
            className="z-10"
          >
            <div className="w-full flex justify-between">
              <div>
                {[{ id: "customer", label: "Customer Name", type: "text" },
                { id: "noTelepon", label: "Phone Number", type: "number" }].map(({ id, label, type }) => (
                  <div className="w-full" key={id}>
                    <label
                      className="flex font-ruda ms-[40px] mb-[5px] font-extrabold text-[14px]"
                      htmlFor={id}
                    >
                      {label}
                    </label>
                    <input
                      id={id}
                      type={type}
                      className="h-[50px] w-[370px] peer outline-none bg-custom-gray-1 px-4 focus:shadow-md text-black rounded-[10px] border border-custom-gray-2 mb-[8px]"
                      required
                      value={formData[id as keyof typeof formData]}
                      onChange={handleInputChange}
                      autoComplete="off"
                      min={id === "noTelepon" ? "0" : undefined}
                    />
                  </div>
                ))}
              </div>

              <div>
                <div className="">
                  <label
                    className="flex font-ruda ms-[40px] mb-[5px] font-extrabold text-[14px]"
                    htmlFor="service"
                  >
                    Service
                  </label>
                  <select
                    id="service"
                    className="h-[50px] w-[370px] peer outline-none bg-custom-gray-1 px-4 focus:shadow-md text-black rounded-[10px] border border-custom-gray-2 mb-[8px] font-sans"
                    required
                    value={formData.service}
                    onChange={handleServiceChange}
                  >
                    <option value="">Select Service</option>
                    <option value="Regular">Regular</option>
                    <option value="Express">Express</option>
                  </select>
                </div>

                <div>
                  <label
                    className="flex font-ruda text-center mb-[5px] ms-[70px] font-extrabold text-[14px]"
                  >
                    DateOut & TimeOut (estimated)
                  </label>
                  <div className="w-[370px] flex justify-between">
                    <input
                      id="dateOut"
                      type="date"
                      className="h-[50px] w-[165px] peer outline-none bg-custom-gray-1 px-4 focus:shadow-md text-black rounded-[10px] border border-custom-gray-2 mb-[8px] font-sans"
                      value={formData.dateOut}
                      onChange={handleInputChange}
                      required
                      min={new Date().toISOString().split("T")[0]}
                    />
                    <Flatpickr
                      id="timeOut"
                      className="h-[50px] w-[165px] peer outline-none bg-custom-gray-1 px-4 focus:shadow-md text-black rounded-[10px] border border-custom-gray-2 mb-[8px] font-sans"
                      value={formData.timeOut}
                      onChange={(dates: Date[], dateStr: string, instance: any) => {
                        const timeValue = dates[0]
                          ? dates[0].toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                          : "";
                        setFormData((prevData) => ({ ...prevData, timeOut: timeValue }));
                      }}
                      options={{
                        enableTime: true,
                        noCalendar: true,
                        dateFormat: "H:i",
                        time_24hr: true,
                        minuteIncrement: 5,
                      }}
                      placeholder="Select time"
                      required={formData.service === "Express"}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-[820px] border border-custom-gray-2 my-[30px] mx-auto rounded"></div>

            <div className="">
              <div className="">
                {[{ id: "itemType", label: "Item Type" },
                { id: "color_description", label: "Color/Description" },
                { id: "brand", label: "Brand" },
                { id: "care_instruction", label: "Care Instruction" },
                { id: "remarks", label: "Remarks" }].map(({ id, label }) => (
                  <div key={id} className="flex justify-end items-center">
                    <label
                      className="font-ruda font-extrabold text-[16px] mb-[30px]"
                      htmlFor={id}
                    >
                      {label}
                    </label>
                    <input
                      id={id}
                      type="text"
                      className="h-[50px] w-[645px] peer outline-none bg-custom-gray-1 px-4 focus:shadow-md text-black rounded-[10px] border border-custom-gray-2 mb-[30px] ms-[30px] font-sans"
                      value={formData[id as keyof typeof formData]}
                      onChange={handleInputChange}
                      autoComplete="off"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full flex justify-between">
              <div>
                <div className="w-[370px] h-[180px] bg-custom-gray-1 p-[20px] border border-custom-gray-2 rounded-[10px]">
                  <div className="flex w-full justify-between items-center">
                    <div>
                      <select
                        className="w-[280px] h-[42px] rounded-[10px] bg-white border border-custom-gray-2 outline-none text-[14px] font-ruda px-[30px]"
                        value={selectedBahan}
                        onChange={(e) => setSelectedBahan(e.target.value)}
                      >
                        <option value="">Select supply</option>
                        {bahanOptions.map((bahan) => (
                          <option key={bahan.id} value={bahan.id.toString()}>
                            {bahan.namaBahan}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      className="text-[32px] font-extrabold font-ruda text-custom-green hover:text-custom-gray-2 transition-colors"
                      onClick={handleTambah}
                    >
                      +
                    </button>
                  </div>
                  <div className="mt-3">
                    <ul className="w-[330px] h-[78px] overflow-y-auto bg-white rounded-[10px] border border-custom-gray-2 px-[20px] py-[10px]">
                      {addedBahan.map((bahan, index) => (
                        <li key={index} className="flex justify-between items-center font-ruda text-[14px] font-extrabold">
                          <span>- {bahanOptions.find((b) => b.id === bahan.bahanId)?.namaBahan || "Unknown Supply"}</span>
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700 transition-colors"
                            onClick={() => handleHapus(bahan.bahanId)}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="w-[370px] border border-custom-gray-2 mt-[30px] mb-[15px] mx-auto rounded"></div>

                <div>
                  <label
                    className="flex font-ruda ms-[40px] mb-[5px] font-extrabold text-[14px]"
                    htmlFor="total"
                  >
                    Total
                  </label>
                  <input
                    id="total"
                    type="text"
                    className="h-[50px] w-[370px] peer outline-none bg-custom-gray-1 px-4 focus:shadow-md text-black rounded-[10px] border border-custom-gray-2 mb-[8px]"
                    value={`Rp ${Math.floor(total).toLocaleString("id-ID")}`}
                    readOnly
                  />
                </div>
              </div>

              <div className="">
                <div className="flex justify-between w-[370px] -mt-[25px]">
                  {[{ id: "pcs", label: "PCS", type: "number" },
                  { id: "weight", label: "Weight", type: "text" }].map(({ id, label, type }) => (
                    <div key={id}>
                      <label
                        className="flex font-ruda ms-[40px] mb-[5px] font-extrabold text-[14px]"
                        htmlFor={id}
                      >
                        {label}
                      </label>
                      <input
                        id={id}
                        type={type}
                        className="h-[50px] w-[165px] peer outline-none bg-custom-gray-1 px-4 focus:shadow-md text-black rounded-[10px] border border-custom-gray-2 mb-[8px] font-sans"
                        value={formData[id as keyof typeof formData]}
                        onChange={(e) => {
                          const { value } = e.target;

                          if (id === "pcs") {
                            const numericValue = parseInt(value, 10);
                            if (numericValue >= 0 || value === "") {
                              handleInputChange(e);
                            }
                          } else {
                            handleInputChange(e);
                          }
                        }}
                        autoComplete="off"
                        min={id === "pcs" ? "0" : undefined}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label
                    className="flex font-ruda ms-[40px] mb-[5px] font-extrabold text-[14px]"
                    htmlFor="personInCharge"
                  >
                    Person In Charge
                  </label>
                  <input
                    id="personInCharge"
                    type="text"
                    className="h-[50px] w-[370px] peer outline-none bg-custom-gray-1 px-4 focus:shadow-md text-black rounded-[10px] border border-custom-gray-2 mb-[8px]"
                    value={formData.personInCharge}
                    onChange={handleInputChange}
                    autoComplete="off"
                    required
                  />
                </div>

                <div>
                  <label
                    className="flex font-ruda ms-[40px] mb-[5px] font-extrabold text-[14px]"
                    htmlFor="harga"
                  >
                    Bill
                  </label>
                  <input
                    id="harga"
                    type="text"
                    className="h-[50px] w-[370px] peer outline-none bg-custom-gray-1 px-4 focus:shadow-md text-black rounded-[10px] border border-custom-gray-2 mb-[8px]"
                    value={formData.harga}
                    onChange={handleInputChange}
                    required
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label
                    className="flex font-ruda ms-[40px] mb-[5px] font-extrabold text-[14px]"
                    htmlFor="dp"
                  >
                    DP (Down Payment)
                  </label>
                  <input
                    id="dp"
                    type="text"
                    className="h-[50px] w-[370px] peer outline-none bg-custom-gray-1 px-4 focus:shadow-md text-black rounded-[10px] border border-custom-gray-2 mb-[8px]"
                    value={dp}
                    onChange={handleInputChange}
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>

            <div className="w-full flex justify-end mt-[20px]">
              <button
                type="submit"
                className="w-[200px] h-[50px] bg-custom-green rounded-[10px] text-white font-ruda text-[24px] flex justify-center items-center hover:bg-green-800 transition-colors"
              >
                Process
              </button>
            </div>
          </form>
        </div>
      </div>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
          <div className="text-black">
            <h2 className="text-2xl mb-4 text-center font-ruda font-extrabold">CONFIRM DATA</h2>
            <div className="p-4 max-h-[500px] overflow-y-auto">
              <div className="space-y-2 font-ruda text-[14px]">
                {Object.entries(formData).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b border-gray-300 py-2">
                    <p className="font-semibold me-4">{key.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase())}</p>
                    <p className="text-wrap text-end">{value || '-'}</p>
                  </div>
                ))}
                <div className="flex justify-between border-b border-gray-300 py-2">
                  <p className="font-semibold">Total</p>
                  <p>{`Rp ${Math.floor(total).toLocaleString("id-ID")}`}</p>
                </div>
                <div className="flex justify-between border-b border-gray-300 py-2">
                  <p className="font-semibold">Down Payment</p>
                  <p>{dp || '-'}</p>
                </div>
                <div className="flex justify-between border-b border-gray-300 py-2">
                  <p className="font-semibold">Supply Used</p>
                  <p>
                    {addedBahan.length > 0
                      ? addedBahan.map(b => bahanOptions.find(opt => opt.id === b.bahanId)?.namaBahan).join(', ')
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-6 gap-4">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-600 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-custom-green text-white font-semibold rounded-full hover:bg-green-800 hover:shadow-lg transition-all duration-200"
              >
                {loading ? (
                  <div className="flex flex-row gap-2">
                    <div className="w-2 h-2 rounded-full bg-custom-grey animate-bounce [animation-delay:.7s]"></div>
                    <div className="w-2 h-2 rounded-full bg-custom-grey animate-bounce [animation-delay:.3s]"></div>
                    <div className="w-2 h-2 rounded-full bg-custom-grey animate-bounce [animation-delay:.7s]"></div>
                  </div>
                ) : (
                  "PRINT"
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {isModalOpenStok && (
        <Modal isOpen={isModalOpenStok} onClose={() => setIsModalOpenStok(false)}>
          <div className="text-center text-black">
            <h2 className="text-2xl font-semibold font-ruda text-center mb-3">Notification!</h2>
            <p className="font-ruda text-wrap text-[16px]">{modalMessage}</p>
            <button
              className="mt-4 px-6 py-2 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-600 transition-all duration-200"
              onClick={() => setIsModalOpenStok(false)}
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Render Receipt hanya untuk printing, tidak ditampilkan di DOM */}
      <div style={{ display: 'none' }}>
        <Receipt ref={componentRef} transaksiData={transaksiData} />
      </div>
    </div>
  );
};

export default DashboardKasir;