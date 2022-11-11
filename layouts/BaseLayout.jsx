import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Layout({ children }) {
  return (
    <>
      <div id="hero" className='bg-gray-600 text-slate-50 px-5 md:px-auto'>
        <Navbar />
        {children}
        <Footer />
      </div>
    </>
  )
}