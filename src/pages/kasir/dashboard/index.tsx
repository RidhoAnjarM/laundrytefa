import React, { useState } from "react";
import NavbarKasir from "@/pages/components/navbarkasir";
import axios from "axios";
import Cookies from "js-cookie";
import Modal from "@/pages/components/modal";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const DashboardKasir = () => {
  const [formData, setFormData] = useState({
    customer: "",
    itemType: "",
    pcs: "",
    weight: "",
    brand: "",
    color_description: "",
    remarks: "",
    supplyUsed: "",
    care_instruction: "",
    personInCharge: "",
    harga: "",
  });

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

  const handleSubmit = async () => {
    try {
      const token = Cookies.get("token");

      const cleanData = {
        ...formData,
        harga: parseInt(formData.harga.replace(/[^0-9]/g, ""), 10),
      };

      await axios.post(
        `${API_URL}/api/transaksilaundry`,
        cleanData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFormData({
        customer: "",
        itemType: "",
        pcs: "",
        weight: "",
        brand: "",
        color_description: "",
        remarks: "",
        supplyUsed: "",
        care_instruction: "",
        personInCharge: "",
        harga: "",
      });
      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error(error);
      setIsErrorModalOpen(true);
    }
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
              { id: "customer", label: "CUSTOMER" },
              { id: "itemType", label: "ITEM TYPE" },
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

            <div className="flex justify-between mb-[35px]">
              {[
                { id: "pcs", label: "PCS" },
                { id: "weight", label: "WEIGHT" },
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

            {[
              { id: "brand", label: "BRAND" },
              { id: "color_description", label: "COLOR/DESCRIPTION" },
              { id: "remarks", label: "REMARKS" },
              { id: "supplyUsed", label: "SUPPLY USED" },
              { id: "care_instruction", label: "CARE INSTRUCTION" },
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
              className="h-[50px] w-full flex justify-center items-center rounded-[5px] bg-custom-green hover:bg-white hover:border-2 hover:border-custom-green hover:text-custom-green ease-in-out duration-300 text-white text-[24px]"
            >
              PROCES
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
              className="w-[90px] h-[40px] bg-custom-green border-2 border-custom-green text-white rounded-[5px] hover:bg-white hover:text-custom-green ease-in-out duration-300 flex justify-center items-center"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_123_4)">
                  <path d="M17.5 7.5V3.01758C17.5 2.68594 17.3684 2.36836 17.134 2.13359L15.366 0.366016C15.1316 0.131641 14.8137 0 14.482 0H3.75C3.05977 0 2.5 0.559766 2.5 1.25V7.5C1.11914 7.5 0 8.61914 0 10V14.375C0 14.7203 0.279687 15 0.625 15H2.5V18.75C2.5 19.4402 3.05977 20 3.75 20H16.25C16.9402 20 17.5 19.4402 17.5 18.75V15H19.375C19.7203 15 20 14.7203 20 14.375V10C20 8.61914 18.8809 7.5 17.5 7.5ZM15 17.5H5V13.75H15V17.5ZM15 8.75H5V2.5H12.5V4.375C12.5 4.72031 12.7797 5 13.125 5H15V8.75ZM16.875 11.5625C16.3574 11.5625 15.9375 11.1426 15.9375 10.625C15.9375 10.107 16.3574 9.6875 16.875 9.6875C17.3926 9.6875 17.8125 10.107 17.8125 10.625C17.8125 11.1426 17.3926 11.5625 16.875 11.5625Z" />
                </g>
                <defs>
                  <clipPath id="clip0_123_4">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </button>

          </div>
        </div>
      </Modal >

      <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)}>
        <div className="p-4 text-center">
          <h2 className="text-2xl font-bold mb-6 text-green-600">Success!</h2>
          <p>Transaksi berhasil dibuat!</p>
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="w-[90px] h-[40px] bg-custom-green border-2 border-custom-green text-white rounded-[5px] hover:bg-white hover:text-custom-green ease-in-out duration-300"
            >
              OK
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isErrorModalOpen} onClose={() => setIsErrorModalOpen(false)}>
        <div className="p-4 text-center">
          <h2 className="text-2xl font-bold mb-6 text-red-600">Error!</h2>
          <p>Terjadi kesalahan saat membuat transaksi. Silakan coba lagi.</p>
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
