import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar />
      <main className="flex-1">
        {/* Own boundary so lazy pages never suspend the Navbar (its cart drawer's exit animation would freeze). */}
        <Suspense
          fallback={
            <div className="min-h-[40vh] flex items-center justify-center text-sage-600 text-sm">
              Loading…
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
