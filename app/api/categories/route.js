import { NextResponse } from 'next/server';
import { executeQuery } from '../../../db/oracle';

export async function GET() {
  try {
    const result = await executeQuery(`
      SELECT 
        p.*,
        c.NAME as CATEGORY_NAME
      FROM product p
      LEFT JOIN category c ON p.category_id = c.category_id
      ORDER BY p.product_id
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
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
    
    console.log('📝 Creating category:', name.trim());
    
    // SIMPLE INSERT without RETURNING clause
    await executeQuery(
      `INSERT INTO category (name) VALUES (:1)`,
      [name.trim()]
    );
    
    // Get the newly created category ID
    const getCategoryQuery = `
      SELECT category_id 
      FROM category 
      WHERE name = :1 
      AND ROWNUM = 1 
      ORDER BY category_id DESC
    `;
    
    const categoryResult = await executeQuery(getCategoryQuery, [name.trim()]);
    
    if (categoryResult.rows.length === 0) {
      // Fallback: get the maximum category_id
      const maxIdResult = await executeQuery(
        'SELECT MAX(category_id) as max_id FROM category'
      );
      
      const categoryId = maxIdResult.rows[0]?.MAX_ID;
      
      return NextResponse.json(
        { 
          success: true, 
          message: 'Category created successfully',
          category_id: categoryId 
        },
        { status: 201 }
      );
    }
    
    const categoryId = categoryResult.rows[0].CATEGORY_ID;
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Category created successfully',
        category_id: categoryId 
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('❌ Error creating category:', error.message);
    
    // Handle duplicate category name
    if (error.message.includes('unique constraint') || 
        error.message.includes('ORA-00001') ||
        error.message.includes('ORA-01400')) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      );
    }
    
    // Handle table doesn't exist
    if (error.message.includes('ORA-00942')) {
      return NextResponse.json(
        { error: 'Category table does not exist. Please run the SQL script first.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create category. Please try again.' },
      { status: 500 }
    );
  }
}