package com.enterprise.itsm.notification.controller;

import com.enterprise.itsm.notification.entity.Notification;
import com.enterprise.itsm.notification.service.NotificationService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Notification create(@RequestBody Notification notification) {

        if (notification.getRecipient() == null
                || notification.getRecipient().isBlank()
                || notification.getSubject() == null
                || notification.getSubject().isBlank()
                || notification.getMessage() == null
                || notification.getMessage().isBlank()) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Recipient, subject and message are required"
            );
        }

        return service.create(notification);
    }

    @GetMapping
    public List<Notification> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Notification getById(@PathVariable Long id) {
        Notification notification = service.findById(id);

        if (notification == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Notification not found"
            );
        }

        return notification;
    }

    @PatchMapping("/{id}/sent")
    public Notification markAsSent(@PathVariable Long id) {
        if (!service.markAsSent(id)) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Notification not found"
            );
        }

        return service.findById(id);
    }
}
