import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import DanhSachChoGrid from "./DanhSachChoGrid";
import KhamBenhDoctor from "./KhamBenhDoctor";
import { ToaThuocDoctor } from "./ToaThuocDoctor"; 
import VisitHistory from "./VisitHistory";
import PrescriptionHistory from "./PrescriptionHistory";
import { PatientDisplay } from "./PatientDisplay"; 
import { Box, Button, Typography, Paper, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";

interface KhamBenh {
  benhnhan_id: string;
  bacsi_id: string;
  ngay_kham: string;
  trieu_chung: string;
  chan_doan: string;
  so_ngay_toa: number;
  ho_ten?: string;
  tuoi_display?: string;
  can_nang?: string | number;
  dia_chi?: string;
  so_dien_thoai?: string;
  gioi_tinh?: string;
}

const DoctorView: React.FC = () => {
  const [khambenhID, setKhambenhID] = useState<string | null>(null);
  const [tongTien, setTongTien] = useState<number>(0);
  const [khambenh, setKhambenh] = useState<KhamBenh>({
    benhnhan_id: "",
    bacsi_id: "",
    ngay_kham: new Date().toISOString().slice(0, 10),
    trieu_chung: "",
    chan_doan: "",
    so_ngay_toa: 0,
    ho_ten: "",
    tuoi_display: "",
    can_nang: "",
    dia_chi: "",
    so_dien_thoai: "",
    gioi_tinh: ""
  });
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);

  const fetchTongTien = async (id: string) => {
    const { data, error } = await supabase.rpc('calculate_encounter_total', { 
      p_khambenh_id: id,
      p_cong_kham: 40000 
    });
    if (!error) setTongTien(data || 0);
  };

  useEffect(() => {
    if (khambenhID) fetchTongTien(khambenhID);
  }, [khambenhID]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };
  
  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      <Topbar />
      <Box sx={{ display: "flex", height: "calc(100vh - 64px)", mt: 8 }}>
        {drawerOpen && (
          <Box sx={{ width: 240, display: "flex", flexDirection: "column", bgcolor: "background.paper", boxShadow: 1, zIndex: 1200 }}>
            <Sidebar role="doctor" />
            <Box sx={{ flexGrow: 1 }} />
            <Button startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ justifyContent: "flex-start", m: 1 }}>
              Đăng xuất
            </Button>
          </Box>
        )}

        <IconButton onClick={toggleDrawer} sx={{ position: "fixed", top: 72, left: drawerOpen ? 240 : 0, zIndex: 1300, bgcolor: "white", boxShadow: 1 }}>
          <MenuIcon />
        </IconButton>
        
        <Box sx={{ flex: 1, p: 2, display: "flex", gap: 2, overflowY: "auto" }}>
          {/* Cột trái */}
          <Box sx={{ width: "320px", display: "flex", flexDirection: "column", gap: 2 }}>
            <Paper sx={{ flex: 1, p: 1 }}>
              <DanhSachChoGrid 
                onSelect={(bn: any) => { 
                  setKhambenh(bn); 
                  setKhambenhID(null); 
                }}
                selectedId={khambenh.benhnhan_id}
              />
            </Paper>
          </Box>

          {/* Cột phải */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <Paper sx={{ p: 2 }}>
               <KhamBenhDoctor setKhambenhID={setKhambenhID} setKhambenh={setKhambenh} khambenh={khambenh} />
            </Paper>

            <PatientDisplay 
              data={{
                ho_ten: khambenh.ho_ten || "---",
                tuoi_display: khambenh.tuoi_display || "---",
                gioi_tinh: khambenh.gioi_tinh || "---",
                chan_doan: khambenh.chan_doan || "---",
                tong_tien: tongTien
              }} 
            />
            
            <Paper sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>Toa thuốc mới</Typography>
              {khambenhID ? <ToaThuocDoctor khambenhID={khambenhID} /> : <Typography variant="body2">Lưu khám để kê toa</Typography>}
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DoctorView;
