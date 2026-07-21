export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"

export async function GET(request: Request) {
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const business = await prisma.business.findUnique({
      where: { userId: token.id as string }
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    const [
      totalPurchases,
      totalSales,
      totalLabourers,
      totalSuppliers,
      totalShops,
      openingBalance,
      purchases,
      sales,
      labourTransactions,
      finishingTransactions,
    ] = await Promise.all([
      prisma.purchase.aggregate({
        where: { businessId: business.id },
        _sum: { totalCost: true }
      }),
      prisma.sale.aggregate({
        where: { businessId: business.id },
        _sum: { totalAmount: true }
      }),
      prisma.labourer.count({
        where: { businessId: business.id }
      }),
      prisma.supplier.count({
        where: { businessId: business.id }
      }),
      prisma.shop.count({
        where: { businessId: business.id }
      }),
      prisma.openingBalance.findUnique({
        where: { businessId: business.id }
      }),
      prisma.purchase.findMany({
        where: { businessId: business.id },
        select: { chainType: true, packetCount: true }
      }),
      prisma.sale.findMany({
        where: { businessId: business.id },
        select: { chainType: true, chainCount: true, totalAmount: true, saleDate: true }
      }),
      prisma.labourTransaction.findMany({
        where: { businessId: business.id },
        select: { chainType: true, chainsGiven: true, chainsReceived: true }
      }),
      prisma.finishingTransaction.findMany({
        where: { businessId: business.id },
        select: { chainType: true, chainsGiven: true, finishedChainsReceived: true }
      }),
    ])

    const purchasedOT = purchases.filter(p => p.chainType === "OT").reduce((sum, p) => sum + p.packetCount, 0)
    const purchasedMedium = purchases.filter(p => p.chainType === "MEDIUM").reduce((sum, p) => sum + p.packetCount, 0)
    
    const labourGivenOT = labourTransactions.filter(l => l.chainType === "OT").reduce((sum, l) => sum + l.chainsGiven, 0)
    const labourGivenMedium = labourTransactions.filter(l => l.chainType === "MEDIUM").reduce((sum, l) => sum + l.chainsGiven, 0)
    
    const labourReceivedOT = labourTransactions.filter(l => l.chainType === "OT").reduce((sum, l) => sum + l.chainsReceived, 0)
    const labourReceivedMedium = labourTransactions.filter(l => l.chainType === "MEDIUM").reduce((sum, l) => sum + l.chainsReceived, 0)
    
    const finishingGivenOT = finishingTransactions.filter(f => f.chainType === "OT").reduce((sum, f) => sum + f.chainsGiven, 0)
    const finishingGivenMedium = finishingTransactions.filter(f => f.chainType === "MEDIUM").reduce((sum, f) => sum + f.chainsGiven, 0)
    
    const finishingReceivedOT = finishingTransactions.filter(f => f.chainType === "OT").reduce((sum, f) => sum + f.finishedChainsReceived, 0)
    const finishingReceivedMedium = finishingTransactions.filter(f => f.chainType === "MEDIUM").reduce((sum, f) => sum + f.finishedChainsReceived, 0)
    
    const salesOT = sales.filter(s => s.chainType === "OT").reduce((sum, s) => sum + s.chainCount, 0)
    const salesMedium = sales.filter(s => s.chainType === "MEDIUM").reduce((sum, s) => sum + s.chainCount, 0)

    const openingOtChains = openingBalance?.otChains || 0
    const openingMediumChains = openingBalance?.mediumChains || 0
    const openingFinishingOtChains = openingBalance?.finishingOtChains || 0
    const openingFinishingMediumChains = openingBalance?.finishingMediumChains || 0

    const stockOT = openingOtChains + labourReceivedOT - finishingGivenOT + openingFinishingOtChains - salesOT
    const stockMedium = openingMediumChains + labourReceivedMedium - finishingGivenMedium + openingFinishingMediumChains - salesMedium

    const monthlySales = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const month = date.toLocaleString('default', { month: 'short' })
      const monthSales = sales
        .filter(s => {
          const saleDate = new Date(s.saleDate)
          return saleDate.getMonth() === date.getMonth() && saleDate.getFullYear() === date.getFullYear()
        })
        .reduce((sum, s) => sum + (s.totalAmount?.toNumber() || 0), 0)
      return { month, amount: monthSales }
    }).reverse()

    const chainDistribution = [
      { name: "OT", value: stockOT },
      { name: "Medium", value: stockMedium },
    ]

    const result = {
      totalPurchases: totalPurchases._sum.totalCost?.toNumber() || 0,
      totalSales: totalSales._sum.totalAmount?.toNumber() || 0,
      totalLabourers,
      totalSuppliers,
      totalShops,
      stockOT,
      stockMedium,
      monthlySales,
      chainDistribution,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Dashboard fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}
