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
    timeIn: string;
    checkByIn: string;
    timeOut: string;
    checkByOut: string;
    personInCharge: string;
    supplyUsed: string;
    service: string;
    status: string;
    noTelepon: string;
    dateIn: string;
    dateOut: string;
    dateOutAktual: string;
    timeOutAktual: string;
};

export type Bahan = {
    id: number;
    namaBahan: string;
};

export type User = {
    id: number;
    username: string;
    email: string;
    password: string;
    no_hp: string;
    role: string;
};

export interface PendapatanPerHari {
    tanggal: string;
    total_pendapatan: string;
    total_transaksi: number;
}

export interface PendapatanPerBulan {
    bulan: number;
    total_pendapatan: string;
    total_transaksi: number;
}

export interface PendapatanPerTahun {
    tahun: number;
    total_pendapatan: string;
    total_transaksi: number;
}

export interface PendapatanResponse {
    total_pendapatan: number;
    total_transaksi: number;
}
