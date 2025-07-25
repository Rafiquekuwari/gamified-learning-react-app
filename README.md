# Edutech Gamified App (Phase 1 MVP)

This is a basic gamified learning web application built with React, demonstrating core features for Phase 1 of the roadmap. It includes user authentication, a diagnostic quiz for personalized placement, lessons, quizzes, and a simple points/leveling system.

**Note:** This is an MVP (Minimum Viable Product) and uses `localStorage` to simulate backend data storage and API calls for simplicity. In a real-world application, you would integrate with a proper backend (e.g., Node.js, Python Flask/Django, Firebase Firestore).

## Features

* User Registration and Login
* Diagnostic Quiz for initial level placement
* Sequential Lessons
* Interactive Quizzes
* Points and Leveling System
* Basic User Dashboard
* Responsive UI using Tailwind CSS

## Setup and Run Locally

Follow these steps to get the application running on your local machine:

1.  **Clone this repository (or create the files manually):**
    If you have the files provided in a single block, create a new directory `edutech-gamified-app` and then create the `public` and `src` subdirectories, along with `package.json` and `README.md`.

2.  **Navigate to the project directory:**
    ```bash
    cd edutech-gamified-app
    ```

3.  **Install Dependencies:**
    This project uses `react` and `react-dom`. You'll also need `react-scripts` for development.
    ```bash
    npm install
    # or
    yarn install
    ```

4.  **Start the Development Server:**
    ```bash
    npm start
    # or
    yarn start
    ```
    This will open the application in your browser, usually at `http://localhost:3000`.

## How to Use

1.  **Register:** Create a new user account.
2.  **Diagnostic Quiz:** After registration, you'll be directed to a short diagnostic quiz. Your performance here will determine your starting learning level.
3.  **Dashboard:** After the diagnostic, you'll land on the dashboard, showing your current level and points.
4.  **Continue Learning:** Click "Continue Learning" to access the next lesson or quiz in your current level.
5.  **Progress:** Complete quizzes to earn points and potentially level up.

## Technologies Used

* **React.js:** Frontend library for building user interfaces.
* **Tailwind CSS:** A utility-first CSS framework for rapid styling.
* **JavaScript (ES6+):** For application logic.
* **HTML5/CSS3:** Standard web technologies.

## Future Enhancements (Phase 2 & Beyond)

* Integration with a real backend (e.g., Firebase Firestore, custom API).
* More complex AI for adaptive learning paths and personalized content recommendations.
* Advanced gamification features (badges, leaderboards, virtual currency store).
* Multilingual content support beyond UI.
* Accessibility features for children with disabilities.
* Parent/Teacher dashboards for progress monitoring.