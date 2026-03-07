import React, { useState, useEffect, useRef } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  TextField, Paper, IconButton, Autocomplete, Typography, Box 
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { supabase } from '@/lib/supabase';

// 1. Dùng 'export const' thay vì 'export default'
export const ToaThuocDoctor = ({ khambenhID }: { khambenhID: string }) => {
  const [savedToa, setSavedToa] = useState<any[]>([]);
  const [danhMucThuoc, setDanhMucThuoc] = useState<any[]>([]);

  const fetchData = async () => {
    const { data: kho } = await supabase.from('thuoc').select('*');
    if (kho) setDanhMucThuoc(kho);

    const { data: daKe } = await supabase.from('toathuoc').select('*, thuoc:thuoc_id(*)').eq('khambenh_id', khambenhID);
    if (daKe) setSavedToa(daKe);
  };

  useEffect(() => { fetchData(); }, [khambenhID]);

  const handleAdd = async (thuoc: any) => {
    if (!thuoc) return;
    await supabase.from('toathuoc').insert({
      khambenh_id: khambenhID,
      thuoc_id: thuoc.id,
      so_lan_dung: 2, so_luong_moi_lan: 1, so_ngay: 3,
      tong_so_luong: 6, thanh_tien: (thuoc.gia_ban || 0) * 6
    });
    fetchData();
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
            <TableCell sx={{ width: '30%' }}>Tên thuốc (Tìm & Chọn)</TableCell>
            <TableCell>Lần/N</TableCell>
            <TableCell>SL/L</TableCell>
            <TableCell>Ngày</TableCell>
            <TableCell>Tổng SL</TableCell>
            <TableCell>Đơn giá</TableCell>
            <TableCell>Thành tiền</TableCell>
            <TableCell>Ghi chú</TableCell>
            <TableCell>Xóa</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow sx={{ bgcolor: '#e3f2fd' }}>
            <TableCell colSpan={9}>
              <Autocomplete
                options={danhMucThuoc}
                getOptionLabel={(o) => o.ten_thuoc}
                onChange={(_, v) => handleAdd(v)}
                renderInput={(p) => (
                  <TextField {...p} label="Gõ tên thuốc và nhấn Enter để thêm vào toa..." variant="standard" fullWidth />
                )}
              />
            </TableCell>
          </TableRow>

          {savedToa.map((item) => (
            <TableRow key={item.id}>
              <TableCell sx={{ fontWeight: 'bold' }}>{item.thuoc?.ten_thuoc}</TableCell>
              <TableCell><TextField size="small" variant="standard" type="number" defaultValue={item.so_lan_dung} /></TableCell>
              <TableCell><TextField size="small" variant="standard" type="number" defaultValue={item.so_luong_moi_lan} /></TableCell>
              <TableCell><TextField size="small" variant="standard" type="number" defaultValue={item.so_ngay} /></TableCell>
              <TableCell>{item.tong_so_luong}</TableCell>
              <TableCell>{item.thuoc?.gia_ban?.toLocaleString()}</TableCell>
              <TableCell>{item.thanh_tien?.toLocaleString()}</TableCell>
              <TableCell><TextField size="small" variant="standard" defaultValue={item.ghi_chu} /></TableCell>
              <TableCell>
                <IconButton color="error" size="small" onClick={async () => { await supabase.from('toathuoc').delete().eq('id', item.id); fetchData(); }}><DeleteIcon /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
