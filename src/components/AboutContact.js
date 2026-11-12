import React, { useState, useEffect } from 'react';
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
  Form
} from 'react-bootstrap';

function AboutContact() {
  const [academyInfo, setAcademyInfo] = useState(null);

  // Form liên hệ state
  const [contactForm, setContactForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Lấy thông tin học viện bằng axios từ json-server
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await axios.get('http://localhost:9999/academyInfo');
        setAcademyInfo(res.data);
      } catch (err) {
        console.error('Lỗi khi lấy thông tin học viện:', err);
      }
    };

    fetchInfo();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validation Form liên hệ
  const validateForm = () => {
    const newErrors = {};

    if (!contactForm.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!contactForm.email.trim()) {
      newErrors.email = 'Vui lòng nhập email.';
    } else if (!emailRegex.test(contactForm.email.trim())) {
      newErrors.email = 'Email không hợp lệ.';
    }

    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!contactForm.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại.';
    } else if (!phoneRegex.test(contactForm.phone.trim())) {
      newErrors.phone = 'Số điện thoại phải là 10 số hợp lệ.';
    }

    if (!contactForm.message.trim()) {
      newErrors.message = 'Vui lòng nhập nội dung liên hệ.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const newContact = {
        ...contactForm,
        status: 'unread',
        createdAt: new Date().toISOString()
      };

      // Gửi axios POST lên json-server endpoint contacts
      await axios.post('http://localhost:9999/contacts', newContact);

      setSuccessMsg('Cảm ơn bạn! Chúng tôi đã nhận được thông tin liên hệ và sẽ phản hồi sớm nhất.');
      setContactForm({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setErrors({});
    } catch (err) {
      console.error('Lỗi khi gửi form liên hệ qua axios:', err);
      setErrorMsg('Không thể gửi tin nhắn liên hệ. Vui lòng kiểm tra lại server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="about-contact-page py-5 bg-light">
      <Container>
        {/* TIÊU ĐỀ TRANG */}
        <div className="text-center mb-5">
          <Badge bg="primary" className="px-3 py-2 text-uppercase mb-2">Về Chúng Tôi</Badge>
          <h1 className="fw-bold text-dark">Giới Thiệu & Thông Tin Liên Hệ</h1>
          <p className="text-muted mx-auto" style={{ maxWidth: '650px' }}>
            Tìm hiểu câu chuyện phát triển của Pro Pickleball Academy và kết nối trực tiếp với ban điều hành để nhận hỗ trợ tốt nhất.
          </p>
        </div>

        {/* 1. LỊCH SỬ HÌNH THÀNH & TẦM NHÌN */}
        <Card className="border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white mb-5">
          <Row className="g-4 align-items-center">
            <Col xs={12} lg={6}>
              <span className="text-primary fw-bold text-uppercase small">Hành trình đam mê</span>
              <h2 className="fw-bold text-dark mt-1 mb-3">Lịch Sử Hình Thành Học Viện</h2>
              <p className="text-secondary">
                {academyInfo ? academyInfo.history : 'Thành lập từ năm 2022 khi làn sóng Pickleball bắt đầu bùng nổ tại Châu Á, học viện đã nhanh chóng phát triển từ một câu lạc bộ nhỏ thành một học viện chuyên nghiệp hàng đầu với hơn 1.500 học viên đã tốt nghiệp.'}
              </p>
              <p className="text-secondary">
                {academyInfo ? academyInfo.description : 'Pro Pickleball Academy tự hào là đơn vị tiên phong tại Việt Nam cung cấp các chương trình đào tạo Pickleball chuẩn quốc tế từ cơ bản đến nâng cao.'}
              </p>

              <Row className="g-3 mt-2">
                <Col xs={6}>
                  <div className="p-3 bg-light rounded-3 text-center border">
                    <h4 className="fw-bold text-primary mb-1">USA Pickleball</h4>
                    <small className="text-muted">Tiêu chuẩn sân đấu</small>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="p-3 bg-light rounded-3 text-center border">
                    <h4 className="fw-bold text-warning mb-1">IPTPA & PPR</h4>
                    <small className="text-muted">Chứng chỉ HLV Quốc tế</small>
                  </div>
                </Col>
              </Row>
            </Col>

            <Col xs={12} lg={6}>
              <img
                src="https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?auto=format&fit=crop&w=800&q=80"
                alt="Pickleball Court History"
                className="img-fluid rounded-4 shadow-sm w-100"
                style={{ height: '340px', objectFit: 'cover' }}
              />
            </Col>
          </Row>
        </Card>

        {/* 2. FORM LIÊN HỆ & THÔNG TIN ĐỊA CHỈ */}
        <Row className="g-4 mb-5">
          {/* Cột Trái: Thông tin liên hệ trực tiếp */}
          <Col xs={12} lg={5}>
            <Card className="border-0 shadow-sm rounded-4 p-4 bg-dark text-white h-100 d-flex flex-column justify-content-between">
              <div>
                <h4 className="fw-bold text-warning mb-4">
                  <i className="bi bi-headset me-2"></i> Kết Nối Với Chúng Tôi
                </h4>
                <p className="text-light opacity-75 small mb-4">
                  Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn về khóa học, thuê sân tập hoặc hợp tác sự kiện.
                </p>

                <div className="d-flex flex-column gap-3 small">
                  <div className="d-flex align-items-start gap-3">
                    <div className="p-2 bg-warning text-dark rounded-circle fs-5 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-geo-alt-fill"></i>
                    </div>
                    <div>
                      <strong className="d-block text-white">Địa chỉ học viện:</strong>
                      <span className="text-secondary">{academyInfo?.address}</span>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <div className="p-2 bg-warning text-dark rounded-circle fs-5 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-telephone-fill"></i>
                    </div>
                    <div>
                      <strong className="d-block text-white">Hotline / Zalo:</strong>
                      <span className="text-secondary">{academyInfo?.phone} ({academyInfo?.hotline})</span>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <div className="p-2 bg-warning text-dark rounded-circle fs-5 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-envelope-fill"></i>
                    </div>
                    <div>
                      <strong className="d-block text-white">Email tiếp nhận:</strong>
                      <span className="text-secondary">{academyInfo?.email}</span>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <div className="p-2 bg-warning text-dark rounded-circle fs-5 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-clock-fill"></i>
                    </div>
                    <div>
                      <strong className="d-block text-white">Giờ mở cửa phục vụ:</strong>
                      <span className="text-secondary">Ngày trong tuần: {academyInfo?.openingHours?.weekdays}</span>
                      <br />
                      <span className="text-secondary">Cuối tuần: {academyInfo?.openingHours?.weekends}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-top border-secondary mt-4">
                <span className="small text-secondary d-block mb-2">Theo dõi kênh mạng xã hội:</span>
                <div className="d-flex gap-3 fs-5">
                  <a href={academyInfo?.socialLinks?.facebook || '#'} target="_blank" rel="noreferrer" className="text-warning">
                    <i className="bi bi-facebook"></i>
                  </a>
                  <a href={academyInfo?.socialLinks?.youtube || '#'} target="_blank" rel="noreferrer" className="text-warning">
                    <i className="bi bi-youtube"></i>
                  </a>
                  <a href={academyInfo?.socialLinks?.tiktok || '#'} target="_blank" rel="noreferrer" className="text-warning">
                    <i className="bi bi-tiktok"></i>
                  </a>
                </div>
              </div>
            </Card>
          </Col>

          {/* Cột Phải: Form Gửi Liên Hệ */}
          <Col xs={12} lg={7}>
            <Card className="border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white h-100">
              <h4 className="fw-bold text-dark mb-4">Gửi Lời Nhắn Cho Chúng Tôi</h4>

              {successMsg && (
                <Alert variant="success" className="d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-check-circle-fill fs-5"></i>
                  <div>{successMsg}</div>
                </Alert>
              )}

              {errorMsg && (
                <Alert variant="danger" className="d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-octagon-fill fs-5"></i>
                  <div>{errorMsg}</div>
                </Alert>
              )}

              <Form onSubmit={handleSubmit} noValidate>
                <Row className="g-3 mb-3">
                  <Col xs={12} md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-dark small">Họ và tên *</Form.Label>
                      <Form.Control
                        type="text"
                        name="fullName"
                        isInvalid={!!errors.fullName}
                        placeholder="Nguyễn Văn A"
                        value={contactForm.fullName}
                        onChange={handleChange}
                      />
                      <Form.Control.Feedback type="invalid">{errors.fullName}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-dark small">Số điện thoại *</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        isInvalid={!!errors.phone}
                        placeholder="0912345678"
                        value={contactForm.phone}
                        onChange={handleChange}
                      />
                      <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-3 mb-3">
                  <Col xs={12} md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-dark small">Email *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        isInvalid={!!errors.email}
                        placeholder="email@vidu.com"
                        value={contactForm.email}
                        onChange={handleChange}
                      />
                      <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-dark small">Chủ đề cần tư vấn</Form.Label>
                      <Form.Control
                        type="text"
                        name="subject"
                        placeholder="Ví dụ: Đăng ký học theo nhóm, thuê sân..."
                        value={contactForm.subject}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-dark small">Nội dung tin nhắn *</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="message"
                    rows={4}
                    isInvalid={!!errors.message}
                    placeholder="Nhập câu hỏi hoặc yêu cầu của bạn tại đây..."
                    value={contactForm.message}
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">{errors.message}</Form.Control.Feedback>
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  className="px-4 py-2 fw-semibold shadow-sm w-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" role="status" /> Đang gửi...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send-fill me-2"></i> Gửi Tin Nhắn
                    </>
                  )}
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>

        {/* 3. BẢN ĐỒ VỊ TRÍ (GOOGLE MAPS IFRAME) */}
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <Card.Header className="bg-white border-0 p-4 pb-0">
            <h5 className="fw-bold text-dark mb-1">
              <i className="bi bi-map-fill text-danger me-2"></i> Bản Đồ Vị Trí Học Viện
            </h5>
            <p className="text-muted small mb-3">
              Khu Đô Thị Sala, Phường An Lợi Đông, TP. Thủ Đức, TP. Hồ Chí Minh
            </p>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="ratio ratio-21x9" style={{ minHeight: '380px' }}>
              <iframe
                title="Bản đồ vị trí Học Viện"
                src={
                  academyInfo?.mapEmbedUrl ||
                  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.517758345151!2d106.7192994757038!3d10.77160025928172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f41639d675b%3A0xb3514749f7b0b2e8!2sKhu%20%C4%91%C3%B4%20th%E1%BB%8B%20Sala!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s'
                }
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default AboutContact;
