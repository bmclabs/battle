import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// IMPORTANT: This is a demonstration API only!
// In a real application, this would need to be:
// 1. Protected by admin authentication
// 2. Use a proper configuration management system
// 3. Handle environment variables differently

export async function POST(request: NextRequest) {
  try {
    // SECURITY WARNING: In a real app, you must authenticate this request!
    // This API is for demonstration purposes only.
    
    // Get the enableMaintenance flag from the request
    const data = await request.json();
    const { enableMaintenance } = data;
    
    if (typeof enableMaintenance !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request. enableMaintenance must be a boolean.' },
        { status: 400 }
      );
    }
    
    // In production, you'd use a proper environment variable management system
    // This is just for demo purposes and works only in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({
        success: false,
        message: 'This demo endpoint is only for development environments',
      }, { status: 403 });
    }
    
    try {
      // Get current environment variables
      const envPath = path.join(process.cwd(), '.env');
      
      // Check if file exists and is accessible
      if (!fs.existsSync(envPath)) {
        throw new Error('Environment file not found');
      }
      
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Update NEXT_PUBLIC_IS_MAINTENANCE flag
      const updatedContent = envContent.replace(
        /NEXT_PUBLIC_IS_MAINTENANCE=(true|false)/,
        `NEXT_PUBLIC_IS_MAINTENANCE=${String(enableMaintenance)}`
      );
      
      // Write updated content back
      fs.writeFileSync(envPath, updatedContent);
      
      // Return success response
      return NextResponse.json({
        success: true,
        maintenanceMode: enableMaintenance,
        message: `Maintenance mode ${enableMaintenance ? 'enabled' : 'disabled'}`,
      });
    } catch (fileError) {
      console.error('File operation error:', fileError);
      return NextResponse.json({
        error: 'Failed to update environment variables',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error toggling maintenance mode:', error);
    return NextResponse.json(
      { error: 'Failed to toggle maintenance mode' },
      { status: 500 }
    );
  }
}

// NOTE: In production, you would use a real admin interface and proper env var management
// This example is just to demonstrate the concept of toggling maintenance mode 