# Git Workspace Mapper

This project is designed to map Git repositories to workspaces. It includes functionality to scan directories for Git repositories, map local cloned repos and their remotes, and generate a crosswalk between Git URLs and Eclipse workspaces.

### Installing

1. Clone the repository
2. Install dependencies with `npm install`

## Running the tests

Run the tests using the command `npm run test`.

## Using the Handler

The `handler.js` script is designed to take a Git URL as an argument and open the associated Eclipse workspace. If multiple workspaces are associated with the provided Git URL, the script will prompt you to choose one.

To run the script, use the following command:

```sh
node handler.js <your-git-url>
```

Replace <your-git-url> with the actual Git URL. For example:

```sh
node handler.js https://github.com/roshinc/git-workspace-mapper.git
```

## Using it as protocol handler

This project can be used as a handler for a custom protocol. You can register it as a handler using a PowerShell script like below

```powershell
$protocol = "someprotocol"
$scriptPath = "path\to\handler.js"
$nodePath = "path\to\node.exe"
# Register the custom URL protocol
New-Item -Path "Registry::HKEY_CLASSES_ROOT\$protocol" -Force | Out-Null
Set-ItemProperty -Path "Registry::HKEY_CLASSES_ROOT\$protocol" -Name "(Default)" -Value "URL:$protocol Protocol" -Force
Set-ItemProperty -Path "Registry::HKEY_CLASSES_ROOT\$protocol" -Name "URL Protocol" -Value "" -Force
# Register the shell command
New-Item -Path "Registry::HKEY_CLASSES_ROOT\$protocol\shell" -Force | Out-Null
New-Item -Path "Registry::HKEY_CLASSES_ROOT\$protocol\shell\open" -Force | Out-Null
New-Item -Path "Registry::HKEY_CLASSES_ROOT\$protocol\shell\open\command" -Force | Out-Null
# Set the command to run the Node.js script
$command = "`"$nodePath`" `"$scriptPath`" `"%1`""
Set-ItemProperty -Path "Registry::HKEY_CLASSES_ROOT\$protocol\shell\open\command" -Name "(Default)" -Value $command -Force
Write-Host "Custom URL protocol handler registered successfully."
```

Please note that you need to update the `.env` file based on the `.env.example` file in your project.
