import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase } from '@/lib/supabase';

// 1. Sửa Interface để khớp với SQL (benhnhan_id là string/uuid)
interface Patient {
  id: number; // Cột serial trong SQL
  benhnhan_id: string; // UUID từ bảng benhnhan
  ho_ten: string;
  ngay_sinh: string;
  thang_tuoi: number;
  can_nang: string;
  dia_chi: string;
  so_dien_thoai: string;
}

interface DanhSachChoGridProps {
  onSelect: (patient: Patient) => void;
  selectedId: string;
}

const DanhSachChoGrid: React.FC<DanhSachChoGridProps> = ({ onSelect, selectedId }) => {
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    fetchWaitingList();
  }, []);

  const fetchWaitingList = async () => {
    // 2. Sửa order('created_at') thành order('id') hoặc bỏ order nếu không cần
    const { data, error } = await supabase
      .from('danhsachcho')
      .select('id, benhnhan_id, ho_ten, ngay_sinh, thang_tuoi, can_nang, dia_chi, so_dien_thoai')
      .order('id', { ascending: true }); // Sắp xếp theo ID tự tăng
    
    if (error) {
      console.error('Error fetching waiting list:', error);
      return;
    }
    
    setPatients(data || []);
  };

  // 3. Sửa kiểu dữ liệu tham số thành string cho UUID
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

  const hienThiTuoiTheoThang = (thangTuoi: number | null | undefined) => {
    if (thangTuoi === null || thangTuoi === undefined) return "-";
    if (thangTuoi < 24) return `${thangTuoi} tháng`;
    
    const nam = Math.floor(thangTuoi / 12);
    const thangLe = thangTuoi % 12;
    return thangLe === 0 ? `${nam} tuổi` : `${nam} t ${thangLe} th`;
  };

  const columns: GridColDef[] = [
    { field: 'ho_ten', headerName: 'Họ tên', flex: 1 },
    { 
      field: 'thang_tuoi_display', 
      headerName: 'Tuổi', 
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
    },
    { 
      field: 'can_nang', 
      headerName: 'Cân nặng', 
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'actions',
      headerName: '',
      width: 50,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveFromQueue(params.row.benhnhan_id);
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Typography variant="h6" sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        Danh sách chờ ({patients.length})
      </Typography>
      <DataGrid
        rows={patients.map((patient) => ({
          id: patient.id, // Sử dụng ID serial của bảng danhsachcho
          benhnhan_id: patient.benhnhan_id,
          ho_ten: patient.ho_ten,
          thang_tuoi_display: hienThiTuoiTheoThang(patient.thang_tuoi),
          can_nang: patient.can_nang ? `${patient.can_nang} kg` : '-',
          // Giữ lại các trường gốc để onSelect hoạt động đúng
          dia_chi: patient.dia_chi,
          so_dien_thoai: patient.so_dien_thoai,
          thang_tuoi: patient.thang_tuoi,
          ngay_sinh: patient.ngay_sinh
        }))}
        columns={columns}
        onRowClick={(params) => onSelect(params.row as Patient)}
        sx={{
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
            // Kiểm tra selectedId khớp với UUID
            backgroundColor: (params: any) => 
              params.row?.benhnhan_id === selectedId ? '#e3f2fd !important' : 'inherit',
          },
          '& .MuiDataGrid-cell:focus': { outline: 'none' },
          border: 'none',
        }}
        hideFooter
        disableColumnMenu
        disableRowSelectionOnClick
      />
    </Box>
  );
};

export default DanhSachChoGrid;
