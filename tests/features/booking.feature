Feature: Room Booking
  As a traveler
  I want to book a hotel room
  So that I have accommodation for my trip

  Scenario: Complete a room booking
    Given I am on the homepage
    When I click "View Rooms" on "Grand Plaza Hotel"
    And I click "Book Now" on the first room
    Then I should see the booking form
    When I fill in the booking form with:
      | firstName | John          |
      | lastName  | Doe           |
      | email     | john@test.com |
    And I click "Confirm Booking"
    Then I should see the booking confirmation

  Scenario: View booking summary before confirming
    Given I am on the homepage
    When I click "View Rooms" on "Seaside Resort"
    And I click "Book Now" on the first room
    Then I should see the booking summary
    And I should see the total price

  Scenario: Book a room at Mountain Lodge
    Given I am on the homepage
    When I click "View Rooms" on "Mountain Lodge"
    And I click "Book Now" on the first room
    And I fill in the booking form with:
      | firstName | Jane           |
      | lastName  | Smith          |
      | email     | jane@test.com  |
    And I click "Confirm Booking"
    Then I should see the booking confirmation
