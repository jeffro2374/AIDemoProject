Feature: Hotel Browsing
  As a traveler
  I want to browse available hotels
  So that I can find a place to stay

  Scenario: View all hotels on homepage
    Given I am on the homepage
    Then I should see the search form
    And I should see 3 hotel cards

  Scenario: View hotel details
    Given I am on the homepage
    When I click "View Rooms" on "Grand Plaza Hotel"
    Then I should see the hotel name "Grand Plaza Hotel"
    And I should see available rooms

  Scenario: Filter hotels by location
    Given I am on the homepage
    When I select "New York, NY" from the location dropdown
    And I click the search button
    Then I should see 1 hotel cards
    And I should see "Grand Plaza Hotel"
