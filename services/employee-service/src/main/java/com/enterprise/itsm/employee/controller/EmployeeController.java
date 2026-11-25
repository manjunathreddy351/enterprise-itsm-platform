package com.enterprise.itsm.employee.controller;

import com.enterprise.itsm.employee.entity.Employee;
import com.enterprise.itsm.employee.repository.EmployeeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*")
public class EmployeeController {

    private final EmployeeRepository repository;

    public EmployeeController(EmployeeRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Employee createEmployee(@RequestBody Employee employee) {
        if (employee.getEmail() == null || employee.getEmail().isBlank()
                || employee.getFullName() == null || employee.getFullName().isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Full name and email are required");
        }

        employee.setEmail(employee.getEmail().trim().toLowerCase());

        if (repository.existsByEmail(employee.getEmail())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT, "Employee email already exists");
        }

        return repository.save(employee);
    }

    @GetMapping
    public List<Employee> getAllEmployees() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Employee getEmployeeById(@PathVariable Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Employee not found"));
    }

    @PutMapping("/{id}")
    public Employee updateEmployee(
            @PathVariable Long id,
            @RequestBody Employee updatedEmployee) {

        Employee employee = getEmployeeById(id);

        if (updatedEmployee.getFullName() != null) {
            employee.setFullName(updatedEmployee.getFullName());
        }

        if (updatedEmployee.getEmail() != null) {
            String email = updatedEmployee.getEmail().trim().toLowerCase();

            if (repository.existsByEmail(email)
                    && !email.equalsIgnoreCase(employee.getEmail())) {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Employee email already exists");
            }

            employee.setEmail(email);
        }

        if (updatedEmployee.getDepartment() != null) {
            employee.setDepartment(updatedEmployee.getDepartment());
        }

        if (updatedEmployee.getJobTitle() != null) {
            employee.setJobTitle(updatedEmployee.getJobTitle());
        }

        if (updatedEmployee.getPhone() != null) {
            employee.setPhone(updatedEmployee.getPhone());
        }

        return repository.save(employee);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEmployee(@PathVariable Long id) {
        Employee employee = getEmployeeById(id);
        repository.delete(employee);
    }
}
