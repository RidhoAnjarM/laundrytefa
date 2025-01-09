import React, { useState, useEffect } from "react";
import NavbarKasir from "@/components/navbarkasir";
import axios from "axios";
import Cookies from "js-cookie";
import Modal from "@/components/modal";
import { Bahan, FormData, AddedBahan } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  });

  const [bahanOptions, setBahan] = useState<Bahan[]>([]);
  const [selectedBahan, setSelectedBahan] = useState<string>("");
  const [addedBahan, setAddedBahan] = useState<AddedBahan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenStok, setIsModalOpenStok] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [dp, setDp] = useState<string>("");
  const [total, setTotal] = useState<number>(0);
  const [isClosing, setIsClosing] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");

      const formattedDateOut = formData.dateOut
        ? new Date(formData.dateOut).toISOString().split("T")[0]
        : null;

      const formattedTimeOut = formData.timeOut || null;

      const dateIn = new Date().toISOString().split("T")[0];

      const timeIn = new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      console.log("Formatted Date:", formattedDateOut);
      console.log("Formatted Time:", formattedTimeOut);

      const dpValue = dp ? parseInt(dp.replace(/[^0-9]/g, ""), 10) : 0;

      const cleanData = {
        ...formData,
        dateOut: formattedDateOut,
        timeOut: formattedTimeOut,
        dateIn: dateIn,
        timeIn: timeIn,
        harga: parseInt(formData.harga.replace(/[^0-9]/g, ""), 10),
        biayaLayanan: parseInt(formData.harga.replace(/[^0-9]/g, ""), 10) * 0.21,
        subTotal: parseInt(formData.harga.replace(/[^0-9]/g, ""), 10) + (parseInt(formData.harga.replace(/[^0-9]/g, ""), 10) * 0.21),
        sisa: (parseInt(formData.harga.replace(/[^0-9]/g, ""), 10) + (parseInt(formData.harga.replace(/[^0-9]/g, ""), 10) * 0.21)) - dpValue,
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
        subTotal: "",
      });

      setAddedBahan([]);
      setDp("");
      setTotal(0);

      const query = new URLSearchParams({
        noBill: noBill.toString(),
        itemType: cleanData.itemType,
        customer: cleanData.customer,
        noTelepon: cleanData.noTelepon,
        service: cleanData.service,
        pcs: cleanData.pcs,
        weight: cleanData.weight,
        harga: cleanData.harga.toString(),
        dp: cleanData.dp.toString(),
        biayaLayanan: cleanData.biayaLayanan.toString(),
        subTotal: cleanData.subTotal.toString(),
        sisa: cleanData.sisa.toString(),
        dateIn: cleanData.dateIn,
        timeIn: cleanData.timeIn,
        dateOut: cleanData.dateOut || '',
        timeOut: cleanData.timeOut || '',
      }).toString();

      window.open(`/strukkasir?${query}`, "_blank");

      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      setLoading(false);
      console.error("Error saat membuat transaksi:", error.response || error.message);
      setIsErrorModalOpen(true);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === "harga") {
      const numericValue = value.replace(/[^0-9]/g, "");
      const formattedValue = numericValue
        ? `Rp ${parseInt(numericValue).toLocaleString("id-ID")}`
        : "";
      setFormData((prevData) => ({ ...prevData, [id]: formattedValue }));

      const hargaNumeric = parseInt(numericValue, 10);
      const subtotal = hargaNumeric * 0.21; //biaya layanan
      setTotal(hargaNumeric ? hargaNumeric + subtotal : 0);
    } else if (id === "dp") {
      const numericValue = value.replace(/[^0-9]/g, "");
      const formattedValue = numericValue
        ? `Rp ${parseInt(numericValue).toLocaleString("id-ID")}`
        : "";
      setDp(formattedValue);
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
      timeOut: value === "Express" ? "" : undefined,
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
      <div className="ms-[210px] flex flex-wrap justify-center z-0">
        <div className="w-full text-center font-ruda text-[20px] font-black mt-[40px] mb-[30px]">
          <h1>Transaction Form</h1>
        </div>

        <div className="w-[1000px] mb-[100px] px-[85px] py-[70px] bg-white rounded-[30px] shadow-lg">
          {/* form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setIsModalOpen(true);
            }}
            className="z-10"
          >
            <div className="w-full flex justify-between">
              {/* customer, notel */}
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
                    />
                  </div>
                ))}
              </div>

              {/* service, date, time */}
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
                    />
                    <input
                      id="timeOut"
                      type="time"
                      className="h-[50px] w-[165px] peer outline-none bg-custom-gray-1 px-4 focus:shadow-md text-black rounded-[10px] border border-custom-gray-2 mb-[8px] font-sans"
                      value={formData.timeOut || ""}
                      onChange={handleInputChange}
                      required={formData.service === "Express"}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-[820px] border border-custom-gray-2 my-[30px] mx-auto rounded"></div>

            {/* item, deskription, brand, care, remarks */}
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
                      required
                      value={formData[id as keyof typeof formData]}
                      onChange={handleInputChange}
                      autoComplete="off"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full flex justify-between">
              {/* supply & total */}
              <div>
                <div className="w-[370px] h-[180px] bg-custom-gray-1 p-[20px] border border-custom-gray-2 rounded-[10px]">
                  <div className="flex w-full justify-between items-center">
                    <div className="">
                      <select
                        className="w-[280px] h-[42px] flex rounded-[10px] bg-white border border-custom-gray-2 outline-none text-[14px] font-ruda px-[30px]"
                        value={selectedBahan}
                        onChange={(e) => setSelectedBahan(e.target.value)}
                      >
                        <option value="">select supply</option>
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
                        <div key={index} className="font-ruda text-[14px] font-extrabold">
                          - {bahanOptions.find((b) => b.id === bahan.bahanId)?.namaBahan || "Unknown Supply"}
                          <button
                            type="button"
                            className="me-2 text-red-500"
                            onClick={() => handleHapus(bahan.bahanId)}
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="w-[370px] border border-custom-gray-2 mt-[30px] mb-[15px] mx-auto rounded"></div>

                <div>
                  <label
                    className="flex font-ruda ms-[40px] mb-[5px] font-extrabold text-[14px]"
                    htmlFor="harga"
                  >
                    Total
                  </label>
                  <input
                    id="total"
                    type="text"
                    className="h-[50px] w-[370px] peer outline-none bg-custom-gray-1 px-4 focus:shadow-md text-black rounded-[10px] border border-custom-gray-2 mb-[8px]"
                    value={`Rp ${total.toLocaleString("id-ID")}`}
                    readOnly
                  />
                </div>
              </div>

              <div className="">
                {/* pcs & weight */}
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

                {/* person in charge */}
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

                {/* bill */}
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

                {/* dp */}
                <div>
                  <label
                    className="flex font-ruda ms-[40px] mb-[5px] font-extrabold text-[14px]"
                    htmlFor="dp"
                  >
                    Down Payment
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
                className="w-[200px] h-[50px] bg-custom-green rounded-[10px] text-white font-ruda text-[20px] flex justify-center items-center hover:bg-green-500 transition-colors"
              >
                Process
              </button>
            </div>
          </form>
        </div>
      </div>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
          <div className="">
            <h2 className="text-2xl mb-4 text-center text-custom-green font-russo">Confirm Data</h2>
            <div className="p-4 max-h-[500px] overflow-y-auto">
              <div className="space-y-2">
                {Object.entries(formData).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b border-gray-300 py-2">
                    <span className="font-semibold me-2">{key.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase())}</span>
                    <span className="text-gray-700 text-wrap">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between border-b border-gray-300 py-2">
                  <span className="font-semibold">Total</span>
                  <span className="text-gray-700">{`Rp ${total.toLocaleString("id-ID")}`}</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 py-2">
                  <span className="font-semibold">Down payment</span>
                  <span className="text-gray-700">{dp}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-4">
              <button
                onClick={handleCloseModal}
                className="w-[90px] h-[40px] bg-white border-2 border-custom-green text-custom-green rounded-[5px] hover:bg-custom-green hover:border-custom-green hover:text-white ease-in-out duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="w-[90px] h-[40px] bg-custom-green text-white border-2 border-custom-green hover:bg-white hover:text-custom-green ease-in-out duration-300 flex items-center justify-center rounded-[5px]"
              >
                {loading ? (
                  <div className="flex flex-row gap-2">
                    <div className="w-2 h-2 rounded-full bg-custom-grey animate-bounce [animation-delay:.7s]"></div>
                    <div className="w-2 h-2 rounded-full bg-custom-grey animate-bounce [animation-delay:.3s]"></div>
                    <div className="w-2 h-2 rounded-full bg-custom-grey animate-bounce [animation-delay:.7s]"></div>
                  </div>
                ) : (
                  "Print"
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {isSuccessModalOpen && (
        <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)}>
          <div className="p-4 text-center">
            <h2 className="text-2xl font-bold mb-6 text-green-600">Success!</h2>
            <p>Transaction created successfully!</p>
            <div className="flex justify-center mt-10">
              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="w-[90px] h-[40px] bg-custom-green text-white border-2 border-custom-green hover:bg-white hover:text-custom-green ease-in-out duration-300 flex items-center justify-center rounded-[5px]"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {isErrorModalOpen && (
        <Modal isOpen={isErrorModalOpen} onClose={() => setIsErrorModalOpen(false)}>
          <div className="p-4 text-center">
            <h2 className="text-2xl font-bold mb-6 text-red-600">Error!</h2>
            <p>An error occurred while creating a transaction. Please try again.</p>
            <div className="flex justify-center mt-10">
              <button
                onClick={() => setIsErrorModalOpen(false)}
                className="w-[90px] h-[40px] bg-red-600 border-2 border-red-600 text-white rounded-[5px] hover:bg-white hover:text-red-600 ease-in-out duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {isModalOpenStok && (
        <Modal isOpen={isModalOpenStok} onClose={() => setIsModalOpen(false)}>
          <div className="text-center">
            <p>{modalMessage}</p>
            <button
              className="mt-4 w-[90px] h-[40px] bg-blue-500 text-white rounded hover:bg-blue-700"
              onClick={() => setIsModalOpenStok(false)}
            >
              Close
            </button>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default DashboardKasir;
