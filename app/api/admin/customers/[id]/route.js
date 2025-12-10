import { NextResponse } from 'next/server';
import { executeQuery } from '../../../../../db/oracle';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const result = await executeQuery(`
      SELECT 
        c.*,
        COUNT(o.order_id) as ORDER_COUNT,
        SUM(o.total_amount) as TOTAL_SPENT
      FROM customer c
      LEFT JOIN orders o ON c.customer_id = o.customer_id
      WHERE c.customer_id = :1
      GROUP BY 
        c.customer_id, 
        c.fullname, 
        c.email, 
        c.phone, 
        c.password, 
        c.created_date
    `, [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}


export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Check if customer exists and has orders
    const checkQuery = `
      SELECT 
        c.*,
        COUNT(o.order_id) as ORDER_COUNT
      FROM customer c
      LEFT JOIN orders o ON c.customer_id = o.customer_id
      WHERE c.customer_id = :1
      GROUP BY 
        c.customer_id, 
        c.fullname, 
        c.email, 
        c.phone, 
        c.password, 
        c.created_date
    `;
    
    const checkResult = await executeQuery(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    const customer = checkResult.rows[0];
    
    // Check if customer has orders
    if (customer.ORDER_COUNT > 0) {
      return NextResponse.json(
        { error: `Cannot delete customer because they have ${customer.ORDER_COUNT} order(s)` },
        { status: 400 }
      );
    }
    
    // Delete the customer
    await executeQuery(
      `DELETE FROM customer WHERE customer_id = :1`,
      [id]
    );
    
    return NextResponse.json(
      { success: true, message: 'Customer deleted successfully' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}


























export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { fullname, email, phone } = await request.json();
    
    if (!fullname || !email) {
      return NextResponse.json(
        { error: 'Full name and email are required' },
        { status: 400 }
      );
    }
    
    // Update customer
    await executeQuery(
      `UPDATE customer 
       SET fullname = :1, email = :2, phone = :3 
       WHERE customer_id = :4`,
      [fullname.trim(), email.trim(), phone || null, id]
    );
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Customer updated successfully'
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error updating customer:', error);
    
    // Handle duplicate email
    if (error.message.includes('unique constraint') || 
        error.message.includes('ORA-00001')) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}