import { NextResponse } from 'next/server';
import { executeQuery } from '../../../../db/oracle';

// GET single product by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const result = await executeQuery(
      `SELECT p.*, c.name as category_name 
       FROM product p 
       LEFT JOIN category c ON p.category_id = c.category_id 
       WHERE p.product_id = :1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { name, description, price, stock, category_id } = await request.json();
    
    // Validate required fields
    if (!name || !price || !category_id) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }
    
    await executeQuery(
      `UPDATE product SET 
        name = :1, 
        description = :2, 
        price = :3, 
        stock = :4, 
        category_id = :5 
       WHERE product_id = :6`,
      [name, description || '', price, stock || 0, category_id, id]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Product updated successfully' 
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Check if product exists
    const checkResult = await executeQuery(
      'SELECT product_id FROM product WHERE product_id = :1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Check if product is in any orders
    const orderCheck = await executeQuery(
      `SELECT COUNT(*) as order_count 
       FROM order_items 
       WHERE product_id = :1`,
      [id]
    );
    
    if (orderCheck.rows[0].ORDER_COUNT > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product that exists in orders' },
        { status: 400 }
      );
    }
    
    // Delete the product
    await executeQuery(
      'DELETE FROM product WHERE product_id = :1',
      [id]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}