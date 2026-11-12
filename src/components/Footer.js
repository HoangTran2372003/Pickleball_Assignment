import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Badge } from 'react-bootstrap';

function Footer() {
  return (
    <footer className="bg-dark text-light pt-5 pb-3 border-top border-secondary mt-5">
      <Container>
        <Row className="gy-4">
          {/* Cột 1: Thông tin học viện */}
          <Col xs={12} md={4}>
            <h5 className="fw-bold text-warning d-flex align-items-center gap-2 mb-3">
             PICKLEBALL VIETNAM
            </h5>
            <p className="small text-secondary mb-3">
              Học viện Đào tạo Pickleball chuẩn quốc tế hàng đầu tại Việt Nam. Trang bị hệ thống sân thi đấu đạt chuẩn USA Pickleball và đội ngũ HLV chứng chỉ quốc tế IPTPA/PPR.
            </p>
            <div className="d-flex gap-3 fs-5">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-secondary text-hover-light">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-secondary text-hover-light">
                <i className="bi bi-youtube"></i>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="text-secondary text-hover-light">
                <i className="bi bi-tiktok"></i>
              </a>
            </div>
          </Col>

          {/* Cột 2: Điều hướng nhanh */}
          <Col xs={6} md={2}>
            <h6 className="text-uppercase fw-bold text-white mb-3">Khám phá</h6>
            <ul className="list-unstyled small mb-0 d-flex flex-column gap-2">
              <li>
                <Link to="/" className="text-secondary text-decoration-none">Trang chủ</Link>
              </li>
              <li>
                <Link to="/courses" className="text-secondary text-decoration-none">Các khóa học</Link>
              </li>
              <li>
                <Link to="/register" className="text-secondary text-decoration-none">Đăng ký học</Link>
              </li>
              <li>
                <Link to="/about-contact" className="text-secondary text-decoration-none">Giới thiệu & Bản đồ</Link>
              </li>
            </ul>
          </Col>

          {/* Cột 3: Tính năng mở rộng */}
          <Col xs={6} md={2}>
            <h6 className="text-uppercase fw-bold text-white mb-3">Dịch vụ</h6>
            <ul className="list-unstyled small mb-0 d-flex flex-column gap-2">
              <li>
                <Link to="/court-booking" className="text-secondary text-decoration-none">Đặt sân theo giờ</Link>
              </li>
              <li>
                <Link to="/shop" className="text-secondary text-decoration-none">Cửa hàng dụng cụ</Link>
              </li>
              <li>
                <Badge bg="warning" text="dark">Mở cửa: 06:00 - 22:30</Badge>
              </li>
            </ul>
          </Col>

          {/* Cột 4: Liên hệ */}
          <Col xs={12} md={4}>
            <h6 className="text-uppercase fw-bold text-white mb-3">Thông tin liên hệ</h6>
            <ul className="list-unstyled small text-secondary mb-0 d-flex flex-column gap-2">
              <li className="d-flex align-items-start gap-2">
                <i className="bi bi-geo-alt-fill text-warning mt-1"></i>
                <span>Số 18 Đường D1, KĐT Sala, P. An Lợi Đông, TP. Thủ Đức, TP.HCM</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-telephone-fill text-warning"></i>
                <span>Hotline: 0988 123 456 (1900 6868)</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-envelope-fill text-warning"></i>
                <span>Email: contact@propickleball.vn</span>
              </li>
            </ul>
          </Col>
        </Row>

        <hr className="my-4 border-secondary opacity-50" />

        <div className="text-center small text-secondary">
          <p className="mb-0">
            © {new Date().getFullYear()} Học Viện Đào Tạo Pickleball. FER202 Assignment.
          </p>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
