import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/adminAuth';
import Order from '@/app/api/models/Order';
import Product from '@/app/api/models/Product';
import DailyStat from '@/app/api/models/DailyStat';
import {
  MONTH_LABELS_UK,
  calcConversionRate,
  calcMarginPercent,
  estimateCostFromSale,
  getOrderDate,
  roundMoney,
  wholesaleToUah,
} from '@/lib/adminAnalytics';

interface OrderItem {
  _id?: string;
  title?: string;
  price?: number;
  quantity?: number;
  handle?: string;
}

function isInMonth(date: Date, year: number, month: number) {
  return date.getFullYear() === year && date.getMonth() + 1 === month;
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const year = Number(searchParams.get('year') || now.getFullYear());
    const month = Number(searchParams.get('month') || now.getMonth() + 1);

    if (!year || month < 1 || month > 12) {
      return NextResponse.json({ error: 'Invalid year or month' }, { status: 400 });
    }

    const [orders, products, dailyStats] = await Promise.all([
      Order.find().lean(),
      Product.find().select('_id handle mmaSourcePrice price').lean(),
      DailyStat.find({
        date: {
          $gte: `${year}-01-01`,
          $lte: `${year}-12-31`,
        },
      }).lean(),
    ]);

    const productById = new Map(
      products.map((p) => [String(p._id), p])
    );
    const productByHandle = new Map(
      products.filter((p) => p.handle).map((p) => [p.handle as string, p])
    );

    const pageViewsByMonth = Array.from({ length: 12 }, () => 0);
    for (const stat of dailyStats) {
      const monthIndex = Number(stat.date.slice(5, 7)) - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        pageViewsByMonth[monthIndex] += stat.pageViews || 0;
      }
    }

    const monthBuckets = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      label: MONTH_LABELS_UK[index],
      revenue: 0,
      cost: 0,
      margin: 0,
      ordersCount: 0,
      pageViews: pageViewsByMonth[index],
      conversionRate: 0,
      marginPercent: 0,
    }));

    const parsedOrders = orders
      .map((order) => {
        const raw = order as {
          createdAt?: string | Date;
          updatedAt?: Date;
        };
        const date =
          getOrderDate({ createdAt: raw.createdAt as string }) ||
          (raw.updatedAt ? new Date(raw.updatedAt) : null);

        return { order, date };
      })
      .filter((entry) => entry.date);

    for (const { order, date } of parsedOrders) {
      const monthIndex = date!.getMonth();
      if (date!.getFullYear() !== year) continue;

      const bucket = monthBuckets[monthIndex];
      bucket.ordersCount += 1;
      bucket.revenue += order.total || 0;

      const items = (order.items || []) as OrderItem[];
      for (const item of items) {
        const qty = item.quantity || 1;
        const salePrice = item.price || 0;
        const product =
          (item._id && productById.get(String(item._id))) ||
          (item.handle && productByHandle.get(item.handle)) ||
          null;

        const costUnit =
          wholesaleToUah(product?.mmaSourcePrice) ??
          estimateCostFromSale(salePrice);

        bucket.cost += costUnit * qty;
      }

      bucket.margin = bucket.revenue - bucket.cost;
      bucket.conversionRate = calcConversionRate(
        bucket.ordersCount,
        bucket.pageViews
      );
      bucket.marginPercent = calcMarginPercent(bucket.margin, bucket.revenue);
    }

    for (const bucket of monthBuckets) {
      bucket.revenue = roundMoney(bucket.revenue);
      bucket.cost = roundMoney(bucket.cost);
      bucket.margin = roundMoney(bucket.margin);
    }

    const selectedOrders = parsedOrders
      .filter(({ date }) => isInMonth(date!, year, month))
      .map(({ order, date }) => ({
        _id: String(order._id),
        name: order.name,
        lastName: order.lastName,
        phone: order.phone,
        total: order.total,
        paymentMethod: order.paymentMethod,
        city: order.city,
        warehouse: order.warehouse,
        createdAt: date!.toISOString(),
        items: order.items,
      }))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    const lineItems: Array<{
      orderId: string;
      orderDate: string;
      customer: string;
      title: string;
      quantity: number;
      costPrice: number;
      salePrice: number;
      revenue: number;
      margin: number;
      marginPercent: number;
      costEstimated: boolean;
    }> = [];

    let totalCost = 0;
    let totalRevenue = 0;

    for (const order of selectedOrders) {
      const items = (order.items || []) as OrderItem[];
      for (const item of items) {
        const qty = item.quantity || 1;
        const salePrice = item.price || 0;
        const product =
          (item._id && productById.get(String(item._id))) ||
          (item.handle && productByHandle.get(item.handle)) ||
          null;

        const wholesale = wholesaleToUah(product?.mmaSourcePrice);
        const costPrice = wholesale ?? estimateCostFromSale(salePrice);
        const revenue = salePrice * qty;
        const costTotal = costPrice * qty;
        const margin = revenue - costTotal;

        totalCost += costTotal;
        totalRevenue += revenue;

        lineItems.push({
          orderId: order._id,
          orderDate: order.createdAt,
          customer: `${order.name || ''} ${order.lastName || ''}`.trim(),
          title: item.title || 'Товар',
          quantity: qty,
          costPrice,
          salePrice,
          revenue: roundMoney(revenue),
          margin: roundMoney(margin),
          marginPercent: calcMarginPercent(margin, revenue),
          costEstimated: wholesale === null,
        });
      }
    }

    const totalMargin = roundMoney(totalRevenue - totalCost);
    const selectedBucket = monthBuckets[month - 1];

    return NextResponse.json({
      year,
      month,
      currentMonth: now.getFullYear() === year ? now.getMonth() + 1 : null,
      months: monthBuckets,
      summary: {
        revenue: roundMoney(selectedBucket.revenue),
        cost: roundMoney(selectedBucket.cost),
        margin: roundMoney(selectedBucket.margin),
        marginPercent: selectedBucket.marginPercent,
        conversionRate: selectedBucket.conversionRate,
        ordersCount: selectedBucket.ordersCount,
        pageViews: selectedBucket.pageViews,
      },
      orders: selectedOrders,
      lineItems,
      totals: {
        totalCost: roundMoney(totalCost),
        totalRevenue: roundMoney(totalRevenue),
        totalMargin,
        marginPercent: calcMarginPercent(totalMargin, totalRevenue),
      },
    });
  } catch (error) {
    console.error('❌ Analytics error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
