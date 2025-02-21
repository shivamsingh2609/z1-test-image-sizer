import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

// Define TypeScript interfaces
interface Dimension {
  width: number;
  height: number;
}

interface ResizeResult {
  dimension: string;
  data: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, dimensions }: { image: string; dimensions: Dimension[] } = body;

    // Validate input
    if (!image || !dimensions?.length) {
      return NextResponse.json(
        { error: "Missing image or dimensions" },
        { status: 400 }
      );
    }

    // Extract base64 data and convert to buffer
    const base64Data = image.split(",")[1];
    if (!base64Data) {
      return NextResponse.json(
        { error: "Invalid base64 image format" },
        { status: 400 }
      );
    }
    const imageBuffer = Buffer.from(base64Data, "base64");

    // Resize images in parallel
    const resizedImages: ResizeResult[] = await Promise.all(
      dimensions.map(async ({ width, height }) => {
        const resizedBuffer = await sharp(imageBuffer)
          .resize(width, height, {
            fit: "contain",
            background: { r: 255, g: 255, b: 255, alpha: 1 },
          })
          .toBuffer();

        return {
          dimension: `${width}x${height}`,
          data: `data:image/png;base64,${resizedBuffer.toString("base64")}`,
        };
      })
    );

    // Convert array to object with dimensions as keys
    const result = resizedImages.reduce<Record<string, string>>(
      (acc, { dimension, data }) => {
        acc[dimension] = data;
        return acc;
      },
      {}
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Image processing error:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}
