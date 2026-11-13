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
  Alert,
  Spinner,
  Modal,
  Form,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("bookings");

  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");

  // Modal CRUD Product
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    category: "paddles",
    brand: "",
    price: "",
    originalPrice: "",
    stock: "10",
    image: "/image/productsImg/product1.jpg",
    description: "",
  });

  // Modal CRUD Course
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: "",
    category: "Cơ bản",
    level: "Người mới bắt đầu",
    price: "",
    originalPrice: "",
    duration: "4 tuần (12 buổi)",
    schedule: "Thứ 2 - 4 - 6 (18:00 - 19:30)",
    coachName: "Nguyễn Hoàng Nam",
    maxStudents: "6",
    image: "/image/courseImg/course1.jpg",
    description: "",
  });

  const showNotice = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(""), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingRes, orderRes, regRes, contactRes, prodRes, courseRes] =
        await Promise.all([
          axios.get("http://localhost:9999/courtBookings"),
          axios.get("http://localhost:9999/orders"),
          axios.get("http://localhost:9999/registrations"),
          axios.get("http://localhost:9999/contacts"),
          axios.get("http://localhost:9999/products"),
          axios.get("http://localhost:9999/courses"),
        ]);
      setBookings(
        Array.isArray(bookingRes.data) ? [...bookingRes.data].reverse() : [],
      );
      setOrders(
        Array.isArray(orderRes.data) ? [...orderRes.data].reverse() : [],
      );
      setRegistrations(
        Array.isArray(regRes.data) ? [...regRes.data].reverse() : [],
      );
      setContacts(
        Array.isArray(contactRes.data) ? [...contactRes.data].reverse() : [],
      );
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
      setCourses(Array.isArray(courseRes.data) ? courseRes.data : []);
    } catch (err) {
      console.error("Lỗi tải dữ liệu quản trị:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Tự động đồng bộ dữ liệu khi có cập nhật từ tab/cửa sổ khác
    const handleSync = (e) => {
      if (!e || !e.key || e.key === 'propickleball_mock_db') {
        fetchData();
      }
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('mock_db_updated', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('mock_db_updated', handleSync);
    };
  }, []);

  // --- Duyệt Đặt Sân ---
  const handleUpdateBookingStatus = async (id, newStatus, paymentStatus) => {
    try {
      const payload = { status: newStatus };
      if (paymentStatus) payload.paymentStatus = paymentStatus;
      await axios.patch(`http://localhost:9999/courtBookings/${id}`, payload);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...payload } : b)),
      );
      showNotice(`Đã cập nhật đặt sân #${id}`);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Duyệt Đơn Hàng ---
  const handleUpdateOrderStatus = async (id, newStatus, paymentStatus) => {
    try {
      const payload = { status: newStatus };
      if (paymentStatus) payload.paymentStatus = paymentStatus;
      await axios.patch(`http://localhost:9999/orders/${id}`, payload);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, ...payload } : o)),
      );
      showNotice(`Đã cập nhật đơn hàng ${id}`);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Duyệt Ghi Danh Khóa Học ---
  const handleUpdateRegistrationStatus = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:9999/registrations/${id}`, {
        status: newStatus,
      });
      setRegistrations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
      );
      showNotice(`Đã cập nhật hồ sơ ghi danh #${id}`);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Phản Hồi Liên Hệ ---
  const handleMarkContactReplied = async (id) => {
    try {
      await axios.patch(`http://localhost:9999/contacts/${id}`, {
        status: "replied",
      });
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "replied" } : c)),
      );
      showNotice(`Đã đánh dấu phản hồi tin nhắn #${id}`);
    } catch (err) {
      console.error(err);
    }
  };

  // --- CRUD Sản Phẩm ---
  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      category: "paddles",
      brand: "",
      price: "",
      originalPrice: "",
      stock: "15",
      image: "/image/productsImg/product1.jpg",
      description: "",
    });
    setShowProductModal(true);
  };

  const openEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name || "",
      category: prod.category || "paddles",
      brand: prod.brand || "",
      price: String(prod.price || ""),
      originalPrice: String(prod.originalPrice || ""),
      stock: String(prod.stock ?? 0),
      image: prod.image || "/image/productsImg/product1.jpg",
      description: prod.description || "",
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.price) return;

    const payload = {
      name: productForm.name.trim(),
      category: productForm.category,
      brand: productForm.brand.trim() || "Pro Official",
      price: Number(productForm.price) || 0,
      originalPrice:
        Number(productForm.originalPrice) || Number(productForm.price) || 0,
      stock: Math.max(0, Number(productForm.stock) || 0),
      rating: editingProduct?.rating || 5.0,
      reviewsCount: editingProduct?.reviewsCount || 0,
      isFeatured: editingProduct?.isFeatured || false,
      image: productForm.image.trim() || "/image/productsImg/product1.jpg",
      description: productForm.description.trim(),
    };

    try {
      if (editingProduct) {
        const res = await axios.patch(
          `http://localhost:9999/products/${editingProduct.id}`,
          payload,
        );
        setProducts((prev) =>
          prev.map((p) =>
            String(p.id) === String(editingProduct.id)
              ? { ...p, ...res.data }
              : p,
          ),
        );
        showNotice(`Đã cập nhật sản phẩm "${payload.name}"`);
      } else {
        const res = await axios.post("http://localhost:9999/products", payload);
        setProducts((prev) => [res.data, ...prev]);
        showNotice(`Đã thêm sản phẩm "${payload.name}"`);
      }
      setShowProductModal(false);
    } catch (err) {
      alert("Lỗi khi lưu sản phẩm!");
    }
  };

  const handleDeleteProduct = async (prod) => {
    if (!window.confirm(`Xóa sản phẩm "${prod.name}" khỏi cửa hàng?`)) return;
    try {
      await axios.delete(`http://localhost:9999/products/${prod.id}`);
      setProducts((prev) =>
        prev.filter((p) => String(p.id) !== String(prod.id)),
      );
      showNotice(`Đã xóa sản phẩm "${prod.name}"`);
    } catch (err) {
      alert("Không thể xóa sản phẩm!");
    }
  };

  // --- CRUD Khóa Học ---
  const openAddCourse = () => {
    setEditingCourse(null);
    setCourseForm({
      title: "",
      category: "Cơ bản",
      level: "Người mới bắt đầu",
      price: "2500000",
      originalPrice: "3000000",
      duration: "4 tuần (12 buổi - 1.5h/buổi)",
      schedule: "Thứ 2 - 4 - 6 (18:00 - 19:30)",
      coachName: "Nguyễn Hoàng Nam",
      maxStudents: "6",
      image: "/image/courseImg/course1.jpg",
      description: "",
    });
    setShowCourseModal(true);
  };

  const openEditCourse = (c) => {
    setEditingCourse(c);
    setCourseForm({
      title: c.title || "",
      category: c.category || "Cơ bản",
      level: c.level || "",
      price: String(c.price || ""),
      originalPrice: String(c.originalPrice || ""),
      duration: c.duration || "",
      schedule: c.schedule || "",
      coachName: c.coachName || "",
      maxStudents: String(c.maxStudents || 6),
      image: c.image || "/image/courseImg/course1.jpg",
      description: c.description || "",
    });
    setShowCourseModal(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.title.trim() || !courseForm.price) return;

    const payload = {
      title: courseForm.title.trim(),
      category: courseForm.category,
      level: courseForm.level.trim(),
      price: Number(courseForm.price) || 0,
      originalPrice:
        Number(courseForm.originalPrice) || Number(courseForm.price) || 0,
      duration: courseForm.duration.trim(),
      schedule: courseForm.schedule.trim(),
      coachName: courseForm.coachName.trim(),
      maxStudents: Math.max(1, Number(courseForm.maxStudents) || 6),
      isFeatured: editingCourse?.isFeatured ?? true,
      image: courseForm.image.trim() || "/image/courseImg/course1.jpg",
      description: courseForm.description.trim(),
    };

    try {
      if (editingCourse) {
        const res = await axios.patch(
          `http://localhost:9999/courses/${editingCourse.id}`,
          payload,
        );
        setCourses((prev) =>
          prev.map((c) =>
            String(c.id) === String(editingCourse.id)
              ? { ...c, ...res.data }
              : c,
          ),
        );
        showNotice(`Đã cập nhật khóa học "${payload.title}"`);
      } else {
        const res = await axios.post("http://localhost:9999/courses", payload);
        setCourses((prev) => [...prev, res.data]);
        showNotice(`Đã thêm khóa học "${payload.title}"`);
      }
      setShowCourseModal(false);
    } catch (err) {
      alert("Lỗi khi lưu khóa học!");
    }
  };

  const handleDeleteCourse = async (c) => {
    if (!window.confirm(`Xóa khóa học "${c.title}"?`)) return;
    try {
      await axios.delete(`http://localhost:9999/courses/${c.id}`);
      setCourses((prev) =>
        prev.filter((item) => String(item.id) !== String(c.id)),
      );
      showNotice(`Đã xóa khóa học "${c.title}"`);
    } catch (err) {
      alert("Không thể xóa khóa học!");
    }
  };

  if (currentUser?.role !== "admin") {
    return (
      <Container className="py-5 text-center">
        <Card
          className="p-5 shadow-sm border-0 rounded-4 mx-auto"
          style={{ maxWidth: "600px" }}
        >
          <i className="bi bi-shield-lock text-warning display-3 mb-3"></i>
          <h3 className="fw-bold text-dark">Khu Vực Dành Cho Quản Trị Viên</h3>
          <p className="text-muted">
            Bạn hiện đang ở quyền{" "}
            <strong>
              {currentUser ? currentUser.fullName : "Khách vãng lai"}
            </strong>
            . Vui lòng đăng nhập bằng tài khoản Quản Trị Viên để truy cập.
          </p>
          <div className="d-flex justify-content-center gap-2 mt-3">
            <Button as={Link} to="/login" variant="primary">
              <i className="bi bi-box-arrow-in-right me-1"></i> Đến trang Đăng
              Nhập
            </Button>
            <Button as={Link} to="/" variant="outline-secondary">
              Về Trang Chủ
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  const pendingBookingsCount = bookings.filter(
    (b) => b.status === "pending",
  ).length;
  const pendingOrdersCount = orders.filter(
    (o) => o.status === "pending",
  ).length;
  const pendingRegsCount = registrations.filter(
    (r) => r.status === "pending",
  ).length;
  const unreadContactsCount = contacts.filter(
    (c) => c.status !== "replied",
  ).length;

  return (
    <div className="admin-page py-5 bg-light min-vh-100">
      <Container>
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <Badge bg="danger" className="px-3 py-2 text-uppercase mb-2">
              Hệ Thống Quản Trị CMS
            </Badge>
            <h1 className="fw-bold text-dark mb-1">
              Bảng Điều Khiển Quản Trị (Admin Panel)
            </h1>
            <p className="text-muted mb-0">
              Duyệt đặt sân, đơn hàng, hồ sơ học viên và quản lý danh mục sản
              phẩm / khóa học.
            </p>
          </div>
          <Button variant="outline-secondary" size="sm" onClick={fetchData}>
            <i className="bi bi-arrow-clockwise me-1"></i> Làm mới dữ liệu
          </Button>
        </div>

        {actionMessage && (
          <Alert
            variant="success"
            dismissible
            onClose={() => setActionMessage("")}
            className="mb-4"
          >
            <i className="bi bi-check-circle-fill me-2"></i> {actionMessage}
          </Alert>
        )}

        {/* THẺ THỐNG KÊ */}
        <Row className="g-3 mb-4">
          <Col xs={6} md={3}>
            <Card className="border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <span className="text-muted small">Đặt Sân Chờ Duyệt</span>
              <h3 className="fw-bold text-warning mb-0">
                {pendingBookingsCount}
              </h3>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <span className="text-muted small">Đơn Hàng Chờ Xử Lý</span>
              <h3 className="fw-bold text-danger mb-0">{pendingOrdersCount}</h3>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <span className="text-muted small">Ghi Danh Chờ Duyệt</span>
              <h3 className="fw-bold text-primary mb-0">{pendingRegsCount}</h3>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <span className="text-muted small">Liên Hệ Mới</span>
              <h3 className="fw-bold text-success mb-0">
                {unreadContactsCount}
              </h3>
            </Card>
          </Col>
        </Row>

        <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <Card.Header className="bg-white border-bottom pt-3 px-4">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="border-bottom-0"
            >
              <Tab
                eventKey="bookings"
                title={
                  <span>
                    Đặt Sân{" "}
                    {pendingBookingsCount > 0 && (
                      <Badge bg="warning" text="dark">
                        {pendingBookingsCount}
                      </Badge>
                    )}
                  </span>
                }
              />
              <Tab
                eventKey="orders"
                title={
                  <span>
                    Đơn Hàng{" "}
                    {pendingOrdersCount > 0 && (
                      <Badge bg="danger">{pendingOrdersCount}</Badge>
                    )}
                  </span>
                }
              />
              <Tab
                eventKey="registrations"
                title={
                  <span>
                    Ghi Danh{" "}
                    {pendingRegsCount > 0 && (
                      <Badge bg="primary">{pendingRegsCount}</Badge>
                    )}
                  </span>
                }
              />
              <Tab
                eventKey="contacts"
                title={
                  <span>
                    Liên Hệ{" "}
                    {unreadContactsCount > 0 && (
                      <Badge bg="success">{unreadContactsCount}</Badge>
                    )}
                  </span>
                }
              />
              <Tab
                eventKey="products"
                title={`Sản Phẩm (${products.length})`}
              />
              <Tab eventKey="courses" title={`Khóa Học (${courses.length})`} />
            </Tabs>
          </Card.Header>

          <Card.Body className="p-4">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : activeTab === "bookings" ? (
              <div className="table-responsive">
                <Table hover align="middle" className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Mã</th>
                      <th>Sân tập</th>
                      <th>Khách đặt</th>
                      <th>Ngày & Giờ</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                      <th className="text-end">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <strong className="text-primary">#{b.id}</strong>
                        </td>
                        <td className="fw-semibold">{b.courtName}</td>
                        <td>
                          <div className="fw-bold">{b.customerName}</div>
                          <small className="text-muted">{b.phone}</small>
                        </td>
                        <td>
                          <div>{b.date}</div>
                          <small className="text-primary fw-semibold">
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
                            text={b.status === "pending" ? "dark" : "white"}
                          >
                            {b.status === "confirmed"
                              ? "Đã duyệt"
                              : b.status === "cancelled"
                                ? "Đã hủy"
                                : "Chờ duyệt"}
                          </Badge>
                        </td>
                        <td className="text-end text-nowrap">
                          {b.status !== "confirmed" && (
                            <Button
                              variant="success"
                              size="sm"
                              className="me-1"
                              onClick={() =>
                                handleUpdateBookingStatus(
                                  b.id,
                                  "confirmed",
                                  "paid",
                                )
                              }
                            >
                              Duyệt
                            </Button>
                          )}
                          {b.status !== "cancelled" && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() =>
                                handleUpdateBookingStatus(b.id, "cancelled")
                              }
                            >
                              Hủy
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : activeTab === "orders" ? (
              <div className="table-responsive">
                <Table hover align="middle" className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Mã đơn</th>
                      <th>Khách hàng</th>
                      <th>Sản phẩm</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                      <th className="text-end">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td>
                          <strong className="text-primary">{o.id}</strong>
                        </td>
                        <td>
                          <div className="fw-bold">{o.customerName}</div>
                          <small className="text-muted d-block">
                            {o.phone}
                          </small>
                          <small className="text-muted">
                            {o.shippingAddress}
                          </small>
                        </td>
                        <td>
                          <ul className="list-unstyled mb-0 small">
                            {o.items?.map((it, i) => (
                              <li key={i}>
                                <strong>x{it.quantity}</strong> {it.name}
                              </li>
                            ))}
                          </ul>
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
                            text={o.status === "pending" ? "dark" : "white"}
                          >
                            {o.status === "completed"
                              ? "Hoàn thành"
                              : o.status === "shipping"
                                ? "Đang giao"
                                : o.status === "cancelled"
                                  ? "Đã hủy"
                                  : "Chờ xác nhận"}
                          </Badge>
                        </td>
                        <td className="text-end text-nowrap">
                          {o.status === "pending" && (
                            <Button
                              variant="primary"
                              size="sm"
                              className="me-1"
                              onClick={() =>
                                handleUpdateOrderStatus(o.id, "shipping")
                              }
                            >
                              Giao hàng
                            </Button>
                          )}
                          {o.status === "shipping" && (
                            <Button
                              variant="success"
                              size="sm"
                              className="me-1"
                              onClick={() =>
                                handleUpdateOrderStatus(
                                  o.id,
                                  "completed",
                                  "paid",
                                )
                              }
                            >
                              Hoàn thành
                            </Button>
                          )}
                          {o.status !== "cancelled" &&
                            o.status !== "completed" && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() =>
                                  handleUpdateOrderStatus(o.id, "cancelled")
                                }
                              >
                                Hủy
                              </Button>
                            )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : activeTab === "registrations" ? (
              <div className="table-responsive">
                <Table hover align="middle" className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Mã</th>
                      <th>Khóa học</th>
                      <th>Học viên</th>
                      <th>Lịch mong muốn</th>
                      <th>Trạng thái</th>
                      <th className="text-end">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <strong className="text-primary">#{r.id}</strong>
                        </td>
                        <td className="fw-bold">{r.courseName}</td>
                        <td>
                          <div className="fw-bold">{r.fullName}</div>
                          <small className="text-muted">
                            {r.phone} • {r.email}
                          </small>
                        </td>
                        <td>{r.preferredSchedule}</td>
                        <td>
                          <Badge
                            bg={
                              r.status === "confirmed"
                                ? "success"
                                : r.status === "cancelled"
                                  ? "danger"
                                  : "warning"
                            }
                            text={r.status === "pending" ? "dark" : "white"}
                          >
                            {r.status === "confirmed"
                              ? "Đã xếp lớp"
                              : r.status === "cancelled"
                                ? "Đã hủy"
                                : "Chờ duyệt"}
                          </Badge>
                        </td>
                        <td className="text-end text-nowrap">
                          {r.status !== "confirmed" && (
                            <Button
                              variant="success"
                              size="sm"
                              className="me-1"
                              onClick={() =>
                                handleUpdateRegistrationStatus(
                                  r.id,
                                  "confirmed",
                                )
                              }
                            >
                              Duyệt
                            </Button>
                          )}
                          {r.status !== "cancelled" && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() =>
                                handleUpdateRegistrationStatus(
                                  r.id,
                                  "cancelled",
                                )
                              }
                            >
                              Hủy
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : activeTab === "contacts" ? (
              <div className="table-responsive">
                <Table hover align="middle" className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Mã</th>
                      <th>Người gửi</th>
                      <th>Chủ đề & Nội dung</th>
                      <th>Trạng thái</th>
                      <th className="text-end">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <strong className="text-primary">#{c.id}</strong>
                        </td>
                        <td>
                          <div className="fw-bold">{c.fullName}</div>
                          <small className="text-muted">
                            {c.phone} • {c.email}
                          </small>
                        </td>
                        <td style={{ maxWidth: "380px" }}>
                          <div className="fw-semibold">
                            {c.subject || "Tư vấn chung"}
                          </div>
                          <small className="text-secondary">{c.message}</small>
                        </td>
                        <td>
                          <Badge
                            bg={c.status === "replied" ? "success" : "warning"}
                            text={c.status === "replied" ? "white" : "dark"}
                          >
                            {c.status === "replied"
                              ? "Đã phản hồi"
                              : "Chưa xử lý"}
                          </Badge>
                        </td>
                        <td className="text-end">
                          {c.status !== "replied" && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleMarkContactReplied(c.id)}
                            >
                              Đánh dấu đã phản hồi
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : activeTab === "products" ? (
              /* TAB 5: QUẢN LÝ SẢN PHẨM PRO SHOP */
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0">Danh Mục Sản Phẩm Pro Shop</h5>
                  <Button
                    variant="primary"
                    size="sm"
                    className="fw-semibold"
                    onClick={openAddProduct}
                  >
                    <i className="bi bi-plus-lg me-1"></i> Thêm Sản Phẩm Mới
                  </Button>
                </div>
                <div className="table-responsive">
                  <Table hover align="middle" className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Hãng / Loại</th>
                        <th>Giá bán</th>
                        <th>Tồn kho</th>
                        <th className="text-end">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <img
                                src={p.image}
                                alt={p.name}
                                style={{
                                  width: "44px",
                                  height: "44px",
                                  objectFit: "cover",
                                }}
                                className="rounded"
                              />
                              <strong className="small">{p.name}</strong>
                            </div>
                          </td>
                          <td>
                            <Badge bg="dark" className="me-1">
                              {p.brand}
                            </Badge>
                            <small className="text-muted">{p.category}</small>
                          </td>
                          <td className="fw-bold text-danger">
                            {(p.price || 0).toLocaleString("vi-VN")} đ
                          </td>
                          <td>
                            <Badge bg={p.stock > 0 ? "success" : "danger"}>
                              {p.stock > 0 ? `Còn ${p.stock}` : "Hết hàng"}
                            </Badge>
                          </td>
                          <td className="text-end text-nowrap">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-1"
                              onClick={() => openEditProduct(p)}
                            >
                              Sửa
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteProduct(p)}
                            >
                              Xóa
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            ) : (
              /* TAB 6: QUẢN LÝ KHÓA HỌC */
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0">Danh Sách Khóa Học Đào Tạo</h5>
                  <Button
                    variant="primary"
                    size="sm"
                    className="fw-semibold"
                    onClick={openAddCourse}
                  >
                    <i className="bi bi-plus-lg me-1"></i> Thêm Khóa Học Mới
                  </Button>
                </div>
                <div className="table-responsive">
                  <Table hover align="middle" className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Khóa học</th>
                        <th>Phân loại</th>
                        <th>HLV & Lịch học</th>
                        <th>Học phí</th>
                        <th className="text-end">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((c) => (
                        <tr key={c.id}>
                          <td className="fw-bold">{c.title}</td>
                          <td>
                            <Badge bg="info" text="dark">
                              {c.category}
                            </Badge>
                          </td>
                          <td>
                            <div className="small fw-semibold">
                              {c.coachName}
                            </div>
                            <small className="text-muted">{c.schedule}</small>
                          </td>
                          <td className="fw-bold text-danger">
                            {(c.price || 0).toLocaleString("vi-VN")} đ
                          </td>
                          <td className="text-end text-nowrap">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-1"
                              onClick={() => openEditCourse(c)}
                            >
                              Sửa
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteCourse(c)}
                            >
                              Xóa
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* MODAL THÊM / SỬA SẢN PHẨM */}
        <Modal
          show={showProductModal}
          onHide={() => setShowProductModal(false)}
          centered
        >
          <Modal.Header closeButton className="bg-dark text-white">
            <Modal.Title as="h6" className="fw-bold">
              {editingProduct ? "Chỉnh Sửa Sản Phẩm" : "Thêm Sản Phẩm Mới"}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSaveProduct}>
            <Modal.Body className="p-4">
              <Form.Group className="mb-2">
                <Form.Label className="small fw-semibold">
                  Tên sản phẩm *
                </Form.Label>
                <Form.Control
                  required
                  size="sm"
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                />
              </Form.Group>
              <Row className="g-2 mb-2">
                <Col xs={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold">
                      Danh mục
                    </Form.Label>
                    <Form.Select
                      size="sm"
                      value={productForm.category}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          category: e.target.value,
                        })
                      }
                    >
                      <option value="paddles">Vợt (paddles)</option>
                      <option value="balls">Bóng (balls)</option>
                      <option value="shoes">Giày (shoes)</option>
                      <option value="accessories">
                        Phụ kiện (accessories)
                      </option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold">
                      Thương hiệu
                    </Form.Label>
                    <Form.Control
                      size="sm"
                      value={productForm.brand}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          brand: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="g-2 mb-2">
                <Col xs={4}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold">
                      Giá bán *
                    </Form.Label>
                    <Form.Control
                      required
                      type="number"
                      size="sm"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          price: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col xs={4}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold">
                      Giá gốc
                    </Form.Label>
                    <Form.Control
                      type="number"
                      size="sm"
                      value={productForm.originalPrice}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          originalPrice: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col xs={4}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold">
                      Tồn kho *
                    </Form.Label>
                    <Form.Control
                      required
                      type="number"
                      size="sm"
                      value={productForm.stock}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          stock: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-2">
                <Form.Label className="small fw-semibold">
                  URL Hình ảnh
                </Form.Label>
                <Form.Control
                  size="sm"
                  value={productForm.image}
                  onChange={(e) =>
                    setProductForm({ ...productForm, image: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group>
                <Form.Label className="small fw-semibold">
                  Mô tả sản phẩm
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  size="sm"
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      description: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="bg-light">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowProductModal(false)}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                type="submit"
                size="sm"
                className="fw-semibold"
              >
                Lưu Sản Phẩm
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* MODAL THÊM / SỬA KHÓA HỌC */}
        <Modal
          show={showCourseModal}
          onHide={() => setShowCourseModal(false)}
          centered
        >
          <Modal.Header closeButton className="bg-dark text-white">
            <Modal.Title as="h6" className="fw-bold">
              {editingCourse ? "Chỉnh Sửa Khóa Học" : "Thêm Khóa Học Mới"}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSaveCourse}>
            <Modal.Body className="p-4">
              <Form.Group className="mb-2">
                <Form.Label className="small fw-semibold">
                  Tên khóa học *
                </Form.Label>
                <Form.Control
                  required
                  size="sm"
                  value={courseForm.title}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, title: e.target.value })
                  }
                />
              </Form.Group>
              <Row className="g-2 mb-2">
                <Col xs={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold">
                      Danh mục
                    </Form.Label>
                    <Form.Select
                      size="sm"
                      value={courseForm.category}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          category: e.target.value,
                        })
                      }
                    >
                      <option value="Cơ bản">Cơ bản</option>
                      <option value="Nâng cao">Nâng cao</option>
                      <option value="Trẻ em">Trẻ em</option>
                      <option value="1 kèm 1">1 kèm 1</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold">
                      HLV phụ trách
                    </Form.Label>
                    <Form.Control
                      size="sm"
                      value={courseForm.coachName}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          coachName: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="g-2 mb-2">
                <Col xs={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold">
                      Học phí *
                    </Form.Label>
                    <Form.Control
                      required
                      type="number"
                      size="sm"
                      value={courseForm.price}
                      onChange={(e) =>
                        setCourseForm({ ...courseForm, price: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col xs={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold">
                      Sĩ số tối đa
                    </Form.Label>
                    <Form.Control
                      type="number"
                      size="sm"
                      value={courseForm.maxStudents}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          maxStudents: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-2">
                <Form.Label className="small fw-semibold">
                  Lịch học & Thời lượng
                </Form.Label>
                <Form.Control
                  size="sm"
                  value={courseForm.schedule}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, schedule: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group>
                <Form.Label className="small fw-semibold">
                  Mô tả khóa học
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  size="sm"
                  value={courseForm.description}
                  onChange={(e) =>
                    setCourseForm({
                      ...courseForm,
                      description: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="bg-light">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowCourseModal(false)}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                type="submit"
                size="sm"
                className="fw-semibold"
              >
                Lưu Khóa Học
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </div>
  );
}

export default AdminDashboard;
