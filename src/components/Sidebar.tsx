// Sidebar.tsx - Restored from original system
import React from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AssignmentIcon from '@mui/icons-material/Assignment';

interface SidebarProps {
  role: 'doctor' | 'receptionist';
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const menuItems = role === 'doctor' 
    ? [
        { text: 'Khám bệnh', icon: <LocalHospitalIcon /> },
        { text: 'Toa thuốc', icon: <AssignmentIcon /> },
      ]
    : [
        { text: 'Bệnh nhân', icon: <PeopleIcon /> },
        { text: 'Danh sách chờ', icon: <AssignmentIcon /> },
      ];

  return (
    <Box sx={{ width: 240, pt: 2 }}>
      <List>
        {menuItems.map((item, index) => (
          <ListItem button key={index}>
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;