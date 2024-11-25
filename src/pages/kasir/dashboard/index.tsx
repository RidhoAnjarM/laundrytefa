import React, { useState, useEffect } from "react";
import NavbarKasir from "@/pages/components/navbarkasir";
import axios from "axios";
import Cookies from "js-cookie";
import Modal from "@/pages/components/modal";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Tipe untuk form data transaksi
type FormData = {
  customer: string;
  noTelepon: string;
  itemType: string;
  pcs: string;
  weight: string;
  brand: string;
  color_description: string;
  remarks: string;
  service: string;
  care_instruction: string;
  personInCharge: string;
  harga: string;
};

// Tipe untuk bahan yang diambil dari API
type Bahan = {
  id: number;
  namaBahan: string;
  stok: number;
  createdAt: string;
  updatedAt: string;
};

// Tipe untuk bahan yang dipilih untuk supply
type AddedBahan = {
  bahanId: number;
};

// Tipe untuk data yang akan dikirim saat create transaksi
type CreateTransaksiData = FormData & {
  supplyUsed: AddedBahan[];
};

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
  });

  const [bahanOptions, setBahanOptions] = useState<Bahan[]>([]);
  const [selectedBahan, setSelectedBahan] = useState<string>("");
  const [addedBahan, setAddedBahan] = useState<AddedBahan[]>([])



  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    if (id === "harga") {
      const numericValue = value.replace(/[^0-9]/g, "");
      const formattedValue = numericValue
        ? `Rp ${parseInt(numericValue).toLocaleString("id-ID")}`
        : "";
      setFormData((prevData) => ({ ...prevData, [id]: formattedValue }));
    } else {
      setFormData((prevData) => ({ ...prevData, [id]: value }));
    }
  };

  const handleTambah = () => {
    if (selectedBahan) {
      const bahanToAdd = bahanOptions.find((bahan) => bahan.id.toString() === selectedBahan);
      if (bahanToAdd) {
        setAddedBahan((prev) => [...prev, { bahanId: bahanToAdd.id }]);
        setSelectedBahan("");
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const token = Cookies.get("token");

      const cleanData = {
        ...formData,
        harga: parseInt(formData.harga.replace(/[^0-9]/g, ""), 10),
        supplyUsed: addedBahan,
      };

      await axios.post(
        `${API_URL}/api/transaksilaundry`,
        cleanData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

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
      });

      setAddedBahan([]);
      const query = new URLSearchParams(cleanData as unknown as Record<string, string>).toString();
      window.open(`/struk?${query}`, "_blank");

      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error(error);
      setIsErrorModalOpen(true);
    }
  };

  useEffect(() => {
    const fetchBahan = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/bahan`);
        setBahanOptions(response.data.data);
      } catch (error) {
        console.error("Error fetching bahan:", error);
      }
    };

    fetchBahan();
  }, []);


  // Handle perubahan pilihan bahan
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBahan(event.target.value);
  };



  return (
    <div>
      <NavbarKasir />
      <div className="ms-[100px] flex flex-wrap justify-center">
        <div className="w-full text-[30px] h-[45px] mt-[30px] ps-[40px] mb-[30px]">
          <h1>Dashboard</h1>
        </div>
        <div className="w-[780px] mb-[100px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setIsModalOpen(true);
            }}
          >
            {[
              { id: "customer", label: "CUSTOMER", type: "text" },
              { id: "noTelepon", label: "PHONE NUMBER", type: "number" },
              { id: "itemType", label: "ITEM TYPE", type: "text" },
            ].map(({ id, label, type }) => (
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
            </div>

            {[
              { id: "color_description", label: "COLOR/DESCRIPTION" },
              { id: "brand", label: "BRAND" },
              { id: "care_instruction", label: "CARE INSTRUCTION" },
              { id: "remarks", label: "REMARKS" },
            ].map(({ id, label }) => (
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
              <div className="h-[150px] w-[370px] relative rounded-[5px] mb-[35px] bg-black bg-opacity-20 p-3">
                <label className="absolute text-black -top-4 left-3 px-2 font-bold text-[12px]">
                  SUPPLY USED
                </label>
                <div className="flex justify-between w-full">
                  <select
                    value={selectedBahan}
                    onChange={(e) => setSelectedBahan(e.target.value)}
                  >
                    <option value="">Pilih Bahan</option>
                    {bahanOptions.map((bahan) => (
                      <option key={bahan.id} value={bahan.id.toString()}>
                        {bahan.namaBahan}
                      </option>
                    ))}
                  </select>

                  <button onClick={handleTambah}>Tambah Bahan</button>

                </div>
                <div className="mt-2">
                  <h3>Bahan yang Ditambahkan:</h3>
                  <ul>
                    {addedBahan.map((bahan, index) => (
                      <li key={index}>{bahan.bahanId}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="w-[370px]">
                <div className="w-full h-[50px] bg-black bg-opacity-20 rounded-[5px] mb-[35px] relative">
                  <select name="" id="service" className="w-full bg-transparent h-[50px] p-3 rounded-[5px]">
                    <option value="">..</option>
                    <option value="">Express</option>
                    <option value="">Standar</option>
                  </select>
                  <label className="absolute text-black -top-4 left-3 px-2 font-bold text-[12px]" htmlFor="service">
                    SERVICE
                  </label>
                </div>
                <div className="flex relative">
                  <input type="date" className="w-full h-[50px] bg-black bg-opacity-20 rounded-[5px] p-3" />
                  <label className="absolute text-black -top-4 left-3 px-2 font-bold text-[12px]" htmlFor="service">
                    ESTIMATED DATEOUT
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-between mb-[35px]">
              {[
                { id: "personInCharge", label: "PERSON IN CHARGE" },
                { id: "harga", label: "BILL" },
              ].map(({ id, label }) => (
                <div className="w-[370px] h-[50px] relative flex rounded-[5px]" key={id}>
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
            </div>

            <button
              type="submit"
              className="h-[50px] w-full flex justify-center items-center rounded-[5px] bg-custom-green hover:bg-white border-2 border-custom-green hover:text-custom-green ease-in-out duration-300 text-white text-[24px]"
            >
              PROCESS
            </button>
          </form>
        </div>
      </div>

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
              className="w-[90px] h-[40px] bg-custom-green text-white border-2 border-custom-green  hover:bg-white hover:text-custom-green ease-in-out duration-300 flex items-center justify-center rounded-[5px]"
            >
              Print
            </button>
          </div>
        </div>
      </Modal >

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
    </div >
  );
};

export default DashboardKasir;
