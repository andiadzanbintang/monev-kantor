import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import Home from './pages/Home'
import Panel from './pages/Panel'

import axios from 'axios'
import './App.css'
import Indicator from './pages/Indicator'
import Dimension from './pages/Dimension'
import Policy from './pages/Policy'
import Misi from './pages/Misi'
import Dashboard from './pages/Dashboard'

axios.defaults.baseURL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;
axios.defaults.withCredentials = true; 

function App() {
  

  return (
    <div>
      <Toaster 
      toastOptions={{
        duration:2000
      }}
      />

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/panel/*' element={<Panel />}>
          <Route path='dashboard' element={<Dashboard />}/>
          <Route path='misi' element={<Misi />} />
          <Route path='kebijakan' element={<Policy />} />
          <Route path='dimensi' element={<Dimension/>} />
          <Route path='indikator' element={<Indicator />} />
          <Route path='aktivitas' />
        </Route>
      </Routes>
    </div>
  )
}

export default App
