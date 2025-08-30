import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; import Axios from "../../Axios/axios";

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await Axios.post("/api/login", credentials);
      const { token, expiresAt } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("expiresAt", expiresAt);

      onLogin(token, new Date(expiresAt));
      navigate("/home"); 
    } catch (error) {
      setError(error.response?.data?.error || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Bootstrap & Font Awesome */}
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />

      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
              <div
                className="card shadow-lg border-0"
                style={{ borderRadius: "15px" }}
              >
                <div className="card-body p-5">
                  {/* Header */}
                  <div className="text-center mb-4">
                    <div
                      className="bg-primary rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <i
                        className="fas fa-user text-white"
                        style={{ fontSize: "24px" }}
                      ></i>
                    </div>
                    <h2 className="text-primary fw-bold mb-2">Welcome Back</h2>
                    <p className="text-muted">Sign in to your account</p>
                  </div>

                  {/* Error Alert */}
                  {error && (
                    <div
                      className="alert alert-danger d-flex align-items-center mb-4"
                      role="alert"
                    >
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      <div>{error}</div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label
                        htmlFor="username"
                        className="form-label text-secondary fw-semibold"
                      >
                        Username
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="fas fa-user text-muted"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-0"
                          id="username"
                          placeholder="Enter username"
                          value={credentials.username}
                          onChange={(e) =>
                            setCredentials({
                              ...credentials,
                              username: e.target.value,
                            })
                          }
                          required
                          style={{ boxShadow: "none" }}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="password"
                        className="form-label text-secondary fw-semibold"
                      >
                        Password
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="fas fa-lock text-muted"></i>
                        </span>
                        <input
                          type="password"
                          className="form-control border-start-0 ps-0"
                          id="password"
                          placeholder="Enter password"
                          value={credentials.password}
                          onChange={(e) =>
                            setCredentials({
                              ...credentials,
                              password: e.target.value,
                            })
                          }
                          required
                          style={{ boxShadow: "none" }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-2 fw-semibold"
                      disabled={isLoading}
                      style={{ borderRadius: "8px" }}
                    >
                      {isLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </button>
                  </form>

                  {/* Demo credentials */}
                  <div className="mt-4">
                    <div className="alert alert-info py-2 mb-0">
                      <small>
                        <strong>Demo credentials:</strong>
                        <br />
                        Username: <code>testuser</code>
                        <br />
                        Password: <code>00000</code>
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
