package com.enterprise.itsm.ticket.controller;

import com.enterprise.itsm.ticket.entity.Ticket;
import com.enterprise.itsm.ticket.repository.TicketRepository;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketRepository repository;

    public TicketController(TicketRepository repository) {
        this.repository = repository;
    }

    // Create a ticket
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Ticket createTicket(@RequestBody Ticket ticket) {

        if (ticket.getTitle() == null || ticket.getTitle().isBlank()
                || ticket.getDescription() == null
                || ticket.getDescription().isBlank()
                || ticket.getRequesterEmail() == null
                || ticket.getRequesterEmail().isBlank()) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Title, description and requester email are required"
            );
        }

        ticket.setRequesterEmail(
            ticket.getRequesterEmail().trim().toLowerCase()
        );

        if (ticket.getPriority() == null ||
                !List.of("LOW", "MEDIUM", "HIGH", "CRITICAL")
                    .contains(ticket.getPriority().toUpperCase())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Invalid ticket priority"
            );
        }

        ticket.setPriority(ticket.getPriority().toUpperCase());
        ticket.setStatus("OPEN");

        return repository.save(ticket);
    }

    // Get all tickets
    @GetMapping
    public List<Ticket> getAllTickets() {
        return repository.findAll();
    }

    // Get ticket by ID
    @GetMapping("/{id}")
    public Ticket getTicketById(@PathVariable Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Ticket not found"
            ));
    }

    // Update ticket status
    @PatchMapping("/{id}/status")
    public Ticket updateTicketStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        Ticket ticket = getTicketById(id);

        List<String> allowedStatuses =
            List.of("OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED");

        if (!allowedStatuses.contains(status.toUpperCase())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Invalid ticket status"
            );
        }

        ticket.setStatus(status.toUpperCase());

        return repository.save(ticket);
    }

    // Assign ticket to a team
    @PatchMapping("/{id}/assign")
    public Ticket assignTicket(
            @PathVariable Long id,
            @RequestParam String team) {

        if (team == null || team.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Team is required"
            );
        }

        Ticket ticket = getTicketById(id);
        ticket.setAssignedTeam(team.trim());

        return repository.save(ticket);
    }

    // Delete ticket
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTicket(@PathVariable Long id) {
        repository.delete(getTicketById(id));
    }
}
