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
  Modal,
  Form
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Shop() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bộ lọc danh mục & Tìm kiếm
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // State giỏ hàng
  const [cart, setCart] = useState([]);
  // State xem chi tiết sản phẩm modal
  const [viewProduct, setViewProduct] = useState(null);

  // State Modal Thanh Toán (Checkout)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    paymentMethod: 'COD',
    notes: ''
  });
  const [checkoutErrors, setCheckoutErrors] = useState({});
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Load danh sách sản phẩm từ backend json-server
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:9999/products');
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Lỗi khi tải danh sách sản phẩm:', err);
        setError('Không thể kết nối đến máy chủ cửa hàng. Đang hiển thị chế độ dự phòng.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Cập nhật thông tin form thanh toán khi currentUser thay đổi
  useEffect(() => {
    if (currentUser) {
      setCheckoutForm((prev) => ({
        ...prev,
        fullName: currentUser.fullName || '',
        phone: currentUser.phone || '',
        email: currentUser.email || ''
      }));
    }
  }, [currentUser]);

  // Thêm sản phẩm vào giỏ
  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert('Sản phẩm này hiện đã hết hàng trong kho!');
      return;
    }
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Bạn đã chọn tối đa số lượng có sẵn trong kho (${product.stock})!`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // Cập nhật số lượng trong giỏ
  const updateQuantity = (productId, delta) => {
    const prod = products.find((p) => p.id === productId);
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === productId) {
            if (delta > 0 && prod && item.quantity >= prod.stock) {
              alert(`Chỉ còn ${prod.stock} sản phẩm trong kho!`);
              return item;
            }
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Xóa sản phẩm khỏi giỏ
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Tính tổng tiền giỏ hàng
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  // Xử lý mở Modal Thanh Toán
  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    if (currentUser) {
      setCheckoutForm((prev) => ({
        ...prev,
        fullName: currentUser.fullName || '',
        phone: currentUser.phone || '',
        email: currentUser.email || ''
      }));
    }
    setCheckoutErrors({});
    setShowCheckoutModal(true);
  };

  const handleCheckoutChange = (e) => {
    const { name, value } = e.target;
    setCheckoutForm((prev) => ({ ...prev, [name]: value }));
    if (checkoutErrors[name]) {
      setCheckoutErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validation Form Thanh Toán
  const validateCheckout = () => {
    const errors = {};
    if (!checkoutForm.fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ và tên người nhận.';
    }
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!checkoutForm.phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại.';
    } else if (!phoneRegex.test(checkoutForm.phone.trim())) {
      errors.phone = 'Số điện thoại 10 số không hợp lệ.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!checkoutForm.email.trim()) {
      errors.email = 'Vui lòng nhập email.';
    } else if (!emailRegex.test(checkoutForm.email.trim())) {
      errors.email = 'Email không đúng định dạng.';
    }
    if (!checkoutForm.address.trim()) {
      errors.address = 'Vui lòng nhập địa chỉ nhận hàng chi tiết.';
    }
    setCheckoutErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Gửi đơn hàng lên backend
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!validateCheckout()) return;

    try {
      setIsSubmittingOrder(true);
      const newOrderId = `ORD-${Date.now().toString().slice(-6)}`;
      const orderPayload = {
        id: newOrderId,
        customerName: checkoutForm.fullName.trim(),
        phone: checkoutForm.phone.trim(),
        email: checkoutForm.email.trim(),
        shippingAddress: checkoutForm.address.trim(),
        items: cart.map((c) => ({
          id: c.id,
          name: c.name,
          price: c.price,
          quantity: c.quantity,
          image: c.image
        })),
        totalAmount: cartTotal,
        paymentMethod: checkoutForm.paymentMethod,
        paymentStatus: checkoutForm.paymentMethod === 'Chuyển khoản QR' ? 'paid' : 'unpaid',
        status: 'pending',
        notes: checkoutForm.notes.trim() || 'Không có ghi chú',
        createdAt: new Date().toISOString()
      };

      // 1. Gửi axios POST lên endpoint orders
      await axios.post('http://localhost:9999/orders', orderPayload);

      // 2. Trừ số lượng tồn kho (stock) của từng sản phẩm trong database.json
      await Promise.all(
        cart.map(async (cartItem) => {
          const currentProd = products.find((p) => p.id === cartItem.id);
          if (currentProd) {
            const newStock = Math.max(0, (currentProd.stock || 0) - cartItem.quantity);
            await axios.patch(`http://localhost:9999/products/${cartItem.id}`, { stock: newStock });
          }
        })
      );

      // 3. Cập nhật state products ngay lập tức trên màn hình
      setProducts((prev) =>
        prev.map((p) => {
          const cartItem = cart.find((c) => c.id === p.id);
          if (cartItem) {
            return { ...p, stock: Math.max(0, (p.stock || 0) - cartItem.quantity) };
          }
          return p;
        })
      );

      setCompletedOrder(orderPayload);
      setCart([]);
      setShowCheckoutModal(false);
    } catch (err) {
      console.error('Lỗi khi gửi đơn hàng:', err);
      alert('Không thể lưu đơn hàng. Vui lòng kiểm tra lại kết nối!');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Lọc sản phẩm theo danh mục và từ khóa
  const filteredProducts = products.filter((prod) => {
    const matchCat = selectedCategory === 'all' || prod.category === selectedCategory;
    const matchSearch =
      prod.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      prod.brand.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="shop-page py-5 bg-light min-vh-100">
      <Container>
        {/* TIÊU ĐỀ TRANG */}
        <div className="text-center mb-5">
          <Badge bg="warning" text="dark" className="px-3 py-2 text-uppercase mb-2">Chức Năng Mở Rộng 2</Badge>
          <h1 className="fw-bold text-dark">Cửa Hàng Dụng Cụ Pickleball Pro Shop</h1>
          <p className="text-muted mx-auto" style={{ maxWidth: '650px' }}>
            Cung cấp các dòng vợt cao cấp, bóng thi đấu tiêu chuẩn quốc tế và phụ kiện chính hãng từ Joola, Selkirk, Franklin và Asics.
          </p>
        </div>

        {error && (
          <Alert variant="warning" className="mb-4" role="alert">
            {error}
          </Alert>
        )}

        {/* BỘ LỌC DANH MỤC & TÌM KIẾM */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 p-3 bg-white rounded-4 shadow-sm">
          {/* Bộ lọc */}
          <div className="d-flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Tất cả dụng cụ' },
              { id: 'paddles', label: 'Vợt Pickleball' },
              { id: 'balls', label: 'Bóng thi đấu' },
              { id: 'shoes', label: 'Giày thể thao' },
              { id: 'accessories', label: 'Túi & Phụ kiện' }
            ].map((cat) => (
              <Button
                key={cat.id}
                size="sm"
                className="px-3 rounded-pill fw-semibold"
                variant={selectedCategory === cat.id ? 'primary' : 'outline-secondary'}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Ô tìm kiếm & Giỏ hàng nhanh */}
          <div className="d-flex align-items-center gap-2">
            <Form.Control
              type="text"
              size="sm"
              placeholder="Tìm theo tên hoặc hãng..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ width: '220px' }}
              className="rounded-pill"
            />
            <Badge bg="danger" className="fs-6 px-3 py-2 rounded-pill">
              <i className="bi bi-cart3 me-1"></i> Giỏ hàng ({cart.reduce((sum, i) => sum + i.quantity, 0)})
            </Badge>
          </div>
        </div>

        <Row className="g-4">
          {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
          <Col xs={12} lg={8}>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" role="status" />
                <p className="mt-2 text-muted">Đang tải sản phẩm...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-5 bg-white rounded-4 p-4 shadow-sm">
                <i className="bi bi-search fs-1 text-muted mb-2 d-block"></i>
                <p className="text-muted">Không tìm thấy sản phẩm nào khớp với tìm kiếm.</p>
                <Button size="sm" variant="outline-primary" onClick={() => { setSelectedCategory('all'); setSearchKeyword(''); }}>
                  Xem tất cả sản phẩm
                </Button>
              </div>
            ) : (
              <Row className="g-3">
                {filteredProducts.map((prod) => (
                  <Col xs={12} sm={6} md={6} key={prod.id}>
                    <Card className="h-100 shadow-sm border-0 hover-card rounded-4 overflow-hidden d-flex flex-column">
                      <div className="position-relative">
                        <Card.Img
                          variant="top"
                          src={prod.image}
                          alt={prod.name}
                          style={{ height: '190px', objectFit: 'cover' }}
                        />
                        <Badge bg="dark" className="position-absolute top-0 start-0 m-2">
                          {prod.brand}
                        </Badge>
                        {prod.originalPrice && (
                          <Badge bg="danger" className="position-absolute top-0 end-0 m-2">
                            Giảm {Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}%
                          </Badge>
                        )}
                      </div>

                      <Card.Body className="p-3 d-flex flex-column justify-content-between">
                        <div>
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <small className="text-warning">
                              <i className="bi bi-star-fill me-1"></i>
                              {prod.rating} ({prod.reviewsCount} đánh giá)
                            </small>
                            {prod.stock > 0 ? (
                              <small className="text-muted">Còn: <strong>{prod.stock}</strong></small>
                            ) : (
                              <Badge bg="danger" className="fw-bold">Hết hàng</Badge>
                            )}
                          </div>
                          <Card.Title as="h6" className="fw-bold text-dark text-truncate" title={prod.name}>
                            {prod.name}
                          </Card.Title>
                          <p className="small text-secondary mb-3" style={{ height: '38px', overflow: 'hidden' }}>
                            {prod.description}
                          </p>
                        </div>

                        <div>
                          <div className="d-flex align-items-baseline gap-2 mb-3">
                            <span className="fw-bold text-danger fs-5">
                              {prod.price.toLocaleString('vi-VN')} đ
                            </span>
                            {prod.originalPrice && (
                              <span className="text-muted text-decoration-line-through small">
                                {prod.originalPrice.toLocaleString('vi-VN')} đ
                              </span>
                            )}
                          </div>

                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="w-50"
                              onClick={() => setViewProduct(prod)}
                            >
                              Chi tiết
                            </Button>
                            <Button
                              variant={prod.stock > 0 ? 'primary' : 'secondary'}
                              size="sm"
                              className="w-50 fw-semibold"
                              disabled={prod.stock <= 0}
                              onClick={() => addToCart(prod)}
                            >
                              {prod.stock > 0 ? (
                                <>
                                  <i className="bi bi-cart-plus me-1"></i> Mua ngay
                                </>
                              ) : (
                                'Hết hàng'
                              )}
                            </Button>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Col>

          {/* CỘT PHẢI: GIỎ HÀNG */}
          <Col xs={12} lg={4}>
            <Card className="border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: '80px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <h5 className="fw-bold text-dark mb-0">
                  <i className="bi bi-cart3 text-primary me-2"></i> Giỏ Hàng Của Bạn
                </h5>
                <Badge bg="secondary">{cart.length} mặt hàng</Badge>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-cart-x fs-1 text-secondary mb-2 d-block"></i>
                  <p className="mb-0">Giỏ hàng đang trống.</p>
                  <small>Chọn sản phẩm để thêm vào giỏ.</small>
                </div>
              ) : (
                <>
                  <div className="cart-items-list mb-3" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="d-flex align-items-center justify-content-between py-2 border-bottom"
                      >
                        <div style={{ maxWidth: '170px' }}>
                          <div className="fw-semibold small text-truncate" title={item.name}>
                            {item.name}
                          </div>
                          <span className="text-danger fw-bold small">
                            {item.price.toLocaleString('vi-VN')} đ
                          </span>
                        </div>

                        <div className="d-flex align-items-center gap-1">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="px-2 py-0"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            -
                          </Button>
                          <span className="px-2 small fw-bold">{item.quantity}</span>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="px-2 py-0"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            +
                          </Button>
                          <Button
                            variant="link"
                            className="text-danger p-0 ms-2"
                            onClick={() => removeFromCart(item.id)}
                            title="Xóa"
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-3 pt-2 border-top">
                    <span className="fw-semibold text-muted">Tổng cộng:</span>
                    <span className="h5 fw-bold text-danger mb-0">
                      {cartTotal.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <Button
                    variant="warning"
                    className="w-100 fw-bold py-2 shadow-sm text-dark"
                    onClick={handleOpenCheckout}
                  >
                    <i className="bi bi-credit-card-fill me-2"></i> Tiến Hành Đặt Hàng
                  </Button>

                  <small className="text-secondary text-center d-block mt-2">
                    Miễn phí giao hàng toàn quốc cho đơn từ 1.000.000 đ
                  </small>
                </>
              )}
            </Card>
          </Col>
        </Row>
      </Container>

      {/* MODAL THANH TOÁN (CHECKOUT FORM) */}
      <Modal show={showCheckoutModal} onHide={() => setShowCheckoutModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-dark text-white border-0">
          <Modal.Title as="h5" className="fw-bold">
            <i className="bi bi-bag-check me-2 text-warning"></i> Xác Nhận Đơn Hàng & Thông Tin Nhận Hàng
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitOrder}>
          <Modal.Body className="p-4">
            <Row className="g-3">
              {/* Tóm tắt giỏ hàng */}
              <Col xs={12} md={5}>
                <div className="bg-light p-3 rounded-4 h-100">
                  <h6 className="fw-bold text-dark mb-3 border-bottom pb-2">Đơn hàng ({cart.length} món)</h6>
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {cart.map((item) => (
                      <div key={item.id} className="d-flex justify-content-between align-items-center small mb-2">
                        <span className="text-truncate me-2" style={{ maxWidth: '140px' }}>
                          x{item.quantity} {item.name}
                        </span>
                        <strong className="text-danger">{(item.price * item.quantity).toLocaleString('vi-VN')} đ</strong>
                      </div>
                    ))}
                  </div>
                  <div className="border-top pt-2 mt-2 d-flex justify-content-between align-items-center">
                    <span className="fw-bold">Tổng thanh toán:</span>
                    <h5 className="fw-bold text-danger mb-0">{cartTotal.toLocaleString('vi-VN')} đ</h5>
                  </div>
                  <div className="mt-3 p-2 bg-white rounded border small text-muted">
                    <i className="bi bi-shield-check text-success me-1"></i> Cam kết 100% hàng chính hãng, kiểm tra trước khi nhận.
                  </div>
                </div>
              </Col>

              {/* Form thông tin giao hàng */}
              <Col xs={12} md={7}>
                <h6 className="fw-bold text-dark mb-3">Thông Tin Người Nhận</h6>
                <Form.Group className="mb-2">
                  <Form.Label className="small fw-semibold mb-1">Họ và tên *</Form.Label>
                  <Form.Control
                    type="text"
                    size="sm"
                    name="fullName"
                    value={checkoutForm.fullName}
                    onChange={handleCheckoutChange}
                    isInvalid={!!checkoutErrors.fullName}
                    placeholder="Nguyễn Văn A"
                  />
                  <Form.Control.Feedback type="invalid">{checkoutErrors.fullName}</Form.Control.Feedback>
                </Form.Group>

                <Row className="g-2 mb-2">
                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold mb-1">Số điện thoại *</Form.Label>
                      <Form.Control
                        type="tel"
                        size="sm"
                        name="phone"
                        value={checkoutForm.phone}
                        onChange={handleCheckoutChange}
                        isInvalid={!!checkoutErrors.phone}
                        placeholder="0912345678"
                      />
                      <Form.Control.Feedback type="invalid">{checkoutErrors.phone}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold mb-1">Email *</Form.Label>
                      <Form.Control
                        type="email"
                        size="sm"
                        name="email"
                        value={checkoutForm.email}
                        onChange={handleCheckoutChange}
                        isInvalid={!!checkoutErrors.email}
                        placeholder="email@example.com"
                      />
                      <Form.Control.Feedback type="invalid">{checkoutErrors.email}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-2">
                  <Form.Label className="small fw-semibold mb-1">Địa chỉ nhận hàng *</Form.Label>
                  <Form.Control
                    type="text"
                    size="sm"
                    name="address"
                    value={checkoutForm.address}
                    onChange={handleCheckoutChange}
                    isInvalid={!!checkoutErrors.address}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP"
                  />
                  <Form.Control.Feedback type="invalid">{checkoutErrors.address}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold mb-1">Phương thức thanh toán</Form.Label>
                  <div className="d-flex gap-3">
                    <Form.Check
                      type="radio"
                      id="method-cod"
                      name="paymentMethod"
                      label="Thanh toán khi nhận hàng (COD)"
                      value="COD"
                      checked={checkoutForm.paymentMethod === 'COD'}
                      onChange={handleCheckoutChange}
                      className="small"
                    />
                    <Form.Check
                      type="radio"
                      id="method-qr"
                      name="paymentMethod"
                      label="Chuyển khoản VietQR"
                      value="Chuyển khoản QR"
                      checked={checkoutForm.paymentMethod === 'Chuyển khoản QR'}
                      onChange={handleCheckoutChange}
                      className="small"
                    />
                  </div>
                </Form.Group>

                {checkoutForm.paymentMethod === 'Chuyển khoản QR' && (
                  <div className="p-3 bg-warning bg-opacity-10 rounded-3 mb-2 small text-dark border border-warning">
                    <div className="fw-bold mb-1"><i className="bi bi-qr-code-scan me-1"></i> Hướng dẫn chuyển khoản:</div>
                    <div>Ngân hàng: <strong>Vietcombank (Chi nhánh Sala)</strong></div>
                    <div>STK: <strong>0123 4567 8999</strong> - Chủ TK: <strong>HOC VIEN PICKLEBALL</strong></div>
                    <div>Nội dung: <strong>MUA DUNG CU</strong></div>
                  </div>
                )}

                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">Ghi chú giao hàng</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    size="sm"
                    name="notes"
                    value={checkoutForm.notes}
                    onChange={handleCheckoutChange}
                    placeholder="Ví dụ: Giao giờ hành chính, gọi trước 15 phút..."
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="bg-light border-0">
            <Button variant="secondary" size="sm" onClick={() => setShowCheckoutModal(false)}>
              Hủy
            </Button>
            <Button variant="warning" type="submit" size="sm" className="fw-bold px-4" disabled={isSubmittingOrder}>
              {isSubmittingOrder ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" /> Đang xử lý...
                </>
              ) : (
                'Xác Nhận Đặt Hàng'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* MODAL THÔNG BÁO ĐẶT HÀNG THÀNH CÔNG */}
      {completedOrder && (
        <Modal show={!!completedOrder} onHide={() => setCompletedOrder(null)} centered>
          <Modal.Body className="p-4 text-center">
            <div className="display-4 text-success mb-2">
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <h4 className="fw-bold text-dark mb-1">Đặt Hàng Thành Công!</h4>
            <p className="text-muted small mb-3">
              Mã đơn hàng: <strong className="text-primary">{completedOrder.id}</strong>
            </p>

            <div className="bg-light p-3 rounded-4 text-start small mb-3">
              <div>Người nhận: <strong>{completedOrder.customerName}</strong> ({completedOrder.phone})</div>
              <div>Giao tới: <strong>{completedOrder.shippingAddress}</strong></div>
              <div>Tổng tiền: <strong className="text-danger">{completedOrder.totalAmount?.toLocaleString('vi-VN')} đ</strong></div>
              <div>Phương thức: <strong>{completedOrder.paymentMethod}</strong></div>
              <div>Trạng thái: <Badge bg="warning" text="dark">Chờ shop xác nhận</Badge></div>
            </div>

            <p className="small text-muted mb-3">
              Nhân viên học viện sẽ liên hệ xác nhận đơn hàng và gửi cho đơn vị vận chuyển sớm nhất!
            </p>

            <div className="d-flex justify-content-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setCompletedOrder(null)}>
                Tiếp tục mua sắm
              </Button>
              <Button as={Link} to="/my-account" variant="primary" size="sm">
                <i className="bi bi-box-seam me-1"></i> Xem đơn hàng của tôi
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      )}

      {/* MODAL XEM CHI TIẾT THÔNG SỐ SẢN PHẨM */}
      {viewProduct && (
        <Modal show={!!viewProduct} onHide={() => setViewProduct(null)} centered>
          <Modal.Header closeButton closeVariant="white" className="bg-dark text-white border-0">
            <Modal.Title as="h6" className="fw-bold">{viewProduct.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <img
              src={viewProduct.image}
              alt={viewProduct.name}
              className="img-fluid rounded-3 mb-3"
              style={{ height: '220px', width: '100%', objectFit: 'cover' }}
            />
            <h5 className="fw-bold text-danger mb-2">{viewProduct.price.toLocaleString('vi-VN')} đ</h5>
            <p className="text-secondary small mb-3">{viewProduct.description}</p>

            {viewProduct.specs && (
              <div className="bg-light p-3 rounded-3">
                <h6 className="fw-bold text-dark small mb-2">Thông số kỹ thuật sản phẩm:</h6>
                <ul className="list-unstyled small mb-0 text-muted">
                  {Object.entries(viewProduct.specs).map(([k, v]) => (
                    <li key={k} className="mb-1">
                      <strong className="text-capitalize text-dark">{k}:</strong> {v}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="bg-light border-0">
            <Button variant="secondary" size="sm" onClick={() => setViewProduct(null)}>
              Đóng
            </Button>
            <Button
              variant={viewProduct.stock > 0 ? "primary" : "secondary"}
              size="sm"
              className="fw-semibold"
              disabled={viewProduct.stock <= 0}
              onClick={() => {
                addToCart(viewProduct);
                setViewProduct(null);
              }}
            >
              {viewProduct.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}

export default Shop;
