import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hệ thống Quản lý Phòng khám',
  description: 'Hệ thống quản lý bệnh nhân, toa thuốc và thống kê cho phòng khám',
  keywords: 'phòng khám, quản lý bệnh nhân, toa thuốc, thống kê',
  authors: [{ name: 'Medical Clinic System' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}