import { NextResponse } from 'next/server';
import { executeQuery } from '../../../../../db/oracle';

// GET single order by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Get order details
    const orderResult = await executeQuery(`
      SELECT 
        o.*,
        c.fullname as customer_name,
        c.email as customer_email,
        c.phone as customer_phone
      FROM orders o
      JOIN customer c ON o.customer_id = c.customer_id
      WHERE o.order_id = :1
    `, [id]);
    
    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Get order items
    const itemsResult = await executeQuery(`
      SELECT 
        oi.*,
        p.name as product_name,
        p.description as product_description
      FROM order_items oi
      JOIN product p ON oi.product_id = p.product_id
      WHERE oi.order_id = :1
    `, [id]);
    
    // Get payment info if exists
    const paymentResult = await executeQuery(`
      SELECT * FROM payment 
      WHERE order_id = :1
    `, [id]);
    
    const order = orderResult.rows[0];
    order.items = itemsResult.rows;
    order.payment = paymentResult.rows.length > 0 ? paymentResult.rows[0] : null;
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PUT update order (especially status)
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { status, shipping_address, total_amount } = await request.json();
    
    let query = 'UPDATE orders SET ';
    const paramsArray = [];
    
    if (status !== undefined) {
      query += 'status = :1 ';
      paramsArray.push(status);
    }
    
    if (shipping_address !== undefined) {
      if (paramsArray.length > 0) query += ', ';
      query += 'shipping_address = :' + (paramsArray.length + 1) + ' ';
      paramsArray.push(shipping_address);
    }
    
    if (total_amount !== undefined) {
      if (paramsArray.length > 0) query += ', ';
      query += 'total_amount = :' + (paramsArray.length + 1) + ' ';
      paramsArray.push(total_amount);
    }
    
    query += ' WHERE order_id = :' + (paramsArray.length + 1);
    paramsArray.push(id);
    
    await executeQuery(query, paramsArray);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// DELETE order
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    await executeQuery('DELETE FROM orders WHERE order_id = :1', [id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}