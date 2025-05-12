RequestExecutionLevel user

; Define the name of the installer
OutFile "VetLabLinkSetup.exe"

; Define the default installation directory
InstallDir "$APPDATA\VetLabLink"

; Set the source directory
!define SOURCE_DIR "setup"

; Show the license page with the MIT license
LicenseData "LICENSE.txt"

Page license
Page directory
Page instfiles

; Define the sections
Section "Install"

  ; Set the installation directory
  SetOutPath "$INSTDIR"

  ; Copy all files from the source directory to the installation directory
  File /r "${SOURCE_DIR}\*.*"

  ; Create a shortcut in the user's start menu
  CreateShortCut "$SMSTARTUP\VetLabLink.lnk" "$INSTDIR\VetLabLink\VetLabLink.exe"

  ; Create a shortcut on the user's desktop
  CreateShortCut "$DESKTOP\VetLabLink.lnk" "$INSTDIR\VetLabLink\VetLabLink.exe"

  ; Create an uninstall shortcut in the user's start menu
  CreateShortCut "$SMSTARTUP\Uninstall VetLabLink.lnk" "$INSTDIR\uninstall.exe"

  ; Write the uninstaller
  WriteUninstaller "$INSTDIR\uninstall.exe"

  ; Ensure the directory for the database file exists
  CreateDirectory "$APPDATA\VetLabLink"

  Exec '"$INSTDIR\VetLabLink\VetLabLink.exe"'

SectionEnd

; Define the uninstaller
Section "Uninstall"

  ; Remove all files from the installation directory
  Delete "$INSTDIR\*.*"

  ; Remove the installation directory
  RMDir /r "$INSTDIR"

  ; Remove the shortcut from the user's start menu
  Delete "$SMSTARTUP\VetLabLink.lnk"

  ; Remove the shortcut from the user's desktop
  Delete "$DESKTOP\VetLabLink.lnk"

  ; Remove the uninstall shortcut from the user's start menu
  Delete "$SMSTARTUP\Uninstall VetLabLink.lnk"

SectionEnd
