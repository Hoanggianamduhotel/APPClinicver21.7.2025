// KhamBenhDoctor.tsx - Đã fix lỗi Foreign Key
import React, { useState, useRef } from 'react';
import { Box, TextField, Button, Grid, Typography, Divider } from '@mui/material';
import { supabase } from '@/lib/supabase';

interface KhamBenh {
  benhnhan_id: string;
  bacsi_id: string; // ID này sẽ được lấy từ session
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

  const trieuChungRef = useRef<HTMLDivElement>(null);
  const chanDoanRef = useRef<HTMLDivElement>(null);
  const ngayKhamRef = useRef<HTMLDivElement>(null);
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
      alert('Vui lòng chọn bệnh nhân!');
      return;
    }

    // 1. LẤY ID BÁC SĨ THỰC TẾ TỪ SESSION
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert('Phiên làm việc hết hạn, vui lòng đăng nhập lại!');
      return;
    }

    if (!khambenh.trieu_chung || !khambenh.chan_doan) {
      alert('Vui lòng nhập Triệu chứng và Chẩn đoán');
      trieuChungRef.current?.querySelector('textarea')?.focus();
      return;
    }

    setIsLoading(true);
    try {
      // 2. SỬ DỤNG user.id ĐỂ LƯU VÀO KHÓA NGOẠI
      const { data, error: insertError } = await supabase
        .from('khambenh')
        .insert([{
          benhnhan_id: khambenh.benhnhan_id,
          bacsi_id: user.id, // Thay chuỗi số 0 bằng ID chuẩn từ hệ thống
          ngay_kham: khambenh.ngay_kham,
          trieu_chung: khambenh.trieu_chung,
          chan_doan: khambenh.chan_doan,
          so_ngay_toa: khambenh.so_ngay_toa || 0,
        }])
        .select('id')
        .single();

      if (insertError) throw insertError;

      setKhambenhID(data.id.toString());
      
      await supabase
        .from('danhsachcho')
        .delete()
        .eq('benhnhan_id', khambenh.benhnhan_id);

      alert('Lưu kết quả khám thành công!');
    } catch (error: any) {
      console.error('Save error:', error);
      alert('Lỗi lưu dữ liệu: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      {/* ... Phần giao diện giữ nguyên ... */}
      <Typography variant="subtitle1" sx={{ color: '#1976d2', fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        NỘI DUNG THĂM KHÁM 
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 400 }}>
          (Bác sĩ: {khambenh.bacsi_id || 'Đang xác thực...'})
        </Typography>
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={2}>
        <Grid sx={{ gridColumn: { xs: "span 12", md: "span 6" } }}>
          <TextField
            ref={trieuChungRef}
            fullWidth
            label="1. Triệu chứng"
            multiline
            rows={2}
            value={khambenh.trieu_chung}
            onChange={(e) => handleInputChange('trieu_chung', e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, chanDoanRef)}
            autoFocus
          />
        </Grid>
        
        <Grid sx={{ gridColumn: { xs: "span 12", md: "span 6" } }}>
          <TextField
            ref={chanDoanRef}
            fullWidth
            label="2. Chẩn đoán"
            multiline
            rows={2}
            value={khambenh.chan_doan}
            onChange={(e) => handleInputChange('chan_doan', e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, ngayKhamRef)}
          />
        </Grid>

        <Grid sx={{ gridColumn: { xs: "span 12", sm: "span 4" } }}>
          <TextField
            ref={ngayKhamRef}
            fullWidth
            label="3. Ngày hẹn tái khám"
            type="date"
            value={khambenh.ngay_kham}
            onChange={(e) => handleInputChange('ngay_kham', e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, soNgayRef)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        
        <Grid sx={{ gridColumn: { xs: "span 12", sm: "span 4" } }}>
          <TextField
            ref={soNgayRef}
            fullWidth
            label="4. Số ngày thuốc"
            type="number"
            value={khambenh.so_ngay_toa}
            onChange={(e) => handleInputChange('so_ngay_toa', parseInt(e.target.value) || 0)}
            onKeyDown={(e) => handleKeyDown(e, undefined, true)}
          />
        </Grid>
        
        <Grid sx={{ gridColumn: { xs: "span 12", sm: "span 4" } }}>
          <Button
            fullWidth
            variant="contained"
            color="success"
            size="large"
            onClick={handleSave}
            disabled={isLoading || !khambenh.benhnhan_id}
            sx={{ height: '56px', fontWeight: 'bold' }}
          >
            {isLoading ? 'ĐANG LƯU...' : 'LƯU KẾT QUẢ (ENTER)'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default KhamBenhDoctor;
