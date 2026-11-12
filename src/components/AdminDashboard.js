import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Table, Badge, Button, Tabs, Tab, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminDashboard() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  // Tải dữ liệu đặt sân, đơn hàng và đăng ký khóa học từ json-server
  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingRes, orderRes, regRes] = await Promise.all([
        axios.get('http://localhost:9999/courtBookings'),
        axios.get('http://localhost:9999/orders'),
        axios.get('http://localhost:9999/registrations')
      ]);
      setBookings(Array.isArray(bookingRes.data) ? bookingRes.data.reverse() : []);
      setOrders(Array.isArray(orderRes.data) ? orderRes.data.reverse() : []);
      setRegistrations(Array.isArray(regRes.data) ? regRes.data.reverse() : []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu quản trị:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Cập nhật trạng thái đặt sân
  const handleUpdateBookingStatus = async (id, newStatus, paymentStatus) => {
    try {
      const payload = { status: newStatus };
      if (paymentStatus) payload.paymentStatus = paymentStatus;

      await axios.patch(`http://localhost:9999/courtBookings/${id}`, payload);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...payload } : b))
      );
      setActionMessage(`Đã cập nhật trạng thái đặt sân #${id} sang "${newStatus === 'confirmed' ? 'Đã duyệt' : 'Đã hủy'}"`);
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      console.error('Lỗi cập nhật đặt sân:', err);
    }
  };

  // Cập nhật trạng thái đơn hàng
  const handleUpdateOrderStatus = async (id, newStatus, paymentStatus) => {
    try {
      const payload = { status: newStatus };
      if (paymentStatus) payload.paymentStatus = paymentStatus;

      await axios.patch(`http://localhost:9999/orders/${id}`, payload);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, ...payload } : o))
      );
      setActionMessage(`Đã cập nhật đơn hàng ${id} sang "${newStatus === 'shipping' ? 'Đang giao hàng' : newStatus === 'completed' ? 'Hoàn thành' : 'Đã hủy'}"`);
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      console.error('Lỗi cập nhật đơn hàng:', err);
    }
  };

  // Cập nhật trạng thái đăng ký khóa học
  const handleUpdateRegistrationStatus = async (id, newStatus) => {
    try {
      const payload = { status: newStatus };
      await axios.patch(`http://localhost:9999/registrations/${id}`, payload);
      setRegistrations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...payload } : r))
      );
      setActionMessage(`Đã cập nhật hồ sơ ghi danh #${id} sang "${newStatus === 'confirmed' ? 'Đã xếp lớp' : 'Đã hủy'}"`);
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      console.error('Lỗi cập nhật ghi danh:', err);
    }
  };

  // Kiểm tra nếu chưa phải quyền Admin
  if (currentUser?.role !== 'admin') {
    return (
      <Container className="py-5 text-center">
        <Card className="p-5 shadow-sm border-0 rounded-4 mx-auto" style={{ maxWidth: '600px' }}>
          <i className="bi bi-shield-lock text-warning display-3 mb-3"></i>
          <h3 className="fw-bold text-dark">Khu Vực Dành Cho Quản Trị Viên</h3>
          <p className="text-muted">
            Bạn hiện đang ở quyền <strong>{currentUser ? currentUser.fullName : 'Khách vãng lai'}</strong>. 
            Để truy cập và duyệt đơn đặt sân hoặc đơn hàng, vui lòng đăng nhập bằng tài khoản Quản Trị Viên.
          </p>
          <div className="d-flex justify-content-center gap-2 mt-3">
            <Button as={Link} to="/login" variant="primary">
              <i className="bi bi-box-arrow-in-right me-1"></i> Đến trang Đăng Nhập
            </Button>
            <Button as={Link} to="/" variant="outline-secondary">
              Về Trang Chủ
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  const pendingBookingsCount = bookings.filter((b) => b.status === 'pending').length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const pendingRegsCount = registrations.filter((r) => r.status === 'pending').length;

  return (
    <div className="admin-page py-5 bg-light min-vh-100">
      <Container>
        {/* TIÊU ĐỀ TRANG ADMIN */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <Badge bg="danger" className="px-3 py-2 text-uppercase mb-2">Hệ Thống Phân Quyền</Badge>
            <h1 className="fw-bold text-dark mb-1">Bảng Quản Trị Học Viện (Admin Panel)</h1>
            <p className="text-muted mb-0">Quản lý và duyệt lịch đặt sân, đơn mua hàng và hồ sơ đăng ký khóa học.</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Button variant="outline-secondary" size="sm" onClick={fetchData}>
              <i className="bi bi-arrow-clockwise me-1"></i> Làm mới dữ liệu
            </Button>
          </div>
        </div>

        {actionMessage && (
          <Alert variant="success" dismissible onClose={() => setActionMessage('')} className="mb-4">
            <i className="bi bi-check-circle-fill me-2"></i> {actionMessage}
          </Alert>
        )}

        {/* THẺ THỐNG KÊ NHANH */}
        <Row className="g-3 mb-4">
          <Col xs={12} sm={6} md={3}>
            <Card className="border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted small">Đặt Sân Chờ Duyệt</span>
                  <h3 className="fw-bold text-warning mb-0">{pendingBookingsCount}</h3>
                </div>
                <div className="p-3 bg-warning bg-opacity-10 rounded-circle text-warning fs-4">
                  <i className="bi bi-calendar-event"></i>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Card className="border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted small">Đơn Hàng Chờ Xử Lý</span>
                  <h3 className="fw-bold text-danger mb-0">{pendingOrdersCount}</h3>
                </div>
                <div className="p-3 bg-danger bg-opacity-10 rounded-circle text-danger fs-4">
                  <i className="bi bi-bag-dash"></i>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Card className="border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted small">Đăng Ký Học Chờ Duyệt</span>
                  <h3 className="fw-bold text-primary mb-0">{pendingRegsCount}</h3>
                </div>
                <div className="p-3 bg-primary bg-opacity-10 rounded-circle text-primary fs-4">
                  <i className="bi bi-pencil-square"></i>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Card className="border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted small">Tổng Học Viên Ghi Danh</span>
                  <h3 className="fw-bold text-success mb-0">{registrations.length}</h3>
                </div>
                <div className="p-3 bg-success bg-opacity-10 rounded-circle text-success fs-4">
                  <i className="bi bi-people"></i>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* TABS QUẢN LÝ */}
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
                    <i className="bi bi-calendar-check me-2"></i> Quản Lý Đặt Sân
                    {pendingBookingsCount > 0 && (
                      <Badge bg="warning" text="dark" className="ms-2">{pendingBookingsCount}</Badge>
                    )}
                  </span>
                }
              />
              <Tab
                eventKey="orders"
                title={
                  <span>
                    <i className="bi bi-box-seam me-2"></i> Quản Lý Đơn Hàng Shop
                    {pendingOrdersCount > 0 && (
                      <Badge bg="danger" className="ms-2">{pendingOrdersCount}</Badge>
                    )}
                  </span>
                }
              />
              <Tab
                eventKey="registrations"
                title={
                  <span>
                    <i className="bi bi-mortarboard me-2"></i> Quản Lý Đăng Ký Khóa Học
                    {pendingRegsCount > 0 && (
                      <Badge bg="primary" className="ms-2">{pendingRegsCount}</Badge>
                    )}
                  </span>
                }
              />
            </Tabs>
          </Card.Header>

          <Card.Body className="p-4">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">Đang tải dữ liệu quản trị...</p>
              </div>
            ) : activeTab === 'bookings' ? (
              /* TAB 1: QUẢN LÝ ĐẶT SÂN */
              bookings.length === 0 ? (
                <p className="text-center text-muted py-4">Chưa có lượt đặt sân nào.</p>
              ) : (
                <div className="table-responsive">
                  <Table hover align="middle" className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Mã</th>
                        <th>Sân tập</th>
                        <th>Khách đặt & SĐT</th>
                        <th>Ngày & Khung giờ</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                        <th className="text-end text-nowrap" style={{ minWidth: '170px', width: '170px' }}>Hành động của Admin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id}>
                          <td>
                            <strong className="text-primary">#{b.id}</strong>
                          </td>
                          <td>
                            <div className="fw-semibold text-dark">{b.courtName}</div>
                            <small className="text-muted">{b.notes || 'Không ghi chú'}</small>
                          </td>
                          <td>
                            <div className="fw-bold">{b.customerName}</div>
                            <small className="text-muted"><i className="bi bi-telephone me-1"></i>{b.phone}</small>
                          </td>
                          <td>
                            <div><i className="bi bi-calendar-event me-1"></i>{b.date}</div>
                            <small className="text-primary fw-semibold">{b.timeSlot}</small>
                          </td>
                          <td>
                            <div className="fw-bold text-danger">{(b.totalPrice || 0).toLocaleString('vi-VN')} đ</div>
                            <Badge bg={b.paymentStatus === 'paid' ? 'success' : 'secondary'} className="small">
                              {b.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                            </Badge>
                          </td>
                          <td>
                            <Badge
                              bg={
                                b.status === 'confirmed'
                                  ? 'success'
                                  : b.status === 'cancelled'
                                  ? 'danger'
                                  : 'warning'
                              }
                              text={b.status === 'pending' ? 'dark' : 'white'}
                              className="px-2 py-1"
                            >
                              {b.status === 'confirmed'
                                ? 'Đã duyệt'
                                : b.status === 'cancelled'
                                ? 'Đã hủy'
                                : 'Chờ duyệt'}
                            </Badge>
                          </td>
                          <td className="text-end text-nowrap" style={{ minWidth: '170px', width: '170px' }}>
                            <div className="d-flex justify-content-end align-items-center gap-1 flex-nowrap">
                              {b.status !== 'confirmed' ? (
                                <Button
                                  variant="success"
                                  size="sm"
                                  className="px-2 py-1 text-nowrap fw-semibold d-inline-flex align-items-center"
                                  onClick={() => handleUpdateBookingStatus(b.id, 'confirmed', 'paid')}
                                  title="Duyệt sân và xác nhận"
                                >
                                  <i className="bi bi-check-lg me-1"></i> Duyệt
                                </Button>
                              ) : (
                                <span className="badge bg-light text-success border border-success px-2 py-1 small text-nowrap me-1">
                                  <i className="bi bi-check-circle-fill me-1"></i> Đã duyệt
                                </span>
                              )}
                              {b.status !== 'cancelled' ? (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  className="px-2 py-1 text-nowrap d-inline-flex align-items-center"
                                  onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                                  title="Từ chối hoặc hủy"
                                >
                                  <i className="bi bi-x-lg me-1"></i> Hủy
                                </Button>
                              ) : (
                                <span className="badge bg-light text-secondary border px-2 py-1 small text-nowrap">
                                  Đã hủy
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )
            ) : activeTab === 'orders' ? (
              /* TAB 2: QUẢN LÝ ĐƠN HÀNG SHOP */
              orders.length === 0 ? (
                <p className="text-center text-muted py-4">Chưa có đơn hàng nào.</p>
              ) : (
                <div className="table-responsive">
                  <Table hover align="middle" className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng & Địa chỉ</th>
                        <th>Sản phẩm</th>
                        <th>Tổng tiền & PT Thanh toán</th>
                        <th>Trạng thái</th>
                        <th className="text-end text-nowrap" style={{ minWidth: '180px', width: '180px' }}>Hành động của Admin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id}>
                          <td>
                            <strong className="text-primary">{o.id}</strong>
                            <div className="small text-muted">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</div>
                          </td>
                          <td>
                            <div className="fw-bold">{o.customerName}</div>
                            <small className="text-muted d-block"><i className="bi bi-telephone me-1"></i>{o.phone}</small>
                            <small className="text-muted"><i className="bi bi-geo-alt me-1"></i>{o.shippingAddress}</small>
                          </td>
                          <td>
                            <ul className="list-unstyled mb-0 small">
                              {o.items?.map((item, idx) => (
                                <li key={idx}>
                                  <strong>x{item.quantity}</strong> {item.name}
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td>
                            <div className="fw-bold text-danger">{(o.totalAmount || 0).toLocaleString('vi-VN')} đ</div>
                            <Badge bg="info" text="dark" className="me-1">{o.paymentMethod || 'COD'}</Badge>
                            <Badge bg={o.paymentStatus === 'paid' ? 'success' : 'secondary'}>
                              {o.paymentStatus === 'paid' ? 'Đã TT' : 'Chưa TT'}
                            </Badge>
                          </td>
                          <td>
                            <Badge
                              bg={
                                o.status === 'completed'
                                  ? 'success'
                                  : o.status === 'shipping'
                                  ? 'primary'
                                  : o.status === 'cancelled'
                                  ? 'danger'
                                  : 'warning'
                              }
                              text={o.status === 'pending' ? 'dark' : 'white'}
                              className="px-2 py-1"
                            >
                              {o.status === 'completed'
                                ? 'Hoàn thành'
                                : o.status === 'shipping'
                                ? 'Đang giao'
                                : o.status === 'cancelled'
                                ? 'Đã hủy'
                                : 'Chờ xác nhận'}
                            </Badge>
                          </td>
                          <td className="text-end text-nowrap" style={{ minWidth: '180px', width: '180px' }}>
                            <div className="d-flex justify-content-end align-items-center gap-1 flex-nowrap">
                              {o.status === 'pending' && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="px-2 py-1 text-nowrap fw-semibold d-inline-flex align-items-center"
                                  onClick={() => handleUpdateOrderStatus(o.id, 'shipping')}
                                >
                                  <i className="bi bi-truck me-1"></i> Giao hàng
                                </Button>
                              )}
                              {o.status === 'shipping' && (
                                <Button
                                  variant="success"
                                  size="sm"
                                  className="px-2 py-1 text-nowrap fw-semibold d-inline-flex align-items-center"
                                  onClick={() => handleUpdateOrderStatus(o.id, 'completed', 'paid')}
                                >
                                  <i className="bi bi-check-circle me-1"></i> Hoàn thành
                                </Button>
                              )}
                              {o.status === 'completed' && (
                                <span className="badge bg-light text-success border border-success px-2 py-1 small text-nowrap me-1">
                                  <i className="bi bi-check-all me-1"></i> Xong
                                </span>
                              )}
                              {o.status !== 'cancelled' && o.status !== 'completed' && (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  className="px-2 py-1 text-nowrap d-inline-flex align-items-center"
                                  onClick={() => handleUpdateOrderStatus(o.id, 'cancelled')}
                                >
                                  <i className="bi bi-x-lg me-1"></i> Hủy
                                </Button>
                              )}
                              {o.status === 'cancelled' && (
                                <span className="badge bg-light text-secondary border px-2 py-1 small text-nowrap">
                                  Đã hủy
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )
            ) : (
              /* TAB 3: QUẢN LÝ ĐĂNG KÝ KHÓA HỌC */
              registrations.length === 0 ? (
                <p className="text-center text-muted py-4">Chưa có hồ sơ đăng ký khóa học nào.</p>
              ) : (
                <div className="table-responsive">
                  <Table hover align="middle" className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Mã hồ sơ</th>
                        <th>Khóa học</th>
                        <th>Học viên</th>
                        <th>Lịch mong muốn & Ghi chú</th>
                        <th>Ngày gửi</th>
                        <th>Trạng thái</th>
                        <th className="text-end text-nowrap" style={{ minWidth: '170px', width: '170px' }}>Hành động của Admin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map((r) => (
                        <tr key={r.id}>
                          <td>
                            <strong className="text-primary">#{r.id}</strong>
                          </td>
                          <td>
                            <div className="fw-bold text-dark">{r.courseName}</div>
                            <small className="text-muted">Mã khóa: {r.courseId}</small>
                          </td>
                          <td>
                            <div className="fw-bold">{r.fullName}</div>
                            <small className="text-muted d-block"><i className="bi bi-telephone me-1"></i>{r.phone}</small>
                            <small className="text-muted"><i className="bi bi-envelope me-1"></i>{r.email}</small>
                          </td>
                          <td>
                            <div><i className="bi bi-calendar3 me-1 text-primary"></i>{r.preferredSchedule}</div>
                            <small className="text-secondary fst-italic">{r.notes}</small>
                          </td>
                          <td>
                            <small className="text-muted">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</small>
                          </td>
                          <td>
                            <Badge
                              bg={
                                r.status === 'confirmed'
                                  ? 'success'
                                  : r.status === 'cancelled'
                                  ? 'danger'
                                  : 'warning'
                              }
                              text={r.status === 'pending' ? 'dark' : 'white'}
                              className="px-2 py-1"
                            >
                              {r.status === 'confirmed'
                                ? 'Đã xếp lớp'
                                : r.status === 'cancelled'
                                ? 'Đã hủy'
                                : 'Chờ tư vấn & duyệt'}
                            </Badge>
                          </td>
                          <td className="text-end text-nowrap" style={{ minWidth: '170px', width: '170px' }}>
                            <div className="d-flex justify-content-end align-items-center gap-1 flex-nowrap">
                              {r.status !== 'confirmed' ? (
                                <Button
                                  variant="success"
                                  size="sm"
                                  className="px-2 py-1 text-nowrap fw-semibold d-inline-flex align-items-center"
                                  onClick={() => handleUpdateRegistrationStatus(r.id, 'confirmed')}
                                  title="Duyệt hồ sơ và xếp lớp"
                                >
                                  <i className="bi bi-check-lg me-1"></i> Duyệt
                                </Button>
                              ) : (
                                <span className="badge bg-light text-success border border-success px-2 py-1 small text-nowrap me-1">
                                  <i className="bi bi-check-circle-fill me-1"></i> Đã xếp lớp
                                </span>
                              )}
                              {r.status !== 'cancelled' ? (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  className="px-2 py-1 text-nowrap d-inline-flex align-items-center"
                                  onClick={() => handleUpdateRegistrationStatus(r.id, 'cancelled')}
                                  title="Hủy đăng ký"
                                >
                                  <i className="bi bi-x-lg me-1"></i> Hủy
                                </Button>
                              ) : (
                                <span className="badge bg-light text-secondary border px-2 py-1 small text-nowrap">
                                  Đã hủy
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default AdminDashboard;
