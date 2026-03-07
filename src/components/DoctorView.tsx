import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import DanhSachChoGrid from "./DanhSachChoGrid";
import KhamBenhDoctor from "./KhamBenhDoctor";
// Sửa lỗi import: Thêm ngoặc nhọn để khớp với Named Export
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
  Divider
} from "@mui/material";
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
}

const sectionTitleSx = {
  fontFamily: "Roboto, Helvetica, Arial, sans-serif",
  fontSize: "1.1rem",
  fontWeight: 700,
  color: "#1976d2",
  textTransform: "uppercase" as const, 
  mb: 1
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
    so_dien_thoai: ""
  });
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);

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

        <IconButton
          onClick={toggleDrawer}
          sx={{
            position: "fixed", top: 72, left: drawerOpen ? 240 : 0, zIndex: 1300,
            bgcolor: "white", boxShadow: 1, "&:hover": { bgcolor: "#e3f2fd" }
          }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flex: 1, p: 2, display: "flex", gap: 2, overflow: "hidden" }}>
          <Box sx={{ width: "320px", display: "flex", flexDirection: "column", gap: 2 }}>
            <Paper sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
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
            <Paper sx={{ height: "35%", p: 1, overflowY: "auto" }}>
              <Typography sx={sectionTitleSx}>Lịch sử khám</Typography>
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

          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
            <Paper sx={{ p: 2, borderLeft: "5px solid #1976d2" }}>
              <Typography sx={sectionTitleSx}>Hồ sơ bệnh nhân</Typography>
              <Grid container spacing={2}>
                <Grid sx={{ gridColumn: { xs: "span 12", md: "span 4" } }}>
                  <Typography variant="caption" color="textSecondary">Họ và tên</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: "#d32f2f" }}>
                    {khambenh.ho_ten ? khambenh.ho_ten.toUpperCase() : "---"}
                  </Typography>
                </Grid>
                <Grid sx={{ gridColumn: { xs: "span 6", md: "span 2" } }}>
                  <Typography variant="caption" color="textSecondary">Tuổi</Typography>
                  <Typography variant="body1">{khambenh.tuoi_display || "---"}</Typography>
                </Grid>
                <Grid sx={{ gridColumn: { xs: "span 6", md: "span 2" } }}>
                  <Typography variant="caption" color="textSecondary">Cân nặng</Typography>
                  <Typography variant="body1">{khambenh.can_nang ? `${khambenh.can_nang} kg` : "---"}</Typography>
                </Grid>
                <Grid sx={{ gridColumn: { xs: "span 12", md: "span 4" } }}>
                  <Typography variant="caption" color="textSecondary">Số điện thoại</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{khambenh.so_dien_thoai || "---"}</Typography>
                </Grid>
                <Grid sx={{ gridColumn: { xs: "span 12" } }}>
                  <Typography variant="caption" color="textSecondary">Địa chỉ</Typography>
                  <Typography variant="body2">{khambenh.dia_chi || "---"}</Typography>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <KhamBenhDoctor
                setKhambenhID={setKhambenhID}
                setKhambenh={setKhambenh}
                khambenh={khambenh}
              />
            </Paper>

            {selectedVisitId && (
              <Paper sx={{ p: 2, bgcolor: "#fffde7" }}>
                <Typography sx={sectionTitleSx} color="secondary">Chi tiết toa cũ</Typography>
                <PrescriptionHistory visitId={selectedVisitId} />
              </Paper>
            )}

            <Paper sx={{ p: 2, minHeight: 200 }}>
              <Typography sx={sectionTitleSx}>Toa thuốc mới</Typography>
              {khambenhID ? (
                <>
                  <ToaThuocDoctor khambenhID={khambenhID} />
                  <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                    <Button variant="contained" size="large" sx={{ px: 4 }}>Lưu toa</Button>
                    <Button variant="outlined" size="large">In toa thuốc</Button>
                  </Box>
                </>
              ) : (
                <Box sx={{ py: 4, border: "1px dashed #ccc", textAlign: "center", borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Lưu "Nội dung thăm khám" ở trên để kê toa mới
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DoctorView;
