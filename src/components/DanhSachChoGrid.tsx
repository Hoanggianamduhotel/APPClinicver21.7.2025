// DanhSachChoGrid.tsx - Restored from original system
import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase } from '@/lib/supabase';

interface Patient {
  benhnhan_id: number;
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
    const { data, error } = await supabase
      .from('danhsachcho')
      .select('benhnhan_id, ho_ten, ngay_sinh, thang_tuoi, can_nang, dia_chi, so_dien_thoai')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching waiting list:', error);
      return;
    }
    
    setPatients(data || []);
  };

  const handleRemoveFromQueue = async (benhnhan_id: number) => {
    const { error } = await supabase
      .from('danhsachcho')
      .delete()
      .eq('benhnhan_id', benhnhan_id);
    
    if (error) {
      console.error('Error removing from queue:', error);
      return;
    }
    
    fetchWaitingList();
  };

  const hienThiTuoiTheoThang = (thangTuoi: number) => {
    if (thangTuoi > 48) {
      const tuoi = thangTuoi / 12;
      const tuoiLamTron = Math.floor(tuoi * 2) / 2;
      return `${tuoiLamTron} tuổi`;
    } else {
      return `${thangTuoi} tháng`;
    }
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
          id: patient.benhnhan_id,
          benhnhan_id: patient.benhnhan_id,
          ho_ten: patient.ho_ten,
          thang_tuoi_display: hienThiTuoiTheoThang(patient.thang_tuoi),
          can_nang: patient.can_nang + ' kg',
        }))}
        columns={columns}
        onRowClick={(params) => onSelect(params.row)}
        sx={{
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
            backgroundColor: params => 
              params.row.benhnhan_id.toString() === selectedId ? '#e3f2fd' : 'inherit',
          },
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
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