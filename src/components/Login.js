import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Điền nhanh tài khoản mẫu để test
  const fillSampleAccount = (sampleEmail, samplePass) => {
    setIdentifier(sampleEmail);
    setPassword(samplePass);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Vui lòng nhập Email hoặc Tên đăng nhập.');
      return;
    }

    if (!password) {
      setError('Vui lòng nhập Mật khẩu.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(identifier, password);

      if (res.success) {
        if (res.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/my-account');
        }
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page py-5 bg-light min-vh-100 d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={5}>
            <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
              {/* Header Card */}
              <div className="bg-dark text-white p-4 text-center">
                <Badge bg="warning" text="dark" className="px-3 py-2 text-uppercase mb-2">
                  Cổng Thành Viên
                </Badge>
                <h3 className="fw-bold mb-1">Đăng Nhập Tài Khoản</h3>
                <p className="text-light opacity-75 small mb-0">
                  Dành cho Học viên và Ban Quản Trị Học Viện Pickleball
                </p>
              </div>

              {/* Body Form */}
              <Card.Body className="p-4 p-md-5 bg-white">
                {error && (
                  <Alert variant="danger" dismissible onClose={() => setError('')} className="py-2 small">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  {/* Email / Username */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold small text-dark">
                      Email hoặc Tên đăng nhập *
                    </Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-person text-muted"></i>
                      </span>
                      <Form.Control
                        type="text"
                        placeholder="Nhập email hoặc tên tài khoản"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="border-start-0 ps-0"
                        disabled={loading}
                      />
                    </div>
                  </Form.Group>

                  {/* Password */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold small text-dark d-flex justify-content-between align-items-center">
                      <span>Mật khẩu *</span>
                      <span className="text-muted fw-normal" style={{ fontSize: '0.8rem' }}>Mặc định: 123</span>
                    </Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-lock text-muted"></i>
                      </span>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Nhập mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-start-0 border-end-0 px-0"
                        disabled={loading}
                      />
                      <Button
                        variant="light"
                        className="border border-start-0 text-muted"
                        onClick={() => setShowPassword(!showPassword)}
                        type="button"
                      >
                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </Button>
                    </div>
                  </Form.Group>

                  {/* Nút Đăng nhập */}
                  <Button
                    type="submit"
                    variant="warning"
                    className="w-100 fw-bold py-2 mb-3 shadow-sm text-dark btn-login-no-hover"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Đang xác thực...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Đăng Nhập Ngay
                      </>
                    )}
                  </Button>
                </Form>

                {/* GỢI Ý TÀI KHOẢN MẪU TỪ DATABASE */}
                <div className="p-3 bg-light rounded-3 border mt-4">
                  <div className="small fw-bold text-secondary mb-2 text-uppercase">
                    <i className="bi bi-lightning-charge-fill text-warning me-1"></i>
                    Bấm để điền nhanh tài khoản:
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="text-start d-flex justify-content-between align-items-center py-2"
                      onClick={() => fillSampleAccount('hocvien@gmail.com', '123')}
                    >
                      <span>
                        <i className="bi bi-person-check text-success me-1"></i>
                        <strong>Học viên:</strong> hocvien@gmail.com
                      </span>
                      <Badge bg="secondary">Điền</Badge>
                    </Button>

                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="text-start d-flex justify-content-between align-items-center py-2"
                      onClick={() => fillSampleAccount('admin@propickleball.vn', '123')}
                    >
                      <span>
                        <i className="bi bi-shield-lock text-danger me-1"></i>
                        <strong>Quản trị viên:</strong> admin@propickleball.vn
                      </span>
                      <Badge bg="danger">Điền</Badge>
                    </Button>
                  </div>
                </div>

                <div className="text-center mt-4">
                  <Link to="/" className="text-decoration-none small text-secondary">
                    <i className="bi bi-arrow-left me-1"></i> Trở về Trang chủ
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;

