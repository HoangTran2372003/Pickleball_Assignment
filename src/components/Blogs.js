import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Form,
  InputGroup,
  Spinner,
  Modal,
} from "react-bootstrap";

function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBlog, setSelectedBlog] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:9999/blogs");
        setBlogs(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Lỗi tải danh sách bài viết:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(blogs.map((b) => b.category))),
  ];

  const filteredBlogs = blogs.filter((b) => {
    const matchCat =
      selectedCategory === "All" || b.category === selectedCategory;
    const q = searchTerm.toLowerCase();
    const matchSearch =
      b.title.toLowerCase().includes(q) ||
      b.summary.toLowerCase().includes(q) ||
      (b.author || "").toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="blogs-page py-5 bg-light min-vh-100">
      <Container>
        <div className="text-center mb-5">
          <Badge bg="success" className="px-3 py-2 text-uppercase mb-2">
            Kiến Thức & Kỹ Thuật
          </Badge>
          <h1 className="fw-bold text-dark">Cẩm Nang & Tin Tức Pickleball</h1>
          <p className="text-muted mx-auto" style={{ maxWidth: "650px" }}>
            Tổng hợp hướng dẫn luật thi đấu chuẩn quốc tế, kỹ thuật Dinking,
            kinh nghiệm chọn vợt và bài tập phòng tránh chấn thương từ đội ngũ
            HLV.
          </p>
        </div>

        {/* Bộ lọc & Tìm kiếm */}
        <Card className="border-0 shadow-sm rounded-4 p-3 mb-4">
          <Row className="g-3 align-items-center">
            <Col xs={12} md={5}>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0 text-muted">
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  className="border-start-0 ps-0"
                  placeholder="Tìm kiếm bài viết, kỹ thuật..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col xs={12} md={7}>
              <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    size="sm"
                    className="px-3 rounded-pill fw-semibold"
                    variant={
                      selectedCategory === cat ? "primary" : "outline-secondary"
                    }
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat === "All" ? "Tất cả chuyên mục" : cat}
                  </Button>
                ))}
              </div>
            </Col>
          </Row>
        </Card>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Đang tải bài viết...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 shadow-sm p-4">
            <p className="text-muted mb-2">Không tìm thấy bài viết phù hợp.</p>
            <Button
              size="sm"
              variant="outline-primary"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
            >
              Xem tất cả bài viết
            </Button>
          </div>
        ) : (
          <Row className="g-4">
            {filteredBlogs.map((blog) => (
              <Col xs={12} md={6} key={blog.id}>
                <Card className="h-100 border-0 shadow-sm hover-card rounded-4 overflow-hidden d-flex flex-column">
                  <div className="position-relative">
                    <Card.Img
                      variant="top"
                      src={blog.thumbnail}
                      alt={blog.title}
                      style={{ height: "230px", objectFit: "cover" }}
                    />
                    <Badge
                      bg="primary"
                      className="position-absolute top-0 start-0 m-3"
                    >
                      {blog.category}
                    </Badge>
                    <Badge
                      bg="dark"
                      className="position-absolute top-0 end-0 m-3 bg-opacity-75"
                    >
                      <i className="bi bi-clock me-1"></i> {blog.readTime}
                    </Badge>
                  </div>

                  <Card.Body className="p-4 d-flex flex-column justify-content-between">
                    <div>
                      <div className="text-muted small mb-2">
                        <i className="bi bi-person-circle me-1 text-primary"></i>{" "}
                        {blog.author} &nbsp;•&nbsp;{" "}
                        <i className="bi bi-calendar3 me-1"></i> {blog.date}
                      </div>
                      <Card.Title as="h5" className="fw-bold text-dark mb-2">
                        {blog.title}
                      </Card.Title>
                      <Card.Text className="text-secondary small mb-3">
                        {blog.summary}
                      </Card.Text>
                    </div>

                    <div className="pt-3 border-top d-flex justify-content-between align-items-center">
                      <div className="d-flex flex-wrap gap-1">
                        {blog.tags?.slice(0, 3).map((tag, idx) => (
                          <Badge
                            key={idx}
                            bg="light"
                            text="dark"
                            className="border fw-normal"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="fw-semibold"
                        onClick={() => setSelectedBlog(blog)}
                      >
                        Đọc tiếp <i className="bi bi-arrow-right ms-1"></i>
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Modal Chi Tiết Bài Viết */}
        {selectedBlog && (
          <Modal
            show={!!selectedBlog}
            onHide={() => setSelectedBlog(null)}
            size="lg"
            centered
          >
            <Modal.Header
              closeButton
              closeVariant="white"
              className="bg-dark text-white border-0"
            >
              <Modal.Title as="h6" className="fw-bold">
                {selectedBlog.category}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
              <h3 className="fw-bold text-dark mb-2">{selectedBlog.title}</h3>
              <div className="text-muted small mb-3">
                Tác giả: <strong>{selectedBlog.author}</strong> • Ngày đăng:{" "}
                {selectedBlog.date} • {selectedBlog.readTime}
              </div>
              <img
                src={selectedBlog.thumbnail}
                alt={selectedBlog.title}
                className="img-fluid rounded-4 mb-4 w-100"
                style={{ maxHeight: "320px", objectFit: "cover" }}
              />
              <p className="fw-semibold text-dark">{selectedBlog.summary}</p>
              <p
                className="text-secondary"
                style={{ lineHeight: 1.75, whiteSpace: "pre-line" }}
              >
                {selectedBlog.content}
              </p>
            </Modal.Body>
            <Modal.Footer className="bg-light border-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedBlog(null)}
              >
                Đóng bài viết
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </Container>
    </div>
  );
}

export default Blogs;
