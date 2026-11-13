import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
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
  Modal,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const TIME_SLOTS = [
  {
    label: "06:00 - 08:00 (Sáng sớm - Giảm giá)",
    time: "06:00 - 08:00",
    isPeak: false,
  },
  { label: "08:00 - 10:00 (Buổi sáng)", time: "08:00 - 10:00", isPeak: false },
  { label: "16:00 - 18:00 (Buổi chiều)", time: "16:00 - 18:00", isPeak: false },
  {
    label: "18:00 - 20:00 (Giờ vàng cao điểm)",
    time: "18:00 - 20:00",
    isPeak: true,
  },
  {
    label: "20:00 - 22:00 (Giờ vàng cao điểm)",
    time: "20:00 - 22:00",
    isPeak: true,
  },
];

function CourtBooking() {
  const { currentUser } = useAuth();
  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [bookingForm, setBookingForm] = useState({
    courtId: "",
    customerName: "",
    phone: "",
    email: "",
    date: new Date().toISOString().split("T")[0],
    timeSlot: TIME_SLOTS[3].label,
    paymentMethod: "Tại sân",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [voucherModal, setVoucherModal] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [courtRes, bookingRes] = await Promise.all([
          axios.get("http://localhost:9999/courts"),
          axios.get("http://localhost:9999/courtBookings"),
        ]);
        const courtList = Array.isArray(courtRes.data) ? courtRes.data : [];
        const bookingList = Array.isArray(bookingRes.data)
          ? bookingRes.data
          : [];

        setCourts(courtList);
        setBookings(bookingList);

        if (courtList.length > 0) {
          setBookingForm((prev) => ({
            ...prev,
            courtId: String(courtList[0].id),
          }));
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu sân:", err);
        setErrorMsg("Không thể kết nối đến máy chủ json-server.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      setBookingForm((prev) => ({
        ...prev,
        customerName: currentUser.fullName || "",
        phone: currentUser.phone || "",
        email: currentUser.email || "",
      }));
    }
  }, [currentUser]);

  const checkSlotBooked = useCallback(
    (
      slotTime,
      courtId = bookingForm.courtId,
      date = bookingForm.date,
      bookingList = bookings,
    ) => {
      return bookingList.some(
        (b) =>
          String(b.courtId) === String(courtId) &&
          b.date === date &&
          String(b.timeSlot || "").includes(slotTime) &&
          b.status !== "cancelled",
      );
    },
    [bookingForm.courtId, bookingForm.date, bookings],
  );

  // Tự động chọn khung giờ trống đầu tiên khi đổi sân hoặc đổi ngày
  useEffect(() => {
    if (!bookingForm.courtId || !bookingForm.date) return;

    const currentSlotObj = TIME_SLOTS.find(
      (s) =>
        s.label === bookingForm.timeSlot || s.time === bookingForm.timeSlot,
    );
    const isCurrentBooked = currentSlotObj
      ? checkSlotBooked(currentSlotObj.time)
      : false;

    if (isCurrentBooked) {
      const firstAvailable = TIME_SLOTS.find((s) => !checkSlotBooked(s.time));
      if (firstAvailable) {
        setBookingForm((prev) => ({ ...prev, timeSlot: firstAvailable.label }));
        setErrors((prev) => ({ ...prev, timeSlot: "" }));
      }
    }
  }, [
    bookingForm.courtId,
    bookingForm.date,
    bookingForm.timeSlot,
    checkSlotBooked,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const calculateTotal = () => {
    const selectedCourt = courts.find(
      (c) => String(c.id) === String(bookingForm.courtId),
    );
    if (!selectedCourt) return 0;

    const selectedSlotObj = TIME_SLOTS.find(
      (s) =>
        s.label === bookingForm.timeSlot || s.time === bookingForm.timeSlot,
    );
    const isPeak = selectedSlotObj ? selectedSlotObj.isPeak : false;

    const rate =
      isPeak && selectedCourt.peakHourPrice
        ? selectedCourt.peakHourPrice
        : selectedCourt.pricePerHour;
    return rate * 2;
  };

  const validate = () => {
    const newErrors = {};

    if (!bookingForm.courtId) {
      newErrors.courtId = "Vui lòng chọn sân tập.";
    }

    if (!bookingForm.customerName.trim()) {
      newErrors.customerName = "Vui lòng nhập họ và tên người đặt.";
    }

    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!bookingForm.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại.";
    } else if (!phoneRegex.test(bookingForm.phone.trim())) {
      newErrors.phone = "Số điện thoại phải đủ 10 số hợp lệ.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!bookingForm.email.trim()) {
      newErrors.email = "Vui lòng nhập email.";
    } else if (!emailRegex.test(bookingForm.email.trim())) {
      newErrors.email = "Email không hợp lệ.";
    }

    if (!bookingForm.date) {
      newErrors.date = "Vui lòng chọn ngày đặt sân.";
    }

    const selectedSlotObj = TIME_SLOTS.find(
      (s) =>
        s.label === bookingForm.timeSlot || s.time === bookingForm.timeSlot,
    );
    const slotTimeToCheck = selectedSlotObj
      ? selectedSlotObj.time
      : bookingForm.timeSlot;

    if (checkSlotBooked(slotTimeToCheck)) {
      newErrors.timeSlot =
        "Khung giờ này đã có người đặt trước. Vui lòng chọn khung giờ khác!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!validate()) return;

    try {
      setIsSubmitting(true);

      // Fetch lại dữ liệu đặt sân mới nhất để chặn đặt trùng (Double Booking)
      const latestRes = await axios.get("http://localhost:9999/courtBookings");
      const latestBookings = Array.isArray(latestRes.data)
        ? latestRes.data
        : bookings;
      setBookings(latestBookings);

      const selectedSlotObj = TIME_SLOTS.find(
        (s) =>
          s.label === bookingForm.timeSlot || s.time === bookingForm.timeSlot,
      );
      const cleanTimeSlot = selectedSlotObj
        ? selectedSlotObj.time
        : bookingForm.timeSlot;

      if (
        checkSlotBooked(
          cleanTimeSlot,
          bookingForm.courtId,
          bookingForm.date,
          latestBookings,
        )
      ) {
        setErrors((prev) => ({
          ...prev,
          timeSlot:
            "Rất tiếc, khung giờ này vừa có khách khác đặt xong. Vui lòng chọn giờ khác!",
        }));
        return;
      }

      const selectedCourt = courts.find(
        (c) => String(c.id) === String(bookingForm.courtId),
      );
      const courtName = selectedCourt
        ? selectedCourt.name
        : "Sân tập Pickleball";
      const totalPrice = calculateTotal();

      const newBooking = {
        courtId: String(bookingForm.courtId),
        courtName,
        customerName: bookingForm.customerName.trim(),
        phone: bookingForm.phone.trim(),
        email: bookingForm.email.trim(),
        date: bookingForm.date,
        timeSlot: cleanTimeSlot,
        hours: 2,
        totalPrice,
        paymentMethod: bookingForm.paymentMethod,
        paymentStatus:
          bookingForm.paymentMethod === "Chuyển khoản QR" ? "paid" : "unpaid",
        status: "pending",
        notes: bookingForm.notes.trim() || "Không có ghi chú",
        createdAt: new Date().toISOString(),
      };

      const res = await axios.post(
        "http://localhost:9999/courtBookings",
        newBooking,
      );

      setBookings((prev) => [res.data, ...prev]);
      setVoucherModal(res.data);

      setBookingForm((prev) => ({
        ...prev,
        customerName: currentUser?.fullName || "",
        phone: currentUser?.phone || "",
        email: currentUser?.email || "",
        notes: "",
      }));
      setErrors({});
    } catch (err) {
      console.error("Lỗi khi gửi đặt sân qua axios:", err);
      setErrorMsg("Không thể lưu đặt sân. Vui lòng kiểm tra lại kết nối.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const allSlotsFullForDay =
    bookingForm.courtId &&
    bookingForm.date &&
    TIME_SLOTS.every((s) => checkSlotBooked(s.time));

  return (
    <div className="court-booking-page py-5 bg-light min-vh-100">
      <Container>
        <div className="text-center mb-5">
          <Badge
            bg="warning"
            text="dark"
            className="px-3 py-2 text-uppercase mb-2"
          >
            Chức Năng Mở Rộng 1
          </Badge>
          <h1 className="fw-bold text-dark">
            Hệ Thống Đặt Sân Pickleball Theo Giờ
          </h1>
          <p className="text-muted mx-auto" style={{ maxWidth: "650px" }}>
            Trải nghiệm cụm sân thi đấu chuẩn USA Pickleball. Đặt lịch nhanh
            chóng, chọn khung giờ linh hoạt và xác nhận tức thì.
          </p>
        </div>

        {errorMsg && (
          <Alert
            variant="danger"
            dismissible
            onClose={() => setErrorMsg("")}
            className="mb-4"
          >
            {errorMsg}
          </Alert>
        )}

        {/* DANH SÁCH SÂN TẬP */}
        <div className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold text-dark mb-0">
              <i className="bi bi-grid-fill text-primary me-2"></i> Danh Sách
              Cụm Sân Hiện Có
            </h4>
            <span className="text-muted small">
              Cập nhật tình trạng thời gian thực
            </span>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" role="status" />
              <p className="mt-2 text-muted">Đang tải dữ liệu sân bãi...</p>
            </div>
          ) : (
            <Row className="g-4">
              {courts.map((court) => (
                <Col xs={12} md={6} lg={4} key={court.id}>
                  <Card className="h-100 shadow-sm border-0 hover-card rounded-4 overflow-hidden d-flex flex-column">
                    <div className="position-relative">
                      <Card.Img
                        variant="top"
                        src={court.image}
                        alt={court.name}
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                      <Badge
                        bg="dark"
                        className="position-absolute top-0 start-0 m-3"
                      >
                        {court.type}
                      </Badge>
                      <Badge
                        bg="success"
                        className="position-absolute top-0 end-0 m-3"
                      >
                        Sẵn sàng
                      </Badge>
                    </div>

                    <Card.Body className="p-4 d-flex flex-column justify-content-between">
                      <div>
                        <Card.Title as="h5" className="fw-bold text-dark mb-2">
                          {court.name}
                        </Card.Title>
                        <p className="small text-muted mb-3">
                          <i className="bi bi-layers me-1 text-primary"></i>
                          {court.surface}
                        </p>

                        <div className="mb-3">
                          <small className="fw-bold text-secondary text-uppercase d-block mb-1">
                            Tiện ích đi kèm:
                          </small>
                          <div className="d-flex flex-wrap gap-1">
                            {court.features?.map((f, i) => (
                              <Badge
                                key={i}
                                bg="light"
                                text="dark"
                                className="border fw-normal"
                              >
                                <i className="bi bi-check2 text-success me-1"></i>
                                {f}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-top">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div>
                            <small className="text-muted d-block">
                              Giờ thường:
                            </small>
                            <span className="fw-bold text-primary fs-6">
                              {court.pricePerHour?.toLocaleString("vi-VN")} đ/h
                            </span>
                          </div>
                          <div className="text-end">
                            <small className="text-muted d-block">
                              Giờ cao điểm:
                            </small>
                            <span className="fw-bold text-danger fs-6">
                              {court.peakHourPrice?.toLocaleString("vi-VN")} đ/h
                            </span>
                          </div>
                        </div>

                        <Button
                          variant={
                            String(bookingForm.courtId) === String(court.id)
                              ? "primary"
                              : "outline-primary"
                          }
                          className="w-100 fw-semibold"
                          onClick={() => {
                            setBookingForm((prev) => ({
                              ...prev,
                              courtId: String(court.id),
                            }));
                            document
                              .getElementById("booking-form-card")
                              ?.scrollIntoView({ behavior: "smooth" });
                          }}
                        >
                          {String(bookingForm.courtId) === String(court.id) ? (
                            <>
                              <i className="bi bi-check-circle-fill me-1"></i>{" "}
                              Đang Chọn Sân Này
                            </>
                          ) : (
                            "Chọn Sân Này"
                          )}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>

        {/* FORM ĐẶT SÂN & LỊCH ĐÃ ĐẶT */}
        <Row className="g-4" id="booking-form-card">
          <Col xs={12} lg={7}>
            <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold text-dark mb-0">
                  <i className="bi bi-calendar2-check-fill text-warning me-2"></i>{" "}
                  Điền Thông Tin Đặt Lịch
                </h4>
                {currentUser && (
                  <Badge bg="success" className="small">
                    <i className="bi bi-person-check me-1"></i>{" "}
                    {currentUser.fullName}
                  </Badge>
                )}
              </div>
              <p className="text-muted small mb-4">
                Mỗi ca đặt cố định là <strong>2 giờ</strong>. Vui lòng kiểm tra
                kỹ ngày và giờ để tránh trùng lịch.
              </p>

              {allSlotsFullForDay && (
                <Alert variant="warning" className="small py-2">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  Sân này đã kín toàn bộ khung giờ trong ngày {bookingForm.date}
                  . Vui lòng chọn sân hoặc ngày khác!
                </Alert>
              )}

              <Form onSubmit={handleBookingSubmit} noValidate>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">
                    Sân tập muốn đặt *
                  </Form.Label>
                  <Form.Select
                    name="courtId"
                    value={bookingForm.courtId}
                    onChange={handleChange}
                    isInvalid={!!errors.courtId}
                  >
                    <option value="">-- Chọn sân Pickleball --</option>
                    {courts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.type}) -{" "}
                        {c.pricePerHour?.toLocaleString("vi-VN")} đ/h
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.courtId}
                  </Form.Control.Feedback>
                </Form.Group>

                <Row className="g-3 mb-3">
                  <Col xs={12} sm={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">
                        Ngày tập *
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={bookingForm.date}
                        onChange={handleChange}
                        isInvalid={!!errors.date}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.date}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col xs={12} sm={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">
                        Khung giờ (2 tiếng/ca) *
                      </Form.Label>
                      <Form.Select
                        name="timeSlot"
                        value={bookingForm.timeSlot}
                        onChange={handleChange}
                        isInvalid={!!errors.timeSlot}
                      >
                        {TIME_SLOTS.map((s, idx) => {
                          const booked = checkSlotBooked(s.time);
                          return (
                            <option key={idx} value={s.label} disabled={booked}>
                              {s.label} {booked ? "❌ [ĐÃ KÍN]" : "✅ [TRỐNG]"}
                            </option>
                          );
                        })}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.timeSlot}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-3 mb-3">
                  <Col xs={12} sm={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">
                        Họ và tên người đặt *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="customerName"
                        placeholder="Nguyễn Văn A"
                        value={bookingForm.customerName}
                        onChange={handleChange}
                        isInvalid={!!errors.customerName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.customerName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col xs={12} sm={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">
                        Số điện thoại liên hệ *
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        placeholder="0912345678"
                        value={bookingForm.phone}
                        onChange={handleChange}
                        isInvalid={!!errors.phone}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.phone}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-3 mb-3">
                  <Col xs={12} sm={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">
                        Email nhận vé điện tử *
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="nguyenvana@gmail.com"
                        value={bookingForm.email}
                        onChange={handleChange}
                        isInvalid={!!errors.email}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col xs={12} sm={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">
                        Phương thức thanh toán
                      </Form.Label>
                      <Form.Select
                        name="paymentMethod"
                        value={bookingForm.paymentMethod}
                        onChange={handleChange}
                      >
                        <option value="Tại sân">
                          Thanh toán tại quầy check-in
                        </option>
                        <option value="Chuyển khoản QR">
                          Chuyển khoản VietQR tức thì
                        </option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {bookingForm.paymentMethod === "Chuyển khoản QR" && (
                  <div className="p-3 bg-light rounded-3 mb-3 small border border-warning">
                    <div className="fw-bold text-dark mb-1">
                      <i className="bi bi-qr-code me-1"></i> Quét mã VietQR
                      chuyển khoản:
                    </div>
                    <div>
                      Ngân hàng: <strong>Vietcombank (Chi nhánh Sala)</strong> -
                      STK: <strong>0123 4567 8999</strong>
                    </div>
                    <div>
                      Chủ TK: <strong>PRO PICKLEBALL ACADEMY</strong> - Nội
                      dung: <strong>DAT SAN {bookingForm.phone}</strong>
                    </div>
                  </div>
                )}

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold small">
                    Ghi chú thêm
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="notes"
                    placeholder="Ví dụ: Cần mượn thêm 2 vợt tập, 1 túi bóng..."
                    value={bookingForm.notes}
                    onChange={handleChange}
                  />
                </Form.Group>

                <div className="p-3 bg-light rounded-3 mb-4 d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-secondary small d-block">
                      Tạm tính (2 giờ tập):
                    </span>
                    <strong className="text-dark">
                      Đã bao gồm thuế & hệ thống chiếu sáng
                    </strong>
                  </div>
                  <div className="text-end">
                    <span className="h4 fw-bold text-danger mb-0">
                      {calculateTotal().toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="success"
                  size="lg"
                  className="w-100 fw-bold shadow-sm"
                  disabled={isSubmitting || allSlotsFullForDay}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner
                        animation="border"
                        size="sm"
                        className="me-2"
                        role="status"
                      />
                      Đang xử lý đặt sân...
                    </>
                  ) : (
                    "Xác Nhận Giữ Sân Ngay"
                  )}
                </Button>
              </Form>
            </Card>
          </Col>

          {/* Cột Phải: Lịch đặt sân gần đây */}
          <Col xs={12} lg={5}>
            <Card className="border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <h5 className="fw-bold text-dark mb-3 d-flex align-items-center justify-content-between">
                <span>
                  <i className="bi bi-clock-history text-success me-2"></i> Lịch
                  Đặt Sân Đã Đăng Ký
                </span>
                <Badge bg="secondary">{bookings.length} lượt</Badge>
              </h5>
              <p className="text-muted small mb-3">
                Các lượt đặt gần đây giúp tránh trùng lịch với người chơi khác.
              </p>

              <div
                style={{ maxHeight: "520px", overflowY: "auto" }}
                className="pe-1"
              >
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 bg-light rounded-3 mb-2 border small"
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <strong className="text-primary">{b.courtName}</strong>
                      <Badge
                        bg={
                          b.status === "confirmed"
                            ? "success"
                            : b.status === "cancelled"
                              ? "danger"
                              : "warning"
                        }
                        text={
                          b.status === "confirmed" || b.status === "cancelled"
                            ? "white"
                            : "dark"
                        }
                      >
                        {b.status === "confirmed"
                          ? "Đã duyệt"
                          : b.status === "cancelled"
                            ? "Đã hủy"
                            : "Chờ duyệt"}
                      </Badge>
                    </div>
                    <div className="text-dark fw-semibold">
                      {b.customerName}
                    </div>
                    <div className="text-secondary">
                      <i className="bi bi-calendar3 me-1"></i> Ngày: {b.date} |{" "}
                      {b.timeSlot}
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-1">
                      <span className="text-danger fw-bold">
                        {(b.totalPrice || 0).toLocaleString("vi-VN")} đ
                      </span>
                      <small className="text-muted">
                        {b.paymentMethod || "Tại sân"}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* MODAL VÉ ĐẶT SÂN ĐIỆN TỬ */}
      {voucherModal && (
        <Modal
          show={!!voucherModal}
          onHide={() => setVoucherModal(null)}
          centered
        >
          <Modal.Header closeButton className="bg-success text-white border-0">
            <Modal.Title as="h5" className="fw-bold">
              <i className="bi bi-ticket-perforated-fill me-2"></i> Vé Đặt Sân
              Điện Tử
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4 text-center">
            <div className="mb-3">
              <span className="badge bg-warning text-dark px-3 py-2 fs-6">
                Mã Đặt Sân: #{voucherModal.id}
              </span>
            </div>

            <div className="p-3 bg-light rounded-4 text-start small mb-3 border">
              <div className="mb-2">
                <strong>Sân tập:</strong> {voucherModal.courtName}
              </div>
              <div className="mb-2">
                <strong>Ngày tập:</strong> {voucherModal.date}
              </div>
              <div className="mb-2">
                <strong>Khung giờ:</strong> {voucherModal.timeSlot}
              </div>
              <div className="mb-2">
                <strong>Người đặt:</strong> {voucherModal.customerName} (
                {voucherModal.phone})
              </div>
              <div className="mb-2">
                <strong>Tổng tiền:</strong>{" "}
                <span className="text-danger fw-bold">
                  {(voucherModal.totalPrice || 0).toLocaleString("vi-VN")} đ
                </span>
              </div>
              <div className="mb-2">
                <strong>Thanh toán:</strong> {voucherModal.paymentMethod}
              </div>
              <div>
                <strong>Trạng thái:</strong>{" "}
                <Badge bg="warning" text="dark">
                  Chờ admin xác nhận
                </Badge>
              </div>
            </div>

            <div className="p-3 bg-white border rounded-3 mb-3 d-inline-block">
              <i className="bi bi-qr-code display-4 text-dark d-block"></i>
              <small className="text-muted">Mã Check-in khi đến sân</small>
            </div>

            <p className="small text-muted mb-0">
              Vui lòng có mặt trước giờ tập 10 phút tại quầy lễ tân để nhận sân!
            </p>
          </Modal.Body>
          <Modal.Footer className="bg-light border-0 justify-content-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setVoucherModal(null)}
            >
              Đóng
            </Button>
            <Button as={Link} to="/my-account" variant="primary" size="sm">
              <i className="bi bi-calendar-check me-1"></i> Xem lịch sử đặt sân
              của tôi
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}

export default CourtBooking;
