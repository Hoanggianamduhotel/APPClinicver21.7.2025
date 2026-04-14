import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import DanhSachChoGrid from "./DanhSachChoGrid";
import KhamBenhDoctor from "./KhamBenhDoctor";
import { ToaThuocDoctor } from "./ToaThuocDoctor"; 
import VisitHistory from "./VisitHistory";
import PrescriptionHistory from "./PrescriptionHistory";
import { PatientDisplay } from "./PatientDisplay"; // Import component mới
import { Box, Button, Typography, Paper, Grid, IconButton, Divider } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";

// ... (Giữ nguyên interface KhamBenh, thêm thuộc tính gioi_tinh nếu cần)

const DoctorView: React.FC = () => {
  const [khambenhID, setKhambenhID] = useState<string | null>(null);
  const [tongTien, setTongTien] = useState<number>(0);
  const [khambenh, setKhambenh] = useState<any>({ /* ... state khởi tạo như cũ ... */ });
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);

  // Gọi hàm tính tiền từ Supabase
  const fetchTongTien = async (id: string) => {
    const { data } = await supabase.rpc('calculate_encounter_total', { 
      p_khambenh_id: id,
      p_cong_kham: 40000 
    });
    setTongTien(data || 0);
  };

  useEffect(() => {
    if (khambenhID) fetchTongTien(khambenhID);
  }, [khambenhID]);

  // ... (giữ nguyên các hàm handleLogout, toggleDrawer)

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      <Topbar />
      <Box sx={{ display: "flex", height: "calc(100vh - 64px)", mt: 8 }}>
        {/* ... (phần Sidebar) */}
        
        <Box sx={{ flex: 1, p: 2, display: "flex", gap: 2, overflowY: "auto" }}>
          {/* Cột trái: Danh sách và Lịch sử */}
          <Box sx={{ width: "320px", display: "flex", flexDirection: "column", gap: 2 }}>
            <Paper sx={{ flex: 1, p: 1 }}><DanhSachChoGrid onSelect={(bn: any) => { setKhambenh(bn); setKhambenhID(null); }} /></Paper>
          </Box>

          {/* Cột phải: Hồ sơ, Khám bệnh, Hiển thị thông tin */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <Paper sx={{ p: 2 }}>
               {/* ... phần nhập thông tin khám ... */}
               <KhamBenhDoctor setKhambenhID={setKhambenhID} setKhambenh={setKhambenh} khambenh={khambenh} />
            </Paper>

            {/* Component hiển thị cho bệnh nhân */}
            <PatientDisplay 
              data={{
                ho_ten: khambenh.ho_ten || "---",
                tuoi_display: khambenh.tuoi_display || "---",
                gioi_tinh: khambenh.gioi_tinh || "---",
                chan_doan: khambenh.chan_doan || "---",
                tong_tien: tongTien
              }} 
            />
            
            {/* ... phần toa thuốc ... */}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DoctorView;
