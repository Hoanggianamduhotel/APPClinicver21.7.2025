// DanhSachChoGrid.tsx - Tối ưu hiển thị 2 cột & Truyền dữ liệu đầy đủ
import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase } from '@/lib/supabase';

// Định nghĩa Interface khớp với cấu trúc bảng danhsachcho của bạn
interface Patient {
  id: number;
  benhnhan_id: string; // UUID
  ho_ten: string;
  ngay_sinh: string;
  thang_tuoi: number;
  can_nang: number;
  dia_chi: string;
  so_dien_thoai: string;
  gioi_tinh: string;
}

interface DanhSachChoGridProps {
  onSelect: (patient: any) => void;
  selectedId: string;
}

const DanhSachChoGrid: React.FC<DanhSachChoGridProps> = ({ onSelect, selectedId }) => {
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    fetchWaitingList();
  }, []);

  const fetchWaitingList = async () => {
    // Truy vấn đầy đủ các cột cần thiết để hiển thị bên DoctorView
    const { data, error } = await supabase
      .from('danhsachcho')
      .select('id, benhnhan_id, ho_ten, ngay_sinh, thang_tuoi, can_nang, dia_chi, so_dien_thoai, gioi_tinh')
      .order('id', { ascending: true });
    
    if (error) {
      console.error('Error fetching waiting list:', error);
      return;
    }
    
    setPatients(data || []);
  };

  const handleRemoveFromQueue = async (uuid: string) => {
    const { error } = await supabase
      .from('danhsachcho')
      .delete()
      .eq('benhnhan_id', uuid);
    
    if (error) {
      console.error('Error removing from queue:', error);
      return;
    }
    
    fetchWaitingList();
  };

  // Logic tính tuổi chuẩn y khoa
  const hienThiTuoiTheoThang = (thangTuoi: number | null | undefined) => {
    if (thangTuoi === null || thangTuoi === undefined) return "-";
    if (thangTuoi < 24) return `${thangTuoi} th`;
    
    const nam = Math.floor(thangTuoi / 12);
    const thangLe = thangTuoi % 12;
    return thangLe === 0 ? `${nam} tuổi` : `${nam}t ${thangLe}th`;
  };

  // Cấu hình 2 cột chính: Họ tên và Tuổi
  const columns: GridColDef[] = [
    { 
      field: 'ho_ten', 
      headerName: 'Họ tên', 
      flex: 1.3,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'thang_tuoi_display', 
      headerName: 'Tuổi', 
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'actions',
      headerName: '',
      width: 40,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveFromQueue(params.row.benhnhan_id);
          }}
          sx={{ color: '#d32f2f' }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 1.5, bgcolor: '#1976d2', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          DANH SÁCH CHỜ
        </Typography>
        <Typography variant="subtitle1">
          {patients.length}
        </Typography>
      </Box>

      <DataGrid
        rows={patients.map((p) => ({
          ...p,
          id: p.id, // ID chính cho DataGrid
          thang_tuoi_display: hienThiTuoiTheoThang(p.thang_tuoi),
        }))}
        columns={columns}
        onRowClick={(params) => onSelect(params.row)} // Truyền toàn bộ object row (có địa chỉ, sđt...)
        sx={{
          border: 'none',
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
            backgroundColor: (params: any) => 
              params.row?.benhnhan_id === selectedId ? '#e3f2fd !important' : 'inherit',
            '&:hover': { bgcolor: '#f5f5f5' }
          },
          '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' },
          '& .MuiDataGrid-cell:focus': { outline: 'none' },
        }}
        hideFooter
        disableColumnMenu
        disableRowSelectionOnClick
      />
    </Box>
  );
};

export default DanhSachChoGrid;
