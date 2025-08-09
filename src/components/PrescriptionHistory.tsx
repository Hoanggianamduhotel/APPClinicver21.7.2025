// PrescriptionHistory.tsx - Prescription history component
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography,
  Box 
} from '@mui/material';
import { supabase } from '@/lib/supabase';

interface Prescription {
  id: number;
  ten_thuoc: string;
  so_lan_dung: number;
  so_luong_moi_lan: number;
  tong_so_luong: number;
  ghi_chu: string;
}

interface PrescriptionHistoryProps {
  visitId: string;
}

const PrescriptionHistory: React.FC<PrescriptionHistoryProps> = ({ visitId }) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  useEffect(() => {
    if (visitId) {
      fetchPrescriptions();
    }
  }, [visitId]);

  const fetchPrescriptions = async () => {
    const { data, error } = await supabase
      .from('toathuoc')
      .select('id, ten_thuoc, so_lan_dung, so_luong_moi_lan, tong_so_luong, ghi_chu')
      .eq('khambenh_id', parseInt(visitId))
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching prescriptions:', error);
      return;
    }

    setPrescriptions(data || []);
  };

  if (prescriptions.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
        Chưa có toa thuốc cho lần khám này
      </Typography>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tên thuốc</TableCell>
              <TableCell align="center">Số lần</TableCell>
              <TableCell align="center">SL/lần</TableCell>
              <TableCell align="center">Tổng SL</TableCell>
              <TableCell>Ghi chú</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prescriptions.map((prescription) => (
              <TableRow key={prescription.id}>
                <TableCell>{prescription.ten_thuoc}</TableCell>
                <TableCell align="center">{prescription.so_lan_dung}</TableCell>
                <TableCell align="center">{prescription.so_luong_moi_lan}</TableCell>
                <TableCell align="center">{prescription.tong_so_luong}</TableCell>
                <TableCell>{prescription.ghi_chu || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
        Tổng số loại thuốc: {prescriptions.length}
      </Typography>
    </Box>
  );
};

export default PrescriptionHistory;