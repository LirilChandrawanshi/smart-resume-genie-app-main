
```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Testing the new features (LaTeX templates)

### 1. Start backend and frontend

**Backend** (from project root):

```sh
cd spring-boot-backend
mvn spring-boot:run
```

Requires: Java 17+, Maven, MongoDB (see `spring-boot-backend/application.properties`). Optional: **pdflatex** on your PATH for server-side PDF generation from LaTeX templates (e.g. `brew install --cask mactex` on macOS, or install TeX Live). If pdflatex is not available, PDF for LaTeX templates falls back to client-side (html2canvas).

**Frontend** (from project root):

```sh
npm i
npm run dev
```

Open the URL shown (e.g. http://localhost:5173).

### 2. Test template list from API

- **GET** `http://localhost:8080/api/templates` (no auth). You should get JSON with `templates` (array of `{ id, name, description, hasLatex }`) and `total`. The **Jake** template should have `hasLatex: true` (it has a `.tex` file in `spring-boot-backend/src/main/resources/templates/latex/jake.tex`).

### 3. Test Templates page (UI)

- Go to **Templates** (nav or `/templates`). The list should load from the API. **Jake** (or any template with a `.tex` file) should show a **LaTeX** badge.
- Click **Use This Template** on Jake. You should land on the builder with Jake selected.

### 4. Test template selector on builder

- On the builder page, the **Choose Template** card should show a few templates from the API. Jake (if in the first four) should have a small **LaTeX** badge. Selecting a template updates the preview.

### 5. Test PDF download (LaTeX template)

- Select the **Jake** template, fill in personal info and at least one section (e.g. experience).
- **Save** the resume (requires sign-in). After save, click **PDF** under Download options.
- **If pdflatex is installed**: Backend returns a real PDF (LaTeX-compiled). The file downloads.
- **If pdflatex is not installed**: Backend returns JSON; the app falls back to client-side PDF (html2canvas). The file still downloads.

### 6. Test adding a new LaTeX template

- Add a new file e.g. `spring-boot-backend/src/main/resources/templates/latex/academic.tex` using the same placeholders as `jake.tex` (see `templates/latex/README.md`).
- Restart the backend. **GET** `/api/templates` should include the new template with `hasLatex: true`. The Templates page and template selector will show it (and LaTeX badge) without any code changes.

---

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

