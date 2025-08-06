// 'use client'

// const NavBar = () => {
//   const [navbar, setNavbar] = useState(false)
//   const [scrolled, setScrolled] = useState(false)

//   React.useEffect(() => {
//     const handleScroll = () => {
//       const offset = window.scrollY
//       if (offset > 50) {
//         setScrolled(true)
//       } else {
//         setScrolled(false)
//       }
//     }

//     window.addEventListener('scroll', handleScroll)
//     return () => window.removeEventListener('scroll', handleScroll)
//   }, [])

//   return (
//     <nav className={`fixed w-full z-30 top-0 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
//       <div className="max-w-7xl mx-auto px-4 sm:px-6">
//         <div className="flex items-center justify-between h-16 md:h-20">
//           {/* Logo */}
//           <Link href="/" className="flex shrink-0 items-center">
//             <h2 className={`text-xl font-bold ${scrolled ? 'text-gray-900' : 'text-white'}`}>
//               LOGO
//             </h2>
//           </a>

//           {/* Mobile menu button */}
//           <div className="md:hidden">
//             <button
//               onClick={() => setNavbar(!navbar)}
//               className={`p-2 rounded-md ${scrolled ? 'text-gray-600' : 'text-white'}`}
//             >
//               {navbar ? (
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               ) : (
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
//                 </svg>
//               )}
//             </button>
//           </div>

//           {/* Desktop menu */}
//           <div className="hidden md:flex md:items-center md:space-x-8">
//             {['About', 'Blog', 'Contact', 'Projects'].map((item) => (
//               <a
//                 key={item}
//                 href={`#${item.toLowerCase()}`}
//                 className={`text-sm font-medium transition-colors hover:text-gray-900 ${scrolled ? 'text-gray-600' : 'text-white'}`}
//               >
//                 {item}
//               </a>
//             ))}
//           </div>
//         </div>

//         {/* Mobile menu */}
//         <div className={`md:hidden ${navbar ? 'block' : 'hidden'}`}>
//           <div className="px-2 pt-2 pb-3 space-y-1 bg-white/80 backdrop-blur-md rounded-lg mt-2 shadow-lg">
//             {['About', 'Blog', 'Contact', 'Projects'].map((item) => (
//               <a
//                 key={item}
//                 href={`#${item.toLowerCase()}`}
//                 onClick={() => setNavbar(false)}
//                 className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
//               >
//                 {item}
//               </a>
//             ))}
//           </div>
//         </div>
//       </div>
//     </nav>
//   )
// }

// export default NavBar