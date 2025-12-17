import path from "path";
import fs from "fs";
import archiver from "archiver";

const REPORTS_DIR = path.resolve(__dirname, "../../storage/reports");

export class ReportService {
  /**
   * Возвращает список всех .xlsx отчётов
   */
  static getAllReports(): string[] {
    if (!fs.existsSync(REPORTS_DIR)) {
      return [];
    }

    return fs.readdirSync(REPORTS_DIR).filter((file) => file.endsWith(".xlsx"));
  }

  /**
   * Возвращает абсолютный путь к конкретному отчёту
   * + защита от ../
   */
  static getReportPath(filename: string): string {
    if (!filename.endsWith(".xlsx")) {
      throw new Error("Invalid report format");
    }

    const safeFilename = path.basename(filename);
    const filePath = path.join(REPORTS_DIR, safeFilename);

    if (!fs.existsSync(filePath)) {
      throw new Error("Report not found");
    }

    return filePath;
  }

  /**
   * Создаёт ZIP архив со всеми отчётами и пишет его в stream
   */
  static async streamAllReportsAsZip(res: any) {
    const reports = this.getAllReports();

    if (reports.length === 0) {
      throw new Error("No reports available");
    }

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="reports.zip"');

    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    archive.on("error", (err) => {
      throw err;
    });

    archive.pipe(res);

    for (const report of reports) {
      const filePath = path.join(REPORTS_DIR, report);
      archive.file(filePath, { name: report });
    }

    await archive.finalize();
  }
}
