// ToaThuocDoctor.tsx - Simple prescription component
import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TextField, 
  Paper, 
  IconButton,
  Typography 
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { supabase } from '@/lib/supabase';

interface ToaThuocDoctorProps {
  khambenhID: string;
}

interface MedicationRow {
  id: number;
  ten_thuoc: string;
  so_lan_dung: number;
  so_luong_moi_lan: number;
  ghi_chu: string;
}

const ToaThuocDoctor: React.FC<ToaThuocDoctorProps> = ({ khambenhID }) => {
  const [medications, setMedications] = useState<MedicationRow[]>([]);
  const [nextId, setNextId] = useState(1);

  const handleAddRow = () => {
    const newRow: MedicationRow = {
      id: nextId,
      ten_thuoc: '',
      so_lan_dung: 1,
      so_luong_moi_lan: 1,
      ghi_chu: '',
    };
    setMedications([...medications, newRow]);
    setNextId(nextId + 1);
  };

  const handleRemoveRow = (id: number) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const handleUpdateRow = (id: number, field: keyof MedicationRow, value: string | number) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const handleSave = async () => {
    if (!khambenhID) {
      alert('Chưa có thông tin khám bệnh');
      return;
    }

    const validMedications = medications.filter(med => med.ten_thuoc.trim() !== '');
    
    if (validMedications.length === 0) {
      alert('Vui lòng thêm ít nhất một loại thuốc');
      return;
    }

    try {
      const toInsert = validMedications.map(med => ({
        khambenh_id: parseInt(khambenhID),
        ten_thuoc: med.ten_thuoc,
        so_lan_dung: med.so_lan_dung,
        so_luong_moi_lan: med.so_luong_moi_lan,
        tong_so_luong: med.so_lan_dung * med.so_luong_moi_lan,
        ghi_chu: med.ghi_chu,
      }));

      const { error } = await supabase
        .from('toathuoc')
        .insert(toInsert);

      if (error) throw error;

      alert(`Đã lưu ${validMedications.length} loại thuốc thành công!`);
      setMedications([]);
      setNextId(1);
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert('Có lỗi xảy ra khi lưu toa thuốc');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          variant="outlined"
          onClick={handleAddRow}
          startIcon={<AddIcon />}
        >
          Thêm thuốc
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={medications.length === 0}
        >
          Lưu toa thuốc
        </Button>
      </Box>

      {medications.length > 0 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Tên thuốc</TableCell>
                <TableCell align="center">Số lần/ngày</TableCell>
                <TableCell align="center">SL mỗi lần</TableCell>
                <TableCell>Ghi chú</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {medications.map((med) => (
                <TableRow key={med.id}>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      value={med.ten_thuoc}
                      onChange={(e) => handleUpdateRow(med.id, 'ten_thuoc', e.target.value)}
                      placeholder="Nhập tên thuốc"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      value={med.so_lan_dung}
                      onChange={(e) => handleUpdateRow(med.id, 'so_lan_dung', parseInt(e.target.value) || 1)}
                      inputProps={{ min: 1, style: { textAlign: 'center' } }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      value={med.so_luong_moi_lan}
                      onChange={(e) => handleUpdateRow(med.id, 'so_luong_moi_lan', parseInt(e.target.value) || 1)}
                      inputProps={{ min: 1, style: { textAlign: 'center' } }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      value={med.ghi_chu}
                      onChange={(e) => handleUpdateRow(med.id, 'ghi_chu', e.target.value)}
                      placeholder="Ghi chú"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveRow(med.id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {medications.length === 0 && (
        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
          Nhấn "Thêm thuốc" để bắt đầu kê đơn
        </Typography>
      )}
    </Box>
  );
};

export default ToaThuocDoctor;