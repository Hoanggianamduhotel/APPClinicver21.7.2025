import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TextField, Paper, IconButton, Typography,
  Autocomplete, Card, CardContent
} from '@mui/material';
import { Delete as DeleteIcon, ReceiptLong as ReceiptIcon } from '@mui/icons-material';
import { supabase } from '@/lib/supabase';

interface ToaThuocDoctorProps {
  khambenhID: string;
}

const ToaThuocDoctor: React.FC<ToaThuocDoctorProps> = ({ khambenhID }) => {
  const [savedToa, setSavedToa] = useState<any[]>([]);
  const [danhMucThuoc, setDanhMucThuoc] = useState<any[]>([]);

  // 1. Fetch dữ liệu
  const fetchData = useCallback(async () => {
    if (!khambenhID) return;

    // Load kho thuốc
    const { data: kho } = await supabase
      .from('thuoc')
      .select('id, ten_thuoc, don_vi, gia_ban')
      .order('ten_thuoc');
    if (kho) setDanhMucThuoc(kho);

    // Load toa thuốc
    const { data: daKe } = await supabase
      .from('toathuoc')
      .select(`*, thuoc:thuoc_id(ten_thuoc, gia_ban)`)
      .eq('khambenh_id', khambenhID)
      .order('created_at', { ascending: true });
    if (daKe) setSavedToa(daKe);
  }, [khambenhID]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 2. Thêm thuốc mới (Tự động insert vào DB)
  const handleAddMedication = async (thuoc: any) => {
    if (!thuoc) return;
    
    const { error } = await supabase.from('toathuoc').insert({
      khambenh_id: khambenhID,
      thuoc_id: thuoc.id,
      so_lan_dung: 2,
      so_luong_moi_lan: 1,
      so_ngay: 3,
      tong_so_luong: 6, // 2*1*3
      don_vi: thuoc.don_vi,
      thanh_tien: (thuoc.gia_ban || 0) * 6,
      ghi_chu: '',
      trang_thai: 'Chờ'
    });

    if (!error) fetchData();
  };

  // 3. Cập nhật và tính toán lại ngay khi thay đổi số liệu
  const handleUpdateRow = async (item: any, field: string, value: any) => {
    const val = field === 'ghi_chu' ? value : Number(value);
    
    const so_lan = field === 'so_lan_dung' ? val : (item.so_lan_dung || 0);
    const sl_lan = field === 'so_luong_moi_lan' ? val : (item.so_luong_moi_lan || 0);
    const so_ngay = field === 'so_ngay' ? val : (item.so_ngay || 1);
    const gia = item.thuoc?.gia_ban || 0;

    const moi_tong_sl = so_lan * sl_lan * so_ngay;
    const moi_thanh_tien = moi_tong_sl * gia;

    await supabase.from('toathuoc').update({
      [field]: val,
      tong_so_luong: moi_tong_sl,
      thanh_tien: moi_thanh_tien
    }).eq('id', item.id);

    fetchData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('toathuoc').delete().eq('id', id);
    fetchData();
  };

  const tongTienToa = savedToa.reduce((sum, i) => sum + (i.thanh_tien || 0), 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Ô TÌM KIẾM NHANH */}
      <Card variant="outlined" sx={{ bgcolor: '#f8f9fa' }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>TÌM & THÊM THUỐC</Typography>
          <Autocomplete
            options={danhMucThuoc}
            getOptionLabel={(o) => `${o.ten_thuoc} - Giá: ${o.gia_ban?.toLocaleString()}đ`}
            onChange={(_, v) => handleAddMedication(v)}
            renderInput={(p) => <TextField {...p} placeholder="Gõ tên thuốc..." size="small" fullWidth />}
          />
        </CardContent>
      </Card>

      {/* DANH SÁCH CHI TIẾT */}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Tên thuốc</TableCell>
              <TableCell align="center" width="70">Lần/N</TableCell>
              <TableCell align="center" width="70">SL/L</TableCell>
              <TableCell align="center" width="70">Ngày</TableCell>
              <TableCell align="center" width="90">Tổng SL</TableCell>
              <TableCell align="right" width="100">Đơn giá</TableCell>
              <TableCell align="right" width="100">Thành tiền</TableCell>
              <TableCell width="250">Ghi chú (Dặn dò)</TableCell>
              <TableCell align="center" width="50"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {savedToa.map((item) => (
              <TableRow key={item.id}>
                <TableCell><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{item.thuoc?.ten_thuoc}</Typography></TableCell>
                <TableCell align="center"><TextField variant="standard" type="number" value={item.so_lan_dung} onChange={(e) => handleUpdateRow(item, 'so_lan_dung', e.target.value)} /></TableCell>
                <TableCell align="center"><TextField variant="standard" type="number" value={item.so_luong_moi_lan} onChange={(e) => handleUpdateRow(item, 'so_luong_moi_lan', e.target.value)} /></TableCell>
                <TableCell align="center"><TextField variant="standard" type="number" value={item.so_ngay || 1} onChange={(e) => handleUpdateRow(item, 'so_ngay', e.target.value)} /></TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>{item.tong_so_luong}</TableCell>
                <TableCell align="right">{item.thuoc?.gia_ban?.toLocaleString()}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{item.thanh_tien?.toLocaleString()}đ</TableCell>
                <TableCell><TextField variant="standard" fullWidth value={item.ghi_chu || ''} onChange={(e) => handleUpdateRow(item, 'ghi_chu', e.target.value)} /></TableCell>
                <TableCell align="center"><IconButton size="small" onClick={() => handleDelete(item.id)} color="error"><DeleteIcon fontSize="small" /></IconButton></TableCell>
              </TableRow>
            ))}
            
            {savedToa.length > 0 && (
              <TableRow sx={{ bgcolor: '#fffde7' }}>
                <TableCell colSpan={6} align="right" sx={{ fontWeight: 'bold' }}>TỔNG TIỀN:</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#d32f2f', fontSize: '1.1rem' }}>{tongTienToa.toLocaleString()}đ</TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ToaThuocDoctor;
