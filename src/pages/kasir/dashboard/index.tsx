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

      const cleanData = {
        ...formData,
        dateOut: formattedDateOut,
        timeOut: formattedTimeOut,
        dateIn: dateIn,
        timeIn: timeIn,
        harga: parseInt(formData.harga.replace(/[^0-9]/g, ""), 10),
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
      });

      setAddedBahan([]);

      const query = new URLSearchParams({
        noBill: noBill.toString(),
        customer: cleanData.customer,
        noTelepon: cleanData.noTelepon,
        service: cleanData.service,
        pcs: cleanData.pcs,
        weight: cleanData.weight,
        harga: cleanData.harga.toString(),
        dateIn: cleanData.dateIn,
        timeIn: cleanData.timeIn,
        dateOut: cleanData.dateOut || '',
        timeOut: cleanData.timeOut || '',
      }).toString();

      window.open(`/components/struk?${query}`, "_blank");

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
    } else if (id === "dateOut" || id === "timeOut") {
      setFormData((prevData) => ({ ...prevData, [id]: value }));
    }
    else {
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


  return (
    <div>
      <NavbarKasir />
      <div className="ms-[100px] flex flex-wrap justify-center z-0">
        <div className="w-full text-[30px] h-[45px] mt-[30px] ps-[40px] mb-[30px]">
          <h1>Dashboard</h1>
        </div>
        <div className="w-[780px] mb-[100px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setIsModalOpen(true);
            }}
            className="z-10"
          >
            {[{ id: "customer", label: "CUSTOMER", type: "text" },
            { id: "noTelepon", label: "PHONE NUMBER", type: "number" },
            { id: "itemType", label: "ITEM TYPE", type: "text" }].map(({ id, label, type }) => (
              <div className="h-[50px] relative flex rounded-[5px] mb-[35px]" key={id}>
                <input
                  id={id}
                  type={type}
                  className="peer w-full outline-none bg-black bg-opacity-20 px-4 rounded-[5px] focus:shadow-md text-black"
                  required
                  value={formData[id as keyof typeof formData]}
                  onChange={handleInputChange}
                  autoComplete="off"
                />
                <label
                  className="absolute text-black top-1/2 translate-y-[-50%] left-[40px] px-2 peer-focus:-top-2 peer-focus:left-3 font-bold peer-focus:text-[12px] peer-focus:text-black peer-valid:-top-2 peer-valid:left-3 peer-valid:text-[12px] peer-valid:text-black duration-150"
                  htmlFor={id}
                >
                  {label}
                </label>
              </div>
            ))}

            <div className="flex justify-between mb-[35px]">
              {[
                { id: "pcs", label: "PCS", type: "number" },
                { id: "weight", label: "WEIGHT", type: "text" },
              ].map(({ id, label, type }) => (
                <div className="w-[370px] h-[50px] relative flex rounded-[5px]" key={id}>
                  <input
                    id={id}
                    type={type}
                    className="peer w-full outline-none bg-black bg-opacity-20 px-4 rounded-[5px] focus:shadow-md text-black"
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
                  <label
                    className="absolute translate-y-[-50%] px-2 -top-2 left-3 font-bold text-[12px]"
                    htmlFor={id}
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>


            {[{ id: "color_description", label: "COLOR/DESCRIPTION" },
            { id: "brand", label: "BRAND" },
            { id: "care_instruction", label: "CARE INSTRUCTION" },
            { id: "remarks", label: "REMARKS" }].map(({ id, label }) => (
              <div className="h-[50px] relative flex rounded-[5px] mb-[35px]" key={id}>
                <input
                  id={id}
                  type="text"
                  className="peer w-full outline-none bg-black bg-opacity-20 px-4 rounded-[5px] focus:shadow-md text-black"
                  required
                  value={formData[id as keyof typeof formData]}
                  onChange={handleInputChange}
                  autoComplete="off"
                />
                <label
                  className="absolute text-black top-1/2 translate-y-[-50%] left-[40px] px-2 peer-focus:-top-2 peer-focus:left-3 font-bold peer-focus:text-[12px] peer-focus:text-black peer-valid:-top-2 peer-valid:left-3 peer-valid:text-[12px] peer-valid:text-black duration-150"
                  htmlFor={id}
                >
                  {label}
                </label>
              </div>
            ))}

            <div className="flex justify-between">
              <div className="relative rounded-[5px] mb-[35px] bg-black bg-opacity-20 p-4 h-[220px] w-[370px] ">
                <label
                  className="absolute translate-y-[-50%] px-2 -top-2 left-3 font-bold text-[12px]"
                  htmlFor="timeOut"
                >
                  SUPPLY USED
                </label>
                <div className="flex w-full justify-between">
                  <div className="h-[50px] relative flex rounded-[5px] w-[270px]">
                    <select
                      className="peer w-full outline-none border border-black bg-transparent px-4 rounded-[5px] focus:shadow-md text-black"
                      value={selectedBahan}
                      onChange={(e) => setSelectedBahan(e.target.value)}
                    >
                      <option value="">Select Supply</option>
                      {bahanOptions.map((bahan) => (
                        <option key={bahan.id} value={bahan.id.toString()}>
                          {bahan.namaBahan}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    className="bg-transparent border border-black rounded-[5px] w-[50px] h-[50px] shadow-md"
                    onClick={handleTambah}
                  >
                    +
                  </button>
                </div>
                <div className="mt-3">
                  <h2 className="font-bold text-md ">Selected Supplies</h2>
                  <ul className=" h-[100px] px-3 overflow-y-auto w-full">
                    {addedBahan.map((bahan, index) => (
                      <li key={index} className="mb-[5px] w-full flex justify-between">
                        - {bahanOptions.find((b) => b.id === bahan.bahanId)?.namaBahan || "Unknown Supply"}
                        <button
                          type="button"
                          className="ml-2 text-red-500"
                          onClick={() => handleHapus(bahan.bahanId)}
                        >
                          x
                        </button>
                      </li>

                    ))}
                  </ul>
                </div>
              </div>

              <div className="w-[370px]">
                <div className="h-[50px] relative flex rounded-[5px] mb-[35px]">
                  <select
                    id="service"
                    className="peer w-full outline-none bg-black bg-opacity-20 px-4 rounded-[5px] focus:shadow-md text-black"
                    required
                    value={formData.service}
                    onChange={handleServiceChange}
                  >
                    <option value="">Select Service</option>
                    <option value="Regular">Regular</option>
                    <option value="Express">Express</option>
                  </select>
                  <label
                    className="absolute translate-y-[-50%] px-2 -top-2 left-3 font-bold text-[12px]"
                    htmlFor="service"
                  >
                    SERVICE
                  </label>
                </div>

                <div className="h-[50px] relative flex rounded-[5px] mb-[35px]">
                  <input
                    id="dateOut"
                    type="date"
                    className="peer w-full outline-none bg-black bg-opacity-20 px-4 rounded-[5px] focus:shadow-md text-black"
                    value={formData.dateOut}
                    onChange={handleInputChange}
                    required
                  />
                  <label
                    className="absolute translate-y-[-50%] px-2 -top-2 left-3 font-bold text-[12px]"
                    htmlFor="dateOut"
                  >
                    DATEOUT ESTIMATED
                  </label>
                </div>

                <div className="h-[50px] relative flex rounded-[5px] mb-[35px]">
                  <input
                    id="timeOut"
                    type="time"
                    className="peer w-full outline-none bg-black bg-opacity-20 px-4 rounded-[5px] focus:shadow-md text-black"
                    value={formData.timeOut || ""}
                    onChange={handleInputChange}
                    required={formData.service === "Express"}
                  />
                  <label
                    className="absolute translate-y-[-50%] px-2 -top-2 left-3 font-bold text-[12px]"
                    htmlFor="timeOut"
                  >
                    TIMEOUT ESTIMATED
                  </label>
                </div>
              </div>
            </div>

            <div className="h-[50px] relative flex rounded-[5px] mb-[35px]">
              <input
                id="personInCharge"
                type="text"
                className="peer w-full outline-none bg-black bg-opacity-20 px-4 rounded-[5px] focus:shadow-md text-black"
                value={formData.personInCharge}
                onChange={handleInputChange}
                autoComplete="off"
                required
              />
              <label
                className="absolute text-black top-1/2 translate-y-[-50%] left-[40px] px-2 peer-focus:-top-2 peer-focus:left-3 font-bold peer-focus:text-[12px] peer-focus:text-black peer-valid:-top-2 peer-valid:left-3 peer-valid:text-[12px] peer-valid:text-black duration-150"
                htmlFor="personInCharge"
              >
                PERSON IN CHARGE
              </label>
            </div>

            <div className="h-[50px] relative flex rounded-[5px] mb-[35px]">
              <input
                id="harga"
                type="text"
                className="peer w-full outline-none bg-black bg-opacity-20 px-4 rounded-[5px] focus:shadow-md text-black"
                value={formData.harga}
                onChange={handleInputChange}
                required
                autoComplete="off"
              />
              <label
                className="absolute text-black top-1/2 translate-y-[-50%] left-[40px] px-2 peer-focus:-top-2 peer-focus:left-3 font-bold peer-focus:text-[12px] peer-focus:text-black peer-valid:-top-2 peer-valid:left-3 peer-valid:text-[12px] peer-valid:text-black duration-150"
                htmlFor="harga"
              >
                Bill
              </label>
            </div>

            <button
              type="submit"
              className="h-[50px] relative flex rounded-[5px] bg-custom-green justify-center items-center border-2 border-custom-green text-white hover:text-custom-green hover:bg-white ease-in-out duration-300 w-full"
            >
              PROCESS
            </button>
          </form>
        </div>
      </div>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-6 text-center text-custom-green">Confirm Data!!</h2>
            <ul>
              {Object.entries(formData).map(([key, value]) => (
                <li key={key} className="mb-2">
                  {key.toUpperCase().replace("_", " ")}: <strong>{value}</strong>
                </li>
              ))}
            </ul>
            <div className="flex justify-end mt-10 gap-8">
              <button
                onClick={() => setIsModalOpen(false)}
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
                OK
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
                OK
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
              className="mt-4 px-5 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
              onClick={() => setIsModalOpenStok(false)}
            >
              OK
            </button>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default DashboardKasir;
