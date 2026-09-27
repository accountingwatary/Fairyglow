import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { classifyFile, MAX_DIRECT_BYTES, UPLOAD_TYPES } from "@/lib/media";

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!(await isAdmin())) throw new Error("Sign in to upload.");
        if (!pathname.startsWith("products/") || !classifyFile("", pathname)) {
          throw new Error("Use a photo or video file.");
        }
        return {
          allowedContentTypes: UPLOAD_TYPES,
          maximumSizeInBytes: MAX_DIRECT_BYTES,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 400 });
  }
}
