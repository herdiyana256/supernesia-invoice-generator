"use client"

import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { Copy, Check, Globe, Mail } from "lucide-react"
import { useState } from "react"

interface ServiceItem {
  id: number
  name: string
  package: string
  qty: number
  unitPrice: number
  subtotal: number
}

interface InvoiceData {
  clientName: string
  picName: string
  clientEmail: string
  clientAddress: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  services: ServiceItem[]
  discount: number
  financeName: string
  financePosition: string
  approverName: string
  approverPosition: string
  ppnEnabled: boolean
  pphEnabled: boolean
  ppnRate: number
  pphRate: number
  subject: string
  financeSignature?: string
  approverSignature?: string
}

interface InvoicePreviewProps {
  data: InvoiceData
  totals: {
    subtotal: number
    ppn: number
    pph: number
    grandTotal: number
  }
}

export function InvoicePreview({ data, totals }: InvoicePreviewProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyContent = async () => {
    try {
      const element = document.getElementById("invoice-preview")
      if (element) {
        const text = element.innerText
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Preview Invoice</h3>
          <p className="text-sm text-gray-600">Preview ini dapat di-copy dan di-print dengan format yang tepat</p>
        </div>
        <button
          onClick={handleCopyContent}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy Text"}
        </button>
      </div>

      <div
        className="bg-white p-8 max-w-4xl mx-auto text-sm"
        id="invoice-preview"
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          WebkitUserSelect: "text",
          MozUserSelect: "text",
          msUserSelect: "text",
        }}
      >
        {/* Header / Kop Surat */}
        <div className="flex flex-row items-start justify-between gap-4 mb-2">
          {/* Logo - Fixed Width - Resized Smaller - Nudged Down */}
          <div className="flex-shrink-0 w-[170px] mt-5">
            <Image
              src="/logo_supernesia.png"
              alt="Supernesia Logo"
              width={160}
              height={80}
              className="h-16 w-auto object-contain"
            />
          </div>

          {/* Company Info - Centered */}
          <div className="flex-1 text-center px-4">
            <h1 className="text-2xl font-bold mb-1 tracking-wide text-[#2b2b2b] leading-none pt-2">PT SUPERNESIA CREATIVE TECHNOLOGY</h1>
            <div className="text-[#2b2b2b] text-sm leading-snug">
              <p className="font-medium whitespace-nowrap">
                Wirausaha Building Lt. 1 Unit 104, Jl. HR Rasuna Said Kav. C-5 Jakarta Selatan, 12920. Telp 021-5277639
              </p>

              {/* Icons Row */}
              <div className="flex justify-center gap-4 mt-1 font-medium items-center">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>supernesia.id</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>info@supernesia.id</span>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Title and Number - Fixed Width */}
          <div className="w-[180px] text-right">
            <div className="bg-[#2b2b2b] text-white p-3 rounded-sm shadow-sm text-right">
              <h2 className="text-xl font-black tracking-widest mb-1">INVOICE</h2>
              <p className="text-[#e9e15b] font-mono text-lg font-bold">{data.invoiceNumber}</p>
            </div>
          </div>
        </div>

        {/* Garis Pembatas */}
        <div className="border-t-4 border-double border-[#2b2b2b] mb-6 mt-4 mx-4"></div>

        {/* Subject */}
        {data.subject && (
          <div className="mb-6 px-4">
            <p className="text-base font-medium text-[#2b2b2b]">
              <span className="font-bold">Perihal:</span> {data.subject}
            </p>
          </div>
        )}

        {/* Client Info & Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 px-4">
          {/* Kiri: Info Klien */}
          <div>
            <h3 className="font-bold text-[#2b2b2b] mb-3 text-base">Kepada:</h3>
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-base">{data.clientName}</p>
              <p>
                <strong>PIC:</strong> {data.picName}
              </p>
              <p>
                <strong>Email:</strong> {data.clientEmail}
              </p>
              <p className="whitespace-pre-line">{data.clientAddress}</p>
            </div>
          </div>

          {/* Kanan: Detail Invoice */}
          <div className="flex flex-col md:items-end text-end">
            <h3 className="font-bold text-[#2b2b2b] mb-3 text-base">Detail Invoice:</h3>
            <div className="space-y-1 text-sm">
              <p>
                <strong>Tanggal:</strong> {new Date(data.invoiceDate).toLocaleDateString("id-ID")}
              </p>
              <p>
                <strong>Jatuh Tempo:</strong> {new Date(data.dueDate).toLocaleDateString("id-ID")}
              </p>
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div className="mb-8 px-4">
          <table className="w-full border-collapse border-2 border-gray-400">
            <thead>
              <tr className="bg-[#e9e15b] bg-opacity-30">
                <th className="border border-gray-400 p-3 text-left font-semibold text-sm">No</th>
                <th className="border border-gray-400 p-3 text-left font-semibold text-sm">Nama Layanan</th>
                <th className="border border-gray-400 p-3 text-left font-semibold text-sm">Paket</th>
                <th className="border border-gray-400 p-3 text-center font-semibold text-sm">Qty</th>
                <th className="border border-gray-400 p-3 text-right font-semibold text-sm">Harga</th>
                <th className="border border-gray-400 p-3 text-right font-semibold text-sm">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {data.services.map((service, index) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="border border-gray-400 p-3 text-center">{index + 1}</td>
                  <td className="border border-gray-400 p-3 whitespace-pre-wrap">{service.name}</td>
                  <td className="border border-gray-400 p-3">{service.package}</td>
                  <td className="border border-gray-400 p-3 text-center">{service.qty}</td>
                  <td className="border border-gray-400 p-3 text-right">{formatCurrency(service.unitPrice)}</td>
                  <td className="border border-gray-400 p-3 text-right font-semibold">
                    {formatCurrency(service.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8 px-4">
          <div className="w-full max-w-md space-y-2 text-sm">
            <div className="flex justify-between py-1">
              <span>Subtotal:</span>
              <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
            </div>
            {data.discount > 0 && (
              <div className="flex justify-between py-1">
                <span>Diskon:</span>
                <span className="font-semibold text-red-600">-{formatCurrency(data.discount)}</span>
              </div>
            )}
            {data.ppnEnabled && (
              <div className="flex justify-between py-1">
                <span>PPN {data.ppnRate}%:</span>
                <span className="font-semibold">{formatCurrency(totals.ppn)}</span>
              </div>
            )}
            {data.pphEnabled && (
              <div className="flex justify-between py-1">
                <span>PPh {data.pphRate}%:</span>
                <span className="font-semibold text-red-600">-{formatCurrency(totals.pph)}</span>
              </div>
            )}
            <hr className="border-gray-400 my-2" />
            <div className="flex justify-between text-lg font-bold py-2 bg-[#e9e15b] bg-opacity-20 px-3 rounded">
              <span>Grand Total:</span>
              <span className="text-[#2b2b2b]">{formatCurrency(totals.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Bank Info */}
        <div className="px-4">
          <div className="bg-[#e9e15b] bg-opacity-10 p-6 rounded-lg border-2 border-[#e9e15b] border-opacity-40 mb-8">
            <h3 className="font-bold text-[#2b2b2b] mb-4 text-base">Informasi Rekening Pembayaran</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
              <div>
                <span className="font-semibold">Bank:</span>
                <p className="font-bold">BCA</p>
              </div>
              <div>
                <span className="font-semibold">Account Number:</span>
                <p className="font-mono font-bold text-lg">006 186 0401</p>
              </div>
              <div>
                <span className="font-semibold">On behalf of:</span>
                <p className="font-bold">PT. Supernesia Creative Technology</p>
              </div>
            </div>
            <div className="mb-4 text-sm">
              <span className="font-semibold">NPWP PT Supernesia Creative Technology:</span>
              <p className="font-mono font-semibold">1000.0000.0276.1335</p>
            </div>
            <div className="text-sm space-y-2 border-t border-[#e9e15b] border-opacity-40 pt-4">
              <p className="font-bold">💡 Catatan Penting:</p>
              <p>Mohon melakukan pembayaran sesuai jumlah total yang tertera pada invoice ini ke rekening di atas.</p>
              <p>
                Untuk mempercepat proses verifikasi dan pembukuan, harap sertakan <strong>Nomor Invoice</strong> (
                {data.invoiceNumber}) pada kolom berita atau keterangan saat melakukan transfer.
              </p>
              <p>
                Setelah pembayaran berhasil, mohon mengirimkan bukti transfer melalui email ke <strong>billing@supernesia.id</strong>{" "}
                atau melalui kontak resmi kami agar proses aktivasi layanan dapat segera dilakukan.
              </p>
              <p className="italic font-medium">
                Atas perhatian, kerjasama, dan kepercayaan Anda kepada PT Supernesia Creative Technology, kami ucapkan terima kasih.
              </p>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 px-4 pb-8">
          <div>
            <h4 className="font-semibold mb-2 text-sm">Hormat kami,</h4>
            <h4 className="font-semibold mb-4 text-sm">PT Supernesia Creative Technology</h4>

            {data.financeSignature && (
              <div className="mb-4">
                <img
                  src={data.financeSignature || "/placeholder.svg"}
                  alt="Finance Signature"
                  className="max-w-32 max-h-20 object-contain"
                />
              </div>
            )}
            <div className="border-b-2 border-gray-400 w-48 mb-4"></div>
            <div className="space-y-1 text-sm">
              <p className="font-bold">{data.financeName}</p>
              <p className="font-semibold">{data.financePosition}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-6 text-sm">Mengetahui:</h4>

            {data.approverSignature && (
              <div className="mb-4">
                <img
                  src={data.approverSignature || "/placeholder.svg"}
                  alt="Approver Signature"
                  className="max-w-32 max-h-20 object-contain"
                />
              </div>
            )}
            <div className="border-b-2 border-gray-400 w-48 mb-4"></div>
            <div className="space-y-1 text-sm">
              <p className="font-bold">{data.approverName}</p>
              <p className="font-semibold">{data.approverPosition}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
