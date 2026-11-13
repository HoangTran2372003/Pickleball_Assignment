import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Tabs,
  Tab,
  Spinner,
  Alert,
  Form,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function MyAccount() {
  const { currentUser, updateProfile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  // Profile edit state
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    newPassword: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const showNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 4000);
  };

  useEffect(() => {
    if (!currentUser) {
      setBookings([]);
      setOrders([]);
      setRegistrations([]);
      return;
    }

    setProfileForm({
      fullName: currentUser.fullName || "",
      phone: currentUser.phone || "",
      newPassword: "",
    });

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [bookingRes, orderRes, regRes] = await Promise.all([
          axios.get("http://localhost:9999/courtBookings"),
          axios.get("http://localhost:9999/orders"),
          axios.get("http://localhost:9999/registrations"),
        ]);

        const allBookings = Array.isArray(bookingRes.data)
          ? bookingRes.data
          : [];
        const allOrders = Array.isArray(orderRes.data) ? orderRes.data : [];
        const allRegs = Array.isArray(regRes.data) ? regRes.data : [];

        const userEmail = (currentUser.email || "").trim().toLowerCase();
        const userPhone = (currentUser.phone || "").trim();

        const isOwner = (record) => {
          const recEmail = (record.email || "").trim().toLowerCase();
          const recPhone = (record.phone || "").trim();
          return (
            (userEmail && recEmail === userEmail) ||
            (userPhone && recPhone === userPhone)
          );
        };

        setBookings(allBookings.filter(isOwner).reverse());
        setOrders(allOrders.filter(isOwner).reverse());
        setRegistrations(allRegs.filter(isOwner).reverse());
      } catch (err) {
        console.error("Lỗi tải dữ liệu cá nhân:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Học viên tự hủy đặt sân khi đang pending
  const handleCancelBooking = async (booking) => {
    if (
      !window.confirm(
        `Xác nhận hủy vé đặt sân #${booking.id} (${booking.courtName})?`,
      )
    )
      return;
    try {
      await axios.patch(`http://localhost:9999/courtBookings/${booking.id}`, {
        status: "cancelled",
      });
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, status: "cancelled" } : b,
        ),
      );
      showNotice(`Đã hủy vé đặt sân #${booking.id}. Khung giờ đã được mở lại.`);
    } catch (err) {
      alert("Không thể hủy lịch đặt sân. Vui lòng thử lại!");
    }
  };

  // Học viên tự hủy đơn hàng Shop khi đang pending và tự động hoàn lại tồn kho (stock)
  const handleCancelOrder = async (order) => {
    if (!window.confirm(`Xác nhận hủy đơn hàng ${order.id}?`)) return;
    try {
      await axios.patch(`http://localhost:9999/orders/${order.id}`, {
        status: "cancelled",
      });

      // Hoàn lại stock cho từng sản phẩm trong đơn
      const prodRes = await axios.get("http://localhost:9999/products");
      const latestProducts = Array.isArray(prodRes.data) ? prodRes.data : [];
      await Promise.all(
        (order.items || []).map(async (item) => {
          const prod = latestProducts.find(
            (p) => String(p.id) === String(item.id),
          );
          if (prod) {
            await axios.patch(`http://localhost:9999/products/${prod.id}`, {
              stock: (prod.stock || 0) + item.quantity,
            });
          }
        }),
      );

      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id ? { ...o, status: "cancelled" } : o,
        ),
      );
      showNotice(`Đã hủy đơn hàng ${order.id} và hoàn trả tồn kho sản phẩm.`);
    } catch (err) {
      alert("Không thể hủy đơn hàng. Vui lòng thử lại!");
    }
  };

  // Học viên tự hủy đăng ký khóa học khi đang pending
  const handleCancelRegistration = async (reg) => {
    if (!window.confirm(`Xác nhận hủy đăng ký khóa "${reg.courseName}"?`))
      return;
    try {
      await axios.patch(`http://localhost:9999/registrations/${reg.id}`, {
        status: "cancelled",
      });
      setRegistrations((prev) =>
        prev.map((r) => (r.id === reg.id ? { ...r, status: "cancelled" } : r)),
      );
      showNotice(`Đã hủy phiếu đăng ký #${reg.id}.`);
    } catch (err) {
      alert("Không thể hủy đăng ký. Vui lòng thử lại!");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.fullName.trim()) {
      alert("Họ và tên không được để trống");
      return;
    }
    if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(profileForm.phone.trim())) {
      alert("Số điện thoại phải gồm 10 chữ số hợp lệ");
      return;
    }

    setSavingProfile(true);
    const payload = {
      fullName: profileForm.fullName.trim(),
      phone: profileForm.phone.trim(),
    };
    if (profileForm.newPassword.trim()) {
      payload.password = profileForm.newPassword.trim();
    }

    const res = await updateProfile(payload);
    setSavingProfile(false);
    if (res.success) {
      setProfileForm((prev) => ({ ...prev, newPassword: "" }));
      showNotice("Đã cập nhật thông tin tài khoản thành công!");
    } else {
      alert(res.message);
    }
  };

  if (!currentUser) {
    return (
      <div className="my-account-page py-5 bg-light min-vh-100 d-flex align-items-center">
        <Container className="text-center">
          <Card
            className="p-5 shadow-sm border-0 rounded-4 mx-auto"
            style={{ maxWidth: "540px" }}
          >
            <i className="bi bi-person-lock text-primary display-3 mb-3"></i>
            <h3 className="fw-bold text-dark">Vui Lòng Đăng Nhập</h3>
            <p className="text-muted small mb-4">
              Đăng nhập vào tài khoản học viên để tra cứu khóa học đã ghi danh,
              vé đặt sân điện tử và đơn hàng Pro Shop của riêng bạn.
            </p>
            <div className="d-flex justify-content-center gap-2">
              <Button
                as={Link}
                to="/login"
                variant="warning"
                className="fw-bold text-dark px-4"
              >
                <i className="bi bi-box-arrow-in-right me-1"></i> Đăng Nhập /
                Đăng Ký
              </Button>
              <Button as={Link} to="/" variant="outline-secondary">
                Về Trang Chủ
              </Button>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="my-account-page py-5 bg-light min-vh-100">
      <Container>
        {notice && (
          <Alert
            variant="success"
            dismissible
            onClose={() => setNotice("")}
            className="mb-4"
          >
            <i className="bi bi-check-circle-fill me-2"></i> {notice}
          </Alert>
        )}

        {/* BANNER THÔNG TIN TÀI KHOẢN */}
        <Card className="border-0 shadow-sm rounded-4 p-4 mb-4 bg-dark text-white">
          <Row className="align-items-center g-3">
            <Col xs="auto">
              <img
                src={
                  currentUser.avatar ||
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
                }
                alt={currentUser.fullName}
                className="rounded-circle border border-3 border-warning"
                style={{ width: "80px", height: "80px", objectFit: "cover" }}
              />
            </Col>
            <Col>
              <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                <h3 className="fw-bold mb-0 text-white">
                  {currentUser.fullName}
                </h3>
                <Badge
                  bg={currentUser.role === "admin" ? "danger" : "warning"}
                  text="dark"
                >
                  {currentUser.membershipTier}
                </Badge>
              </div>
              <p className="text-light opacity-75 small mb-0">
                <i className="bi bi-envelope me-1"></i> {currentUser.email}{" "}
                &nbsp;|&nbsp;
                <i className="bi bi-telephone ms-2 me-1"></i>{" "}
                {currentUser.phone}
              </p>
            </Col>
            <Col xs={12} md="auto">
              <div className="d-flex gap-2 flex-wrap">
                {currentUser.role === "admin" && (
                  <Button
                    as={Link}
                    to="/admin"
                    variant="danger"
                    size="sm"
                    className="fw-bold"
                  >
                    <i className="bi bi-shield-lock me-1"></i> Trang Quản Trị
                  </Button>
                )}
                <Button
                  as={Link}
                  to="/courses"
                  variant="outline-light"
                  size="sm"
                >
                  <i className="bi bi-mortarboard me-1"></i> Khóa học
                </Button>
                <Button
                  as={Link}
                  to="/court-booking"
                  variant="outline-warning"
                  size="sm"
                >
                  <i className="bi bi-calendar-plus me-1"></i> Đặt sân
                </Button>
                <Button as={Link} to="/shop" variant="primary" size="sm">
                  <i className="bi bi-bag-plus me-1"></i> Mua dụng cụ
                </Button>
              </div>
            </Col>
          </Row>
        </Card>

        {/* TABS */}
        <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden">
          <Card.Header className="bg-white border-bottom pt-3 px-4">
            <Tabs defaultActiveKey="myCourses" className="border-bottom-0">
              {/* TAB 1: KHÓA HỌC */}
              <Tab
                eventKey="myCourses"
                title={
                  <span>
                    <i className="bi bi-mortarboard me-2"></i> Khóa Học Của Tôi
                    ({registrations.length})
                  </span>
                }
              >
                <div className="pt-4">
                  {loading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" variant="primary" />
                    </div>
                  ) : registrations.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-mortarboard fs-1 text-secondary mb-2 d-block"></i>
                      <p>Bạn chưa đăng ký khóa học nào.</p>
                      <Button
                        as={Link}
                        to="/courses"
                        variant="primary"
                        size="sm"
                      >
                        Khám phá các khóa học ngay
                      </Button>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table hover align="middle" className="mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Mã ghi danh</th>
                            <th>Tên khóa học</th>
                            <th>Lịch học mong muốn</th>
                            <th>Ngày đăng ký</th>
                            <th>Trạng thái</th>
                            <th className="text-end">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registrations.map((r) => (
                            <tr key={r.id}>
                              <td>
                                <strong className="text-primary">
                                  #{r.id}
                                </strong>
                              </td>
                              <td className="fw-bold text-dark">
                                {r.courseName}
                              </td>
                              <td>
                                <div>
                                  <i className="bi bi-calendar3 me-1 text-primary"></i>
                                  {r.preferredSchedule}
                                </div>
                                <small className="text-muted">{r.notes}</small>
                              </td>
                              <td>
                                {new Date(r.createdAt).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </td>
                              <td>
                                <Badge
                                  bg={
                                    r.status === "confirmed"
                                      ? "success"
                                      : r.status === "cancelled"
                                        ? "danger"
                                        : "warning"
                                  }
                                  text={
                                    r.status === "pending" ? "dark" : "white"
                                  }
                                  className="px-2 py-1"
                                >
                                  {r.status === "confirmed"
                                    ? "Đã xếp lớp"
                                    : r.status === "cancelled"
                                      ? "Đã hủy"
                                      : "Chờ xếp lớp"}
                                </Badge>
                              </td>
                              <td className="text-end">
                                {r.status === "pending" && (
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleCancelRegistration(r)}
                                  >
                                    Hủy đăng ký
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </div>
              </Tab>

              {/* TAB 2: ĐẶT SÂN */}
              <Tab
                eventKey="myBookings"
                title={
                  <span>
                    <i className="bi bi-calendar-check me-2"></i> Lịch Sử Đặt
                    Sân ({bookings.length})
                  </span>
                }
              >
                <div className="pt-4">
                  {loading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" variant="primary" />
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-calendar-x fs-1 text-secondary mb-2 d-block"></i>
                      <p>Bạn chưa có lượt đặt sân nào.</p>
                      <Button
                        as={Link}
                        to="/court-booking"
                        variant="primary"
                        size="sm"
                      >
                        Đặt sân ngay hôm nay
                      </Button>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table hover align="middle" className="mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Mã vé</th>
                            <th>Sân tập</th>
                            <th>Ngày & Khung giờ</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th className="text-end">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.map((b) => (
                            <tr key={b.id}>
                              <td>
                                <strong className="text-primary">
                                  #{b.id}
                                </strong>
                              </td>
                              <td className="fw-semibold">{b.courtName}</td>
                              <td>
                                <div>
                                  <i className="bi bi-calendar-event me-1"></i>
                                  {b.date}
                                </div>
                                <small className="text-primary fw-bold">
                                  {b.timeSlot}
                                </small>
                              </td>
                              <td className="fw-bold text-danger">
                                {(b.totalPrice || 0).toLocaleString("vi-VN")} đ
                              </td>
                              <td>
                                <Badge
                                  bg={
                                    b.status === "confirmed"
                                      ? "success"
                                      : b.status === "cancelled"
                                        ? "danger"
                                        : "warning"
                                  }
                                  text={
                                    b.status === "pending" ? "dark" : "white"
                                  }
                                  className="px-2 py-1"
                                >
                                  {b.status === "confirmed"
                                    ? "Đã duyệt"
                                    : b.status === "cancelled"
                                      ? "Đã hủy"
                                      : "Chờ duyệt"}
                                </Badge>
                              </td>
                              <td className="text-end">
                                {b.status === "pending" && (
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleCancelBooking(b)}
                                  >
                                    Hủy đặt sân
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </div>
              </Tab>

              {/* TAB 3: ĐƠN HÀNG */}
              <Tab
                eventKey="myOrders"
                title={
                  <span>
                    <i className="bi bi-box-seam me-2"></i> Đơn Hàng Dụng Cụ (
                    {orders.length})
                  </span>
                }
              >
                <div className="pt-4">
                  {loading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" variant="primary" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-cart-x fs-1 text-secondary mb-2 d-block"></i>
                      <p>Bạn chưa có đơn đặt mua dụng cụ nào.</p>
                      <Button as={Link} to="/shop" variant="primary" size="sm">
                        Đến cửa hàng Pro Shop
                      </Button>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table hover align="middle" className="mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Mã đơn</th>
                            <th>Ngày đặt</th>
                            <th>Sản phẩm</th>
                            <th>Địa chỉ nhận</th>
                            <th>Tổng thanh toán</th>
                            <th>Trạng thái</th>
                            <th className="text-end">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((o) => (
                            <tr key={o.id}>
                              <td>
                                <strong className="text-primary">{o.id}</strong>
                              </td>
                              <td>
                                {new Date(o.createdAt).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </td>
                              <td>
                                <ul className="list-unstyled mb-0 small">
                                  {o.items?.map((item, idx) => (
                                    <li key={idx}>
                                      <strong>x{item.quantity}</strong>{" "}
                                      {item.name}
                                    </li>
                                  ))}
                                </ul>
                              </td>
                              <td>
                                <small className="text-muted">
                                  {o.shippingAddress}
                                </small>
                              </td>
                              <td className="fw-bold text-danger">
                                {(o.totalAmount || 0).toLocaleString("vi-VN")} đ
                              </td>
                              <td>
                                <Badge
                                  bg={
                                    o.status === "completed"
                                      ? "success"
                                      : o.status === "shipping"
                                        ? "primary"
                                        : o.status === "cancelled"
                                          ? "danger"
                                          : "warning"
                                  }
                                  text={
                                    o.status === "pending" ? "dark" : "white"
                                  }
                                  className="px-2 py-1"
                                >
                                  {o.status === "completed"
                                    ? "Đã hoàn thành"
                                    : o.status === "shipping"
                                      ? "Đang giao hàng"
                                      : o.status === "cancelled"
                                        ? "Đã hủy"
                                        : "Chờ shop duyệt"}
                                </Badge>
                              </td>
                              <td className="text-end">
                                {o.status === "pending" && (
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleCancelOrder(o)}
                                  >
                                    Hủy đơn
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </div>
              </Tab>

              {/* TAB 4: CẬP NHẬT HỒ SƠ */}
              <Tab
                eventKey="profile"
                title={
                  <span>
                    <i className="bi bi-person-gear me-2"></i> Cập Nhật Hồ Sơ
                  </span>
                }
              >
                <div className="pt-4 pb-2" style={{ maxWidth: "520px" }}>
                  <Form onSubmit={handleSaveProfile}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold">
                        Email tài khoản (Không thể thay đổi)
                      </Form.Label>
                      <Form.Control
                        type="email"
                        value={currentUser.email}
                        disabled
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold">
                        Họ và tên *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={profileForm.fullName}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            fullName: e.target.value,
                          })
                        }
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold">
                        Số điện thoại liên hệ *
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            phone: e.target.value,
                          })
                        }
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="small fw-semibold">
                        Mật khẩu mới (Để trống nếu không đổi)
                      </Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Nhập mật khẩu mới..."
                        value={profileForm.newPassword}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            newPassword: e.target.value,
                          })
                        }
                      />
                    </Form.Group>

                    <Button
                      type="submit"
                      variant="primary"
                      className="fw-semibold px-4"
                      disabled={savingProfile}
                    >
                      {savingProfile ? "Đang lưu..." : "Lưu Thay Đổi"}
                    </Button>
                  </Form>
                </div>
              </Tab>
            </Tabs>
          </Card.Header>
        </Card>
      </Container>
    </div>
  );
}

export default MyAccount;
