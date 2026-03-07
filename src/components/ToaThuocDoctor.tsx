import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  TextField, Paper, IconButton, Typography, Autocomplete, Card, CardContent 
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { supabase } from '@/lib/supabase';

const ToaThuocDoctor: React.FC<{ khambenhID: string }> = ({ khambenhID }) => {
  const [savedToa, setSavedToa] = useState<any[]>([]);
  const [danhMucThuoc, setDanhMucThuoc] = useState<any[]>([]);
  
  // Refs để điều hướng phím Enter
  const searchInputRef = useRef<any>(null);

  const fetchData = useCallback(async () => {
    if (!khambenhID) return;
    const { data: kho } = await supabase.from('thuoc').select('*').order('ten_thuoc');
    if (kho) setDanhMucThuoc(kho);

    const { data: daKe } = await supabase.from('toathuoc').select('*, thuoc:thuoc_id(*)').eq('khambenh_id', khambenhID);
    if (daKe) setSavedToa(daKe);
  }, [khambenhID]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Thêm thuốc
  const handleAddMedication = async (thuoc: any) => {
    if (!thuoc) return;
    await supabase.from('toathuoc').insert({
      khambenh_id: khambenhID,
      thuoc_id: thuoc.id,
      so_lan_dung: 2, sl_luong_moi_lan: 1, so_ngay: 3,
      tong_so_luong: 6,
      thanh_tien: (thuoc.gia_ban || 0) * 6
    });
    fetchData();
    // Sau khi thêm, focus về ô tìm kiếm
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  // Cập nhật thông số
  const handleUpdate = async (item: any, field: string, value: any) => {
    const val = field === 'ghi_chu' ? value : Number(value);
    const updates: any = { [field]: val };
    
    // Tự động tính lại tổng nếu sửa số lượng/ngày
    if (['so_lan_dung', 'so_luong_moi_lan', 'so_ngay'].includes(field)) {
      const sl = (field === 'so_lan_dung' ? val : item.so_lan_dung) * (field === 'so_luong_moi_lan' ? val : item.so_luong_moi_lan) * (field === 'so_ngay' ? val : item.so_ngay);
      updates.tong_so_luong = sl;
      updates.thanh_tien = sl * (item.thuoc?.gia_ban || 0);
    }

    await supabase.from('toathuoc').update(updates).eq('id', item.id);
    fetchData();
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>KÊ ĐƠN THUỐC</Typography>
      
      {/* Ô SEARCH NẰM ĐẦU */}
      <Autocomplete
        options={danhMucThuoc}
        getOptionLabel={(o) => `${o.ten_thuoc} (${o.gia_ban?.toLocaleString()}đ)`}
        onChange={(_, v) => handleAddMedication(v)}
        renderInput={(p) => <TextField {...p} inputRef={searchInputRef} label="Tìm thuốc (Enter để thêm)" variant="outlined" sx={{ mb: 3 }} />}
      />

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell>Tên thuốc</TableCell>
              <TableCell>Lần/N</TableCell>
              <TableCell>SL/L</TableCell>
              <TableCell>Ngày</TableCell>
              <TableCell>Tổng</TableCell>
              <TableCell>Đơn giá</TableCell>
              <TableCell>Thành tiền</TableCell>
              <TableCell>Ghi chú</TableCell>
              <TableCell>Xóa</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {savedToa.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.thuoc?.ten_thuoc}</TableCell>
                <TableCell><TextField variant="standard" type="number" size="small" value={item.so_lan_dung} onChange={(e) => handleUpdate(item, 'so_lan_dung', e.target.value)} /></TableCell>
                <TableCell><TextField variant="standard" type="number" size="small" value={item.so_luong_moi_lan} onChange={(e) => handleUpdate(item, 'so_luong_moi_lan', e.target.value)} /></TableCell>
                <TableCell><TextField variant="standard" type="number" size="small" value={item.so_ngay} onChange={(e) => handleUpdate(item, 'so_ngay', e.target.value)} /></TableCell>
                <TableCell>{item.tong_so_luong}</TableCell>
                <TableCell>{item.thuoc?.gia_ban?.toLocaleString()}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{item.thanh_tien?.toLocaleString()}</TableCell>
                <TableCell>
                  <TextField 
                    variant="standard" fullWidth size="small" value={item.ghi_chu || ''} 
                    onChange={(e) => handleUpdate(item, 'ghi_chu', e.target.value)}
                    onKeyDown={(e) => { if(e.key === 'Enter') searchInputRef.current?.focus(); }} // Enter tại ghi chú -> về ô tìm thuốc
                  />
                </TableCell>
                <TableCell>
                  <IconButton color="error" onClick={async () => { await supabase.from('toathuoc').delete().eq('id', item.id); fetchData(); }}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ToaThuocDoctor;
