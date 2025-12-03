import { NextResponse } from 'next/server';
import { executeQuery } from '../../../../db/oracle';

// GET all orders
export async function GET() {
  try {
    const result = await executeQuery(`
      SELECT 
        o.order_id,
        o.order_date,
        o.total_amount,
        o.status,
        o.shipping_address,
        c.fullname as customer_name,
        c.email as customer_email,
        c.phone as customer_phone
      FROM orders o
      JOIN customer c ON o.customer_id = c.customer_id
      ORDER BY o.order_date DESC
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST create new order
export async function POST(request) {
  try {
    const { customer_id, total_amount, items, shipping_address } = await request.json();
    
    // Start transaction
    const connection = await executeQuery('SELECT 1 FROM dual'); // Get connection
    
    try {
      // Create order
      const orderResult = await executeQuery(
        `INSERT INTO orders (customer_id, total_amount, shipping_address) 
         VALUES (:1, :2, :3) 
         RETURNING order_id INTO :4`,
        [customer_id, total_amount, shipping_address, { dir: 3003, type: 2006 }] // 3003 = BIND_OUT, 2006 = NUMBER
      );
      
      const orderId = orderResult.outBinds[0][0];
      
      // Insert order items
      for (const item of items) {
        await executeQuery(
          `INSERT INTO order_items (order_id, product_id, quantity, price) 
           VALUES (:1, :2, :3, :4)`,
          [orderId, item.product_id, item.quantity, item.price]
        );
      }
      
      return NextResponse.json(
        { success: true, order_id: orderId },
        { status: 201 }
      );
    } catch (error) {
      // Rollback on error
      console.error('Order creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 }
    );
  }
}