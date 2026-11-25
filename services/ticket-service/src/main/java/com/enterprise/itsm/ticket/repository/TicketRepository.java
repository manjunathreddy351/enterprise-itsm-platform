package com.enterprise.itsm.ticket.repository;

import com.enterprise.itsm.ticket.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
}
