import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'

export default function MainLayout() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main style={{ flex: 1, padding: '2rem' }}>
          <Outlet />
        </main>
        {/* Footer is optional in dashboard, but we'll keep it for now */}
        {/* <Footer /> */}
      </div>
    </div>
  )
}
