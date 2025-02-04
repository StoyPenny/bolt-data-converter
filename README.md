# Bolt Data Converter

![image](https://github.com/user-attachments/assets/2627414c-128c-4e05-adf7-9b6ced663456)


Have you ever encountered a situation where Bolt.new chat failed to restore your project from an old chat, or when losing access to the terminal left you stuck? And now you can't export your project? Bolt Data Converter is a tool designed to help you recover your project from a broken chat with Bolt.new.

With this tool, you can export your chat, then either paste the file contents or upload the JSON file directly. The application analyzes the chat history to automatically detect the latest artifact and extracts the necessary files and terminal commands. Finally, it generates a bash script that you can download and run on your local machine to recreate your project. Once your local files are restored, you have the option to re-import the project back into Bolt.new.

## Quick Start

To run this project locally, follow these steps:

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```


## Features

- **Text Input**: Directly paste the contents of your Bolt chat export into the application.
- **File Upload**: Upload the JSON file exported from your Bolt chat.
- **Bash Script Generation**: Automatically generate a bash script that recreates your project structure and executes any necessary commands.
- **Download Script**: Download the generated bash script for easy execution on your local machine.

## How to Use

1. **Paste Text or Upload File**:
   - Select your preferred input method and provide your file content (the full contents of your chat export JSON file from `bolt.new` or `bolt.diy`).

2. **Process**:
   - Click the "Process" button to analyze your chat history and generate the corresponding bash script.

3. **Download Script**:
   - After processing, the "Download Script" button will be enabled. Click it to download the generated bash script.

4. **Run Script**:
   - Open your terminal and execute the downloaded bash script to recreate your Bolt project.
   - You may need to make the script executable first with `chmod +x restoreBoltProject.sh`.
   - Once executable, run the script using `./restoreBoltProject.sh`.
   - Be sure to place the script in the directory where you want the project files to be created.

## Installation

To run this project locally, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/StoyPenny/bolt-data-converter.git
cd bolt-data-converter
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to <http://localhost:3000> to view the application.

## Technologies Used

- **React**: A JavaScript library for building user interfaces.
- **Material-UI (MUI)**: A popular React UI framework for building responsive and visually appealing components.
- **Vite**: A fast build tool for modern web development.
- **Emotion**: A library for writing CSS styles with JavaScript.


## Use At Your Own Risk

This tool comes with no guarantees. While the bash scripts generated are designed to restore your project, they have access to your terminal and can execute any commands. Please review the contents of the generated script carefully before running it on your machine. Use at your own risk.

## Security

This tool processes Bolt chat exports and generates bash scripts locally in your browser. Here's what you should know about security:

### Data Handling

- All file processing happens entirely in your browser
- No data is sent to external servers
- Chat exports are not stored permanently

### Script Safety

- Generated scripts are deterministic based on your chat export
- Scripts only create files and execute commands that were present in your original Bolt chat
- Each generated script includes comments describing the operations it will perform

### Best Practices

1. Always review the generated script before execution
2. Run scripts in a dedicated project directory
3. Avoid running scripts with sudo/administrator privileges
4. Back up any existing files in the target directory
5. Use version control (like git) before running recovery scripts

### Script Verification

The generated bash script follows this structure:

- File creation operations
- Permission modifications
- Package installations and other commands from your original chat

For additional security measures, consider running the script in a controlled environment first.


## License

This project is open-source and available under the MIT License.

## Contributing

Contributions are welcome! If you have suggestions for improvements or bug fixes, please open an issue or submit a pull request.
