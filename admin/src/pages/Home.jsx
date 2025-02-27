import { useState } from "react"
import Login from "../components/Login"

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  
  const openLogin = () => setIsLoginOpen(true)
  const closeLogin = () => setIsLoginOpen(false)


  return (
    <div className="container home-container">
    <header>
      <h2>Dashboard IKB Studio Cilaki</h2>
      <nav>
        <button onClick={openLogin} className="btn login-btn">Login</button>
      </nav>
    </header> 
    <main className="home-main">
      <div className="data-recap">
        <div className="data-summary data-recap-content">
          <p>[Data Rekap Indikator]</p>
        </div>
        <div className="data-sunburst data-recap-content">
          <p>[Grafik Sunburst]</p>
        </div>       
      </div>

      <div className="data-main-content">
        <h3 className="section-title">Tabel IKB</h3>
        <div className="data-filter">
          <input 
          type="text"
          placeholder="search..."
          />
        </div>
        <div className="data-table">
         <th>
          <tr><td>Misi | Kebijakan | Dimensi | Indikator</td></tr>
          <tr><td>Misi | Kebijakan | Dimensi | Indikator</td></tr>
          <tr><td>Misi | Kebijakan | Dimensi | Indikator</td></tr>
          <tr><td>Misi | Kebijakan | Dimensi | Indikator</td></tr>
          <tr><td>Misi | Kebijakan | Dimensi | Indikator</td></tr>
          <tr><td>Misi | Kebijakan | Dimensi | Indikator</td></tr>
         </th>
        </div>
      </div>
    </main>

     {/* Dialog Box untuk Login */}
     {isLoginOpen && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <button className="close-button" onClick={closeLogin}><h3>X</h3></button>
            <Login />
          </div>
        </div>
      )}

    </div>
  )
}
