// KhamBenhDoctor.tsx - Restored from original system
import React, { useState } from 'react';
import { Box, TextField, Button, Grid, Typography } from '@mui/material';
import { supabase } from '@/lib/supabase';

interface KhamBenh {
  benhnhan_id: string;
  bacsi_id: string;
  ngay_kham: string;
  trieu_chung: string;
  chan_doan: string;
  so_ngay_toa: number;
}

interface KhamBenhDoctorProps {
  setKhambenhID: (id: string | null) => void;
  setKhambenh: React.Dispatch<React.SetStateAction<KhamBenh>>;
  khambenh: KhamBenh;
}

const KhamBenhDoctor: React.FC<KhamBenhDoctorProps> = ({ 
  setKhambenhID, 
  setKhambenh, 
  khambenh 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof KhamBenh, value: string | number) => {
    setKhambenh(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!khambenh.benhnhan_id || !khambenh.trieu_chung || !khambenh.chan_doan) {
      alert('Vui lòng điền đầy đủ thông tin bệnh nhân, triệu chứng và chẩn đoán');
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('khambenh')
        .insert([{
          benhnhan_id: parseInt(khambenh.benhnhan_id),
          bacsi_id: 1, // Default doctor ID
          ngay_kham: khambenh.ngay_kham,
          trieu_chung: khambenh.trieu_chung,
          chan_doan: khambenh.chan_doan,
          so_ngay_toa: khambenh.so_ngay_toa || 0,
        }])
        .select('id')
        .single();

      if (error) throw error;

      setKhambenhID(data.id.toString());
      
      // Remove patient from waiting list
      await supabase
        .from('danhsachcho')
        .delete()
        .eq('benhnhan_id', parseInt(khambenh.benhnhan_id));

      alert('Đã lưu thông tin khám bệnh thành công!');
    } catch (error) {
      console.error('Error saving examination:', error);
      alert('Có lỗi xảy ra khi lưu thông tin khám bệnh');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Form khám bệnh
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Triệu chứng"
            multiline
            rows={3}
            value={khambenh.trieu_chung}
            onChange={(e) => handleInputChange('trieu_chung', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Chẩn đoán"
            multiline
            rows={3}
            value={khambenh.chan_doan}
            onChange={(e) => handleInputChange('chan_doan', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Ngày khám"
            type="date"
            value={khambenh.ngay_kham}
            onChange={(e) => handleInputChange('ngay_kham', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Số ngày toa"
            type="number"
            value={khambenh.so_ngay_toa}
            onChange={(e) => handleInputChange('so_ngay_toa', parseInt(e.target.value) || 0)}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={isLoading || !khambenh.benhnhan_id}
          >
            {isLoading ? 'Đang lưu...' : 'Lưu thông tin khám'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default KhamBenhDoctor;