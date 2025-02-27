import Navbar from '../components/Navbar'
import { Outlet } from 'react-router-dom'
export default function Panel() {
  return (
    <div className='app-layout'>
      <Navbar />
      <div className="panel-content">
        <Outlet /> 
      </div>
    </div>
  )
}
