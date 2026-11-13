import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
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
  InputGroup
} from 'react-bootstrap';

function Register() {
  const location = useLocation();
  const { currentUser } = useAuth();

  // Danh sách các khóa học để người dùng chọn trong dropdown
  const [courses, setCourses] = useState([]);
  // Danh sách các đơn đăng ký đã gửi
  const [registrations, setRegistrations] = useState([]);

  // Dữ liệu của Form đăng ký
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    courseId: '',
    preferredSchedule: '',
    notes: ''
  });

  // State lưu lỗi validation
  const [errors, setErrors] = useState({});
  // Trạng thái gửi form và thông báo
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Lấy query param ?courseId=... từ URL nếu người dùng chuyển từ trang Khóa học sang
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const courseIdParam = params.get('courseId');
    if (courseIdParam) {
      setFormData((prev) => ({ ...prev, courseId: courseIdParam }));
    }
  }, [location.search]);

  // Tự động điền thông tin nếu tài khoản học viên đã đăng nhập
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || currentUser.fullName || '',
        phone: prev.phone || currentUser.phone || '',
        email: prev.email || currentUser.email || ''
      }));
    }
  }, [currentUser]);

  // Sử dụng axios để lấy danh sách khóa học và danh sách đăng ký từ json-server
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, regRes] = await Promise.all([
          axios.get('http://localhost:9999/courses'),
          axios.get('http://localhost:9999/registrations')
        ]);
        setCourses(courseRes.data);
        setRegistrations(Array.isArray(regRes.data) ? [...regRes.data].reverse() : []);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu trang đăng ký:', err);
        setErrorMessage('Không thể kết nối đến json-server. Vui lòng đảm bảo server đang chạy tại cổng 9999.');
      }
    };

    fetchData();
  }, []);

  // Xử lý thay đổi các trường input trong Form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Xóa lỗi của trường đó khi người dùng bắt đầu nhập lại
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Hàm Validation dữ liệu chuẩn xác theo đúng yêu cầu đề bài
  const validateForm = () => {
    const newErrors = {};

    // 1. Kiểm tra Họ tên: không được để trống
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên của bạn.';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Họ và tên phải có tối thiểu 2 ký tự.';
    }

    // 2. Kiểm tra Số điện thoại: định dạng số điện thoại Việt Nam (10 số, bắt đầu bằng 0)
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại.';
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = 'Số điện thoại không hợp lệ (Phải là 10 số, bắt đầu bằng 03, 05, 07, 08 hoặc 09).';
    }

    // 3. Kiểm tra Email: bắt buộc và phải đúng định dạng
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập địa chỉ email.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Email không đúng định dạng (Ví dụ: ten@gmail.com).';
    }

    // 4. Kiểm tra Khóa học: bắt buộc phải chọn
    if (!formData.courseId) {
      newErrors.courseId = 'Vui lòng chọn khóa học bạn muốn đăng ký.';
    }

    setErrors(newErrors);
    // Nếu object newErrors rỗng thì form hợp lệ
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý khi nhấn nút Gửi Đăng Ký
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    // Kiểm tra tính hợp lệ của Form trước khi gửi
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Tìm tên khóa học tương ứng với courseId đã chọn
      const selectedCourseObj = courses.find((c) => String(c.id) === String(formData.courseId));
      const courseName = selectedCourseObj ? selectedCourseObj.title : 'Khóa học Pickleball';

      // Tạo object dữ liệu đăng ký mới
      const newRegistration = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        courseId: Number(formData.courseId) || formData.courseId,
        courseName: courseName,
        preferredSchedule: formData.preferredSchedule.trim() || 'Lịch theo khóa',
        notes: formData.notes.trim() || 'Không có ghi chú',
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Gửi POST request bằng axios lên json-server
      const res = await axios.post('http://localhost:9999/registrations', newRegistration);

      // Cập nhật state danh sách và hiển thị thông báo thành công
      setRegistrations((prev) => [res.data, ...prev]);
      setSuccessMessage('Chúc mừng bạn đã đăng ký khóa học thành công! Ban tư vấn sẽ liên hệ với bạn trong vòng 24h.');

      // Reset form về trạng thái ban đầu
      setFormData({
        fullName: currentUser?.fullName || '',
        phone: currentUser?.phone || '',
        email: currentUser?.email || '',
        courseId: '',
        preferredSchedule: '',
        notes: ''
      });
      setErrors({});
    } catch (err) {
      console.error('Lỗi khi gửi đơn đăng ký qua axios:', err);
      setErrorMessage('Không thể gửi đơn đăng ký. Vui lòng kiểm tra kết nối với server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page py-5 bg-light">
      <Container>
        {/* Tiêu đề trang */}
        <div className="text-center mb-5">
          <Badge bg="warning" text="dark" className="px-3 py-2 text-uppercase mb-2">Ghi Danh Học Viên</Badge>
          <h1 className="fw-bold text-dark">Đăng Ký Khóa Học Pickleball</h1>
          <p className="text-muted mx-auto" style={{ maxWidth: '650px' }}>
            Vui lòng điền đầy đủ các thông tin dưới đây. Tư vấn viên của học viện sẽ liên hệ xác nhận lịch học và hướng dẫn chuẩn bị dụng cụ.
          </p>
        </div>

        <Row className="g-4 justify-content-center">
          {/* Cột Trái: Form Đăng ký */}
          <Col xs={12} lg={7}>
            <Card className="border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <h4 className="fw-bold text-primary mb-0 d-flex align-items-center gap-2">
                  <i className="bi bi-pencil-square"></i> Phiếu Đăng Ký Trực Tuyến
                </h4>
                {currentUser && (
                  <Badge bg="success" className="small py-2 px-3">
                    <i className="bi bi-person-check me-1"></i> {currentUser.fullName}
                  </Badge>
                )}
              </div>

              {/* Thông báo thành công */}
              {successMessage && (
                <Alert variant="success" className="d-flex align-items-center gap-2 mb-4" role="alert">
                  <i className="bi bi-check-circle-fill fs-5"></i>
                  <div>{successMessage}</div>
                </Alert>
              )}

              {/* Thông báo lỗi server */}
              {errorMessage && (
                <Alert variant="danger" className="d-flex align-items-center gap-2 mb-4" role="alert">
                  <i className="bi bi-exclamation-octagon-fill fs-5"></i>
                  <div>{errorMessage}</div>
                </Alert>
              )}

              <Form onSubmit={handleSubmit} noValidate>
                {/* 1. Họ và tên */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-dark">
                    Họ và tên học viên <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup hasValidation>
                    <InputGroup.Text className="bg-light text-muted">
                      <i className="bi bi-person"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="fullName"
                      isInvalid={!!errors.fullName}
                      placeholder="Ví dụ: Nguyễn Văn An"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.fullName}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                {/* 2. Số điện thoại & Email */}
                <Row className="g-3 mb-3">
                  <Col xs={12} md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-dark">
                        Số điện thoại <span className="text-danger">*</span>
                      </Form.Label>
                      <InputGroup hasValidation>
                        <InputGroup.Text className="bg-light text-muted">
                          <i className="bi bi-telephone"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="tel"
                          name="phone"
                          isInvalid={!!errors.phone}
                          placeholder="Ví dụ: 0912345678"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.phone}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-dark">
                        Email liên hệ <span className="text-danger">*</span>
                      </Form.Label>
                      <InputGroup hasValidation>
                        <InputGroup.Text className="bg-light text-muted">
                          <i className="bi bi-envelope"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="email"
                          name="email"
                          isInvalid={!!errors.email}
                          placeholder="Ví dụ: an.nguyen@gmail.com"
                          value={formData.email}
                          onChange={handleChange}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.email}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                {/* 3. Khóa học muốn đăng ký */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-dark">
                    Khóa học muốn đăng ký <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup hasValidation>
                    <InputGroup.Text className="bg-light text-muted">
                      <i className="bi bi-mortarboard"></i>
                    </InputGroup.Text>
                    <Form.Select
                      name="courseId"
                      isInvalid={!!errors.courseId}
                      value={formData.courseId}
                      onChange={handleChange}
                    >
                      <option value="">-- Vui lòng chọn khóa học --</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title} - {course.price.toLocaleString('vi-VN')} đ ({course.schedule})
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.courseId}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                {/* 4. Khung giờ mong muốn */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-dark">Khung giờ mong muốn học</Form.Label>
                  <Form.Control
                    type="text"
                    name="preferredSchedule"
                    placeholder="Ví dụ: Buổi tối các ngày 2-4-6, hoặc cuối tuần"
                    value={formData.preferredSchedule}
                    onChange={handleChange}
                  />
                </Form.Group>

                {/* 5. Ghi chú */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-dark">Ghi chú thêm</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="notes"
                    rows={3}
                    placeholder="Cho học viện biết trình độ hiện tại của bạn hoặc mong muốn đặc biệt..."
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </Form.Group>

                {/* Nút gửi */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-100 fw-bold shadow-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" role="status" />
                      Đang gửi đăng ký...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send-fill me-2"></i> Xác Nhận Đăng Ký Học
                    </>
                  )}
                </Button>
              </Form>
            </Card>
          </Col>

          {/* Cột Phải: Quyền lợi khi đăng ký & Danh sách đơn đăng ký gần đây */}
          <Col xs={12} lg={5}>
            {/* Box Quyền lợi */}
            <Card className="border-0 shadow-sm rounded-4 p-4 bg-dark text-white mb-4">
              <h5 className="fw-bold text-warning mb-3">
                <i className="bi bi-gift-fill me-2"></i> Quyền Lợi Học Viên
              </h5>
              <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
                <li className="d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill text-success"></i>
                  <span>Tài trợ 100% vợt tập và bóng thi đấu suốt khóa</span>
                </li>
                <li className="d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill text-success"></i>
                  <span>Tặng 01 áo thi đấu độc quyền của học viện</span>
                </li>
                <li className="d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill text-success"></i>
                  <span>Được test và cấp chứng nhận đánh giá DUPR</span>
                </li>
                <li className="d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill text-success"></i>
                  <span>Cam kết đầu ra chuẩn kỹ thuật thi đấu phong trào</span>
                </li>
              </ul>
            </Card>

            {/* Danh sách đơn đăng ký gần đây */}
            <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
              <h6 className="fw-bold text-dark mb-3 d-flex align-items-center justify-content-between">
                <span>
                  <i className="bi bi-clock-history text-primary me-2"></i> Đơn đăng ký gần đây
                </span>
                <Badge bg="secondary">{registrations.length} lượt</Badge>
              </h6>

              {registrations.length === 0 ? (
                <p className="text-muted small mb-0">Chưa có đơn đăng ký nào.</p>
              ) : (
                <div style={{ maxHeight: '340px', overflowY: 'auto' }} className="pe-1">
                  {registrations.slice(0, 5).map((reg) => (
                    <div key={reg.id} className="p-3 bg-light rounded-3 mb-2 small border">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <strong className="text-dark">{reg.fullName}</strong>
                        <Badge bg={reg.status === 'confirmed' ? 'success' : 'warning'} text={reg.status === 'confirmed' ? 'white' : 'dark'}>
                          {reg.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ tư vấn'}
                        </Badge>
                      </div>
                      <p className="text-primary fw-semibold mb-1 small">{reg.courseName}</p>
                      <p className="text-muted mb-0 small">
                        <i className="bi bi-telephone me-1"></i> {reg.phone}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Register;
