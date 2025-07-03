"use client"

import Image from "next/image"

interface EnhancedHeaderProps {
  invoiceNumber: string
  onInvoiceNumberChange: (value: string) => void
}

export function EnhancedHeader({ invoiceNumber, onInvoiceNumberChange }: EnhancedHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-[#e9e15b] to-[#e9e15b] p-6 md:p-8 border-b-4 border-[#2b2b2b]">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
        {/* Logo and Company Info */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-1">
          <div className="flex-shrink-0">
            <Image
              src="/supernesia-logo.png"
              alt="Supernesia Logo"
              width={140}
              height={70}
              className="h-14 md:h-18 w-auto"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-[#2b2b2b] mb-2">PT Supernesia Creative Technology</h1>
            <div className="space-y-1 text-[#2b2b2b]/90 text-sm md:text-base">
              <p className="font-medium">
                Gedung Wirausaha Lt. 1 Unit 104
                <br />
                Jl. HR Rasuna Said Kav. C-5
                <br />
                Jakarta Selatan, 12920
              </p>
              <p className="font-medium">NPWP: 1000.0000.0276.1335</p>
              <div className="flex flex-col sm:flex-row sm:gap-4 gap-1 mt-2">
                <p className="flex items-center gap-1">
                  <span>📞</span> 0812-8189-2625
                </p>
                <p className="flex items-center gap-1">
                  <span>📧</span> info@supernesia.id
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Title and Number */}
        <div className="text-right bg-[#2b2b2b] text-white p-4 rounded-lg">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">INVOICE</h2>
          <input
            type="text"
            value={invoiceNumber}
            onChange={(e) => onInvoiceNumberChange(e.target.value)}
            className="bg-transparent text-[#e9e15b] font-mono text-lg border-b border-[#e9e15b]/50 focus:border-[#e9e15b] outline-none text-right"
            placeholder="INV/SNC/2025/001"
          />
        </div>
      </div>
    </div>
  )
}
