"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";

const navLinks = [
  { href: "#", label: "ROOMS & SUITES" },
  { href: "#", label: "WYNN REWARDS" },
  { href: "#", label: "OFFERS" },
  { href: "#", label: "DINING" },
  { href: "#", label: "ENTERTAINMENT" },
  { href: "#", label: "MEETINGS & EVENTS" },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleToggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-white text-black fixed w-full z-50">
      <div className="px-12 py-6 w-full">
        <div className="relative flex h-16 items-center justify-between">
          {/* Logo - Left aligned */}
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/wynn-resorts-logo.svg"
                alt="Wynn Resorts Logo"
                width={200}
                height={90}
                priority
                className="h-auto w-full min-w-[160px]"
              />
            </Link>
          </div>
          
          {/* Navigation - Center aligned */}
          <div className="hidden md:flex justify-center flex-1">
            <div className="flex space-x-4 lg:space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-md px-2 lg:px-3 py-2 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-100 transition-colors tracking-wider"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Language selector - Right aligned */}
          <div className="flex items-center">
            <div className="hidden md:flex items-center space-x-2 cursor-pointer">
              <div className="text-sm font-medium tracking-wider">EN</div>
              <ChevronDown className="h-4 w-4" />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden ml-4">
              <button 
                type="button" 
                className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-black focus:ring-2 focus:ring-black focus:outline-hidden focus:ring-inset" 
                aria-controls="mobile-menu" 
                aria-expanded={mobileMenuOpen}
                onClick={handleToggleMobileMenu}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu with slide-in overlay */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-[80%] max-w-sm bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex justify-end">
            <button 
              onClick={handleToggleMobileMenu}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
              <span className="sr-only">Close menu</span>
            </button>
          </div>
          <div className="flex-1 overflow-auto py-4">
            <div className="space-y-1 px-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block rounded-md px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-black"
                  onClick={handleToggleMobileMenu}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="p-4 border-t">
            <div className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer">
              <div className="text-sm font-medium tracking-wider">EN</div>
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Semi-transparent backdrop overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 backdrop-blur-[2px]"
          onClick={handleToggleMobileMenu}
          aria-hidden="true"
        />
      )}
    </nav>
  );
};

export default Header;