# Nexus-Shell Basic Example

This is a sample application demonstrating how to use the `nexus-shell` library.

## 🚀 How to Run

1.  **Build the Library:**
    Ensure you have built the parent library first.
    ```bash
    cd ../..
    npm run build
    ```

2.  **Install Example Dependencies:**
    ```bash
    cd examples/basic-app
    npm install
    ```

3.  **Start the Example:**
    ```bash
    npm run dev
    ```

## 📝 What this example shows:
-   **Library Integration:** Importing `ShellLayout` and `initializeShell`.
-   **CSS Setup:** Importing `nexus-shell/style.css`.
-   **Command Registration:** Adding a custom `app.ping` command.
-   **Menu Extension:** Adding a new item to the standard "File" menu.
-   **Programmatic Layout:** Opening a new tab automatically on startup.
