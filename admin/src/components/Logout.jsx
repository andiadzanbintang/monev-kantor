import axios from "axios"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

export default function Logout() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
        const response = await axios.post('/api/v1/admin/logout')
        if(response.status === 200) {
            toast.success("Berhasil logout")
            navigate("/")
        }
    } catch (error) {
        return <div className="error-container"><p>Terjadi kesalahan : {error}</p></div>
    }
  }
  return (
    <button onClick={handleLogout} className="btn logout-btn">
      Logout
    </button>
  )
}
