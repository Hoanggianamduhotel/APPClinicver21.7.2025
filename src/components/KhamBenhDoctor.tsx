// KhamBenhDoctor.tsx - Fix lỗi Build Netlify & Giao diện 2 hàng chuẩn HIS
import React, { useState, useRef } from 'react';
import { Box, TextField, Button, Grid, Typography, Divider } from '@mui/material';
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

  // Refs để điều khiển Focus bằng phím Enter
  const trieuChungRef = useRef<HTMLDivElement>(null);
  const chanDoanRef = useRef<HTMLDivElement>(null);
  const ngayHenRef = useRef<HTMLDivElement>(null);
  const soNgayRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (field: keyof KhamBenh, value: string | number) => {
    setKhambenh(prev => ({ ...prev, [field]: value }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, nextRef?: React.RefObject<HTMLDivElement>, isSubmit: boolean = false) => {
    if (e.key === 'Enter') {
      if (!e.shiftKey) {
        e.preventDefault();
        if (isSubmit) {
          handleSave();
        } else if (nextRef && nextRef.current) {
          const input = nextRef.current.querySelector('input, textarea') as HTMLElement;
          input?.focus();
        }
      }
    }
  };

  const handleSave = async () => {
    if (!khambenh.benhnhan_id) {
      alert('Vui lòng chọn bệnh nhân trước!');
      return;
    }
    if (!khambenh.trieu_chung || !khambenh.chan_doan) {
      alert('Vui lòng nhập đầy đủ Triệu chứng và Chẩn đoán');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: insertError } = await supabase
        .from('khambenh')
        .insert([{
          benhnhan_id: khambenh.benhnhan_id,
          bacsi_id: "00000000-0000-0000-0000-000000000000",
          ngay_kham: khambenh.ngay_kham,
          trieu_chung: khambenh.trieu_chung,
          chan_doan: khambenh.chan_doan,
          so_ngay_toa: khambenh.so_ngay_toa || 0,
        }])
        .select('id')
        .single();

      if (insertError) throw insertError;
      setKhambenhID(data.id.toString());
      
      await supabase.from('danhsachcho').delete().eq('benhnhan_id', khambenh.benhnhan_id);
      alert('Đã lưu kết quả khám thành công!');
    } catch (error: any) {
      alert('Lỗi: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ color: '#1976d2', fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        NỘI DUNG THĂM KHÁM
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 400 }}>
          (Enter: chuyển ô | Shift+Enter: xuống dòng)
        </Typography>
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={2}>
        {/* HÀNG 1: TRIỆU CHỨNG & CHẨN ĐOÁN */}
        <Grid item xs={12} md={6}>
          <TextField
            ref={trieuChungRef}
            fullWidth
            label="1. Triệu chứng"
            multiline
            rows={2}
            placeholder="Nhập triệu chứng..."
            value={khambenh.trieu_chung}
            onChange={(e) => handleInputChange('trieu_chung', e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, chanDoanRef)}
            autoFocus
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            ref={chanDoanRef}
            fullWidth
            label="2. Chẩn đoán"
            multiline
            rows={2}
            placeholder="Nhập chẩn đoán..."
            value={khambenh.chan_doan}
            onChange={(e) => handleInputChange('chan_doan', e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, ngayHenRef)}
          />
        </Grid>

        {/* HÀNG 2: NGÀY HẸN, SỐ NGÀY TOA & NÚT LƯU */}
        <Grid item xs={12} sm={4}>
          <TextField
            ref={ngayHenRef}
            fullWidth
            label="3. Ngày hẹn tái khám"
            type="date"
            value={khambenh.ngay_kham}
            onChange={(e) => handleInputChange('ngay_kham', e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, soNgayRef)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <TextField
            ref={soNgayRef}
            fullWidth
            label="4. Số ngày thuốc (toa)"
            type="number"
            value={khambenh.so_ngay_toa}
            onChange={(e) => handleInputChange('so_ngay_toa', parseInt(e.target.value) || 0)}
            onKeyDown={(e) => handleKeyDown(e, undefined, true)}
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Button
            fullWidth
            variant="contained"
            color="success"
            size="large"
            onClick={handleSave}
            disabled={isLoading || !khambenh.benhnhan_id}
            sx={{ height: '56px', fontWeight: 'bold', fontSize: '1rem' }}
          >
            {isLoading ? 'ĐANG LƯU...' : 'LƯU KẾT QUẢ (ENTER)'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default KhamBenhDoctor;
