export type Transaksi = {
    [x: string]: any;
    id: number;
    customer: string;
    itemType: string;
    pcs: string;
    color_description: string;
    brand: string;
    care_instruction: string;
    remarks: string;
    weight: string;
    harga: string;
    date: string;
    timeIn: string;
    checkByIn: string;
    checkByOut: string;
    timeOut: string;
    personInCharge: string;
    supplyUsed: string;
    status: string;
};

export type User = {
    id: number;
    username: string;
    email: string;
    no_hp: string;
    role: string;
};
  