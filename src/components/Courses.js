import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Badge,
  Alert,
  Spinner,
  Form,
  InputGroup,
  Modal,
  ListGroup
} from 'react-bootstrap';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State phục vụ tìm kiếm và lọc danh mục
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // State phục vụ modal xem chi tiết khóa học
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    // Sử dụng axios để lấy danh sách khóa học từ database.json qua json-server
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:9999/courses');
        setCourses(res.data);
        setError(null);
      } catch (err) {
        console.error('Lỗi khi tải danh sách khóa học:', err);
        setError('Không thể kết nối đến máy chủ json-server. Vui lòng chạy "npm run server" ở cổng 9999.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Logic lọc khóa học theo danh mục và từ khóa tìm kiếm
  const filteredCourses = courses.filter((course) => {
    const matchCategory =
      selectedCategory === 'All' || course.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.coachName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="courses-page py-5 bg-light">
      <Container>
        {/* Tiêu đề trang */}
        <div className="text-center mb-5">
          <Badge bg="primary" className="px-3 py-2 text-uppercase mb-2">Chương Trình Huấn Luyện</Badge>
          <h1 className="fw-bold text-dark">Danh Sách Khóa Học Pickleball</h1>
          <p className="text-muted mx-auto" style={{ maxWidth: '650px' }}>
            Học viện cung cấp đầy đủ các chương trình đào tạo từ cơ bản đến nâng cao, lớp trẻ em và 1 kèm 1 VIP với giáo trình chuẩn quốc tế IPTPA.
          </p>
        </div>

        {/* Thông báo nếu lỗi kết nối */}
        {error && (
          <Alert variant="warning" className="d-flex align-items-center gap-2 mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill fs-5"></i>
            <div>{error}</div>
          </Alert>
        )}

        {/* Thanh tìm kiếm & Bộ lọc danh mục */}
        <Card className="border-0 shadow-sm rounded-3 p-3 mb-4">
          <Row className="g-3 align-items-center">
            {/* Ô tìm kiếm */}
            <Col xs={12} md={6} lg={5}>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0 text-muted">
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  className="border-start-0 ps-0"
                  placeholder="Tìm kiếm khóa học hoặc tên HLV..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button
                    variant="outline-secondary"
                    className="border-start-0"
                    onClick={() => setSearchTerm('')}
                  >
                    <i className="bi bi-x-lg"></i>
                  </Button>
                )}
              </InputGroup>
            </Col>

            {/* Bộ lọc Tabs danh mục */}
            <Col xs={12} md={6} lg={7}>
              <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                {['All', 'Cơ bản', 'Nâng cao', 'Trẻ em', '1 kèm 1'].map((cat) => (
                  <Button
                    key={cat}
                    size="sm"
                    className="px-3 rounded-pill fw-semibold"
                    variant={selectedCategory === cat ? 'primary' : 'outline-secondary'}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat === 'All' ? 'Tất cả' : cat}
                  </Button>
                ))}
              </div>
            </Col>
          </Row>
        </Card>

        {/* Trạng thái Loading */}
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </Spinner>
            <p className="mt-2 text-muted">Đang tải danh sách khóa học...</p>
          </div>
        )}

        {/* Danh sách khóa học */}
        {!loading && filteredCourses.length === 0 && (
          <div className="text-center py-5 bg-white rounded-3 shadow-sm p-4">
            <i className="bi bi-inbox text-muted display-4"></i>
            <h5 className="mt-3 text-secondary">Không tìm thấy khóa học nào phù hợp</h5>
            <p className="text-muted small">Vui lòng thử tìm với từ khóa khác hoặc chọn lại phân loại.</p>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
            >
              Đặt lại bộ lọc
            </Button>
          </div>
        )}

        <Row className="g-4">
          {filteredCourses.map((course) => (
            <Col xs={12} md={6} lg={4} key={course.id}>
              <Card className="h-100 shadow-sm border-0 hover-card rounded-3 overflow-hidden d-flex flex-column">
                <div className="position-relative">
                  <Card.Img
                    variant="top"
                    src={course.image}
                    alt={course.title}
                    style={{ height: '210px', objectFit: 'cover' }}
                  />
                  <Badge bg="primary" className="position-absolute top-0 end-0 m-3 shadow-sm">
                    {course.category}
                  </Badge>
                  <Badge bg="dark" className="position-absolute bottom-0 start-0 m-3 bg-opacity-75">
                    Tối đa: {course.maxStudents} học viên/lớp
                  </Badge>
                </div>

                <Card.Body className="p-3 d-flex flex-column">
                  <Card.Title as="h5" className="fw-bold text-dark mb-2">{course.title}</Card.Title>
                  <Card.Text className="text-muted small mb-3 flex-grow-1">
                    {course.description}
                  </Card.Text>

                  {/* Thông tin chi tiết: Thời lượng, Học phí, Lịch học, Huấn luyện viên phụ trách */}
                  <div className="bg-light p-3 rounded-3 mb-3">
                    <ul className="list-unstyled small text-secondary mb-0 d-flex flex-column gap-2">
                      <li className="d-flex align-items-center justify-content-between">
                        <span><i className="bi bi-clock-history text-primary me-2"></i>Thời lượng:</span>
                        <strong className="text-dark">{course.duration}</strong>
                      </li>
                      <li className="d-flex align-items-center justify-content-between">
                        <span><i className="bi bi-calendar3 text-primary me-2"></i>Lịch học:</span>
                        <strong className="text-dark">{course.schedule}</strong>
                      </li>
                      <li className="d-flex align-items-center justify-content-between">
                        <span><i className="bi bi-person-badge text-primary me-2"></i>HLV phụ trách:</span>
                        <strong className="text-primary">{course.coachName}</strong>
                      </li>
                    </ul>
                  </div>

                  {/* Học phí & Các nút hành động */}
                  <div className="pt-2 border-top d-flex justify-content-between align-items-center mt-auto">
                    <div>
                      {course.originalPrice && (
                        <small className="text-muted d-block text-decoration-line-through">
                          {course.originalPrice.toLocaleString('vi-VN')} đ
                        </small>
                      )}
                      <span className="h5 fw-bold text-danger mb-0">
                        {course.price.toLocaleString('vi-VN')} đ
                      </span>
                    </div>

                    <div className="d-flex gap-2">
                      {/* Nút Xem chi tiết giáo trình */}
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => setSelectedCourse(course)}
                        title="Xem giáo trình chi tiết"
                      >
                        <i className="bi bi-eye"></i> Chi tiết
                      </Button>

                      {/* Nút Đăng ký khóa này */}
                      <Button
                        as={Link}
                        to={`/register?courseId=${course.id}`}
                        variant="primary"
                        size="sm"
                        className="fw-semibold"
                      >
                        Đăng ký
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* MODAL CHI TIẾT KHÓA HỌC & GIÁO TRÌNH */}
      {selectedCourse && (
        <Modal
          show={!!selectedCourse}
          onHide={() => setSelectedCourse(null)}
          size="lg"
          centered
        >
          <Modal.Header closeButton closeVariant="white" className="bg-dark text-white border-0 py-3">
            <Modal.Title as="h5" className="fw-bold">
              <i className="bi bi-mortarboard-fill text-warning me-2"></i>
              {selectedCourse.title}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="p-4">
            <Row className="g-4">
              <Col xs={12} md={5}>
                <img
                  src={selectedCourse.image}
                  alt={selectedCourse.title}
                  className="img-fluid rounded-3 mb-3"
                  style={{ height: '220px', width: '100%', objectFit: 'cover' }}
                />
                <Card className="bg-light border-0 p-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Cấp độ:</span>
                    <span className="fw-bold small">{selectedCourse.level}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">HLV phụ trách:</span>
                    <span className="fw-bold small text-primary">{selectedCourse.coachName}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Thời lượng:</span>
                    <span className="fw-bold small">{selectedCourse.duration}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted small">Học phí:</span>
                    <span className="fw-bold text-danger">{selectedCourse.price.toLocaleString('vi-VN')} đ</span>
                  </div>
                </Card>
              </Col>

              <Col xs={12} md={7}>
                <h6 className="fw-bold text-primary mb-2">Giới thiệu khóa học</h6>
                <p className="text-muted small mb-3">{selectedCourse.description}</p>

                {/* Giáo trình buổi học */}
                {selectedCourse.syllabus && (
                  <div className="mb-3">
                    <h6 className="fw-bold text-dark mb-2">
                      <i className="bi bi-journal-check text-success me-1"></i> Lộ trình giảng dạy:
                    </h6>
                    <ListGroup variant="flush" className="small">
                      {selectedCourse.syllabus.map((item, idx) => (
                        <ListGroup.Item key={idx} className="px-0 py-1 bg-transparent text-secondary border-0">
                          <i className="bi bi-check2 text-primary me-2"></i>
                          {item}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                )}

                {/* Quyền lợi học viên */}
                {selectedCourse.features && (
                  <div>
                    <h6 className="fw-bold text-dark mb-2">
                      <i className="bi bi-gift text-warning me-1"></i> Quyền lợi đi kèm:
                    </h6>
                    <ul className="list-unstyled small mb-0">
                      {selectedCourse.features.map((feat, idx) => (
                        <li key={idx} className="mb-1 text-success">
                          <i className="bi bi-star-fill text-warning me-2"></i>
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer className="bg-light border-0 py-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedCourse(null)}
            >
              Đóng
            </Button>
            <Button
              as={Link}
              to={`/register?courseId=${selectedCourse.id}`}
              variant="primary"
              size="sm"
              className="px-4 fw-semibold"
              onClick={() => setSelectedCourse(null)}
            >
              Đăng ký khóa học này
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}

export default Courses;
