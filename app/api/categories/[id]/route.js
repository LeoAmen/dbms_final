import { NextResponse } from 'next/server';
import { executeQuery } from '../../../../db/oracle';

// GET single category by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const result = await executeQuery(
      `SELECT c.*, 
              (SELECT COUNT(*) FROM product p WHERE p.category_id = c.category_id) as product_count
       FROM category c
       WHERE c.category_id = :1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PUT update category
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { name } = await request.json();
    
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }
    
    // Check if category exists
    const checkResult = await executeQuery(
      'SELECT category_id FROM category WHERE category_id = :1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    await executeQuery(
      'UPDATE category SET name = :1 WHERE category_id = :2',
      [name.trim(), id]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Category updated successfully' 
    });
  } catch (error) {
    console.error('Error updating category:', error);
    
    // Handle duplicate category name
    if (error.message.includes('unique constraint')) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE category
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Check if category exists
    const checkResult = await executeQuery(
      'SELECT category_id FROM category WHERE category_id = :1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Check if category has products
    const productCheck = await executeQuery(
      'SELECT COUNT(*) as product_count FROM product WHERE category_id = :1',
      [id]
    );
    
    if (productCheck.rows[0].PRODUCT_COUNT > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete category with products',
          product_count: productCheck.rows[0].PRODUCT_COUNT 
        },
        { status: 400 }
      );
    }
    
    // Delete the category
    await executeQuery(
      'DELETE FROM category WHERE category_id = :1',
      [id]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Category deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}