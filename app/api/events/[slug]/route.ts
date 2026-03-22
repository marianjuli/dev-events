import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/lib/mongodb';
import Event, { IEvent } from '@/database/event.model';

// Define route params type for type safety
type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

/**
 * GET /api/events/[slug]
 * Fetches a single events by its slug
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Connect to database
    await connectDB();

    // Await and extract slug from params
    const { slug } = await params;

    // Validate slug parameter
    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      return NextResponse.json(
        { message: 'Invalid or missing slug parameter' },
        { status: 400 }
      );
    }

    // Sanitize slug: lowercase, spaces to hyphens (matches generateSlug in event.model)
    const sanitizedSlug = slug
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    // Query: exact slug match first
    let event = await Event.findOne({ slug: sanitizedSlug }).lean();
    // Fallback: slug with spaces (e.g. "Next Events") or find by title (e.g. "Cloud Next 2026")
    if (!event) {
      const slugRegex = new RegExp(`^${sanitizedSlug.replace(/-/g, "[-\\s]+")}$`, "i");
      event = await Event.findOne({ $or: [{ slug: { $regex: slugRegex } }, { slug: sanitizedSlug.replace(/-/g, " ") }] }).lean();
    }
    if (!event) {
      const titleRegex = new RegExp(`^${sanitizedSlug.replace(/-/g, "[-\\s]+")}$`, "i");
      event = await Event.findOne({ title: { $regex: titleRegex } }).lean();
    }

    if (!event) {
      return NextResponse.json(
        { message: `Event with slug '${sanitizedSlug}' not found` },
        { status: 404 }
      );
    }

    // Return successful response with events data
    return NextResponse.json(
      { message: 'Event fetched successfully', event },
      { status: 200 }
    );
  } catch (error) {
    // Log error for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching events by slug:', error);
    }

    // Handle specific error types
    if (error instanceof Error) {
      // Handle database connection errors
      if (error.message.includes('MONGODB_URI')) {
        return NextResponse.json(
          { message: 'Database configuration error' },
          { status: 500 }
        );
      }

      // Return generic error with error message
      return NextResponse.json(
        { message: 'Failed to fetch events', error: error.message },
        { status: 500 }
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}