// DoctorView.tsx - Cập nhật tương thích MUI v5 và Netlify Build
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import DanhSachChoGrid from "./DanhSachChoGrid";
import KhamBenhDoctor from "./KhamBenhDoctor";
import { ToaThuocDoctor } from "./ToaThuocDoctor";
import VisitHistory from "./VisitHistory";
import PrescriptionHistory from "./PrescriptionHistory";

import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonIcon from "@mui/icons-material/Person";

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
}

const sectionTitleSx = {
  fontFamily: "Roboto, Helvetica, Arial, sans-serif",
  fontSize: "0.9rem",
  fontWeight: 700,
  color: "#1976d2",
  textTransform: "uppercase" as const,
};

const DoctorView: React.FC = () => {
  const [khambenhID, setKhambenhID] = useState<string | null>(null);
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
  });
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  return (
    <Box sx={{ bgcolor: "#f0f2f5", minHeight: "100vh" }}>
      <Topbar />
      <Box sx={{ display: "flex", height: "calc(100vh - 64px)", mt: 8 }}>
        
        {/* SIDEBAR NAVIGATION */}
        {drawerOpen && (
          <Box sx={{ width: 240, display: "flex", flexDirection: "column", bgcolor: "background.paper", boxShadow: 1, zIndex: 1200 }}>
            <Sidebar role="doctor" />
            <Box sx={{ flexGrow: 1 }} />
            <Button startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ justifyContent: "flex-start", m: 1 }}>
              Đăng xuất
            </Button>
          </Box>
        )}

        <IconButton
          onClick={toggleDrawer}
          sx={{
            position: "fixed", top: 72, left: drawerOpen ? 240 : 0, zIndex: 1300,
            bgcolor: "white", boxShadow: 1, "&:hover": { bgcolor: "#e3f2fd" }
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* MAIN WORKSPACE */}
        <Box sx={{ flex: 1, p: 1.5, display: "flex", gap: 1.5, overflow: "hidden" }}>
          
          {/* LEFT: QUEUE & HISTORY */}
          <Box sx={{ width: "320px", display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Paper sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", borderRadius: 2 }}>
              <DanhSachChoGrid
                onSelect={(bn: any) => {
                  setKhambenh((prev) => ({
                    ...prev,
                    benhnhan_id: bn.benhnhan_id || "",
                    ho_ten: bn.ho_ten || "",
                    tuoi_display: bn.thang_tuoi_display || "",
                    can_nang: bn.can_nang || "",
                    dia_chi: bn.dia_chi || "",
                    so_dien_thoai: bn.so_dien_thoai || ""
                  }));
                  setSelectedVisitId(null);
                  setKhambenhID(null);
                }}
                selectedId={khambenh.benhnhan_id}
              />
            </Paper>
            <Paper sx={{ height: "35%", p: 1.5, overflowY: "auto", borderRadius: 2 }}>
              <Typography sx={sectionTitleSx} gutterBottom>Lịch sử khám</Typography>
              <Divider sx={{ mb: 1 }} />
              {khambenh.benhnhan_id ? (
                <VisitHistory benhnhan_id={khambenh.benhnhan_id} onSelectVisit={setSelectedVisitId} />
              ) : (
                <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
                  Chọn bệnh nhân để xem lịch sử
                </Typography>
              )}
            </Paper>
          </Box>

          {/* RIGHT: EXAMINATION & PRESCRIPTION */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1, overflowY: "auto" }}>
            
            {/* 1. PATIENT PROFILE (ACCORDION) */}
            <Accordion defaultExpanded sx={{ borderRadius: '8px !important', overflow: 'hidden', boxShadow: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: "#f8f9fa", borderBottom: '1px solid #eee' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PersonIcon color="primary" />
                  <Typography sx={{ fontWeight: 700, color: "#d32f2f", textTransform: 'uppercase' }}>
                    {khambenh.ho_ten || "CHƯA CHỌN BỆNH NHÂN"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    {khambenh.tuoi_display ? `| ${khambenh.tuoi_display}` : ""}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 2 }}>
                {/* REMOVED 'item' prop for better MUI v5/Next.js compatibility */}
                <Grid container spacing={1.5}>
                  <Grid xs={12} md={4}>
                    <Box sx={{ p: 1, bgcolor: '#e8f5e9', borderRadius: 1, border: '1px solid #c8e6c9' }}>
                      <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>GIỚI TÍNH / TUỔI</Typography>
                      <Typography variant="body1" fontWeight={600}>{khambenh.tuoi_display || "---"}</Typography>
                    </Box>
                  </Grid>
                  <Grid xs={12} md={4}>
                    <Box sx={{ p: 1, bgcolor: '#fce4ec', borderRadius: 1, border: '1px solid #f8bbd0' }}>
                      <Typography variant="caption" color="secondary.main" sx={{ fontWeight: 700 }}>CÂN NẶNG</Typography>
                      <Typography variant="body1" fontWeight={600}>{khambenh.can_nang ? `${khambenh.can_nang} kg` : "---"}</Typography>
                    </Box>
                  </Grid>
                  <Grid xs={12} md={4}>
                    <Box sx={{ p: 1, bgcolor: '#e3f2fd', borderRadius: 1, border: '1px solid #bbdefb' }}>
                      <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700 }}>ĐIỆN THOẠI</Typography>
                      <Typography variant="body1" fontWeight={600}>{khambenh.so_dien_thoai || "---"}</Typography>
                    </Box>
                  </Grid>
                  <Grid xs={12}>
                    <Box sx={{ p: 1, bgcolor: '#fff3e0', borderRadius: 1, border: '1px solid #ffe0b2' }}>
                      <Typography variant="caption" color="warning.main" sx={{ fontWeight: 700 }}>ĐỊA CHỈ</Typography>
                      <Typography variant="body2" fontWeight={500}>{khambenh.dia_chi || "---"}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* 2. EXAMINATION CONTENT (ACCORDION) */}
            <Accordion defaultExpanded sx={{ borderRadius: '8px !important', overflow: 'hidden', boxShadow: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: "#f8f9fa", borderBottom: '1px solid #eee' }}>
                <Typography sx={sectionTitleSx}>Nội dung thăm khám</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <KhamBenhDoctor
                  setKhambenhID={setKhambenhID}
                  setKhambenh={setKhambenh}
                  khambenh={khambenh}
                />
              </AccordionDetails>
            </Accordion>

            {/* 3. PREVIOUS VISIT DETAIL */}
            {selectedVisitId && (
              <Accordion defaultExpanded sx={{ borderRadius: '8px !important', bgcolor: "#fffde7", boxShadow: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={sectionTitleSx} color="secondary">Chi tiết toa cũ</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <PrescriptionHistory visitId={selectedVisitId} />
                </AccordionDetails>
              </Accordion>
            )}

            {/* 4. NEW PRESCRIPTION (ACCORDION) */}
            <Accordion defaultExpanded sx={{ borderRadius: '8px !important', overflow: 'hidden', boxShadow: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: "#f8f9fa", borderBottom: '1px solid #eee' }}>
                <Typography sx={sectionTitleSx}>Toa thuốc mới</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                {khambenhID ? (
                  <ToaThuocDoctor khambenhID={khambenhID} />
                ) : (
                  <Box sx={{ py: 6, textAlign: "center", bgcolor: '#fafafa' }}>
                    <Typography variant="body2" color="textSecondary">
                      Vui lòng <b>Lưu nội dung thăm khám</b> ở trên để bắt đầu kê toa
                    </Typography>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>

          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DoctorView;
