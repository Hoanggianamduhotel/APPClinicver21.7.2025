// VisitHistory.tsx - Đã fix lỗi load dữ liệu và kiểu ID
import React, { useState, useEffect, useCallback } from 'react';
import { 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  Typography, 
  Box, 
  Divider 
} from '@mui/material';
import { supabase } from '@/lib/supabase';

interface Visit {
  id: string; // Chuyển từ number sang string vì là UUID
  ngay_kham: string;
  trieu_chung: string;
  chan_doan: string;
  so_ngay_toa: number;
}

interface VisitHistoryProps {
  benhnhan_id: string;
  onSelectVisit: (visitId: string) => void;
}

const VisitHistory: React.FC<VisitHistoryProps> = ({ benhnhan_id, onSelectVisit }) => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(false);

  // Dùng useCallback để hàm không bị khởi tạo lại gây loop useEffect
  const fetchVisitHistory = useCallback(async () => {
    if (!benhnhan_id) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('khambenh')
      .select('id, ngay_kham, trieu_chung, chan_doan, so_ngay_toa')
      .eq('benhnhan_id', benhnhan_id) 
      .order('ngay_kham', { ascending: false });

    if (error) {
      console.error('Lỗi lấy lịch sử:', error.message);
    } else {
      setVisits(data || []);
    }
    setLoading(false);
  }, [benhnhan_id]);

  useEffect(() => {
    fetchVisitHistory();
  }, [fetchVisitHistory]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (!benhnhan_id) return null;

  if (loading) return <Typography sx={{ p: 2, textAlign: 'center' }}>Đang tải...</Typography>;

  if (visits.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary" sx={{ p: 2, textAlign: 'center' }}>
        Chưa có lịch sử khám bệnh
      </Typography>
    );
  }

  return (
    <List dense sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {visits.map((visit, index) => (
        <React.Fragment key={visit.id}>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => onSelectVisit(visit.id)} // Không cần toString() nữa
              sx={{ 
                borderLeft: '4px solid transparent',
                '&:hover': { 
                  backgroundColor: '#e3f2fd',
                  borderLeft: '4px solid #1976d2' 
                }
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold' }}>
                      {formatDate(visit.ngay_kham)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {visit.so_ngay_toa} ngày thuốc
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    <Typography variant="body2" color="textPrimary" sx={{ fontWeight: 500, display: 'block' }}>
                      CĐ: {visit.chan_doan || "Chưa có chẩn đoán"}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="textSecondary" 
                      sx={{ 
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      TC: {visit.trieu_chung || "Không ghi nhận"}
                    </Typography>
                  </Box>
                }
              />
            </ListItemButton>
          </ListItem>
          {index < visits.length - 1 && <Divider component="li" />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default VisitHistory;
