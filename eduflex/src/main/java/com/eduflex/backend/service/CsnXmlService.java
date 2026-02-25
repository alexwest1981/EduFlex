package com.eduflex.backend.service;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.CourseResult;
import com.eduflex.backend.model.SystemSetting;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.CourseResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

/**
 * Genererar CSN XML-rapportfiler för utskick till CSN (Centrala studiestödsnämnden).
 * Stöder utbildningstyperna Komvux, Yrkeshögskola (YH) och Högskola.
 *
 * CSN processar inkomna XML-filer som batch-körning varje vardagskväll efter 17:00.
 * Filen kan antingen laddas upp manuellt i CSN:s portal "Mina tjänster"
 * eller skickas system-till-system med säkerhetscertifikat.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CsnXmlService {

    private final CourseRepository courseRepository;
    private final CourseResultRepository courseResultRepository;
    private final SystemSettingService systemSettingService;
    private final GdprAuditService gdprAuditService;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * Genererar en CSN XML-fil för de angivna kurserna.
     *
     * @param courseIds        kurser att inkludera
     * @param educationType    KOMVUX, YH eller HOGSKOLA
     * @param niva             GY (gymnasial) eller GR (grundläggande) — endast Komvux
     * @param studieomfattning 25/50/75/100 procent studietakt — endast Komvux
     * @return XML som byte-array (UTF-8)
     */
    public byte[] generateXml(List<Long> courseIds, String educationType,
                               String niva, Integer studieomfattning) throws Exception {

        // Läs inställningar
        String schoolCode        = getSettingValue("csn.school.code", "");
        String municipalityCode  = getSettingValue("csn.municipality.code", "");
        String resolvedType      = educationType != null
                ? educationType.toUpperCase()
                : getSettingValue("csn.default.education.type", "KOMVUX").toUpperCase();
        int resolvedScope        = studieomfattning != null
                ? studieomfattning
                : parseIntSetting("csn.default.study.scope", 100);
        String resolvedNiva      = niva != null ? niva.toUpperCase() : "GY";

        // Bygg DOM-träd. Vi genererar XML (inte parsar extern input) så standard factory räcker.
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        DocumentBuilder db = dbf.newDocumentBuilder();
        Document doc = db.newDocument();

        Element root = doc.createElement("CSNRapport");
        doc.appendChild(root);

        addElement(doc, root, "Skolkod", schoolCode);
        addElement(doc, root, "RapportDatum", LocalDate.now().format(DATE_FMT));
        addElement(doc, root, "Utbildningstyp", resolvedType);

        int totalStudents = 0;
        int skippedNoSsn  = 0;

        for (Long courseId : courseIds) {
            Optional<Course> courseOpt = courseRepository.findById(courseId);
            if (courseOpt.isEmpty()) {
                log.warn("Kurs {} hittades inte vid CSN XML-export – hoppas över", courseId);
                continue;
            }
            Course course = courseOpt.get();

            for (User student : course.getStudents()) {
                if (student.getSsn() == null || student.getSsn().isBlank()) {
                    log.warn("Elev {} saknar personnummer – hoppas över i CSN XML", student.getId());
                    skippedNoSsn++;
                    continue;
                }

                Element studerande = doc.createElement("Studerande");
                root.appendChild(studerande);

                addElement(doc, studerande, "Personnummer", student.getSsn());

                // Studieperiod: hämta från kursens start- och slutdatum
                Element period = doc.createElement("Studieperiod");
                studerande.appendChild(period);
                addElement(doc, period, "Startdatum", course.getStartDate() != null ? course.getStartDate() : "");
                addElement(doc, period, "Slutdatum",  course.getEndDate()   != null ? course.getEndDate()   : "");

                // Utbildningstyp-specifika fält
                switch (resolvedType) {
                    case "KOMVUX" -> {
                        addElement(doc, studerande, "KommunKod", municipalityCode);
                        String kurskod = course.getCourseCode();
                        if (kurskod == null && course.getSkolverketCourse() != null) {
                            kurskod = course.getSkolverketCourse().getCourseCode();
                        }
                        addElement(doc, studerande, "Kurskod",          kurskod != null ? kurskod : "");
                        addElement(doc, studerande, "DelAvKurs",         "1:1");
                        addElement(doc, studerande, "Niva",              resolvedNiva);
                        addElement(doc, studerande, "Studieomfattning",  String.valueOf(resolvedScope));
                    }
                    case "YH" -> {
                        int points = resolvePoints(course);
                        addElement(doc, studerande, "YHPoang", points + ".0");
                    }
                    case "HOGSKOLA" -> {
                        int points = resolvePoints(course);
                        addElement(doc, studerande, "Hogskolepoang", points + ".0");
                    }
                    default -> log.warn("Okänd utbildningstyp: {}", resolvedType);
                }

                // Kursresultat – lägg bara till om eleven inte är PENDING
                Optional<CourseResult> resultOpt = courseResultRepository
                        .findByCourseIdAndStudentId(course.getId(), student.getId());

                if (resultOpt.isPresent() && resultOpt.get().getStatus() != CourseResult.Status.PENDING) {
                    CourseResult result = resultOpt.get();
                    Element resultat = doc.createElement("Resultat");
                    studerande.appendChild(resultat);

                    switch (resolvedType) {
                        case "KOMVUX" -> {
                            String grade = result.getGrade() != null ? result.getGrade() : "F";
                            addElement(doc, resultat, "Betyg", grade);
                        }
                        case "YH" ->
                            addElement(doc, resultat, "Uppnadde",
                                    result.getStatus() == CourseResult.Status.PASSED ? "J" : "N");
                        case "HOGSKOLA" -> {
                            int achieved = 0;
                            if (result.getStatus() == CourseResult.Status.PASSED) {
                                achieved = resolvePoints(course);
                            }
                            addElement(doc, resultat, "AvklaradePoang", achieved + ".0");
                        }
                    }

                    if (result.getGradedAt() != null) {
                        addElement(doc, resultat, "Resultatdatum",
                                result.getGradedAt().toLocalDate().format(DATE_FMT));
                    }
                }

                totalStudents++;
            }
        }

        // GDPR-loggning av bulk-export med personuppgifter
        gdprAuditService.logBulkExport("CSN_XML_Export",
                String.format("Typ: %s, Kurser: %d, Elever: %d, Utan personnr: %d",
                        resolvedType, courseIds.size(), totalStudents, skippedNoSsn));

        log.info("CSN XML genererad: typ={}, kurser={}, elever={}, hoppade_över={}",
                resolvedType, courseIds.size(), totalStudents, skippedNoSsn);

        // Serialisera till UTF-8 bytes
        TransformerFactory tf = TransformerFactory.newInstance();
        tf.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
        Transformer transformer = tf.newTransformer();
        transformer.setOutputProperty(OutputKeys.ENCODING,   "UTF-8");
        transformer.setOutputProperty(OutputKeys.INDENT,     "yes");
        transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "2");
        transformer.setOutputProperty(OutputKeys.STANDALONE, "yes");

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        transformer.transform(new DOMSource(doc), new StreamResult(out));
        return out.toByteArray();
    }

    // --- Hjälpmetoder ---

    private int resolvePoints(Course course) {
        if (course.getSkolverketCourse() != null && course.getSkolverketCourse().getPoints() != null) {
            return course.getSkolverketCourse().getPoints();
        }
        return 0;
    }

    private String getSettingValue(String key, String defaultValue) {
        SystemSetting setting = systemSettingService.getSetting(key);
        return (setting != null && setting.getSettingValue() != null && !setting.getSettingValue().isBlank())
                ? setting.getSettingValue()
                : defaultValue;
    }

    private int parseIntSetting(String key, int defaultValue) {
        try {
            return Integer.parseInt(getSettingValue(key, String.valueOf(defaultValue)));
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    private void addElement(Document doc, Element parent, String tagName, String value) {
        Element element = doc.createElement(tagName);
        element.setTextContent(value != null ? value : "");
        parent.appendChild(element);
    }
}
