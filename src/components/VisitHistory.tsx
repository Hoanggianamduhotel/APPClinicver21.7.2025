// VisitHistory.tsx - Patient visit history component
import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Typography, Box, Divider } from '@mui/material';
import { supabase } from '@/lib/supabase';

interface Visit {
  id: number;
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

  useEffect(() => {
    if (benhnhan_id) {
      fetchVisitHistory();
    }
  }, [benhnhan_id]);

  const fetchVisitHistory = async () => {
    const { data, error } = await supabase
      .from('khambenh')
      .select('id, ngay_kham, trieu_chung, chan_doan, so_ngay_toa')
      .eq('benhnhan_id', parseInt(benhnhan_id))
      .order('ngay_kham', { ascending: false });

    if (error) {
      console.error('Error fetching visit history:', error);
      return;
    }

    setVisits(data || []);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (visits.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary">
        Chưa có lịch sử khám bệnh
      </Typography>
    );
  }

  return (
    <List dense>
      {visits.map((visit, index) => (
        <React.Fragment key={visit.id}>
          <ListItem 
            button 
            onClick={() => onSelectVisit(visit.id.toString())}
            sx={{ 
              cursor: 'pointer',
              '&:hover': { backgroundColor: '#f5f5f5' }
            }}
          >
            <ListItemText
              primary={
                <Box>
                  <Typography variant="subtitle2" color="primary">
                    {formatDate(visit.ngay_kham)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {visit.chan_doan}
                  </Typography>
                </Box>
              }
              secondary={
                <Typography variant="caption" color="textSecondary">
                  {visit.trieu_chung.length > 50 
                    ? visit.trieu_chung.substring(0, 50) + '...'
                    : visit.trieu_chung
                  }
                </Typography>
              }
            />
          </ListItem>
          {index < visits.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default VisitHistory;