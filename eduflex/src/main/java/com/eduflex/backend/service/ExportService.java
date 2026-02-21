package com.eduflex.backend.service;

import com.eduflex.backend.dto.RoiDataPoint;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.opencsv.CSVWriter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.util.List;

@Service
public class ExportService {

    private final ObjectMapper objectMapper;
    private final XmlMapper xmlMapper;

    public ExportService(ObjectMapper objectMapper, XmlMapper xmlMapper) {
        this.objectMapper = objectMapper;
        this.xmlMapper = xmlMapper;
    }

    public byte[] exportToJson(List<RoiDataPoint> data) throws Exception {
        return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(data);
    }

    public byte[] exportToXml(List<RoiDataPoint> data) throws Exception {
        return xmlMapper.writerWithDefaultPrettyPrinter().withRootName("RoiReport").writeValueAsBytes(data);
    }

    public byte[] exportToCsv(List<RoiDataPoint> data) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(out))) {
            String[] header = { "Student", "Email", "Mastery %", "Metric", "Value", "Date" };
            writer.writeNext(header);

            for (RoiDataPoint point : data) {
                writer.writeNext(new String[] {
                        point.getStudentName(),
                        point.getStudentEmail(),
                        String.valueOf(point.getMasteryScore()),
                        point.getMetricName(),
                        String.valueOf(point.getMetricValue()),
                        point.getDateRecorded()
                });
            }
        }
        return out.toByteArray();
    }

    public byte[] exportToExcel(List<RoiDataPoint> data) throws Exception {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("ROI Report");

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Create Header
            Row headerRow = sheet.createRow(0);
            String[] columns = { "Student", "Email", "Mastery %", "Metric", "Value", "Date" };
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Create Data Rows
            int rowIdx = 1;
            for (RoiDataPoint point : data) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(point.getStudentName());
                row.createCell(1).setCellValue(point.getStudentEmail());
                row.createCell(2).setCellValue(point.getMasteryScore());
                row.createCell(3).setCellValue(point.getMetricName());
                row.createCell(4).setCellValue(point.getMetricValue());
                row.createCell(5).setCellValue(point.getDateRecorded());
            }

            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }
}
