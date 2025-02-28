import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-zinc-900 text-white py-10 mt-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        {/* Left Section - About */}
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-semibold mb-2">🌍 Sustainable Future</h2>
          <p className="text-gray-400 text-sm">
            Our mission is to track and reduce carbon emissions, guiding individuals and organizations toward  ''carbon neutrality ''.
          </p>
        </div>

        {/* Middle Section - Goals */}
        <div className="mt-6 md:mt-0">
          <h3 className="text-lg font-semibold">Our Sustainable Goals</h3>
          <ul className="text-gray-400 text-sm">
            <li>✅ SDG 13: Climate Action</li>
            <li>✅ SDG 11: Sustainable Cities</li>
            <li>✅ SDG 12: Responsible Consumption</li>
            <li>✅ SDG 15: Life on Land</li>
          </ul>
        </div>

        {/* Right Section - Links */}
        <div className="mt-6 md:mt-0">
          <h3 className="text-lg font-semibold">Quick Links</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li><Link href="/" className="hover:text-green-400">About Us</Link></li>
            <li><Link href="/home" className="hover:text-green-400">Dashboard</Link></li>
            <li><Link href="/" className="hover:text-green-400">Contact</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-700 mt-6 text-center pt-4 text-gray-500 text-xs">
        © {new Date().getFullYear()} Sustainable Future. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;