
import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.Signature;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class LicenseManagerGUI extends JFrame {

    private final DefaultTableModel tableModel;
    private final List<Map<String, String>> history = new ArrayList<>();
    private static final String HISTORY_FILE = "license_history.json";

    public LicenseManagerGUI() {
        setTitle("EduFlex License Manager (Vendor Tool)");
        setSize(900, 600);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setLayout(new BorderLayout());

        // --- Toolbar ---
        JPanel toolbar = new JPanel(new FlowLayout(FlowLayout.LEFT));
        JButton btnGenerate = new JButton("Generate New License");
        toolbar.add(btnGenerate);
        add(toolbar, BorderLayout.NORTH);

        // --- Table ---
        String[] columns = { "Customer", "Email", "Tier", "Issued", "Expires", "Status" };
        tableModel = new DefaultTableModel(columns, 0);
        JTable table = new JTable(tableModel);
        add(new JScrollPane(table), BorderLayout.CENTER);

        // --- Footer ---
        JLabel lblStatus = new JLabel(" Ready. Keys located in current directory.");
        lblStatus.setBorder(BorderFactory.createEmptyBorder(5, 5, 5, 5));
        add(lblStatus, BorderLayout.SOUTH);

        // --- Actions ---
        btnGenerate.addActionListener(e -> showGenerateDialog());

        // --- Load Data ---
        loadHistory();
        refreshTable();
    }

    private void showGenerateDialog() {
        JDialog dlg = new JDialog(this, "New License", true);
        dlg.setLayout(new GridLayout(6, 2, 10, 10));
        dlg.setSize(400, 300);
        dlg.setLocationRelativeTo(this);

        JTextField txtCustomer = new JTextField();
        JTextField txtEmail = new JTextField();
        String[] tiers = { "BASIC", "PRO", "ENTERPRISE" };
        JComboBox<String> cmbTier = new JComboBox<>(tiers);
        JTextField txtDuration = new JTextField("365"); // Days

        dlg.add(new JLabel(" Customer Name:"));
        dlg.add(txtCustomer);
        dlg.add(new JLabel(" Contact Email:"));
        dlg.add(txtEmail);
        dlg.add(new JLabel(" License Tier:"));
        dlg.add(cmbTier);
        dlg.add(new JLabel(" Duration (Days):"));
        dlg.add(txtDuration);

        JButton btnSave = new JButton("Generate & Sign");
        btnSave.addActionListener(evt -> {
            try {
                String customer = txtCustomer.getText().trim();
                String email = txtEmail.getText().trim();
                String tier = (String) cmbTier.getSelectedItem();
                int days = Integer.parseInt(txtDuration.getText().trim());

                if (customer.isEmpty())
                    throw new Exception("Customer name required");

                generateLicense(customer, email, tier, days);
                dlg.dispose();
                // Message handled in generateLicense
                // JOptionPane.showMessageDialog(this, "License generated: " + customer +
                // ".lic");
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(dlg, "Error: " + ex.getMessage());
            }
        });

        dlg.add(new JLabel("")); // spacer
        dlg.add(btnSave);
        dlg.setVisible(true);
    }

    private void generateLicense(String customer, String email, String tier, int days) throws Exception {
        LocalDate now = LocalDate.now();
        LocalDate expiry = now.plusDays(days);

        // 1. Prepare Payload
        // Simple JSON manual construction to avoid dependency issues in this standalone
        // tool
        String payload = String.format("{\"customer\":\"%s\",\"tier\":\"%s\",\"validUntil\":\"%s\"}", customer, tier,
                expiry);

        // 2. Sign
        String finalLicense = signData(payload);

        // 3. Save .lic file with JFileChooser
        String defaultFilename = customer.replaceAll("[^a-zA-Z0-9]", "_") + ".lic";
        JFileChooser fileChooser = new JFileChooser();
        fileChooser.setDialogTitle("Spara licensfil");
        fileChooser.setSelectedFile(new File(defaultFilename));

        int userSelection = fileChooser.showSaveDialog(this);
        if (userSelection == JFileChooser.APPROVE_OPTION) {
            File fileToSave = fileChooser.getSelectedFile();
            // Ensure .lic extension logic could go here, but JFileChooser behaves
            // standardly
            Files.write(fileToSave.toPath(), finalLicense.getBytes());
            JOptionPane.showMessageDialog(this, "Licens sparad: " + fileToSave.getAbsolutePath());
        } else {
            return; // User cancelled
        }

        // 4. Update History
        Map<String, String> record = new HashMap<>();
        record.put("customer", customer);
        record.put("email", email);
        record.put("tier", tier);
        record.put("issued", now.toString());
        record.put("expiry", expiry.toString());

        history.add(record);
        saveHistory();
        refreshTable();
    }

    private String signData(String payload) throws Exception {
        File keyFile = new File("private.pem");
        if (!keyFile.exists()) {
            // Try fallback location
            keyFile = new File("tools/secure-license-gen/private.pem");
        }
        if (!keyFile.exists()) {
            throw new FileNotFoundException(
                    "Could not find private.pem in current directory or tools/secure-license-gen/");
        }

        byte[] keyBytes = Files.readAllBytes(keyFile.toPath());
        byte[] keyDecoded = Base64.getDecoder().decode(keyBytes);

        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyDecoded);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        PrivateKey privateKey = kf.generatePrivate(spec);

        Signature sign = Signature.getInstance("SHA256withRSA");
        sign.initSign(privateKey);
        sign.update(payload.getBytes("UTF-8"));

        String signature = Base64.getEncoder().encodeToString(sign.sign());

        // Final JSON with Signature
        String licenseJson = String.format("{\"payload\":\"%s\",\"signature\":\"%s\"}",
                Base64.getEncoder().encodeToString(payload.getBytes("UTF-8")),
                signature);

        return Base64.getEncoder().encodeToString(licenseJson.getBytes("UTF-8"));
    }

    private void loadHistory() {
        File f = new File(HISTORY_FILE);
        if (!f.exists())
            return;
        try (BufferedReader br = new BufferedReader(new FileReader(f))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null)
                sb.append(line);

            // Very naive JSON parsing to avoid libs
            String json = sb.toString();
            if (json.startsWith("[") && json.endsWith("]")) {
                if (json.length() <= 2)
                    return; // empty array
                String content = json.substring(1, json.length() - 1);
                // Split by }, { is risky but simple for this controlled tool
                String[] objects = content.split("},\\{");
                for (String obj : objects) {
                    obj = obj.replace("{", "").replace("}", "").replace("\"", "");
                    Map<String, String> map = new HashMap<>();
                    for (String field : obj.split(",")) {
                        String[] kv = field.split(":");
                        if (kv.length >= 2)
                            map.put(kv[0], kv[1]);
                    }
                    history.add(map);
                }
            }
        } catch (Exception e) {
            e.printStackTrace(); // Just log, don't crash
        }
    }

    private void saveHistory() {
        // Naive JSON serialization
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < history.size(); i++) {
            Map<String, String> r = history.get(i);
            sb.append(String.format(
                    "{\"customer\":\"%s\",\"email\":\"%s\",\"tier\":\"%s\",\"issued\":\"%s\",\"expiry\":\"%s\"}",
                    r.get("customer"), r.get("email"), r.get("tier"), r.get("issued"), r.get("expiry")));
            if (i < history.size() - 1)
                sb.append(",");
        }
        sb.append("]");
        try (FileWriter fw = new FileWriter(HISTORY_FILE)) {
            fw.write(sb.toString());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void refreshTable() {
        tableModel.setRowCount(0);
        for (Map<String, String> r : history) {
            String status = "ACTIVE";
            try {
                if (LocalDate.parse(r.get("expiry")).isBefore(LocalDate.now()))
                    status = "EXPIRED";
            } catch (Exception e) {
            }

            tableModel.addRow(new Object[] {
                    r.get("customer"), r.get("email"), r.get("tier"), r.get("issued"), r.get("expiry"), status
            });
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new LicenseManagerGUI().setVisible(true));
    }
}
