import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Navbar, Nav, Container, NavDropdown, Badge } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

function AppNavbar() {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const closeMenu = () => setExpanded(false);

  const displayName =
    currentUser?.fullName || currentUser?.name || "Thành viên";
  const shortName = displayName.trim().split(/\s+/).slice(-1)[0];

  return (
    <Navbar
      bg="dark"
      variant="dark"
      expand="lg"
      sticky="top"
      className="shadow-sm py-2"
      expanded={expanded}
      onToggle={(navExpanded) => setExpanded(navExpanded)}
    >
      <Container>
        {/* Logo & Tên Học Viện */}
        <Navbar.Brand
          as={Link}
          to="/"
          onClick={closeMenu}
          className="d-flex align-items-center gap-2 fw-bold"
        >
          <span>
            <span className="text-warning">PICKLEBALL</span>
          </span>
        </Navbar.Brand>

        {/* Nút Hamburger cho Mobile */}
        <Navbar.Toggle aria-controls="navbarContent" className="border-0" />

        {/* Menu điều hướng */}
        <Navbar.Collapse id="navbarContent">
          <Nav className="ms-auto mb-2 mb-lg-0 align-items-lg-center gap-1">
            <Nav.Link
              as={Link}
              to="/"
              onClick={closeMenu}
              className={`px-3 ${location.pathname === "/" ? "active text-warning fw-bold" : ""}`}
            >
              <i className="bi bi-house-door me-1"></i> Trang chủ
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/courses"
              onClick={closeMenu}
              className={`px-3 ${location.pathname === "/courses" ? "active text-warning fw-bold" : ""}`}
            >
              <i className="bi bi-mortarboard me-1"></i> Khóa học
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/register"
              onClick={closeMenu}
              className={`px-3 ${location.pathname === "/register" ? "active text-warning fw-bold" : ""}`}
            >
              <i className="bi bi-pencil-square me-1"></i> Đăng ký học
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/court-booking"
              onClick={closeMenu}
              className={`px-3 ${location.pathname === "/court-booking" ? "active text-warning fw-bold" : ""}`}
            >
              <i className="bi bi-calendar-check me-1"></i> Đặt sân tập
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/shop"
              onClick={closeMenu}
              className={`px-3 ${location.pathname === "/shop" ? "active text-warning fw-bold" : ""}`}
            >
              <i className="bi bi-bag-check me-1"></i> Cửa hàng
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/blogs"
              onClick={closeMenu}
              className={`px-3 ${location.pathname === "/blogs" ? "active text-warning fw-bold" : ""}`}
            >
              <i className="bi bi-journal-richtext me-1"></i> Cẩm nang
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/about-contact"
              onClick={closeMenu}
              className={`px-3 ${location.pathname === "/about-contact" ? "active text-warning fw-bold" : ""}`}
            >
              <i className="bi bi-geo-alt me-1"></i> Liên hệ
            </Nav.Link>

            {/* Nút Đăng nhập hoặc Menu Tài khoản */}
            {!currentUser ? (
              <Nav.Link
                as={Link}
                to="/login"
                onClick={closeMenu}
                className="btn btn-warning btn-sm text-dark fw-bold px-3 ms-lg-2 rounded-pill mt-2 mt-lg-0 btn-login-no-hover"
              >
                <i className="bi bi-box-arrow-in-right me-1"></i> Đăng nhập
              </Nav.Link>
            ) : (
              <NavDropdown
                title={
                  <span className="d-inline-flex align-items-center gap-1">
                    <img
                      src={
                        currentUser.avatar ||
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
                      }
                      alt={displayName}
                      className="rounded-circle"
                      style={{
                        width: "26px",
                        height: "26px",
                        objectFit: "cover",
                      }}
                    />
                    <span className="small">{shortName}</span>
                    <Badge
                      bg={currentUser.role === "admin" ? "danger" : "warning"}
                      text="dark"
                      className="ms-1"
                      style={{ fontSize: "0.65rem" }}
                    >
                      {currentUser.role === "admin" ? "Admin" : "Học viên"}
                    </Badge>
                  </span>
                }
                id="user-account-dropdown"
                align="end"
                className={`ms-lg-2 ${
                  location.pathname === "/my-account" ||
                  location.pathname === "/admin"
                    ? "active-dropdown"
                    : ""
                }`}
              >
                <div className="px-3 py-1 text-muted small fw-bold border-bottom">
                  Xin chào, {displayName}
                </div>

                {currentUser.role === "admin" && (
                  <NavDropdown.Item
                    as={Link}
                    to="/admin"
                    onClick={closeMenu}
                    className="small py-2"
                  >
                    <i className="bi bi-shield-lock-fill text-danger me-2"></i>
                    Bảng Quản Trị Học Viện
                  </NavDropdown.Item>
                )}

                <NavDropdown.Item
                  as={Link}
                  to="/my-account"
                  onClick={closeMenu}
                  className="small py-2"
                >
                  <i className="bi bi-person-lines-fill text-primary me-2"></i>
                  Lịch Sử & Thông Tin Cá Nhân
                </NavDropdown.Item>

                <NavDropdown.Divider />

                <NavDropdown.Item
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="small py-2 text-danger"
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Đăng Xuất
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
