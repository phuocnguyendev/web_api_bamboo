import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';

@Injectable()
export class StockOutItemAnalyticsHelper {
  constructor(private readonly prisma: PrismaService) {}

  // Phân tích tồn kho và dự báo nhu cầu sản phẩm
  async forecastProductDemand(productId: string, months: number = 6) {
    // Lấy dữ liệu xuất kho 6 tháng gần nhất
    const now = new Date();
    const fromDate = new Date(now.getFullYear(), now.getMonth() - months, 1);
    const items = await this.prisma.stockOutItem.findMany({
      where: {
        ProductId: productId,
        StockOutVoucher: { IssuedAt: { gte: fromDate } },
      },
      include: { StockOutVoucher: true },
    });
    // Gom nhóm theo tháng
    const monthly: Record<string, number> = {};
    for (const item of items) {
      const month = item.StockOutVoucher.IssuedAt.toISOString().slice(0, 7);
      monthly[month] = (monthly[month] || 0) + Number(item.Qty);
    }
    // Tính trung bình/tháng
    const monthsCount = Object.keys(monthly).length || 1;
    const avg = Object.values(monthly).reduce((a, b) => a + b, 0) / monthsCount;
    return { monthly, avg, monthsCount };
  }

  // So sánh giá xuất kho và giá hiện tại
  async compareExportAndCurrentPrice(productId: string) {
    // Lấy giá xuất kho gần nhất
    const lastExport = await this.prisma.stockOutItem.findFirst({
      where: { ProductId: productId },
      orderBy: { Id: 'desc' },
    });
    // Lấy giá hiện tại từ bảng Product
    const product = await this.prisma.product.findUnique({
      where: { Id: productId },
    });
    return {
      lastExportPrice: lastExport?.UnitCostSnapshot ?? null,
      currentPrice: product?.BaseCost ?? null,
      diff:
        product && lastExport
          ? Number(product.BaseCost) - Number(lastExport.UnitCostSnapshot)
          : null,
    };
  }

  // Audit trail: lịch sử thay đổi StockOutItem
  async getAuditTrail(itemId: string) {
    // Giả sử có bảng audit riêng, ở đây chỉ trả về bản ghi hiện tại
    const item = await this.prisma.stockOutItem.findUnique({
      where: { Id: itemId },
    });
    return [item];
  }
}
