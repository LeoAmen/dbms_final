import { NextResponse } from 'next/server';
import { executeQuery } from '../../../db/oracle';

export async function GET() {
  try {
    const result = await executeQuery(`
      SELECT 
        c.*,
        COUNT(p.product_id) as PRODUCT_COUNT
      FROM category c
      LEFT JOIN product p ON c.category_id = p.category_id
      GROUP BY c.category_id, c.name, c.created_date
      ORDER BY c.name
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    
    // If the table doesn't exist, return empty array for now
    if (error.message.includes('ORA-00942')) {
      return NextResponse.json([]);
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST create new category
export async function POST(request) {
  try {
    const { name } = await request.json();
    
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }
    
    // Create category
    await executeQuery(
      `INSERT INTO category (name) VALUES (:1)`,
      [name.trim()]
    );
    
    // Get the newly created category
    const getCategoryQuery = `
      SELECT c.*, 0 as PRODUCT_COUNT
      FROM category c
      WHERE name = :1 
      AND ROWNUM = 1 
      ORDER BY category_id DESC
    `;
    
    const categoryResult = await executeQuery(getCategoryQuery, [name.trim()]);
    
    if (categoryResult.rows.length === 0) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Category created successfully'
        },
        { status: 201 }
      );
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Category created successfully',
        category: categoryResult.rows[0]
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('❌ Error creating category:', error.message);
    
    // Handle duplicate category name
    if (error.message.includes('unique constraint') || 
        error.message.includes('ORA-00001')) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create category. Please try again.' },
      { status: 500 }
    );
  }
}