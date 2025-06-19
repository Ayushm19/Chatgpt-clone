import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import formidable from "formidable";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import pdfParse from "pdf-parse";

// Disable body parsing by Next.js to allow formidable to handle it
export const config = {
  api: {
    bodyParser: false,
  },
};

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post((req, res) => {
  const form = formidable({
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10 MB
  });

  form.parse(req, async (err: any, _fields: any, files: any) => {
    if (err || !files.file) {
      console.error("❌ Form parsing error:", err);
      return res.status(500).json({ error: "Form parsing failed" });
    }

    const uploadedFile = Array.isArray(files.file)
      ? files.file[0]
      : files.file;

    const filePath = uploadedFile.filepath;
    const mimetype = uploadedFile.mimetype || "";

    console.log("📎 MIME:", mimetype);
    console.log("📎 Path:", filePath);

    if (!mimetype.startsWith("image/") && mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    try {
      // Let Cloudinary handle both images and PDFs
      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: "auto",
      });

      let extractedText = "";

      // ✅ Only extract text from PDF
      if (mimetype === "application/pdf") {
        const buffer = fs.readFileSync(filePath);
        const data = await pdfParse(buffer);
        extractedText = data.text;
      }

      return res.status(200).json({
        secure_url: result.secure_url,
        extracted_text: extractedText,
      });
    } catch (uploadErr) {
      console.error("❌ Upload or parsing error:", uploadErr);
      return res.status(500).json({ error: "Upload failed" });
    } finally {
      // Always delete temp file
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn("⚠️ Failed to delete temp file:", e);
      }
    }
  });
});

export default router.handler();
