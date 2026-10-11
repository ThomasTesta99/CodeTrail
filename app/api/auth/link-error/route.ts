import { NextRequest, NextResponse } from "next/server";

export const GET = (request: NextRequest) => {
  return NextResponse.redirect(new URL("/settings?googleLink=error", request.url));
};