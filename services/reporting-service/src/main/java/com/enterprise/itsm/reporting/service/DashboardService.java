package com.enterprise.itsm.reporting.service;

import com.enterprise.itsm.reporting.dto.DashboardResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final RestClient restClient = RestClient.create();

    @Value("${services.employee.url}")
    private String employeeUrl;

    @Value("${services.ticket.url}")
    private String ticketUrl;

    @Value("${services.incident.url}")
    private String incidentUrl;

    @Value("${services.asset.url}")
    private String assetUrl;

    private List<Map<String, Object>> fetchRecords(String url) {
        List<Map<String, Object>> records = restClient.get()
            .uri(url)
            .retrieve()
            .body(new ParameterizedTypeReference<>() {});

        return records == null ? List.of() : records;
    }

    private long countByValue(
            List<Map<String, Object>> records,
            String field,
            String expectedValue) {

        return records.stream()
            .filter(record -> expectedValue.equalsIgnoreCase(
                String.valueOf(record.get(field))))
            .count();
    }

    public DashboardResponse getDashboard() {

        List<Map<String, Object>> employees =
            fetchRecords(employeeUrl + "/api/employees");

        List<Map<String, Object>> tickets =
            fetchRecords(ticketUrl + "/api/tickets");

        List<Map<String, Object>> incidents =
            fetchRecords(incidentUrl + "/api/incidents");

        List<Map<String, Object>> assets =
            fetchRecords(assetUrl + "/api/assets");

        return new DashboardResponse(
            employees.size(),
            tickets.size(),
            (int) countByValue(tickets, "status", "OPEN"),
            (int) countByValue(tickets, "status", "RESOLVED"),
            incidents.size(),
            (int) countByValue(incidents, "status", "OPEN"),
            (int) countByValue(incidents, "severity", "CRITICAL"),
            assets.size(),
            (int) countByValue(assets, "status", "AVAILABLE"),
            (int) countByValue(assets, "status", "ASSIGNED")
        );
    }
}
