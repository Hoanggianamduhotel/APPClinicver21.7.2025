import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TextField, Paper, IconButton, Typography,
  Autocomplete, CircularProgress
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { supabase } from '@/lib/supabase';

interface ToaThuocDoctorProps {
  khambenhID: string;
}

// Interface cho danh mục thuốc từ kho
interface ThuocDanhMuc {
  id: string;
  ten_thuoc: string;
  don_vi_tinh: string;
}

interface MedicationRow {
  id: number;
  thuoc_id: string; // ID từ kho
  ten_thuoc: string;
  don_vi_tinh: string;
  so_lan_dung: number;
  so_luong_moi_lan: number;
  ghi_chu: string;
}

const ToaThuocDoctor: React.FC<ToaThuocDoctorProps> = ({ khambenhID }) => {
  const [medications, setMedications] = useState<MedicationRow[]>([]);
  const [danhMucThuoc, setDanhMucThuoc] = useState<ThuocDanhMuc[]>([]);
  const [loadingKho, setLoadingKho] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Load danh mục thuốc từ kho khi mở component
  useEffect(() => {
    const fetchKho = async () => {
      setLoadingKho(true);
      const { data, error } = await supabase
        .from('thuoc')
        .select('id, ten_thuoc, don_vi_tinh')
        .order('ten_thuoc', { ascending: true });
      
      if (!error) setDanhMucThuoc(data || []);
      setLoadingKho(false);
    };
    fetchKho();
  }, []);

  const handleAddRow = () => {
    const newRow: MedicationRow = {
      id: Date.now(),
      thuoc_id: '',
      ten_thuoc: '',
      don_vi_tinh: '',
      so_lan_dung: 2, // Mặc định sáng/chiều
      so_luong_moi_lan: 1,
      ghi_chu: '',
    };
    setMedications([...medications, newRow]);
  };

  const handleUpdateRow = (id: number, field: keyof MedicationRow, value: any) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const handleSave = async () => {
    if (!khambenhID) return alert('Chưa có thông tin khám bệnh');

    setIsSaving(true);
    try {
      // KIỂM TRA LOGIC 20 PHÚT
      const { data: currentVisit } = await supabase
        .from('khambenh')
        .select('created_at')
        .eq('id', khambenhID)
        .single();

      if (currentVisit) {
        const diff = (new Date().getTime() - new Date(currentVisit.created_at).getTime()) / 60000;
        if (diff > 20) {
          alert('Tờ điều trị đã khóa (quá 20 phút). Vui lòng tạo tờ điều trị mới!');
          setIsSaving(false);
          return;
        }
      }

      const toInsert = medications
        .filter(m => m.thuoc_id) // Chỉ lấy các dòng đã chọn thuốc
        .map(med => ({
          khambenh_id: khambenhID,
          thuoc_id: med.thuoc_id,
          ten_thuoc: med.ten_thuoc,
          so_lan_dung: med.so_lan_dung,
          so_luong_moi_lan: med.so_luong_moi_lan,
          tong_so_luong: med.so_lan_dung * med.so_luong_moi_lan,
          ghi_chu: med.ghi_chu,
        }));

      const { error } = await supabase.from('toathuoc').insert(toInsert);
      if (error) throw error;

      alert('Lưu đơn thuốc thành công!');
      setMedications([]);
    } catch (error: any) {
      alert('Lỗi: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button variant="outlined" onClick={handleAddRow} startIcon={<AddIcon />}>
          Thêm thuốc
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave} 
          disabled={medications.length === 0 || isSaving}
        >
          {isSaving ? 'Đang lưu...' : 'Lưu toa thuốc'}
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell width="35%">Tên thuốc (Từ kho)</TableCell>
              <TableCell width="10%">ĐVT</TableCell>
              <TableCell align="center">Lần/Ngày</TableCell>
              <TableCell align="center">SL/Lần</TableCell>
              <TableCell>Ghi chú</TableCell>
              <TableCell align="center">Xóa</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {medications.map((med) => (
              <TableRow key={med.id}>
                <TableCell>
                  <Autocomplete
                    options={danhMucThuoc}
                    loading={loadingKho}
                    getOptionLabel={(opt) => opt.ten_thuoc}
                    onChange={(_, val) => {
                      handleUpdateRow(med.id, 'thuoc_id', val?.id || '');
                      handleUpdateRow(med.id, 'ten_thuoc', val?.ten_thuoc || '');
                      handleUpdateRow(med.id, 'don_vi_tinh', val?.don_vi_tinh || '');
                    }}
                    renderInput={(params) => (
                      <TextField {...params} size="small" placeholder="Gõ tên thuốc..." />
                    )}
                  />
                </TableCell>
                <TableCell>{med.don_vi_tinh}</TableCell>
                <TableCell>
                  <TextField
                    type="number" size="small" value={med.so_lan_dung}
                    onChange={(e) => handleUpdateRow(med.id, 'so_lan_dung', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number" size="small" value={med.so_luong_moi_lan}
                    onChange={(e) => handleUpdateRow(med.id, 'so_luong_moi_lan', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth size="small" value={med.ghi_chu}
                    onChange={(e) => handleUpdateRow(med.id, 'ghi_chu', e.target.value)}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => setMedications(medications.filter(m => m.id !== med.id))} color="error">
                    <DeleteIcon />
                  </IconButton>
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
