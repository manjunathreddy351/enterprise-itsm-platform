package com.enterprise.itsm.incident.repository;

import com.enterprise.itsm.incident.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidentRepository extends JpaRepository<Incident, Long> {
}
