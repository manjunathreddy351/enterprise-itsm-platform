package com.enterprise.itsm.notification.service;

import com.enterprise.itsm.notification.entity.Notification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class NotificationService {

    private final List<Notification> notifications = new ArrayList<>();
    private final AtomicLong counter = new AtomicLong(1);

    public synchronized Notification create(Notification notification) {
        notification.setId(counter.getAndIncrement());
        notification.setStatus("PENDING");
        notifications.add(notification);
        return notification;
    }

    public synchronized List<Notification> findAll() {
        return new ArrayList<>(notifications);
    }

    public synchronized Notification findById(Long id) {
        return notifications.stream()
            .filter(n -> n.getId().equals(id))
            .findFirst()
            .orElse(null);
    }

    public synchronized boolean markAsSent(Long id) {
        Notification notification = findById(id);

        if (notification == null) {
            return false;
        }

        notification.setStatus("SENT");
        return true;
    }
}
