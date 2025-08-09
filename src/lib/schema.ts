// Copy from shared/schema.ts
export interface BenhNhan {
  id: number
  ten: string
  tuoi: number
  gioitinh: string
  sodienthoai: string
  diachi: string
  ngaysinh: string
  created_at: string
}

export interface ToaThuoc {
  id: number
  benhnhan_id: number
  thuoc_data: any[]
  tong_tien: number
  phi_kham: number
  created_at: string
}

export interface Thuoc {
  id: number
  ten: string
  gia: number
  donvi: string
  soluongton: number
}

export interface KhamBenh {
  id: number
  benhnhan_id: number
  chandoan: string
  ghichu: string
  ngaykham: string
  created_at: string
}