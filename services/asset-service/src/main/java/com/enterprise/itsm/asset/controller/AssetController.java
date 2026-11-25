package com.enterprise.itsm.asset.controller;

import com.enterprise.itsm.asset.entity.Asset;
import com.enterprise.itsm.asset.repository.AssetRepository;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@CrossOrigin(origins = "*")
public class AssetController {

    private final AssetRepository repository;

    public AssetController(AssetRepository repository) {
        this.repository = repository;
    }

    // Create asset
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Asset createAsset(@RequestBody Asset asset) {

        if (asset.getAssetName() == null || asset.getAssetName().isBlank()
                || asset.getAssetTag() == null || asset.getAssetTag().isBlank()
                || asset.getCategory() == null || asset.getCategory().isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Asset name, asset tag and category are required"
            );
        }

        asset.setAssetTag(asset.getAssetTag().trim().toUpperCase());

        if (repository.existsByAssetTag(asset.getAssetTag())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT, "Asset tag already exists"
            );
        }

        asset.setStatus("AVAILABLE");
        asset.setAssignedTo(null);

        return repository.save(asset);
    }

    // Get all assets
    @GetMapping
    public List<Asset> getAllAssets() {
        return repository.findAll();
    }

    // Get asset by ID
    @GetMapping("/{id}")
    public Asset getAssetById(@PathVariable Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Asset not found"
            ));
    }

    // Assign asset to employee
    @PatchMapping("/{id}/assign")
    public Asset assignAsset(
            @PathVariable Long id,
            @RequestParam String employeeEmail) {

        if (employeeEmail == null || employeeEmail.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Employee email is required"
            );
        }

        Asset asset = getAssetById(id);

        if (!"AVAILABLE".equals(asset.getStatus())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT, "Only available assets can be assigned"
            );
        }

        asset.setAssignedTo(employeeEmail.trim().toLowerCase());
        asset.setStatus("ASSIGNED");

        return repository.save(asset);
    }

    // Update asset status
    @PatchMapping("/{id}/status")
    public Asset updateAssetStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        List<String> allowedStatuses =
            List.of("AVAILABLE", "ASSIGNED", "MAINTENANCE", "RETIRED");

        String newStatus = status.toUpperCase();

        if (!allowedStatuses.contains(newStatus)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Invalid asset status"
            );
        }

        Asset asset = getAssetById(id);
        asset.setStatus(newStatus);

        if ("AVAILABLE".equals(newStatus) || "RETIRED".equals(newStatus)) {
            asset.setAssignedTo(null);
        }

        return repository.save(asset);
    }

    // Delete asset
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAsset(@PathVariable Long id) {
        repository.delete(getAssetById(id));
    }
}
