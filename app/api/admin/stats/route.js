import { executeQuery } from '../../../../db/oracle';

export async function GET() {
  try {
    // Get total products
    const productsResult = await executeQuery('SELECT COUNT(*) as count FROM product');
    const totalProducts = productsResult.rows[0].COUNT;

    // Get total customers
    const customersResult = await executeQuery('SELECT COUNT(*) as count FROM customer');
    const totalCustomers = customersResult.rows[0].COUNT;

    // Get total orders and revenue
    const ordersResult = await executeQuery(`
      SELECT COUNT(*) as order_count, COALESCE(SUM(total_amount), 0) as revenue 
      FROM orders
    `);
    const totalOrders = ordersResult.rows[0].ORDER_COUNT;
    const totalRevenue = ordersResult.rows[0].REVENUE;

    return new Response(JSON.stringify({
      totalProducts,
      totalCustomers,
      totalOrders,
      totalRevenue
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}