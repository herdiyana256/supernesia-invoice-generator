import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, CreditCard, User } from "lucide-react"

interface BankInfoCardProps {
  invoiceNumber: string
}

export function BankInfoCard({ invoiceNumber }: BankInfoCardProps) {
  return (
    <Card className="border-[#e9e15b] border-2">
      <CardHeader className="bg-[#e9e15b]/10">
        <CardTitle className="text-lg font-semibold text-[#2b2b2b] flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Informasi Rekening Pembayaran
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="bg-gradient-to-r from-[#e9e15b]/20 to-[#e9e15b]/10 p-6 rounded-lg border border-[#e9e15b]/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-[#2b2b2b] mt-1" />
              <div>
                <span className="font-semibold text-[#2b2b2b] block">Bank:</span>
                <p className="text-[#2b2b2b]/80 font-medium">BCA</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-[#2b2b2b] mt-1" />
              <div>
                <span className="font-semibold text-[#2b2b2b] block">Account Number:</span>
                <p className="text-[#2b2b2b]/80 font-mono font-bold text-lg">006 186 0401</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-[#2b2b2b] mt-1" />
              <div>
                <span className="font-semibold text-[#2b2b2b] block">On behalf of:</span>
                <p className="text-[#2b2b2b]/80 font-medium">PT. Supernesia Creative Technology</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#e9e15b]/30">
            <div className="mb-4">
              <span className="font-semibold text-[#2b2b2b] block">NPWP PT Supernesia Creative Technology:</span>
              <p className="text-[#2b2b2b]/80 font-mono font-medium">1000.0000.0276.1335</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#e9e15b]/30">
            <div className="text-sm text-[#2b2b2b]/80 space-y-3">
              <p className="font-semibold text-[#2b2b2b]">💡 Catatan Penting:</p>

              <p>Mohon melakukan pembayaran sesuai jumlah total yang tertera pada invoice ini ke rekening di atas.</p>

              <p>
                Untuk mempercepat proses verifikasi dan pembukuan, harap sertakan <strong>Nomor Invoice</strong>{" "}
                (contoh: {invoiceNumber}) pada kolom berita atau keterangan saat melakukan transfer.
              </p>

              <p>
                Setelah pembayaran berhasil, mohon mengirimkan bukti transfer melalui email ke <strong>billing@supernesia.id</strong>{" "}
                atau melalui kontak resmi kami agar proses aktivasi layanan dapat segera dilakukan.
              </p>

              <p className="italic">
                Atas perhatian, kerjasama, dan kepercayaan Anda kepada PT Supernesia Creative Technology, kami ucapkan terima kasih.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
