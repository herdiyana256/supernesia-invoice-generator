"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Download, Printer, Mail, Eye } from "lucide-react"
import { EnhancedHeader } from "@/components/enhanced-header"
import { BankInfoCard } from "@/components/bank-info-card"
import { InvoicePreview } from "@/components/invoice-preview"
import { Toast } from "@/components/toast-notification"
import { generatePDF, printInvoice, parseSharedData } from "@/lib/pdf-utils"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

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

export default function InvoiceGenerator() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    clientName: "",
    picName: "",
    clientEmail: "",
    clientAddress: "",
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    services: [],
    discount: 0,
    financeName: "",
    financePosition: "",
    approverName: "John Doe",
    approverPosition: "CTO",
    ppnEnabled: true,
    pphEnabled: true,
    ppnRate: 11,
    pphRate: 2,
    subject: "penagihan",
    financeSignature: "",
    approverSignature: "",
  })

  const [nextServiceId, setNextServiceId] = useState(1)
  const [showPreview, setShowPreview] = useState(false)
  const [shareLink, setShareLink] = useState("")
  const searchParams = useSearchParams()
  const [financeSignatureFile, setFinanceSignatureFile] = useState<string>("")
  const [approverSignatureFile, setApproverSignatureFile] = useState<string>("")
  // Add PO number state
  const [poNumber, setPoNumber] = useState("")

  // Loading states
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  // Toast state
  const [toast, setToast] = useState<{
    message: string
    type: "success" | "error" | "info" | "loading"
  } | null>(null)

  const showToast = (message: string, type: "success" | "error" | "info" | "loading") => {
    setToast({ message, type })
  }

  const hideToast = () => {
    setToast(null)
  }

  useEffect(() => {
    const shared = searchParams.get("preview")
    if (shared) {
      const sharedData = parseSharedData(shared)
      if (sharedData) {
        setInvoiceData(sharedData)
        setShowPreview(true)
      }
    }
  }, [searchParams])

  const addServiceItem = () => {
    const newService: ServiceItem = {
      id: nextServiceId,
      name: "",
      package: "",
      qty: 1,
      unitPrice: 0,
      subtotal: 0,
    }
    setInvoiceData((prev) => ({
      ...prev,
      services: [...prev.services, newService],
    }))
    setNextServiceId((prev) => prev + 1)
    showToast("Layanan baru ditambahkan", "success")
  }

  const updateServiceItem = (id: number, field: keyof ServiceItem, value: string | number) => {
    setInvoiceData((prev) => ({
      ...prev,
      services: prev.services.map((service) => {
        if (service.id === id) {
          const updatedService = { ...service, [field]: value }
          if (field === "qty" || field === "unitPrice") {
            updatedService.subtotal = updatedService.qty * updatedService.unitPrice
          }
          return updatedService
        }
        return service
      }),
    }))
  }

  const removeServiceItem = (id: number) => {
    setInvoiceData((prev) => ({
      ...prev,
      services: prev.services.filter((service) => service.id !== id),
    }))
    showToast("Layanan dihapus", "info")
  }

  const calculateTotals = () => {
    const subtotal = invoiceData.services.reduce((sum, service) => sum + service.subtotal, 0)
    const ppn = invoiceData.ppnEnabled ? subtotal * (invoiceData.ppnRate / 100) : 0
    const pph = invoiceData.pphEnabled ? subtotal * (invoiceData.pphRate / 100) : 0
    const grandTotal = subtotal + ppn - pph - invoiceData.discount

    return {
      subtotal,
      ppn,
      pph,
      grandTotal: Math.max(0, grandTotal),
    }
  }

  const totals = calculateTotals()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handlePrint = async () => {
    if (!showPreview) {
      setShowPreview(true)
      setTimeout(() => {
        setIsPrinting(true)
        printInvoice()
        setTimeout(() => setIsPrinting(false), 2000)
      }, 1000)
    } else {
      setIsPrinting(true)
      printInvoice()
      setTimeout(() => setIsPrinting(false), 2000)
    }
  }

  const handleDownloadPDF = async () => {
    if (!invoiceData.invoiceNumber) {
      showToast("Mohon isi nomor invoice terlebih dahulu", "error")
      return
    }

    // Always show preview first if not shown
    if (!showPreview) {
      showToast("Menampilkan preview...", "info")
      setShowPreview(true)

      // Wait for preview to render completely
      setTimeout(async () => {
        setIsGeneratingPDF(true)
        const success = await generatePDF("invoice-preview", `${invoiceData.invoiceNumber}.pdf`)
        setIsGeneratingPDF(false)

        if (!success) {
          showToast("Gagal generate PDF. Silakan coba lagi.", "error")
        }
      }, 2000) // Increased wait time
    } else {
      setIsGeneratingPDF(true)
      const success = await generatePDF("invoice-preview", `${invoiceData.invoiceNumber}.pdf`)
      setIsGeneratingPDF(false)

      if (!success) {
        showToast("Gagal generate PDF. Silakan coba lagi.", "error")
      }
    }
  }

  const handleSendEmail = () => {
    if (!invoiceData.clientEmail) {
      showToast("Email klien belum diisi", "error")
      return
    }

    setIsSendingEmail(true)
    showToast("Membuka aplikasi email...", "loading")

    const subject = `Invoice ${invoiceData.invoiceNumber} - ${invoiceData.clientName}`
    const body = `Kepada Yth. ${invoiceData.clientName},

Terlampir invoice dengan detail sebagai berikut:
- Nomor Invoice: ${invoiceData.invoiceNumber}
- Perihal: ${invoiceData.subject}
- Total: ${formatCurrency(totals.grandTotal)}
- Jatuh Tempo: ${new Date(invoiceData.dueDate).toLocaleDateString("id-ID")}

Mohon untuk melakukan pembayaran sesuai dengan ketentuan yang tertera pada invoice.

Terima kasih atas kerjasamanya.

Hormat kami,
PT Supernesia Creative Technology
Email: info@supernesia.id
Phone: 0812-8189-2625`

    const mailtoLink = `mailto:${invoiceData.clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}&from=info@supernesia.id`

    setTimeout(() => {
      window.location.href = mailtoLink
      setIsSendingEmail(false)
      hideToast()
      showToast("Email client dibuka", "success")
    }, 1000)
  }

  const generateNextInvoiceNumber = () => {
    const year = new Date().getFullYear()
    const lastNumber = localStorage.getItem("lastInvoiceNumber") || "000"
    const nextNumber = (Number.parseInt(lastNumber) + 1).toString().padStart(3, "0")
    localStorage.setItem("lastInvoiceNumber", nextNumber)
    const newNumber = `INV/SNC/${year}/${nextNumber}`
    showToast(`Nomor invoice: ${newNumber}`, "success")
    return newNumber
  }

  const handleFinanceSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setFinanceSignatureFile(result)
        setInvoiceData((prev) => ({ ...prev, financeSignature: result }))
        showToast("Tanda tangan finance berhasil diupload", "success")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleApproverSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setApproverSignatureFile(result)
        setInvoiceData((prev) => ({ ...prev, approverSignature: result }))
        showToast("Tanda tangan approver berhasil diupload", "success")
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header Section */}
        <EnhancedHeader
          invoiceNumber={invoiceData.invoiceNumber}
          onInvoiceNumberChange={(value) => setInvoiceData((prev) => ({ ...prev, invoiceNumber: value }))}
        />

        <div className="p-6 md:p-8 space-y-8">
          {/* Client Information */}
          <Card className="border-[#e9e15b]/30">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#2b2b2b]">Informasi Klien</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">Nama Klien</Label>
                  <Input
                    id="clientName"
                    value={invoiceData.clientName}
                    onChange={(e) => setInvoiceData((prev) => ({ ...prev, clientName: e.target.value }))}
                    placeholder="Masukkan nama klien"
                  />
                </div>
                <div>
                  <Label htmlFor="picName">Nama PIC</Label>
                  <Input
                    id="picName"
                    value={invoiceData.picName}
                    onChange={(e) => setInvoiceData((prev) => ({ ...prev, picName: e.target.value }))}
                    placeholder="Masukkan nama PIC"
                  />
                </div>
                <div>
                  <Label htmlFor="clientEmail">Email Klien</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={invoiceData.clientEmail}
                    onChange={(e) => setInvoiceData((prev) => ({ ...prev, clientEmail: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="invoiceNumber">Nomor Invoice</Label>
                  <Input id="invoiceNumber" value={invoiceData.invoiceNumber} readOnly className="bg-gray-100" />
                </div>
                <div>
                  <Label htmlFor="invoiceDate">Tanggal Invoice</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={invoiceData.invoiceDate}
                    onChange={(e) => setInvoiceData((prev) => ({ ...prev, invoiceDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Jatuh Tempo</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={invoiceData.dueDate}
                    onChange={(e) => setInvoiceData((prev) => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Perihal</Label>
                  <Select
                    value={invoiceData.subject}
                    onValueChange={(value) => setInvoiceData((prev) => ({ ...prev, subject: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih perihal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Penagihan Jasa">Penagihan Jasa</SelectItem>
                      <SelectItem value="Tagihan Layanan">Tagihan Layanan</SelectItem>
                      <SelectItem value="Invoice Down Payment (DP)">Invoice Down Payment (DP)</SelectItem>
                      <SelectItem value="Invoice Pelunasan (Final Payment)">
                        Invoice Pelunasan (Final Payment)
                      </SelectItem>
                      <SelectItem value="Pembayaran Termin 1">Pembayaran Termin 1</SelectItem>
                      <SelectItem value="Pembayaran Termin 2">Pembayaran Termin 2</SelectItem>
                      <SelectItem value="Pembayaran Termin ke-___">Pembayaran Termin ke-___</SelectItem>
                      <SelectItem value="Retainer Fee">Retainer Fee</SelectItem>
                      <SelectItem value="Biaya Langganan Bulanan">Biaya Langganan Bulanan</SelectItem>
                      <SelectItem value="Biaya Langganan Tahunan">Biaya Langganan Tahunan</SelectItem>
                      <SelectItem value="Tagihan Pemeliharaan (Maintenance)">
                        Tagihan Pemeliharaan (Maintenance)
                      </SelectItem>
                      <SelectItem value="Biaya Tambahan / Additional Charges">
                        Biaya Tambahan / Additional Charges
                      </SelectItem>
                      <SelectItem value="Invoice Tambahan (Revisi / Add-on)">
                        Invoice Tambahan (Revisi / Add-on)
                      </SelectItem>
                      <SelectItem value="Pembayaran atas PO No.">Pembayaran atas PO No.</SelectItem>
                      <SelectItem value="Tagihan Setup / Instalasi">Tagihan Setup / Instalasi</SelectItem>
                      <SelectItem value="Invoice Hosting & Domain">Invoice Hosting & Domain</SelectItem>
                      <SelectItem value="Invoice Layanan Custom / Spesial">Invoice Layanan Custom / Spesial</SelectItem>
                      <SelectItem value="Tagihan Training / Support">Tagihan Training / Support</SelectItem>
                      <SelectItem value="Proforma Invoice (Estimasi)">Proforma Invoice (Estimasi)</SelectItem>
                      <SelectItem value="Penawaran Harga / Quotation">Penawaran Harga / Quotation</SelectItem>
                      
                    </SelectContent>
                  </Select>
                </div>
                {invoiceData.subject === "Pembayaran atas PO No." && (
                  <div>
                    <Label htmlFor="poNumber">Nomor PO</Label>
                    <Input
                      id="poNumber"
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                      placeholder="Masukkan nomor PO"
                    />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="clientAddress">Alamat Klien</Label>
                <Textarea
                  id="clientAddress"
                  value={invoiceData.clientAddress}
                  onChange={(e) => setInvoiceData((prev) => ({ ...prev, clientAddress: e.target.value }))}
                  placeholder="Masukkan alamat lengkap klien"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Service Items */}
          <Card className="border-[#e9e15b]/30">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#2b2b2b]">Item Layanan</CardTitle>
              <Button
                onClick={addServiceItem}
                size="sm"
                className="bg-[#e9e15b] hover:bg-[#e9e15b]/90 transition-all duration-200 hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Layanan
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">No</th>
                      <th className="text-left p-2 font-medium">Nama Layanan</th>
                      <th className="text-left p-2 font-medium">Paket</th>
                      <th className="text-left p-2 font-medium">Qty</th>
                      <th className="text-left p-2 font-medium">Harga Satuan</th>
                      <th className="text-left p-2 font-medium">Subtotal</th>
                      <th className="text-left p-2 font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.services.map((service, index) => (
                      <tr key={service.id} className="border-b">
                        <td className="p-2">{index + 1}</td>
                        <td className="p-2">
                          <Input
                            value={service.name}
                            onChange={(e) => updateServiceItem(service.id, "name", e.target.value)}
                            placeholder="Nama layanan"
                            className="min-w-[150px]"
                          />
                        </td>
                        <td className="p-2">
                          <Select
                            value={service.package}
                            onValueChange={(value) => updateServiceItem(service.id, "package", value)}
                          >
                            <SelectTrigger className="min-w-[120px]">
                              <SelectValue placeholder="Pilih paket" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SuperNeo">SuperNeo</SelectItem>
                              <SelectItem value="SuperPro">SuperPro</SelectItem>
                              <SelectItem value="SuperPremium">SuperPremium</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={service.qty}
                            onChange={(e) => updateServiceItem(service.id, "qty", Number.parseInt(e.target.value) || 0)}
                            className="w-20"
                            min="1"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={service.unitPrice}
                            onChange={(e) =>
                              updateServiceItem(service.id, "unitPrice", Number.parseFloat(e.target.value) || 0)
                            }
                            placeholder="0"
                            className="min-w-[120px]"
                          />
                        </td>
                        <td className="p-2 font-medium">{formatCurrency(service.subtotal)}</td>
                        <td className="p-2">
                          <Button
                            onClick={() => removeServiceItem(service.id)}
                            size="sm"
                            variant="destructive"
                            className="hover:scale-105 transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {invoiceData.services.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Belum ada layanan ditambahkan. Klik tombol "Tambah Layanan" untuk memulai.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cost Summary */}
          <Card className="border-[#e9e15b] border-2 border-[#e9e15b]/30">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#2b2b2b]">Rangkuman Biaya</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discount">Diskon / Promo</Label>
                    <Input
                      id="discount"
                      type="number"
                      value={invoiceData.discount}
                      onChange={(e) =>
                        setInvoiceData((prev) => ({ ...prev, discount: Number.parseFloat(e.target.value) || 0 }))
                      }
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="invoiceNumberEdit">Edit Nomor Invoice</Label>
                    <div className="flex gap-2">
                      <Input
                        id="invoiceNumberEdit"
                        value={invoiceData.invoiceNumber}
                        onChange={(e) => setInvoiceData((prev) => ({ ...prev, invoiceNumber: e.target.value }))}
                        placeholder="INV/SNC/2025/001"
                      />
                      <Button
                        type="button"
                        onClick={() =>
                          setInvoiceData((prev) => ({ ...prev, invoiceNumber: generateNextInvoiceNumber() }))
                        }
                        size="sm"
                        className="bg-[#e9e15b] hover:bg-[#e9e15b]/90 transition-all duration-200 hover:scale-105"
                      >
                        Auto
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Tax Configuration */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Konfigurasi Pajak</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="ppnEnabled"
                        checked={invoiceData.ppnEnabled}
                        onChange={(e) => setInvoiceData((prev) => ({ ...prev, ppnEnabled: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="ppnEnabled">PPN</Label>
                      <Input
                        type="number"
                        value={invoiceData.ppnRate}
                        onChange={(e) =>
                          setInvoiceData((prev) => ({ ...prev, ppnRate: Number.parseFloat(e.target.value) || 0 }))
                        }
                        className="w-20"
                        min="0"
                        max="100"
                        disabled={!invoiceData.ppnEnabled}
                      />
                      <span>%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="pphEnabled"
                        checked={invoiceData.pphEnabled}
                        onChange={(e) => setInvoiceData((prev) => ({ ...prev, pphEnabled: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="pphEnabled">PPh</Label>
                      <Input
                        type="number"
                        value={invoiceData.pphRate}
                        onChange={(e) =>
                          setInvoiceData((prev) => ({ ...prev, pphRate: Number.parseFloat(e.target.value) || 0 }))
                        }
                        className="w-20"
                        min="0"
                        max="100"
                        disabled={!invoiceData.pphEnabled}
                      />
                      <span>%</span>
                    </div>
                  </div>
                </div>

                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Diskon:</span>
                    <span className="font-medium text-red-600">-{formatCurrency(invoiceData.discount)}</span>
                  </div>
                  {invoiceData.ppnEnabled && (
                    <div className="flex justify-between">
                      <span>PPN {invoiceData.ppnRate}%:</span>
                      <span className="font-medium">{formatCurrency(totals.ppn)}</span>
                    </div>
                  )}
                  {invoiceData.pphEnabled && (
                    <div className="flex justify-between">
                      <span>PPh {invoiceData.pphRate}%:</span>
                      <span className="font-medium text-red-600">-{formatCurrency(totals.pph)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Grand Total:</span>
                    <span className="text-[#2b2b2b] bg-[#e9e15b]/20 px-4 py-2 rounded-lg">
                      {formatCurrency(totals.grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Information */}
          <BankInfoCard />

          {/* Signature Section */}
          <Card className="border-[#e9e15b]/30">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#2b2b2b]">Tanda Tangan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-medium mb-4">Hormat kami,</h4>
                  <h4 className="font-medium mb-4">PT Supernesia Creative Technology</h4>
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="financeName">Nama</Label>
                      <Input
                        id="financeName"
                        value={invoiceData.financeName}
                        onChange={(e) => setInvoiceData((prev) => ({ ...prev, financeName: e.target.value }))}
                        placeholder="Nama Finance"
                      />
                    </div>
                    <div>
                      <Label htmlFor="financePosition">Jabatan</Label>
                      <Select
                        value={invoiceData.financePosition}
                        onValueChange={(value) => setInvoiceData((prev) => ({ ...prev, financePosition: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jabatan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Finance Officer">Finance Officer</SelectItem>
                          <SelectItem value="Finance Support">Finance Support</SelectItem>
                          <SelectItem value="SPV Manager">SPV Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="financeSignature">Upload Tanda Tangan</Label>
                      <Input
                        id="financeSignature"
                        type="file"
                        accept="image/*"
                        onChange={handleFinanceSignatureUpload}
                        className="mt-1"
                      />
                      {invoiceData.financeSignature && (
                        <div className="mt-2">
                          <img
                            src={invoiceData.financeSignature || "/placeholder.svg"}
                            alt="Finance Signature"
                            className="max-w-32 max-h-16 object-contain border rounded"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-8 border-b border-gray-300 w-48"></div>
                  <p className="text-sm text-gray-600 mt-2">Tanda Tangan & Stempel</p>
                </div>
                <div>
                  <h4 className="font-medium mb-4">Mengetahui:</h4>
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="approverName">Nama</Label>
                      <Input
                        id="approverName"
                        value={invoiceData.approverName}
                        onChange={(e) => setInvoiceData((prev) => ({ ...prev, approverName: e.target.value }))}
                        placeholder="Nama"
                      />
                    </div>
                    <div>
                      <Label htmlFor="approverPosition">Jabatan</Label>
                      <Select
                        value={invoiceData.approverPosition}
                        onValueChange={(value) => setInvoiceData((prev) => ({ ...prev, approverPosition: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jabatan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CTO">CTO</SelectItem>
                          <SelectItem value="CEO">CEO</SelectItem>
                          <SelectItem value="CPO">CPO</SelectItem>
                          <SelectItem value="IT Consultant">IT Consultant</SelectItem>
                          <SelectItem value="Sales">Sales</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="approverSignature">Upload Tanda Tangan</Label>
                      <Input
                        id="approverSignature"
                        type="file"
                        accept="image/*"
                        onChange={handleApproverSignatureUpload}
                        className="mt-1"
                      />
                      {invoiceData.approverSignature && (
                        <div className="mt-2">
                          <img
                            src={invoiceData.approverSignature || "/placeholder.svg"}
                            alt="Approver Signature"
                            className="max-w-32 max-h-16 object-contain border rounded"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-8 border-b border-gray-300 w-48"></div>
                  <p className="text-sm text-gray-600 mt-2">Tanda Tangan</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => {
                setShowPreview(!showPreview)
                showToast(showPreview ? "Mode edit aktif" : "Preview aktif", "info")
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium flex items-center gap-2 transition-all duration-200 hover:scale-105"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? "Edit Invoice" : "Preview/Print PDF"}
            </Button>
            <Button
              onClick={handlePrint}
              disabled={isPrinting}
              className="bg-[#e9e15b] hover:bg-[#e9e15b]/90 text-[#2b2b2b] font-medium flex items-center gap-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPrinting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2b2b2b]"></div>
              ) : (
                <Printer className="w-4 h-4" />
              )}
              {isPrinting ? "Printing..." : "Save Document/PDF"}
            </Button>
            <Button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              variant="outline"
              className="flex items-center gap-2 bg-transparent transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isGeneratingPDF ? "Generating..." : "Download PDF"}
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={!invoiceData.clientEmail || isSendingEmail}
              className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSendingEmail ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Mail className="w-4 h-4" />
              )}
              {isSendingEmail ? "Opening..." : "Kirim Email"}
            </Button>
          </div>

          {/* Invoice Preview */}
          {showPreview && (
            <div className="mt-8 border-t pt-8">
              <InvoicePreview data={invoiceData} totals={totals} />
            </div>
          )}
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-preview, #invoice-preview * {
            visibility: visible;
          }
          #invoice-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
