import React from 'react';
import { useRouter } from 'next/router';

const Struk = () => {
  const router = useRouter();
  const transaksi = router.query;

  return (
    <div>
      <div className="w-full flex justify-center items-center">
        <div className="w-[800px] h-[550px] shadow-custom-black bg-white mt-20 flex flex-col">
          <div className="w-full justify-between flex pt-[30px] ">
            <div className="flex">
              <p className="w-[80px] h-[80px] bg-[#E70008] rounded-full flex items-center justify-center ms-[50px]">
                <img src="../images/logo.png" alt="" className='w-[76px] h-[74px]' />
              </p>
              <h1 className='font-bold text-[#E70008] text-[24px] mt-[20px] ms-6'>MILENIAL LAUNDRY</h1>
            </div>
            <div className="text-[14px] font-medium me-[140px]">
              <p className='mb-5'>Bill No  : {transaksi.id || '-'}</p>
              <p>Tgl.Masuk  : {transaksi.dateIn || '-'}</p>
              <p>Waktu Masuk : {transaksi.timeIn || '-'}</p>
              <p>Tgl.Keluar :  {transaksi.dateOut || '-'}</p>
              <p className="mt-[20px]">Nama : {transaksi.customer || '-'}</p>
              <p>Telepon : {transaksi.noTelepon || '-'}</p>
            </div>
          </div>

          <div className="w-full px-[50px] mt-[4px] flex-1">
            <table className="w-full">
              <thead>
                <tr className="bg-custom-grey">
                  <th className="border border-black">ItemTipe</th>
                  <th className="border border-black">Jasa</th>
                  <th className="border border-black w-[100px]">KG</th>
                  <th className="border border-black w-[70px]">PCS</th>
                  <th className="border border-black w-[150px]">Harga</th>
                  <th className="border border-black w-[150px]">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-center">
                  <td className="border border-black">{transaksi.itemType}</td>
                  <td className="border border-black">{transaksi.service || '-'}({transaksi.itemType})</td>
                  <td className="border border-black">{transaksi.weight || '-'}</td>
                  <td className="border border-black">{transaksi.pcs || '-'}</td>
                  <td className="border border-black">Rp {Number(transaksi.harga).toLocaleString("id-ID")}</td>
                  <td className="border border-black">Rp {Number(transaksi.harga).toLocaleString("id-ID")}</td>
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
                  <td className="border border-black">Rp {Number(transaksi.biayaLayanan).toLocaleString("id-ID")}</td>
                </tr>
                <tr className="text-center">
                  <td className="border border-black" colSpan={5}>Total</td>
                  <td className="border border-black">Rp {Number(transaksi.subTotal).toLocaleString("id-ID")}</td>
                </tr>
              </tbody>
            </table>
            <div className="w-full flex justify-end my-2">
              <div className="flex gap-4">
                <p>Dp = {Number(transaksi.dp).toLocaleString("id-ID")}</p>
                <p>Sisa = {Number(transaksi.sisa).toLocaleString("id-ID")}</p>
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
      </div>
    </div>
  );
};

export default Struk;
