import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import formidable from "formidable";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import pdfParse from "pdf-parse";
import Tesseract from "tesseract.js";

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
    maxFileSize: 10 * 1024 * 1024, // 10 MB max
  });

  form.parse(req, async (err:any, _fields:any, files:any) => {
    if (err || !files.file) {
      console.error("❌ Formidable error:", err);
      return res.status(500).json({ error: "Form parsing failed" });
    }

    const uploadedFile = Array.isArray(files.file)
      ? files.file[0]
      : files.file;

    const filePath = uploadedFile.filepath;
    const mimetype = uploadedFile.mimetype || "";

    // Debug logs for Vercel
    console.log("📎 MIME:", mimetype);
    console.log("📎 Path:", filePath);

    if (!mimetype.startsWith("image/") && mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    try {
      // ✅ Use "auto" to let Cloudinary decide type (prevents image failures)
      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: "auto",
      });

      let extractedText = "";

      if (mimetype === "application/pdf") {
        const buffer = fs.readFileSync(filePath);
        const data = await pdfParse(buffer);
        extractedText = data.text;
      } else if (mimetype.startsWith("image/")) {
        const {
          data: { text },
        } = await Tesseract.recognize(filePath, "eng");
        extractedText = text;
      }

      return res.status(200).json({
        secure_url: result.secure_url,
        extracted_text: extractedText,
      });
    } catch (uploadErr) {
      console.error("❌ Upload or parsing error:", uploadErr);
      return res.status(500).json({ error: "Cloudinary upload failed" });
    } finally {
      // Clean up temp file
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn("⚠️ Failed to delete temp file:", e);
      }
    }
  });
});

export default router.handler();
