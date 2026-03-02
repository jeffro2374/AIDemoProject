Feature: Hotel Search
  As a traveler
  I want to search for hotels by location and dates
  So that I can find available accommodations

  Scenario: Search with default dates
    Given I am on the homepage
    Then the check-in date should be today
    And the check-out date should be tomorrow

  Scenario: Search hotels in Miami
    Given I am on the homepage
    When I select "Miami, FL" from the location dropdown
    And I click the search button
    Then I should see "Seaside Resort"
    And I should not see "Grand Plaza Hotel"

  Scenario: Search hotels in Denver
    Given I am on the homepage
    When I select "Denver, CO" from the location dropdown
    And I click the search button
    Then I should see "Mountain Lodge"
