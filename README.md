# ML 101: Bridging Software Engineering and Data Science

An interactive, 3D-enhanced presentation platform designed to demystify Machine Learning concepts for software engineers. Built with **React (Preact)**, **Vite**, and **Three.js**.

![ML 101](public/logo.webp)

## 🚀 Overview

This project is a custom-built presentation tool that moves beyond static slides. It uses interactive 3D visualizations to explain complex ML topics intuitively.

**Key Features:**
*   **Interactive 3D Scenes:** Visualize abstract math concepts like _Linear Regression_, _Gradient Descent_, and _Neural Networks_ using dynamic Three.js models.
*   **"Hello World" of ML:** A dedicated module for understanding Linear Regression deep dive.
*   **Modern Tech Stack:** Fast, responsive, and lightweight using Vite and Preact.
*   **Keyboard Navigation:** seamless presentation controls.

## 📚 Topics Covered

1.  **Introduction**: From explicit rules (Traditional Programming) to learned patterns (Machine Learning).
2.  **Linear Regression Deep Dive**:
    *   The "Hello World" of ML.
    *   Visualizing `y = wx + b`.
    *   Understanding the Cost Function and Gradient Descent.
3.  **Neural Networks**: (In Progress) Understanding neurons, layers, and backpropagation.
4.  **Generative AI**: (In Progress) VAEs, GANs, and Transformers.

## 🛠️ Installation & Running

Ensure you have [Node.js](https://nodejs.org/) installed.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/henrycamposeco/ml-101.git
    cd ml-101
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```

4.  **Open in Browser:**
    Navigate to `http://localhost:5173` (or the URL shown in your terminal).

## 🎮 Controls

*   **Next Slide:** `Right Arrow` (→) or Click "Next Slide"
*   **Previous Slide:** `Left Arrow` (←) or Click "Previous"
*   **Back to Menu:** `Escape` or Click "Back to Topics"
*   **Interactive Scenes:** Use your mouse to rotate and zoom certain 3D visualizations (e.g., Gradient Descent landscape).

## 🏗️ Built With

*   [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
*   [Preact](https://preactjs.com/) - Fast 3kb React alternative
*   [Three.js](https://threejs.org/) - JavaScript 3D Library
*   [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript

## 📄 License

MIT
