// DanhSachChoGrid.tsx - Tối ưu hiển thị 2 cột & Truyền dữ liệu đầy đủ
import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase } from '@/lib/supabase';

// Định nghĩa Interface khớp với cấu trúc bảng danhsachcho
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
  selectedId: string | null;
}

const DanhSachChoGrid: React.FC<DanhSachChoGridProps> = ({ onSelect, selectedId }) => {
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    fetchWaitingList();
    
    // Thiết lập realtime để cập nhật danh sách tự động khi có bệnh nhân mới đăng ký
    const channel = supabase
      .channel('danhsachcho_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'danhsachcho' }, () => {
        fetchWaitingList();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchWaitingList = async () => {
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
    if (!window.confirm("Xóa bệnh nhân này khỏi danh sách chờ?")) return;
    
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

  const columns: GridColDef[] = [
    { 
      field: 'ho_ten', 
      headerName: 'Họ tên', 
      flex: 1.3,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#333', textTransform: 'uppercase', fontSize: '0.8rem' }}>
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
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500, color: '#666' }}>
          {params.value}
        </Typography>
      )
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
          sx={{ color: '#ccc', '&:hover': { color: '#d32f2f' } }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
      <Box sx={{ 
        p: 1.5, 
        bgcolor: '#1976d2', 
        color: 'white', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: 1 }}>
          DANH SÁCH CHỜ
        </Typography>
        <Box sx={{ 
          bgcolor: 'white', 
          color: '#1976d2', 
          px: 1.2, 
          py: 0.2, 
          borderRadius: 10, 
          fontSize: '0.85rem', 
          fontWeight: 'bold' 
        }}>
          {patients.length}
        </Box>
      </Box>

      <DataGrid
        rows={patients.map((p) => ({
          ...p,
          id: p.id, 
          thang_tuoi_display: hienThiTuoiTheoThang(p.thang_tuoi),
        }))}
        columns={columns}
        onRowClick={(params) => onSelect(params.row)}
        getRowId={(row) => row.id}
        sx={{
          border: 'none',
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
            '&.Mui-selected': {
              backgroundColor: '#e3f2fd !important',
            },
            '&:hover': { bgcolor: '#f5f5f5' }
          },
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: '#fafafa',
            borderBottom: '1px solid #eee'
          },
          '& .MuiDataGrid-columnHeaderTitle': { 
            fontWeight: 'bold',
            fontSize: '0.75rem',
            color: '#777'
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #f0f0f0',
            '&:focus': { outline: 'none' }
          },
        }}
        hideFooter
        disableColumnMenu
        disableRowSelectionOnClick
      </Box>
    </Box>
  );
};

export default DanhSachChoGrid;
