import React from 'react';
import { useRouter } from 'next/router';

const Struk = () => {
  const router = useRouter();
  const transaksi = router.query;

  return (
    <div>
      <div className="w-full flex justify-center items-center">
        <div className="w-[800px] h-[500px] shadow-custom-black bg-white mt-20 flex flex-col">
          {/* Bagian atas */}
          <div className="w-full justify-end flex pt-[47px] pe-[140px]">
            <div className="text-[14px] font-medium">
              <p>Tgl.Masuk  : {transaksi.date || '-'}</p>
              <p>Tgl.Keluar :  </p>
              <p className="mt-[38px]">Nama : {transaksi.customer || '-'}</p>
            </div>
          </div>

          {/* Tabel */}
          <div className="w-full px-[50px] mt-[12px] flex-1">
            <table className="w-full">
              <thead>
                <tr className="bg-custom-grey">
                  <th className="border border-black">Jasa</th>
                  <th className="border border-black w-[70px]">KG</th>
                  <th className="border border-black w-[70px]">Pcs</th>
                  <th className="border border-black w-[150px]">Harga</th>
                  <th className="border border-black w-[150px]">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-center">
                  <td className="border border-black">{transaksi.care_instruction || '-'}</td>
                  <td className="border border-black">{transaksi.weight || '-'}</td>
                  <td className="border border-black">{transaksi.pcs || '-'}</td>
                  <td className="border border-black">Rp.{transaksi.harga || '-'}</td>
                  <td className="border border-black">Rp.{transaksi.harga || '-'}</td>
                </tr>
                {/* Baris kosong tambahan */}
                <tr className="text-center">
                  <td className="border border-black p-3"></td>
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
                </tr>
                <tr className="text-center">
                  <td className="border border-black" colSpan={4}>Total</td>
                  <td className="border border-black">Rp.{transaksi.harga || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bagian bawah */}
          <div className="w-full flex justify-between px-[100px] mb-[45px]">
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
  );
};

export default Struk;
