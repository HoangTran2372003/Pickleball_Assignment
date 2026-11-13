import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Badge,
  Spinner,
  Tabs,
  Tab,
} from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // 'login' | 'register'

  // Login state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Register state
  const [regForm, setRegForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fillSampleAccount = (sampleEmail, samplePass) => {
    setIdentifier(sampleEmail);
    setPassword(samplePass);
    setError("");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim()) {
      setError("Vui lòng nhập Email hoặc Tên đăng nhập.");
      return;
    }
    if (!password) {
      setError("Vui lòng nhập Mật khẩu.");
      return;
    }

    try {
      setLoading(true);
      const res = await login(identifier, password);
      if (res.success) {
        navigate(res.user.role === "admin" ? "/admin" : "/my-account");
      } else {
        setError(res.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!regForm.fullName.trim() || regForm.fullName.trim().length < 2) {
      setError("Vui lòng nhập họ và tên (tối thiểu 2 ký tự).");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.email.trim())) {
      setError("Định dạng email không hợp lệ.");
      return;
    }
    if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(regForm.phone.trim())) {
      setError("Số điện thoại Việt Nam phải gồm 10 chữ số (VD: 0912345678).");
      return;
    }
    if (regForm.password.length < 3) {
      setError("Mật khẩu phải có ít nhất 3 ký tự.");
      return;
    }
    if (regForm.password !== regForm.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      setLoading(true);
      const res = await register(regForm);
      if (res.success) {
        navigate("/my-account");
      } else {
        setError(res.message);
      }
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
              <div className="bg-dark text-white p-4 text-center">
                <Badge
                  bg="warning"
                  text="dark"
                  className="px-3 py-2 text-uppercase mb-2"
                >
                  Cổng Thành Viên
                </Badge>
                <h3 className="fw-bold mb-1">
                  {mode === "login"
                    ? "Đăng Nhập Tài Khoản"
                    : "Đăng Ký Học Viên Mới"}
                </h3>
                <p className="text-light opacity-75 small mb-0">
                  Dành cho Học viên và Ban Quản Trị Học Viện Pickleball
                </p>
              </div>

              <Card.Body className="p-4 p-md-5 bg-white">
                <Tabs
                  activeKey={mode}
                  onSelect={(k) => {
                    setMode(k);
                    setError("");
                  }}
                  className="mb-4 nav-justified"
                >
                  <Tab eventKey="login" title="Đăng Nhập" />
                  <Tab eventKey="register" title="Tạo Tài Khoản Mới" />
                </Tabs>

                {error && (
                  <Alert
                    variant="danger"
                    dismissible
                    onClose={() => setError("")}
                    className="py-2 small"
                  >
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </Alert>
                )}

                {mode === "login" ? (
                  <>
                    <Form onSubmit={handleLoginSubmit} noValidate>
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

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold small text-dark d-flex justify-content-between align-items-center">
                          <span>Mật khẩu *</span>
                          <span
                            className="text-muted fw-normal"
                            style={{ fontSize: "0.8rem" }}
                          >
                            Mặc định: 123
                          </span>
                        </Form.Label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <i className="bi bi-lock text-muted"></i>
                          </span>
                          <Form.Control
                            type={showPassword ? "text" : "password"}
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
                            <i
                              className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                            ></i>
                          </Button>
                        </div>
                      </Form.Group>

                      <Button
                        type="submit"
                        variant="warning"
                        className="w-100 fw-bold py-2 mb-3 shadow-sm text-dark btn-login-no-hover"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner
                              animation="border"
                              size="sm"
                              className="me-2"
                            />
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

                    <div className="p-3 bg-light rounded-3 border mt-3">
                      <div className="small fw-bold text-secondary mb-2 text-uppercase">
                        <i className="bi bi-lightning-charge-fill text-warning me-1"></i>
                        Bấm để điền nhanh tài khoản mẫu:
                      </div>
                      <div className="d-flex flex-column gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="text-start d-flex justify-content-between align-items-center py-2"
                          onClick={() =>
                            fillSampleAccount("hocvien@gmail.com", "123")
                          }
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
                          onClick={() =>
                            fillSampleAccount("admin@propickleball.vn", "123")
                          }
                        >
                          <span>
                            <i className="bi bi-shield-lock text-danger me-1"></i>
                            <strong>Quản trị viên:</strong>{" "}
                            admin@propickleball.vn
                          </span>
                          <Badge bg="danger">Điền</Badge>
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <Form onSubmit={handleRegisterSubmit} noValidate>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold small">
                        Họ và tên *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nguyễn Văn An"
                        value={regForm.fullName}
                        onChange={(e) =>
                          setRegForm({ ...regForm, fullName: e.target.value })
                        }
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold small">
                        Email *
                      </Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="hocvien.moi@gmail.com"
                        value={regForm.email}
                        onChange={(e) =>
                          setRegForm({ ...regForm, email: e.target.value })
                        }
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold small">
                        Số điện thoại *
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        placeholder="0912345678"
                        value={regForm.phone}
                        onChange={(e) =>
                          setRegForm({ ...regForm, phone: e.target.value })
                        }
                      />
                    </Form.Group>

                    <Row className="g-2 mb-4">
                      <Col xs={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold small">
                            Mật khẩu *
                          </Form.Label>
                          <Form.Control
                            type="password"
                            placeholder="••••••"
                            value={regForm.password}
                            onChange={(e) =>
                              setRegForm({
                                ...regForm,
                                password: e.target.value,
                              })
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold small">
                            Nhập lại MK *
                          </Form.Label>
                          <Form.Control
                            type="password"
                            placeholder="••••••"
                            value={regForm.confirmPassword}
                            onChange={(e) =>
                              setRegForm({
                                ...regForm,
                                confirmPassword: e.target.value,
                              })
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-100 fw-bold py-2 shadow-sm"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Đang tạo tài khoản...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-person-plus-fill me-2"></i>
                          Hoàn Tất Đăng Ký
                        </>
                      )}
                    </Button>
                  </Form>
                )}

                <div className="text-center mt-4">
                  <Link
                    to="/"
                    className="text-decoration-none small text-secondary"
                  >
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
