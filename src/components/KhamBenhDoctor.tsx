// KhamBenhDoctor.tsx - Đã fix lỗi Grid & Tích hợp Enter Logic
import React, { useState, useRef } from 'react';
import { Box, TextField, Button, Grid, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
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
  
  // Refs để điều khiển focus khi nhấn Enter
  const trieuChungRef = useRef<HTMLDivElement>(null);
  const chanDoanRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (field: keyof KhamBenh, value: string | number) => {
    setKhambenh(prev => ({ ...prev, [field]: value }));
  };

  // Hàm xử lý phím Enter để chuyển ô hoặc lưu
  const handleKeyDown = (e: React.KeyboardEvent, nextRef?: React.RefObject<HTMLDivElement>, isSubmit: boolean = false) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isSubmit) {
        handleSave();
      } else if (nextRef && nextRef.current) {
        const input = nextRef.current.querySelector('input, textarea') as HTMLElement;
        input?.focus();
      }
    }
  };

  const handleSave = async () => {
    if (!khambenh.benhnhan_id) return alert('Vui lòng chọn bệnh nhân!');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert('Phiên làm việc hết hạn!');
    
    if (!khambenh.trieu_chung || !khambenh.chan_doan) {
      alert('Vui lòng nhập Triệu chứng và Chẩn đoán');
      trieuChungRef.current?.querySelector('textarea')?.focus();
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: insertError } = await supabase
        .from('khambenh')
        .insert([{
          benhnhan_id: khambenh.benhnhan_id,
          bacsi_id: user.id,
          ngay_kham: khambenh.ngay_kham,
          trieu_chung: khambenh.trieu_chung,
          chan_doan: khambenh.chan_doan,
          so_ngay_toa: khambenh.so_ngay_toa || 0,
        }])
        .select('id').single();

      if (insertError) throw insertError;
      
      setKhambenhID(data.id.toString());
      
      // Xóa khỏi danh sách chờ sau khi khám xong
      await supabase.from('danhsachcho').delete().eq('benhnhan_id', khambenh.benhnhan_id);
      
      alert('Đã lưu nội dung khám thành công!');
    } catch (error: any) {
      alert('Lỗi lưu dữ liệu: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Grid container spacing={1}>
        {/* CỘT NHẬP LIỆU (95% chiều rộng) */}
        <Grid xs={11.4}>
          <Grid container spacing={1}>
            <Grid xs={12} md={6}>
              <TextField
                ref={trieuChungRef}
                fullWidth
                label="1. Triệu chứng"
                multiline
                rows={3}
                value={khambenh.trieu_chung}
                onChange={(e) => handleInputChange('trieu_chung', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, chanDoanRef)}
                placeholder="Nhập triệu chứng..."
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                ref={chanDoanRef}
                fullWidth
                label="2. Chẩn đoán"
                multiline
                rows={3}
                value={khambenh.chan_doan}
                onChange={(e) => handleInputChange('chan_doan', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, undefined, true)} // Enter ở đây sẽ gọi Save
                placeholder="Nhập chẩn đoán..."
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* NÚT LƯU DỌC (5% chiều rộng - Giống Ảnh 1) */}
        <Grid xs={0.6} sx={{ display: 'flex' }}>
          <Button
            fullWidth
            variant="contained"
            color="success"
            onClick={handleSave}
            disabled={isLoading || !khambenh.benhnhan_id}
            sx={{ 
              minWidth: '40px', 
              p: 0, 
              borderRadius: '4px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'none',
              bgcolor: '#4caf50',
              '&:hover': { bgcolor: '#388e3c' }
            }}
          >
            {isLoading ? '...' : <SaveIcon />}
          </Button>
        </Grid>

        {/* HÀNG THÔNG TIN PHỤ */}
        <Grid xs={12}>
          <Box sx={{ display: 'flex', gap: 2, mt: 1, alignItems: 'center' }}>
            <TextField
              label="Hẹn tái khám"
              type="date"
              size="small"
              value={khambenh.ngay_kham}
              onChange={(e) => handleInputChange('ngay_kham', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 160 }}
            />
            <TextField
              label="Số ngày thuốc"
              type="number"
              size="small"
              value={khambenh.so_ngay_toa}
              onChange={(e) => handleInputChange('so_ngay_toa', parseInt(e.target.value) || 0)}
              sx={{ width: 110 }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary', ml: 'auto', fontWeight: 500 }}>
              ID Bác sĩ: {khambenh.bacsi_id ? khambenh.bacsi_id.slice(0, 8) : '---'}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default KhamBenhDoctor;
