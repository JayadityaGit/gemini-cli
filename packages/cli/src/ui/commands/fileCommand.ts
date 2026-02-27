/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { pickFile } from '../utils/filePicker.js';
import type { SlashCommand } from './types.js';
import { CommandKind } from './types.js';

export const fileCommand: SlashCommand = {
  name: 'file',
  altNames: ['image'],
  description:
    'Open a file explorer to choose a file or image to include in the prompt',
  kind: CommandKind.BUILT_IN,
  autoExecute: true,
  action: async (_context, _args) => {
    const pickedFile = await pickFile();
    if (pickedFile) {
      return {
        type: 'submit_prompt',
        content: [{ text: `@${pickedFile}` }],
      };
    }
    return {
      type: 'message',
      content: 'No file selected.',
      messageType: 'info',
    };
  },
};
