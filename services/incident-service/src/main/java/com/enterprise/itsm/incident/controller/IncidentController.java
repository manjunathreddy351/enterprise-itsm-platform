package com.enterprise.itsm.incident.controller;

import com.enterprise.itsm.incident.entity.Incident;
import com.enterprise.itsm.incident.repository.IncidentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@CrossOrigin(origins = "*")
public class IncidentController {

    private final IncidentRepository repository;

    public IncidentController(IncidentRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Incident createIncident(@RequestBody Incident incident) {

        if (incident.getTitle() == null || incident.getTitle().isBlank()
                || incident.getDescription() == null
                || incident.getDescription().isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Title and description are required"
            );
        }

        List<String> severities =
            List.of("LOW", "MEDIUM", "HIGH", "CRITICAL");

        if (incident.getSeverity() == null ||
                !severities.contains(incident.getSeverity().toUpperCase())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Invalid incident severity"
            );
        }

        incident.setSeverity(incident.getSeverity().toUpperCase());
        incident.setStatus("OPEN");

        return repository.save(incident);
    }

    @GetMapping
    public List<Incident> getAllIncidents() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Incident getIncidentById(@PathVariable Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Incident not found"
            ));
    }

    @PatchMapping("/{id}/status")
    public Incident updateIncidentStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        List<String> allowedStatuses =
            List.of("OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED");

        if (!allowedStatuses.contains(status.toUpperCase())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Invalid incident status"
            );
        }

        Incident incident = getIncidentById(id);
        incident.setStatus(status.toUpperCase());

        return repository.save(incident);
    }

    @PatchMapping("/{id}/assign")
    public Incident assignIncident(
            @PathVariable Long id,
            @RequestParam String team) {

        if (team == null || team.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Team is required"
            );
        }

        Incident incident = getIncidentById(id);
        incident.setAssignedTeam(team.trim());

        return repository.save(incident);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteIncident(@PathVariable Long id) {
        repository.delete(getIncidentById(id));
    }
}
