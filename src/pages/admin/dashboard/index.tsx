import React from 'react'
import Navbar from '../../components/navbar';

const Dashboard = () => {
  return (
    <div>
      <Navbar />
      <div className="ms-[100px] flex flex-wrap justify-center">

        <div className=" w-full text-[30px] h-[45px] mt-[50px] ps-[40px] mb-[6px]">
          <h1>Dashboard</h1>
        </div>

        <div className="w-[1300px] h-[684px]">
          <table className="w-full h-[680px]">
            <tbody>
              <tr>
                {/* table orderan terakhir */}
                <td className="w-[900px] align-top" rowSpan={2}>
                  <div className="w-full flex justify-center text-[30px] text-custom-green font-extrabold mb-[40px]">
                    <h1>LAST ORDER</h1>
                  </div>
                  <table className='w-full border-collapse border-black border rounded-lg'>
                    <thead className='bg-custom-grey'>
                      <tr>
                        <th className='border border-black p-2'>Customer</th>
                        <th className='border border-black p-2'>Item type</th>
                        <th className='border border-black p-2'>PCS</th>
                        <th className='border border-black p-2'>Weight</th>
                        <th className='border border-black p-2'>Bill</th>
                        <th className='border border-black p-2'>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr>
                        <td className='border border-black p-2'></td>
                        <td className='border border-black p-2'></td>
                        <td className='border border-black p-2'></td>
                        <td className='border border-black p-2'></td>
                        <td className='border border-black p-2'></td>
                        <td className='border border-black p-2'></td>
                      </tr>
                    </tbody>
                  </table>

                </td>

                {/* pendapatan */}
                <td className="flex justify-end h-full">
                  <div className="w-[366px] h-[276px] rounded-[17px] bg-custom-grey overflow-hidden">

                    <div className="w-full h-[85px] bg-custom-green text-[30px] ps-[30px] flex items-center text-white">
                      <p>INCOME</p>
                    </div>

                    <div className="w-full h-full text-[32px] text-custom-green ps-[50px] pt-[60px]">
                      <p>Rp.000.000</p>
                    </div>

                  </div>
                </td>
              </tr>

              <tr>
                {/* laporan */}
                <td className="h-full flex justify-end">
                  <div className="w-[366px] h-[320px] rounded-[17px] bg-custom-grey overflow-hidden">

                    <div className="w-full h-[85px] bg-custom-green text-[30px] ps-[30px] flex items-center text-white">
                      <p>REPORT</p>
                    </div>

                    <div className="w-full h-full text-[20px] text-custom-green flex justify-between px-[30px] pt-[30px]">
                      <div className="">
                        <p className="mb-[30px]">Total Orders</p>
                        <p className="mb-[30px]">In Progress</p>
                        <p className="mb-[30px]">Finished</p>
                      </div>

                      <div className="">
                        <p className="mb-[30px]">0</p>
                        <p className="mb-[30px]">0</p>
                        <p className="mb-[30px]">0</p>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard