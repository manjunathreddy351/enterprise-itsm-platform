package com.enterprise.itsm.reporting.dto;

public record DashboardResponse(
    int totalEmployees,
    int totalTickets,
    int openTickets,
    int resolvedTickets,
    int totalIncidents,
    int openIncidents,
    int criticalIncidents,
    int totalAssets,
    int availableAssets,
    int assignedAssets
) {}
