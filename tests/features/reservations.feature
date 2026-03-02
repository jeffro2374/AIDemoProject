Feature: Reservation Management
  As a guest
  I want to view and manage my reservations
  So that I can track my bookings

  Scenario: View empty reservations page
    Given I am on the reservations page
    Then I should see the empty reservations message

  Scenario: View reservation after booking
    Given I have made a booking at "Grand Plaza Hotel"
    When I go to the reservations page
    Then I should see my reservation
    And the reservation status should be "confirmed"

  Scenario: Cancel a reservation
    Given I have made a booking at "Seaside Resort"
    When I go to the reservations page
    And I click "Cancel" on my reservation
    Then the reservation status should be "cancelled"

  Scenario: Navigate to reservations from header
    Given I am on the homepage
    When I click "My Reservations" in the header
    Then I should be on the reservations page
