import { useRouter } from "next/router";

const Struk = () => {
  const router = useRouter();
  const { noBill, customer, noTelepon, service, pcs, weight, harga, dateIn, timeIn, dateOut, timeOut } = router.query;

  return (
    <div>
      <div className="w-full flex justify-center items-center">
        <div className="w-[800px] h-[500px] shadow-custom-black bg-white mt-20 flex flex-col">
          <div className="w-full justify-between flex pt-[30px] ">
            <div className="flex">
              <p className="w-[80px] h-[80px] bg-[#E70008] rounded-full flex items-center justify-center ms-[50px]">
                <img src="../images/logo.png" alt="" className='w-[76px] h-[74px]' />
              </p>
              <h1 className='font-bold text-[#E70008] text-[24px] mt-[20px] ms-6'>MILENIAL HOTEL</h1>
            </div>
            <div className="text-[14px] font-medium me-[140px]">
              <p className='mb-3'>Bill No  : {noBill || '-'}</p>
              <p>Tgl.Masuk  : {dateIn || '-'}</p>
              <p>Waktu Masuk : {timeIn || '-'}</p>
              <p>Tgl.Keluar : {dateOut || '-'}</p>
              <p className="mt-[10px]">Nama : {customer || '-'}</p>
              <p>Telepon : {noTelepon || '-'}</p>
            </div>
          </div>

          <div className="w-full px-[50px] mt-[4px] flex-1">
            <table className="w-full">
              <thead>
                <tr className="bg-custom-grey">
                  <th className="border border-black">Jasa</th>
                  <th className="border border-black w-[100px]">KG</th>
                  <th className="border border-black w-[70px]">PCS</th>
                  <th className="border border-black w-[150px]">Harga</th>
                  <th className="border border-black w-[150px]">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-center">
                  <td className="border border-black">{service || '-'}</td>
                  <td className="border border-black">{weight || '-'}</td>
                  <td className="border border-black">{pcs || '-'}</td>
                  <td className="border border-black">Rp {Number(harga).toLocaleString("id-ID")}</td>
                  <td className="border border-black">Rp {Number(harga).toLocaleString("id-ID")}</td>
                </tr>
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
                  <td className="border border-black p-3"></td>
                  <td className="border border-black"></td>
                  <td className="border border-black"></td>
                  <td className="border border-black"></td>
                  <td className="border border-black"></td>
                </tr>
                <tr className="text-center">
                  <td className="border border-black" colSpan={4}>Total</td>
                  <td className="border border-black">Rp {Number(harga).toLocaleString("id-ID")}</td>
                </tr>
              </tbody>
            </table>
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
