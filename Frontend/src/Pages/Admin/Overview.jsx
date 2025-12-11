import React, { useEffect, useState } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import BookIcon from "@mui/icons-material/Book";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";

const StyledCard = styled(Card)(({ theme, gradient }) => ({
  background: gradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "#fff",
  borderRadius: "16px",
  padding: "10px 0",
  minHeight: "160px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
  },
}));

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "#1e2139",
  color: "#fff",
  padding: "30px",
  borderRadius: "14px",
  width: "600px",
  boxShadow: 24,
};

const Overview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInstructors: 0,
    totalCourses: 0,
    topRatedInstructor: null,
    topRatedCourse: null,
  });

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReasonEN, setRejectReasonEN] = useState("");
  const [rejectReasonAR, setRejectReasonAR] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchRequests();
  }, []);

  const fetchStats = async () => {
    try {
      setStats({
        totalUsers: 1250,
        totalInstructors: 48,
        totalCourses: 156,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/v1/admin/users/requests",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const openRequestModal = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/v1/admin/users/requests/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedRequest(res.data.request);
      setModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const acceptRequest = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/v1/admin/users/requests/${selectedRequest._id}/approve-request`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModalOpen(false);
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const rejectRequest = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/v1/admin/users/requests/${selectedRequest._id}/reject-request`,
        {
          rejectionReason_en: rejectReasonEN,
          rejectionReason_ar: rejectReasonAR,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModalOpen(false);
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      title: "Total Instructors",
      value: stats.totalInstructors,
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      title: "Total Courses",
      value: stats.totalCourses,
      icon: <BookIcon sx={{ fontSize: 40 }} />,
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ color: "#fff", mb: 4, fontWeight: 700 }}>
        Dashboard Overview
      </Typography>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
            <StyledCard gradient={card.gradient}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Box sx={{ opacity: 0.8 }}>{card.icon}</Box>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" sx={{ color: "#fff", mb: 2, fontWeight: 700 }}>
        Instructor Requests
      </Typography>

      <TableContainer component={Paper} sx={{ backgroundColor: "#1a1d2e" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "#fff" }}>Name</TableCell>
              <TableCell sx={{ color: "#fff" }}>Email</TableCell>
              <TableCell sx={{ color: "#fff" }}>Status</TableCell>
              <TableCell sx={{ color: "#fff" }}>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {requests.length > 0 ? (
              requests.map((req) => (
                <TableRow key={req._id}>
                  <TableCell sx={{ color: "#fff" }}>
                    {req.userId?.name}
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    {req.userId?.email}
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>{req.status}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      onClick={() => openRequestModal(req._id)}
                    >
                      View Request
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell sx={{ color: "#fff" }}>No Requests</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={modalStyle}>
          {selectedRequest && (
            <>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Instructor Request Details
              </Typography>

              <Typography>Name: {selectedRequest.userId.name}</Typography>
              <Typography>Email: {selectedRequest.userId.email}</Typography>

              <Typography sx={{ mt: 2 }}>
                Bio (EN): {selectedRequest.bio.en}
              </Typography>
              <Typography>Bio (AR): {selectedRequest.bio.ar}</Typography>

              <Typography sx={{ mt: 2 }}>
                Job Title (EN): {selectedRequest.jobTitle.en}
              </Typography>
              <Typography>
                Job Title (AR): {selectedRequest.jobTitle.ar}
              </Typography>

              <a
                href={selectedRequest.cvURL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="contained" sx={{ mt: 2 }}>
                  View CV
                </Button>
              </a>

              <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={acceptRequest}
                >
                  Accept
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  onClick={rejectRequest}
                >
                  Reject
                </Button>
              </Box>

              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  label="Rejection Reason (EN)"
                  variant="filled"
                  value={rejectReasonEN}
                  onChange={(e) => setRejectReasonEN(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Rejection Reason (AR)"
                  variant="filled"
                  value={rejectReasonAR}
                  onChange={(e) => setRejectReasonAR(e.target.value)}
                />
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default Overview;
