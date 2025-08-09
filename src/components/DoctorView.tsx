// DoctorView.tsx - Restored from original Vite+Express system
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import DanhSachChoGrid from "./DanhSachChoGrid";
import KhamBenhDoctor from "./KhamBenhDoctor";
import ToaThuocDoctor from "./ToaThuocDoctor";
import VisitHistory from "./VisitHistory";
import PrescriptionHistory from "./PrescriptionHistory";
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  IconButton,
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
}

const sectionTitleSx = {
  fontFamily: "Roboto, Helvetica, Arial, sans-serif",
  fontSize: "1.25rem",
  fontWeight: 700 as const,
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
  });
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };
  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  const rowHeight = 48 * 0.7225;
  const numberOfRows = 10;
  const toaThuocHeight = rowHeight * numberOfRows + 48;

  return (
    <Box>
      <Topbar />
      <Box sx={{ display: "flex", height: "100vh", mt: 8 }}>
        {drawerOpen && (
          <Box
            sx={{
              width: 240,
              display: "flex",
              flexDirection: "column",
              bgcolor: "background.paper",
              boxShadow: 1,
            }}
          >
           <Sidebar role="doctor" />
            <Box sx={{ flexGrow: 1 }} />
            <Button
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ justifyContent: "flex-start", m: 1 }}
            >
              Đăng xuất
            </Button>
          </Box>
        )}

        <IconButton
          onClick={toggleDrawer}
          sx={{
            position: "fixed",
            top: 80,
            left: drawerOpen ? 240 : 0,
            zIndex: 1300,
          }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flex: 1, p: 2, display: "flex", gap: 2 }}>
          {/* Cột queue + lịch sử khám */}
          <Box
            sx={{
              width: "25%",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {/* Danh sách chờ - KHÔNG padding để sát với viền trái/phải */}
            <Paper sx={{ flex: "0 0 60%", overflow: "hidden" }}>
              <DanhSachChoGrid
                onSelect={(bn: any) =>
                  setKhambenh((prev) => ({
                    ...prev,
                    benhnhan_id: bn.benhnhan_id.toString(),
                  }))
                }
                selectedId={khambenh.benhnhan_id}
              />
            </Paper>

            <Paper sx={{ flex: "0 0 40%", p: 1, overflowY: "auto" }}>
              <Typography sx={sectionTitleSx} gutterBottom>
                Lịch sử khám
              </Typography>
              {khambenh.benhnhan_id ? (
                <VisitHistory
                  benhnhan_id={khambenh.benhnhan_id}
                  onSelectVisit={setSelectedVisitId}
                />
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Chọn bệnh nhân để xem lịch sử
                </Typography>
              )}
            </Paper>
          </Box>

          {/* Cột info, form khám mới, toa */}
          <Box
            sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}
          >
            {/* Thông tin bệnh nhân */}
            <Paper sx={{ p: 2 }}>
              <Typography sx={sectionTitleSx} gutterBottom>
                Thông tin bệnh nhân
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <strong>BN ID:</strong> {khambenh.benhnhan_id || "-"}
                </Grid>
                <Grid item xs={6}>
                  <strong>Ngày khám:</strong> {khambenh.ngay_kham}
                </Grid>
                <Grid item xs={6}>
                  <strong>Triệu chứng:</strong> {khambenh.trieu_chung || "-"}
                </Grid>
                <Grid item xs={6}>
                  <strong>Chẩn đoán:</strong> {khambenh.chan_doan || "-"}
                </Grid>
              </Grid>
            </Paper>

            {/* Form khám mới */}
            <Paper
              sx={{ px: 2, pt: 2, pb: 1, flex: "0 0 auto", overflowY: "auto" }}
            >
              <KhamBenhDoctor
                setKhambenhID={setKhambenhID}
                setKhambenh={setKhambenh}
                khambenh={khambenh}
              />
            </Paper>

            {/* Lịch sử toa thuốc */}
            <Paper
              sx={{
                px: 2,
                pt: 1,
                pb: 2,
                flex: 1,
                minHeight: toaThuocHeight,
                maxHeight: toaThuocHeight,
                overflowY: "auto",
              }}
            >
              <Typography sx={sectionTitleSx}>Toa thuốc</Typography>
              {selectedVisitId ? (
                <PrescriptionHistory visitId={selectedVisitId} />
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Chọn một lần khám để xem toa thuốc
                </Typography>
              )}
            </Paper>

            {/* Toa thuốc mới */}
            <Paper sx={{ p: 2 }}>
              <Typography sx={sectionTitleSx} gutterBottom>
                Toa thuốc mới
              </Typography>
              {khambenhID ? (
                <>
                  <ToaThuocDoctor khambenhID={khambenhID} />
                  <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                    <Button variant="contained" color="primary">
                      Lưu toa
                    </Button>
                    <Button variant="outlined">In toa</Button>
                  </Box>
                </>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Lưu lần khám mới để tạo toa
                </Typography>
              )}
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DoctorView;