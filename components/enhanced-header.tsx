"use client"

import Image from "next/image"
import { Globe, Mail } from "lucide-react"

interface EnhancedHeaderProps {
  invoiceNumber: string
  onInvoiceNumberChange: (value: string) => void
}

export function EnhancedHeader({ invoiceNumber, onInvoiceNumberChange }: EnhancedHeaderProps) {
  return (
    <div className="bg-white p-8">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4 relative">
        {/* Logo - Fixed Width - Resized Smaller - Nudged Down */}
        <div className="flex-shrink-0 w-full md:w-[170px] flex justify-center md:justify-start mt-5">
          <Image
            src="/logo_supernesia.png"
            alt="Supernesia Logo"
            width={150}
            height={75}
            className="h-14 w-auto object-contain"
          />
        </div>

        {/* Company Info - Centered */}
        <div className="flex-1 text-center px-4">
          <h1 className="text-2xl font-bold text-[#2b2b2b] tracking-wide mb-1 leading-none pt-2">PT SUPERNESIA CREATIVE TECHNOLOGY</h1>
          <div className="text-[#2b2b2b]/80 text-sm leading-relaxed">
            <p className="font-medium whitespace-nowrap md:whitespace-normal">
              Wirausaha Building Lt. 1 Unit 104, Jl. HR Rasuna Said Kav. C-5 Jakarta Selatan, 12920. Telp 021-5277639
            </p>

            {/* Icons Row: Website & Email */}
            <div className="flex flex-wrap justify-center gap-4 mt-2 text-sm font-medium items-center">
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                <span>supernesia.id</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                <span>info@supernesia.id</span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Title and Number - Fixed Width */}
        <div className="w-full md:w-[200px] text-right mt-4 md:mt-0">
          <div className="inline-block bg-[#2b2b2b] text-white p-4 rounded-sm w-full shadow-md text-center md:text-right">
            <h2 className="text-2xl font-black tracking-widest mb-1">INVOICE</h2>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => onInvoiceNumberChange(e.target.value)}
              className="w-full bg-transparent text-[#e9e15b] font-mono text-lg font-bold border-b border-[#e9e15b]/30 focus:border-[#e9e15b] outline-none text-center md:text-right transition-colors"
              placeholder="INV/..."
            />
          </div>
        </div>
      </div>
      <div className="border-b-4 border-double border-[#2b2b2b] mt-8 mx-4"></div>
    </div>
  )
}
