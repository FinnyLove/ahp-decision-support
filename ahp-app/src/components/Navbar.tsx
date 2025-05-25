'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaChartPie, FaHome } from 'react-icons/fa';

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-xl font-bold">
            <FaChartPie className="text-yellow-300" />
            <span>AHP Quản lý Chi tiêu</span>
          </Link>
          
          <div className="hidden md:flex space-x-6">
            <NavLink href="/" isActive={pathname === '/'}>
              <FaHome className="mr-1" />
              Trang chủ
            </NavLink>
            <NavLink href="/about" isActive={pathname === '/about'}>
              Giới thiệu
            </NavLink>
            <NavLink href="/create-problem" isActive={pathname.startsWith('/create-problem')}>
              Tạo bài toán
            </NavLink>
            <NavLink href="/results" isActive={pathname.startsWith('/results')}>
              Kết quả
            </NavLink>
          </div>
          
          <div className="md:hidden">
            {/* Có thể thêm mobile menu ở đây nếu cần */}
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ 
  href, 
  children, 
  isActive 
}: { 
  href: string; 
  children: React.ReactNode; 
  isActive: boolean 
}) => {
  return (
    <Link 
      href={href}
      className={`flex items-center px-3 py-2 rounded-md transition-colors ${
        isActive 
          ? 'bg-blue-700 text-white' 
          : 'hover:bg-blue-500'
      }`}
    >
      {children}
    </Link>
  );
};

export default Navbar;
