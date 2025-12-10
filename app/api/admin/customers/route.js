import { NextResponse } from 'next/server';
import { executeQuery } from '../../../../db/oracle';

export async function GET() {
  try {
    const result = await executeQuery(`
      SELECT 
        c.*,
        COUNT(o.order_id) as ORDER_COUNT,
        SUM(o.total_amount) as TOTAL_SPENT
      FROM customer c
      LEFT JOIN orders o ON c.customer_id = o.customer_id
      GROUP BY 
        c.customer_id, 
        c.fullname, 
        c.email, 
        c.phone, 
        c.password, 
        c.created_date
      ORDER BY c.created_date DESC
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching customers:', error);
    
    // If the table doesn't exist, return empty array for now
    if (error.message.includes('ORA-00942')) {
      return NextResponse.json([]);
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { fullname, email, phone, password } = await request.json();
    
    if (!fullname || !email || !password) {
      return NextResponse.json(
        { error: 'Full name, email, and password are required' },
        { status: 400 }
      );
    }
    
    // Create customer
    await executeQuery(
      `INSERT INTO customer (fullname, email, phone, password) VALUES (:1, :2, :3, :4)`,
      [fullname.trim(), email.trim(), phone || null, password]
    );
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Customer created successfully'
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error creating customer:', error);
    
    // Handle duplicate email
    if (error.message.includes('unique constraint') || 
        error.message.includes('ORA-00001')) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}