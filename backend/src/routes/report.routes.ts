import { Router } from "express";
import { ReportService } from "../services/report.service";

const router = Router();

/**
 * GET /api/reports
 * Список всех отчётов
 */
router.get("/", (req, res) => {
  try {
    const reports = ReportService.getAllReports();
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load reports" });
  }
});

/**
 * GET /api/reports/all
 * Скачать ВСЕ отчёты одним ZIP
 */
router.get("/all", async (req, res) => {
  try {
    await ReportService.streamAllReportsAsZip(res);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: "No reports available" });
  }
});

/**
 * GET /api/reports/:filename
 * Скачать конкретный отчёт
 */
router.get("/:filename", (req, res) => {
  try {
    const filePath = ReportService.getReportPath(req.params.filename);
    res.download(filePath);
  } catch (error) {
    res.status(404).json({ message: "Report not found" });
  }
});

export default router;
