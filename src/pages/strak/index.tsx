import { GetServerSideProps } from 'next';

const Struk = ({ transaksi }: { transaksi: any }) => {
  return (
    <div className="w-full flex justify-center items-center">
      <div className="w-[800px] h-[500px] shadow-custom-black bg-white mt-20 flex flex-col">
        {/* Bagian atas */}
        <div className="w-full justify-end flex pt-[47px] pe-[140px]">
          <div className="text-[14px] font-medium">
            <p>Tgl.Masuk  : {transaksi.date}</p>
            <p>Tgl.Keluar : {transaksi.timeOut}</p>
            <p className="mt-[38px]">Nama : {transaksi.customer}</p>
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
                <td className="border border-black">{transaksi.care_instruction}</td>
                <td className="border border-black">{transaksi.weight}</td>
                <td className="border border-black">{transaksi.pcs}</td>
                <td className="border border-black">Rp {parseInt(transaksi.harga).toLocaleString("id-ID")}</td>
                <td className="border border-black">Rp {parseInt(transaksi.harga).toLocaleString("id-ID")}</td>
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
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const query = context.query;

  const transaksi = {
    date: query.date || 'Data Tidak Tersedia',
    timeOut: query.timeOut || 'Data Tidak Tersedia',
    customer: query.customer || 'Data Tidak Tersedia',
    care_instruction: query.care_instruction || 'Data Tidak Tersedia',
    weight: query.weight || 'Data Tidak Tersedia',
    pcs: query.pcs || 'Data Tidak Tersedia',
    harga: query.harga || 'Data Tidak Tersedia',
  };

  return {
    props: { transaksi },
  };
};

export default Struk;
