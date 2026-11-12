import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Button, Card, Badge, Alert, Spinner } from 'react-bootstrap';

function Home() {
  const [academyInfo, setAcademyInfo] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Sử dụng axios để lấy toàn bộ dữ liệu phục vụ trang chủ từ json-server
    const fetchData = async () => {
      try {
        setLoading(true);
        // Gọi đồng thời các API cần thiết cho trang chủ
        const [infoRes, facRes, coachRes, courseRes, testRes] = await Promise.all([
          axios.get('http://localhost:9999/academyInfo'),
          axios.get('http://localhost:9999/facilities'),
          axios.get('http://localhost:9999/coaches'),
          axios.get('http://localhost:9999/courses'),
          axios.get('http://localhost:9999/testimonials')
        ]);

        setAcademyInfo(infoRes.data);
        setFacilities(facRes.data);
        setCoaches(coachRes.data);
        // Lọc lấy các khóa học nổi bật (isFeatured = true)
        const featured = courseRes.data.filter((item) => item.isFeatured);
        setFeaturedCourses(featured);
        setTestimonials(testRes.data);
        setError(null);
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu trang chủ qua axios:', err);
        setError('Không thể kết nối đến máy chủ mock (json-server). Vui lòng chạy "npm run server" để tải dữ liệu.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="home-page">
      {/* Thông báo nếu chưa bật json-server */}
      {error && (
        <Container className="mt-3">
          <Alert variant="warning" className="d-flex align-items-center gap-2 mb-0" role="alert">
            <i className="bi bi-exclamation-triangle-fill fs-5"></i>
            <div>{error}</div>
          </Alert>
        </Container>
      )}

      {/* Hiệu ứng loading */}
      {loading && (
        <div className="text-center py-4 bg-light">
          <Spinner animation="border" variant="primary" size="sm" className="me-2" role="status" />
          <span className="text-muted small">Đang tải dữ liệu học viện...</span>
        </div>
      )}

      {/* 1. BANNER NỔI BẬT & GIỚI THIỆU HỌC VIỆN */}
      <section className="hero-section text-center text-lg-start">
        <Container className="py-4">
          <Row className="align-items-center gy-4">
            <Col xs={12} lg={7}>
              <h1 className="display-5 fw-bold mb-3 text-white">
                {academyInfo ? academyInfo.heroBanner.title : 'Chinh Phục Môn Thể Thao Bùng Nổ Toàn Cầu'}
              </h1>
              <p className="lead text-light opacity-90 mb-4">
                {academyInfo
                  ? academyInfo.heroBanner.subtitle
                  : 'Chương trình đào tạo chuẩn quốc tế IPTPA/PPR cùng hệ thống sân thi đấu tiêu chuẩn USA Pickleball.'}
              </p>
              <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                <Button as={Link} to="/register" variant="warning" size="lg" className="px-4 fw-bold text-dark shadow">
                  <i className="bi bi-pencil-square me-2"></i> Đăng Ký Học Ngay
                </Button>
                <Button as={Link} to="/courses" variant="outline-light" size="lg" className="px-4 fw-bold">
                  <i className="bi bi-collection-play me-2"></i> Xem Các Khóa Học
                </Button>
              </div>
            </Col>
          </Row>

          {/* Các chỉ số thống kê nổi bật */}
          {academyInfo && academyInfo.stats && (
            <Row className="g-3 mt-4 pt-3 border-top border-secondary border-opacity-50">
              {academyInfo.stats.map((stat) => (
                <Col xs={6} md={3} className="text-center" key={stat.id}>
                  <div className="p-2 bg-dark bg-opacity-50 rounded-3">
                    <h3 className="fw-bold text-warning mb-0">{stat.value}</h3>
                    <p className="small text-light text-opacity-75 mb-0">{stat.label}</p>
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>

      {/* 2. ĐIỂM NỔI BẬT: CƠ SỞ VẬT CHẤT & ĐỘI NGŨ HUẤN LUYỆN VIÊN */}
      <section className="py-5 bg-white">
        <Container>
          <div className="text-center mb-5">
            <span className="text-primary fw-bold text-uppercase small">Chất lượng hàng đầu</span>
            <h2 className="fw-bold mt-1">Cơ Sở Vật Chất Tiêu Chuẩn Quốc Tế</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '650px' }}>
              Trang thiết bị hiện đại bậc nhất giúp học viên tiếp cận kỹ thuật bài bản và phát huy tối đa đam mê thể thao.
            </p>
          </div>

          {/* Danh sách cơ sở vật chất */}
          <Row className="g-4">
            {facilities.map((item) => (
              <Col xs={12} md={6} lg={3} key={item.id}>
                <Card className="h-100 shadow-sm border-0 hover-card rounded-3 overflow-hidden">
                  <Card.Img
                    variant="top"
                    src={item.image}
                    alt={item.name}
                    style={{ height: '180px', objectFit: 'cover' }}
                  />
                  <Card.Body>
                    <Badge bg="primary" className="badge-soft-primary mb-2 text-light">{item.badge}</Badge>
                    <Card.Title as="h6" className="fw-bold text-dark">{item.name}</Card.Title>
                    <Card.Text className="text-muted small">{item.description}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Đội ngũ huấn luyện viên */}
          <div className="text-center mt-5 mb-4 pt-4 border-top">
            <span className="text-primary fw-bold text-uppercase small">Chuyên môn vững vàng</span>
            <h2 className="fw-bold mt-1">Đội Ngũ Huấn Luyện Viên Đẳng Cấp</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '650px' }}>
              100% Huấn luyện viên đạt chứng chỉ quốc tế IPTPA / PPR với nhiều năm kinh nghiệm thi đấu và giảng dạy.
            </p>
          </div>

          <Row className="g-4">
            {coaches.map((coach) => (
              <Col xs={12} md={6} lg={3} key={coach.id}>
                <Card className="h-100 shadow-sm border-0 hover-card rounded-3 text-center p-3">
                  <Card.Img
                    variant="top"
                    src={coach.avatar}
                    alt={coach.name}
                    className="rounded-circle mx-auto mb-3 shadow-sm"
                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                  />
                  <Card.Title as="h5" className="fw-bold text-dark mb-1">{coach.name}</Card.Title>
                  <div>
                    <Badge bg="primary" className="bg-opacity-10 text-primary mb-2">{coach.role}</Badge>
                  </div>
                  <Card.Text className="small text-muted mb-2">{coach.certification}</Card.Text>
                  <Card.Text className="small text-secondary mb-3 fst-italic">"{coach.bio}"</Card.Text>
                  <div className="mt-auto pt-2 border-top d-flex justify-content-between align-items-center text-muted small">
                    <span><i className="bi bi-people-fill text-primary me-1"></i> {coach.studentsCount}+ học viên</span>
                    <span className="text-warning fw-bold"><i className="bi bi-star-fill me-1"></i> {coach.rating}</span>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* 3. TÓM TẮT CÁC KHÓA HỌC NỔI BẬT */}
      <section className="py-5 bg-light">
        <Container>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
            <div>
              <span className="text-primary fw-bold text-uppercase small">Lộ trình bài bản</span>
              <h2 className="fw-bold mt-1">Các Khóa Học Nổi Bật</h2>
              <p className="text-muted mb-0">Thiết kế phù hợp từ người mới nhập môn đến người muốn thi đấu đỉnh cao.</p>
            </div>
            <Button as={Link} to="/courses" variant="outline-primary" className="mt-3 mt-md-0 fw-semibold">
              Xem tất cả khóa học <i className="bi bi-arrow-right ms-1"></i>
            </Button>
          </div>

          <Row className="g-4">
            {featuredCourses.map((course) => (
              <Col xs={12} md={6} lg={3} key={course.id}>
                <Card className="h-100 shadow-sm border-0 hover-card rounded-3 overflow-hidden d-flex flex-column">
                  <div className="position-relative">
                    <Card.Img
                      variant="top"
                      src={course.image}
                      alt={course.title}
                      style={{ height: '180px', objectFit: 'cover' }}
                    />
                    <Badge bg="danger" className="position-absolute top-0 end-0 m-2 shadow-sm">
                      Khóa học Hot
                    </Badge>
                    <Badge bg="dark" className="position-absolute bottom-0 start-0 m-2 bg-opacity-75">
                      {course.category}
                    </Badge>
                  </div>

                  <Card.Body className="p-3 d-flex flex-column">
                    <Card.Title as="h6" className="fw-bold text-dark mb-2">{course.title}</Card.Title>
                    <Card.Text className="text-muted small mb-3 flex-grow-1">
                      {course.description.substring(0, 80)}...
                    </Card.Text>

                    <ul className="list-unstyled small text-secondary mb-3">
                      <li className="mb-1 text-truncate">
                        <i className="bi bi-clock-history text-primary me-2"></i>
                        <strong>Thời lượng:</strong> {course.duration}
                      </li>
                      <li className="mb-1 text-truncate">
                        <i className="bi bi-calendar3 text-primary me-2"></i>
                        <strong>Lịch học:</strong> {course.schedule}
                      </li>
                      <li className="text-truncate">
                        <i className="bi bi-person-badge text-primary me-2"></i>
                        <strong>HLV:</strong> {course.coachName}
                      </li>
                    </ul>

                    <div className="d-flex justify-content-between align-items-center pt-2 border-top mt-auto">
                      <div>
                        {course.originalPrice && (
                          <small className="text-muted d-block text-decoration-line-through" style={{ fontSize: '0.75rem' }}>
                            {course.originalPrice?.toLocaleString('vi-VN')} đ
                          </small>
                        )}
                        <span className="h6 fw-bold text-danger mb-0">
                          {course.price.toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                      <Button as={Link} to={`/register?courseId=${course.id}`} variant="primary" size="sm" className="px-2 fw-semibold">
                        Đăng ký
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* 4. ĐÁNH GIÁ TỪ HỌC VIÊN CŨ (TESTIMONIALS) */}
      {testimonials.length > 0 && (
        <section className="py-5 bg-white border-top">
          <Container>
            <div className="text-center mb-4">
              <span className="text-primary fw-bold text-uppercase small">Cảm nhận học viên</span>
              <h2 className="fw-bold mt-1">Học Viên Nói Gì Về Học Viện?</h2>
            </div>
            <Row className="g-4">
              {testimonials.map((test) => (
                <Col xs={12} md={6} key={test.id}>
                  <div className="p-4 bg-light rounded-3 shadow-sm h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="text-warning mb-2">
                        {[...Array(test.rating)].map((_, i) => (
                          <i key={i} className="bi bi-star-fill me-1"></i>
                        ))}
                      </div>
                      <p className="text-dark fst-italic mb-3">"{test.comment}"</p>
                    </div>
                    <div className="d-flex align-items-center gap-3 pt-2 border-top">
                      <img
                        src={test.avatar}
                        alt={test.name}
                        className="rounded-circle"
                        style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                      />
                      <div>
                        <h6 className="fw-bold mb-0 text-dark">{test.name}</h6>
                        <small className="text-muted">{test.role}</small>
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      )}

    </div>
  );
}

export default Home;
