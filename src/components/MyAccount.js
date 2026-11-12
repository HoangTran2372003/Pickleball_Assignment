import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Table, Badge, Button, Tabs, Tab, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function MyAccount() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [bookingRes, orderRes, regRes] = await Promise.all([
          axios.get('http://localhost:9999/courtBookings'),
          axios.get('http://localhost:9999/orders'),
          axios.get('http://localhost:9999/registrations')
        ]);

        const allBookings = Array.isArray(bookingRes.data) ? bookingRes.data : [];
        const allOrders = Array.isArray(orderRes.data) ? orderRes.data : [];
        const allRegs = Array.isArray(regRes.data) ? regRes.data : [];

        // Nếu có user đăng nhập, lọc theo SĐT hoặc email hoặc tên của user
        if (currentUser) {
          const userBookings = allBookings.filter(
            (b) => b.phone === currentUser.phone || b.email === currentUser.email || b.customerName === currentUser.fullName
          );
          const userOrders = allOrders.filter(
            (o) => o.phone === currentUser.phone || o.email === currentUser.email || o.customerName === currentUser.fullName
          );
          const userRegs = allRegs.filter(
            (r) => r.phone === currentUser.phone || r.email === currentUser.email || r.fullName === currentUser.fullName
          );

          setBookings(userBookings.reverse());
          setOrders(userOrders.reverse());
          setRegistrations(userRegs.reverse());
        } else {
          setBookings(allBookings.slice(-3).reverse());
          setOrders(allOrders.slice(-3).reverse());
          setRegistrations(allRegs.slice(-3).reverse());
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu cá nhân:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  return (
    <div className="my-account-page py-5 bg-light min-vh-100">
      <Container>
        {/* BANNER THÔNG TIN TÀI KHOẢN */}
        <Card className="border-0 shadow-sm rounded-4 p-4 mb-4 bg-dark text-white">
          <Row className="align-items-center g-3">
            <Col xs="auto">
              <img
                src={currentUser ? currentUser.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                alt={currentUser ? currentUser.fullName : 'Guest'}
                className="rounded-circle border border-3 border-warning"
                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
              />
            </Col>
            <Col>
              <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                <h3 className="fw-bold mb-0 text-white">
                  {currentUser ? currentUser.fullName : 'Khách Vãng Lai'}
                </h3>
                <Badge bg={currentUser?.role === 'admin' ? 'danger' : 'warning'} text="dark">
                  {currentUser ? currentUser.membershipTier : 'Chưa đăng nhập'}
                </Badge>
              </div>
              <p className="text-light opacity-75 small mb-0">
                <i className="bi bi-envelope me-1"></i> {currentUser?.email || 'Chưa liên kết email'} &nbsp;|&nbsp;
                <i className="bi bi-telephone ms-2 me-1"></i> {currentUser?.phone || 'Chưa liên kết SĐT'}
              </p>
            </Col>
            <Col xs={12} md="auto">
              <div className="d-flex gap-2 flex-wrap">
                {!currentUser && (
                  <Button as={Link} to="/login" variant="warning" size="sm" className="fw-bold text-dark">
                    <i className="bi bi-box-arrow-in-right me-1"></i> Đăng nhập
                  </Button>
                )}
                <Button as={Link} to="/courses" variant="outline-light" size="sm">
                  <i className="bi bi-mortarboard me-1"></i> Khóa học
                </Button>
                <Button as={Link} to="/court-booking" variant="outline-warning" size="sm">
                  <i className="bi bi-calendar-plus me-1"></i> Đặt sân
                </Button>
                <Button as={Link} to="/shop" variant="primary" size="sm">
                  <i className="bi bi-bag-plus me-1"></i> Mua dụng cụ
                </Button>
              </div>
            </Col>
          </Row>
        </Card>

        {/* NỘI DUNG LỊCH SỬ ĐẶT SÂN, ĐƠN HÀNG & KHÓA HỌC */}
        <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden">
          <Card.Header className="bg-white border-bottom pt-3 px-4">
            <Tabs defaultActiveKey="myCourses" className="border-bottom-0">
              {/* TAB 1: KHÓA HỌC ĐÃ ĐĂNG KÝ */}
              <Tab
                eventKey="myCourses"
                title={
                  <span>
                    <i className="bi bi-mortarboard me-2"></i> Khóa Học Của Tôi ({registrations.length})
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
                      <Button as={Link} to="/courses" variant="primary" size="sm">
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
                            <th>Trạng thái hồ sơ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registrations.map((r) => (
                            <tr key={r.id}>
                              <td>
                                <strong className="text-primary">#{r.id}</strong>
                              </td>
                              <td className="fw-bold text-dark">{r.courseName}</td>
                              <td>
                                <div><i className="bi bi-calendar3 me-1 text-primary"></i>{r.preferredSchedule}</div>
                                <small className="text-muted">{r.notes}</small>
                              </td>
                              <td>{new Date(r.createdAt).toLocaleDateString('vi-VN')}</td>
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
                                    ? 'Đã xếp lớp thành công'
                                    : r.status === 'cancelled'
                                    ? 'Đã hủy'
                                    : 'Chờ học viện xếp lớp'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </div>
              </Tab>

              {/* TAB 2: LỊCH SỬ ĐẶT SÂN */}
              <Tab
                eventKey="myBookings"
                title={
                  <span>
                    <i className="bi bi-calendar-check me-2"></i> Lịch Sử Đặt Sân ({bookings.length})
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
                      <Button as={Link} to="/court-booking" variant="primary" size="sm">
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
                            <th>Trạng thái duyệt</th>
                            <th>Thanh toán</th>
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
                                <div><i className="bi bi-calendar-event me-1"></i>{b.date}</div>
                                <small className="text-primary fw-bold">{b.timeSlot}</small>
                              </td>
                              <td className="fw-bold text-danger">{(b.totalPrice || 0).toLocaleString('vi-VN')} đ</td>
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
                                    : 'Chờ admin duyệt'}
                                </Badge>
                              </td>
                              <td>
                                <Badge bg={b.paymentStatus === 'paid' ? 'success' : 'secondary'}>
                                  {b.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </div>
              </Tab>

              {/* TAB 3: ĐƠN HÀNG DỤNG CỤ */}
              <Tab
                eventKey="myOrders"
                title={
                  <span>
                    <i className="bi bi-box-seam me-2"></i> Đơn Hàng Dụng Cụ ({orders.length})
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
                            <th>Trạng thái đơn hàng</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((o) => (
                            <tr key={o.id}>
                              <td>
                                <strong className="text-primary">{o.id}</strong>
                              </td>
                              <td>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                              <td>
                                <ul className="list-unstyled mb-0 small">
                                  {o.items?.map((item, idx) => (
                                    <li key={idx}>
                                      <strong>x{item.quantity}</strong> {item.name}
                                    </li>
                                  ))}
                                </ul>
                              </td>
                              <td><small className="text-muted">{o.shippingAddress}</small></td>
                              <td className="fw-bold text-danger">{(o.totalAmount || 0).toLocaleString('vi-VN')} đ</td>
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
                                    ? 'Đã hoàn thành'
                                    : o.status === 'shipping'
                                    ? 'Đang giao hàng'
                                    : o.status === 'cancelled'
                                    ? 'Đã hủy'
                                    : 'Chờ shop duyệt'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
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
