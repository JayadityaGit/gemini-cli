/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { spawnAsync, debugLogger } from '@google/gemini-cli-core';

/**
 * Opens a native file selection dialog and returns the selected path.
 * Supports Linux (zenity, kdialog), macOS (osascript), and Windows (PowerShell).
 *
 * @returns The selected file path, or null if cancelled or no tool available.
 */
export async function pickFile(): Promise<string | null> {
  const platform = process.platform;

  try {
    if (platform === 'darwin') {
      // macOS: use AppleScript to open a file dialog
      const script = 'POSIX path of (choose file)';
      const { stdout } = await spawnAsync('osascript', ['-e', script]);
      return stdout.trim() || null;
    }

    if (platform === 'win32') {
      // Windows: use PowerShell to open a file dialog
      const script = `
        Add-Type -AssemblyName System.Windows.Forms
        $f = New-Object System.Windows.Forms.OpenFileDialog
        $f.Filter = "All Files (*.*)|*.*"
        $f.ShowHelp = $true
        $result = $f.ShowDialog()
        if ($result -eq 'OK') {
          Write-Output $f.FileName
        }
      `;
      const { stdout } = await spawnAsync('powershell', [
        '-NoProfile',
        '-Command',
        script,
      ]);
      return stdout.trim() || null;
    }

    if (platform === 'linux') {
      // Linux: try zenity, then kdialog
      try {
        const { stdout } = await spawnAsync('zenity', [
          '--file-selection',
          '--title=Select a file or image',
        ]);
        return stdout.trim() || null;
      } catch (e) {
        debugLogger.debug('zenity not found or failed:', e);
      }

      try {
        const { stdout } = await spawnAsync('kdialog', [
          '--getopenfilename',
          '.',
          'All Files (*)',
        ]);
        return stdout.trim() || null;
      } catch (e) {
        debugLogger.debug('kdialog not found or failed:', e);
      }
    }
  } catch (error) {
    debugLogger.warn('Error opening file picker:', error);
  }

  return null;
}
