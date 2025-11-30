import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    // Get token from JWT
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.email) {
      return NextResponse.json(
        { phoneVerified: false, authenticated: false },
        { status: 401 }
      );
    }

    // Connect to database and fetch user data
    await connectDB();
    const user = await User.findOne({ email: token.email });

    if (!user) {
      return NextResponse.json(
        { phoneVerified: false, authenticated: false },
        { status: 404 }
      );
    }

    // Return phone verification status
    return NextResponse.json({
      authenticated: true,
      phoneVerified: user.phoneVerified || false,
      phone: user.phone,
      countryCode: user.countryCode,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        credits: user.credits,
      },
    });
  } catch (error) {
    console.error('Error checking phone verification:', error);
    return NextResponse.json(
      { error: 'Internal server error', phoneVerified: false },
      { status: 500 }
    );
  }
}
