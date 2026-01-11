package com.eduflex.backend.service;

import com.eduflex.backend.model.Invoice;
import com.eduflex.backend.repository.InvoiceRepository;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RevenueExportService {

    private final InvoiceRepository invoiceRepository;

    public RevenueExportService(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    public ByteArrayInputStream generateInvoiceCsv(LocalDate startDate, LocalDate endDate) {
        // Fetch all invoices (in a real scenario, we would filter by date in the DB
        // query)
        // For now, let's just fetch all and filter in memory or just dump all if dates
        // are null
        List<Invoice> invoices = invoiceRepository.findAll();

        if (startDate != null && endDate != null) {
            invoices = invoices.stream()
                    .filter(inv -> {
                        LocalDate date = inv.getIssueDate();
                        return (date.isEqual(startDate) || date.isAfter(startDate)) &&
                                (date.isEqual(endDate) || date.isBefore(endDate));
                    })
                    .collect(Collectors.toList());
        }

        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
                PrintWriter writer = new PrintWriter(out)) {

            // CSV Header
            writer.println(
                    "Invoice ID,Invoice Number,User,Amount,Currency,Status,Issue Date,Due Date,Paid Date,Plan,Payment ID");

            // CSV Data
            for (Invoice invoice : invoices) {
                writer.printf("%d,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s%n",
                        invoice.getId(),
                        escapeSpecialCharacters(invoice.getInvoiceNumber()),
                        escapeSpecialCharacters(invoice.getUser().getFullName()),
                        invoice.getAmount(),
                        invoice.getCurrency(),
                        invoice.getStatus(),
                        invoice.getIssueDate(),
                        invoice.getDueDate(),
                        invoice.getPaidDate() != null ? invoice.getPaidDate() : "",
                        invoice.getSubscriptionPlan() != null
                                ? escapeSpecialCharacters(invoice.getSubscriptionPlan().getName())
                                : "N/A",
                        invoice.getPayment() != null ? invoice.getPayment().getId() : "");
            }

            writer.flush();
            return new ByteArrayInputStream(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("Failed to import data to CSV file: " + e.getMessage());
        }
    }

    private String escapeSpecialCharacters(String data) {
        if (data == null) {
            return "";
        }
        String escapedData = data.replaceAll("\\R", " ");
        if (data.contains(",") || data.contains("\"") || data.contains("'")) {
            data = data.replace("\"", "\"\"");
            escapedData = "\"" + data + "\"";
        }
        return escapedData;
    }
}
