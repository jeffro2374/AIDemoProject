Feature: Site Navigation
  As a user
  I want to navigate through the website
  So that I can access different features

  Scenario: Navigate to homepage via logo
    Given I am on the reservations page
    When I click the logo
    Then I should be on the homepage
    And I should see the search form

  Scenario: Navigate to hotels from header
    Given I am on the reservations page
    When I click "Hotels" in the header
    Then I should be on the homepage

  Scenario: Return home after booking confirmation
    Given I have completed a booking
    When I click "Back to Home"
    Then I should be on the homepage
    And I should see 3 hotel cards
