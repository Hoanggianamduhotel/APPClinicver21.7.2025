// VisitHistory.tsx - Đã tối ưu hiệu suất và đồng bộ kiểu dữ liệu UUID
import React, { useState, useEffect, useCallback } from 'react';
import { 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  Typography, 
  Box, 
  Divider,
  CircularProgress
} from '@mui/material';
import { supabase } from '@/lib/supabase';

interface Visit {
  id: string; // Đồng bộ kiểu UUID từ cơ sở dữ liệu
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

  // Truy vấn lịch sử khám từ Supabase
  const fetchVisitHistory = useCallback(async () => {
    if (!benhnhan_id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('khambenh')
        .select('id, ngay_kham, trieu_chung, chan_doan, so_ngay_toa')
        .eq('benhnhan_id', benhnhan_id) 
        .order('ngay_kham', { ascending: false });

      if (error) throw error;
      setVisits(data || []);
    } catch (error: any) {
      console.error('Lỗi khi tải lịch sử khám:', error.message);
    } finally {
      setLoading(false);
    }
  }, [benhnhan_id]);

  useEffect(() => {
    fetchVisitHistory();
  }, [fetchVisitHistory]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (!benhnhan_id) return null;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (visits.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary" sx={{ p: 2, textAlign: 'center', fontStyle: 'italic' }}>
        Chưa có lịch sử khám bệnh
      </Typography>
    );
  }

  return (
    <List dense sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
      {visits.map((visit, index) => (
        <React.Fragment key={visit.id}>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => onSelectVisit(visit.id)}
              sx={{ 
                py: 1.5,
                borderLeft: '4px solid transparent',
                transition: 'all 0.2s',
                '&:hover': { 
                  backgroundColor: '#f0f7ff',
                  borderLeft: '4px solid #1976d2' 
                }
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
                      📅 {formatDate(visit.ngay_kham)}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        bgcolor: '#e8f5e9', 
                        color: '#2e7d32', 
                        px: 1, 
                        borderRadius: 1,
                        fontWeight: 600
                      }}
                    >
                      {visit.so_ngay_toa} ngày thuốc
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 0.8 }}>
                    <Typography 
                      variant="body2" 
                      color="text.primary" 
                      sx={{ fontWeight: 600, display: 'block', mb: 0.2 }}
                    >
                      Chẩn đoán: {visit.chan_doan || "---"}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ 
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '260px'
                      }}
                    >
                      Triệu chứng: {visit.trieu_chung || "Không ghi nhận"}
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
