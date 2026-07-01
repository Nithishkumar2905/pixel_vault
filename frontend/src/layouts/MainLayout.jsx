import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'

export default function MainLayout() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    const savedState = localStorage.getItem('pixelvault_sidebar_expanded')
    return savedState !== null ? JSON.parse(savedState) : true
  })
  
  const location = useLocation()

  useEffect(() => {
    localStorage.setItem('pixelvault_sidebar_expanded', JSON.stringify(isSidebarExpanded))
  }, [isSidebarExpanded])

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + B to toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        setIsSidebarExpanded(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="dashboard-container">
      <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
      <div className={`main-content ${!isSidebarExpanded ? 'sidebar-collapsed' : ''}`}>
        <Navbar isSidebarExpanded={isSidebarExpanded} setIsSidebarExpanded={setIsSidebarExpanded} />
        <main key={location.pathname} className="page-transition-wrapper" style={{ flex: 1, padding: '2rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
