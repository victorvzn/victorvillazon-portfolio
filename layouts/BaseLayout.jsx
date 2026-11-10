import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import StarField from '../components/StarField'

export default function Layout({ children }) {
  return (
    <>
      <StarField />
      <div className='relative z-10 min-h-screen text-zinc-50'>
        <Navbar />
        {children}
        <Footer />
      </div>
    </>
  )
}
