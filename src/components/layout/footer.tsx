import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const footerLinks = [
  {
    items: [
      { href: "#", label: "Shop Home Collection" },
      { href: "#", label: "Gift Cards" },
      { href: "#", label: "Bedding" },
      { href: "#", label: "Bath" },
      { href: "#", label: "Spa" },
      { href: "#", label: "Fragrance" },
    ]
  },
  {
    items: [
      { href: "#", label: "About Us" },
      { href: "#", label: "Careers" },
      { href: "#", label: "Investor Relations" },
      { href: "#", label: "Privacy Notice" },
      { href: "#", label: "Cookie Notice" },
      { href: "#", label: "Terms of Use" },
      { href: "#", label: "Hotel Information & Directory" },
    ],
  },
  {
    items: [
      { href: "#", label: "Wynn Palace Cotai" },
      { href: "#", label: "Encore Boston Harbor" },
      { href: "#", label: "Wynn Macau" },
      { href: "#", label: "Wynn Las Vegas" },
    ],
  },
];

const socialLinks = [
  { href: "#", src: "/footer-facebook.svg", alt: "Facebook" },
  { href: "#", src: "/footer-android.svg", alt: "Android" },
  { href: "#", src: "/footer-apple.svg", alt: "Apple" },
  { href: "#", src: "/footer-instagram.svg", alt: "Instagram" },
  { href: "#", src: "/footer-twitter(X).svg", alt: "Twitter (X)" },
];

export const Footer = () => {
  return (
    <footer className="text-white">
      {/* Top Part: Newsletter */}
      <div className="bg-white text-black">
        <div className="px-12 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-8 gap-8 items-center">
            <div className="lg:col-span-2 text-center lg:text-left">
              <h2 className="text-xl md:text-3xl font-serif mb-2 text-[#1A1A1A]">
                Get News & Updates
              </h2>
            </div>
            <div className="lg:col-span-3 text-center lg:text-left">
              <p className="text-gray-600 text-md md:text-lg">
                Get latest developments and exciting news on how we are shaping
                the future!
              </p>
            </div>
            <div className="lg:col-span-3 flex justify-center lg:justify-end">
              <div className="flex w-full">
                <div className="flex flex-1 items-center border-2 border-[#E8E9E9] rounded-md overflow-hidden pt-3 pr-4 pb-3 pl-3">
                  <Input
                    type="email"
                    placeholder="Your email address"
                    className="flex-grow bg-transparent border-0 outline-none shadow-none text-black placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 px-3 py-2 text-base"
                  />
                  <Button
                    type="submit"
                    className="bg-transparent cursor-pointer text-[#006F62] hover:bg-gray-50 font-semibold rounded-md px-6 py-3 h-auto flex-shrink-0 border-2 border-[#006F62] text-base"
                  >
                    JOIN THE NEWSLETTER
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Part: Links and Info */}
      <div className="bg-[#5A3A27]">
        <div className="container mx-auto px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {footerLinks.map((section, index) => (
              <div key={index}>
                <ul>
                  {section.items.map((link) => (
                    <li key={link.label} className="mb-2">
                      <Link
                        href={link.href}
                        className="hover:text-white transition-colors text-sm text-white/80"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h3 className="font-semibold mb-4 text-sm">
                Wynn and Encore Las Vegas
              </h3>
              <p className="text-white/80 text-sm">
                3131 Las Vegas Blvd. Las Vegas, NV 89109
              </p>
              <p className="text-white/80 text-sm">+1 (702) 770-7000</p>
              <h3 className="font-semibold mt-6 mb-4 text-sm">
                Connect with us.
              </h3>
              <div className="flex space-x-4 flex-wrap">
                {socialLinks.map((link) => (
                  <Link key={link.alt} href={link.href} className="mb-2">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center transition-transform hover:scale-110">
                      <Image
                        src={link.src}
                        alt={link.alt}
                        width={28}
                        height={28}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 text-center text-white/60 text-xs">
            <p className="mb-2">Do Not Sell Or Share My Data</p>
            <p>
              © {new Date().getFullYear()} Wynn Resorts Holdings, LLC. All
              rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 