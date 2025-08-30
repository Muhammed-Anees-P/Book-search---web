import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card, Tab, Tabs, Badge, Alert, Navbar, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Axios from "../../Axios/axios";

const Home = ({ onLogout }) => {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favorites")) || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("search");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const expiresAt = localStorage.getItem("expiresAt");
    
    if (!token || !expiresAt || new Date(expiresAt) <= new Date()) {
      localStorage.removeItem("token");
      localStorage.removeItem("expiresAt");
      navigate("/login");
      return;
    }
    
    setUser({ token });
    loadInitialBooks();
  }, [navigate]);

  const processBookData = (bookData) => {
    let booksArray = [];
    
    if (Array.isArray(bookData)) {
      booksArray = bookData;
    } else if (bookData && bookData.items && Array.isArray(bookData.items)) {
      booksArray = bookData.items;
    } else if (bookData && Array.isArray(bookData.data)) {
      booksArray = bookData.data;
    } else {
      console.warn("Unexpected data structure:", bookData);
      return [];
    }

    return booksArray.map(book => ({
      ...book,
      volumeInfo: {
        ...book.volumeInfo,
        imageLinks: book.volumeInfo?.imageLinks || {
          thumbnail: "https://via.placeholder.com/150x200/6c757d/ffffff?text=No+Image"
        }
      }
    }));
  };

  const loadInitialBooks = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      console.log("Loading initial books...");
      const response = await Axios.get(`/api/search?query=best+sellers`);
      console.log("Initial books response:", response);
      console.log("Response data:", response.data);
      
      const processedBooks = processBookData(response.data);
      console.log("Processed books:", processedBooks);
      
      if (processedBooks.length > 0) {
        setBooks(processedBooks);
      } else {
        setError("No books found in the response");
        setBooks([]);
      }
    } catch (error) {
      console.error("Error fetching initial books:", error);
      console.error("Error response:", error.response);
      setError(`Failed to load books: ${error.message}`);
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const searchBooks = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      loadInitialBooks();
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Searching for books with query:", query);
      const response = await Axios.get(`/api/search?query=${encodeURIComponent(query)}`);
      console.log("Search response:", response);
      console.log("Search response data:", response.data);
      
      const processedBooks = processBookData(response.data);
      console.log("Processed search books:", processedBooks);
      
      if (processedBooks.length > 0) {
        setBooks(processedBooks);
      } else {
        setBooks([]);
        setError("No books found for your search query");
      }
    } catch (error) {
      console.error("Error searching books:", error);
      console.error("Error response:", error.response);
      setError(`Error searching books: ${error.message}`);
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addToFavorites = (book) => {
    const exists = favorites.find((fav) => fav.id === book.id);
    if (!exists) {
      const updated = [...favorites, book];
      setFavorites(updated);
      localStorage.setItem("favorites", JSON.stringify(updated));
    }
  };

  const removeFromFavorites = (bookId) => {
    const updated = favorites.filter((fav) => fav.id !== bookId);
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const isFavorite = (bookId) => {
    return favorites.some((fav) => fav.id === bookId);
  };

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const renderBookCard = (book, showRemoveButton = false) => {
    if (!book || !book.volumeInfo) {
      console.warn("Invalid book data:", book);
      return null;
    }
    
    const volume = book.volumeInfo;
    
    let imageUrl = volume.imageLinks?.thumbnail || 
                   volume.imageLinks?.smallThumbnail || 
                   "https://via.placeholder.com/150x200/6c757d/ffffff?text=No+Image";
    
    if (imageUrl.startsWith("http://")) {
      imageUrl = imageUrl.replace("http://", "https://");
    }
    
    return (
      <Col key={book.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
        <Card className="h-100 shadow border-0" style={{borderRadius: '15px', transition: 'transform 0.2s'}}>
          <div className="position-relative">
            <Card.Img
              variant="top"
              src={imageUrl}
              alt={volume.title || 'Book cover'}
              style={{ 
                height: "250px", 
                objectFit: "cover",
                borderTopLeftRadius: '15px',
                borderTopRightRadius: '15px'
              }}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/150x200/6c757d/ffffff?text=No+Image";
              }}
            />
            {volume.averageRating && (
              <Badge 
                bg="warning" 
                className="position-absolute top-0 end-0 m-2"
                style={{fontSize: '0.75rem'}}
              >
                ⭐ {volume.averageRating}
              </Badge>
            )}
          </div>
          <Card.Body className="d-flex flex-column">
            <Card.Title className="fs-6 fw-bold text-primary mb-2" style={{fontSize: '0.9rem'}}>
              {volume.title || 'Untitled'}
            </Card.Title>
            <Card.Text className="mb-2">
              <small className="text-muted">
                <i className="fas fa-user me-1"></i>
                {volume.authors ? volume.authors.join(", ") : "Unknown Author"}
              </small>
            </Card.Text>
            <Card.Text className="mb-2">
              <small className="text-muted">
                <i className="fas fa-calendar me-1"></i>
                {volume.publishedDate ? new Date(volume.publishedDate).getFullYear() : "N/A"}
              </small>
            </Card.Text>
            {volume.description && (
              <Card.Text className="flex-grow-1" style={{fontSize: '0.8rem'}}>
                {volume.description.length > 100 
                  ? volume.description.substring(0, 100) + "..."
                  : volume.description
                }
              </Card.Text>
            )}
            <div className="mt-auto">
              {showRemoveButton ? (
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="w-100"
                  onClick={() => removeFromFavorites(book.id)}
                >
                  <i className="fas fa-heart-broken me-1"></i>
                  Remove from Favorites
                </Button>
              ) : (
                <Button
                  variant={isFavorite(book.id) ? "success" : "outline-success"}
                  size="sm"
                  className="w-100"
                  onClick={() => addToFavorites(book)}
                  disabled={isFavorite(book.id)}
                >
                  <i className={`fas ${isFavorite(book.id) ? 'fa-heart' : 'fa-heart'} me-1`}></i>
                  {isFavorite(book.id) ? "Added to Favorites" : "Add to Favorites"}
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      </Col>
    );
  };

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
      
      <div style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh'}}>
        <Navbar bg="dark" variant="dark" expand="lg" className="px-3">
          <Navbar.Brand>
            <i className="fas fa-book me-2"></i>
            Book Finder
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link active={activeTab === 'search'} onClick={() => setActiveTab('search')}>
                <i className="fas fa-search me-1"></i>
                Search
              </Nav.Link>
              <Nav.Link active={activeTab === 'favorites'} onClick={() => setActiveTab('favorites')}>
                <i className="fas fa-heart me-1"></i>
                Favorites
                {favorites.length > 0 && <Badge bg="danger" className="ms-1">{favorites.length}</Badge>}
              </Nav.Link>
            </Nav>
            <Nav>
              <Navbar.Text className="me-3">
                Welcome, User!
              </Navbar.Text>
              <Button variant="outline-light" size="sm" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt me-1"></i>
                Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <Container className="py-4">
          <div className="text-center mb-5">
            <h1 className="text-white fw-bold mb-3">
              <i className="fas fa-book me-3"></i>
              Book Finder
            </h1>
            <p className="text-white-50">Discover and save your favorite books</p>
          </div>

          <div className="row justify-content-center mb-4">
            <div className="col-md-8 col-lg-6">
              <Card className="border-0 shadow-lg" style={{borderRadius: '15px'}}>
                <Card.Body className="p-4">
                  <Form className="d-flex" onSubmit={searchBooks}>
                    <div className="input-group">
                      <span className="input-group-text bg-primary border-primary">
                        <i className="fas fa-search text-white"></i>
                      </span>
                      <Form.Control
                        type="text"
                        placeholder="Search for books..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="border-start-0"
                        style={{boxShadow: 'none'}}
                      />
                      <Button 
                        type="submit" 
                        variant="primary"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                          'Search'
                        )}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </div>
          </div>

          <Card className="border-0 shadow-lg" style={{borderRadius: '15px'}}>
            <Card.Body className="p-4">
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-4"
                fill
              >
                <Tab 
                  eventKey="search" 
                  title={
                    <span>
                      <i className="fas fa-search me-2"></i>
                      Search Results
                      {books.length > 0 && <Badge bg="primary" className="ms-2">{books.length}</Badge>}
                    </span>
                  }
                >
                  {error && (
                    <Alert variant="danger" className="mb-4">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {error}
                      <details className="mt-2">
                        <summary>Debug Info</summary>
                        <pre style={{fontSize: '0.8rem', whiteSpace: 'pre-wrap'}}>
                          Books array length: {books.length}
                          {books.length > 0 && `First book: ${JSON.stringify(books[0], null, 2)}`}
                        </pre>
                      </details>
                    </Alert>
                  )}

                  {isLoading && (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="text-muted">Searching for books...</p>
                    </div>
                  )}

                  {!isLoading && (
                    <Row>
                      {books.length > 0 ? (
                        <>
                          <Col xs={12} className="mb-3">
                            <small className="text-muted">Found {books.length} books</small>
                          </Col>
                          {books.map((book, index) => {
                            console.log(`Rendering book ${index}:`, book);
                            return renderBookCard(book);
                          })}
                        </>
                      ) : (
                        !error && (
                          <Col xs={12}>
                            <div className="text-center py-5">
                              <i className="fas fa-book text-muted mb-3" style={{fontSize: '3rem'}}></i>
                              <h5 className="text-muted">No books found</h5>
                              <p className="text-muted">Try searching for something else</p>
                            </div>
                          </Col>
                        )
                      )}
                    </Row>
                  )}
                </Tab>

                <Tab 
                  eventKey="favorites" 
                  title={
                    <span>
                      <i className="fas fa-heart me-2"></i>
                      My Favorites
                      {favorites.length > 0 && <Badge bg="danger" className="ms-2">{favorites.length}</Badge>}
                    </span>
                  }
                >
                  <Row>
                    {favorites.length > 0 ? (
                      favorites.map((book) => renderBookCard(book, true))
                    ) : (
                      <Col xs={12}>
                        <div className="text-center py-5">
                          <i className="fas fa-heart-broken text-muted mb-3" style={{fontSize: '3rem'}}></i>
                          <h5 className="text-muted">No favorites yet</h5>
                          <p className="text-muted">Start adding books to your favorites from the search results</p>
                          <Button 
                            variant="primary" 
                            onClick={() => setActiveTab('search')}
                          >
                            <i className="fas fa-search me-2"></i>
                            Browse Books
                          </Button>
                        </div>
                      </Col>
                    )}
                  </Row>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </>
  );
};

export default Home;