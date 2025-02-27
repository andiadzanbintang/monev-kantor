import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState({username:"", password:""})
  const navigate = useNavigate()

  const validateInputs = () => {
    const errors = {}

    if (/[^a-zA-Z_]/.test(username) || username.length > 50) {
        errors.username = "Username salah";
    }

    if (!password) {
        errors.password = "Tolong isi passwordnya";
    } else if (password.length <= 6) {
        errors.password = "Password harus lebih dari 6 karakter";
    }
    

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")

    if(!validateInputs()){
        return
    }

    try {
        const response = await axios.post('/api/v1/admin/login', {username, password}, {withCredentials:true})
        if(response.status === 200){
            toast.success("Login berhasil")
            setTimeout(() => {
                navigate("/panel/dashboard")
                window.location.reload()
            },1000)
        }
    } catch (error) {
        if(error.response && error.response.data.message){
            setError(error.response.data.message)
        } else {
            setError("Terjadi kesalahan, silakan coba lagi.")
        }
    }
  }
  return (
    <div className="login-container">
      <h2>Log in to your account</h2>
      <form onSubmit={handleLogin}>
        <div className="form-content">
            <div className="form-item">
                <label>Username</label>
                <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Masukkan username..."
                />
                {validationErrors.username && <p className="error-message">{validationErrors.username}</p>}
            </div>
            <div className="form-item">
                <label>Password</label>
                <div className="password-wrapper">
                    <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Masukkan password..."
                    />
                    <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368">
                                <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"/>
                            </svg>
                            ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368">
                                <path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z"/>
                            </svg>
                            )}
                    </button>
                </div>
                {validationErrors.password && <p className="error-message">{validationErrors.password}</p>}
            </div>
        </div>
        <div className="btn-form">
            <button type="submit">Login</button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  )
}
