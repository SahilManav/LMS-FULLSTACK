import { Certificate } from "../models/Certificate.js";
import { CourseProgress } from "../models/CourseProgress.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

/* ===============================
   GENERATE CERTIFICATE
=============================== */
export const generateCertificate = async (req, res) => {
  try {
    const userId = String(req.auth?.userId);
    const { courseId } = req.params;

    const progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress || !progress.completed) {
      return res.status(400).json({
        success: false,
        message: "Course not completed yet",
      });
    }

    let certificate = await Certificate.findOne({ userId, courseId });

    if (!certificate) {
      const certificateId =
        "CERT-" + crypto.randomBytes(4).toString("hex").toUpperCase();

      certificate = await Certificate.create({
        certificateId,
        userId,
        courseId,
      });
    }

    // Fetch course + user
    const course = await Course.findById(courseId).lean();
    const user = await User.findById(userId).lean();

    // Create PDF
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 50,
    });

    const fileName = `Certificate-${certificate.certificateId}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${fileName}`
    );

    doc.pipe(res);

    // Background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#f8fafc");

    doc.fillColor("#000");

    doc
      .fontSize(30)
      .text("Certificate of Completion", {
        align: "center",
      });

    doc.moveDown(2);

    doc
      .fontSize(18)
      .text("This certifies that", { align: "center" });

    doc.moveDown();

    doc
      .fontSize(26)
      .fillColor("#2563eb")
      .text(user.name, { align: "center" });

    doc.moveDown();

    doc
      .fontSize(18)
      .fillColor("#000")
      .text("has successfully completed the course", {
        align: "center",
      });

    doc.moveDown();

    doc
      .fontSize(22)
      .fillColor("#16a34a")
      .text(course.courseTitle, { align: "center" });

    doc.moveDown(2);

    doc
      .fontSize(14)
      .fillColor("#000")
      .text(
        `Issued on: ${new Date(
          certificate.issuedAt
        ).toLocaleDateString("en-IN")}`,
        { align: "center" }
      );

    doc.moveDown();

    doc
      .fontSize(12)
      .text(`Certificate ID: ${certificate.certificateId}`, {
        align: "center",
      });

    // QR Code
    const verifyUrl = `${process.env.CLIENT_URL}/verify/${certificate.certificateId}`;
    const qrImage = await QRCode.toDataURL(verifyUrl);

    const base64Data = qrImage.replace(
      /^data:image\/png;base64,/,
      ""
    );
    const qrBuffer = Buffer.from(base64Data, "base64");

    doc.image(qrBuffer, doc.page.width - 150, doc.page.height - 150, {
      width: 100,
    });

    doc.end();
  } catch (error) {
    console.error("Certificate generation error:", error);
    res.status(500).json({
      success: false,
      message: "Certificate generation failed",
    });
  }
};

/* ===============================
   VERIFY CERTIFICATE
=============================== */
export const verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId })
      .populate("courseId", "courseTitle")
      .lean();

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    const user = await User.findById(certificate.userId)
      .select("name")
      .lean();

    res.json({
      success: true,
      data: {
        studentName: user?.name,
        courseTitle: certificate.courseId.courseTitle,
        issuedAt: certificate.issuedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};
