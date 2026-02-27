/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Config } from '../config/config.js';
import type { GeminiClient } from '../core/client.js';
import { LlmRole } from '../telemetry/llmRole.js';
import { getResponseText } from '../utils/partUtils.js';
import { debugLogger } from '../utils/debugLogger.js';

export interface InsightRecord {
  user_prompt: string;
  tool_name: string;
  what: string;
  why: string;
  how: string;
  context_used: string;
}

export class InsightRecordingService {
  private filePath: string | null = null;
  private records: InsightRecord[] = [];

  constructor(private readonly config: Config) {}

  /**
   * Initializes the insight recording service with the first user prompt.
   * Creates the .gemini/insights directory and sets up the session file.
   *
   * @param firstPrompt The first user prompt of the session.
   * @param geminiClient The Gemini client to use for title summarization.
   */
  async initialize(
    firstPrompt: string,
    geminiClient: GeminiClient,
  ): Promise<void> {
    if (this.filePath) {
      return; // Already initialized
    }

    debugLogger.debug(
      'Initializing InsightRecordingService with prompt:',
      firstPrompt,
    );

    try {
      const projectRoot = this.config.getProjectRoot();
      const insightsDir = path.join(projectRoot, '.gemini', 'insights');

      if (!fs.existsSync(insightsDir)) {
        fs.mkdirSync(insightsDir, { recursive: true });
      }

      let summary = firstPrompt.slice(0, 30);
      try {
        const prompt = `Summarize the following user prompt into a very short (max 3-4 words), concise, and clear title for a file name. Use only lowercase letters and hyphens. Do not include any other text or explanation.
        
        Prompt: "${firstPrompt}"`;

        const response = await geminiClient.generateContent(
          { model: 'summarizer-default' },
          [{ role: 'user', parts: [{ text: prompt }] }],
          new AbortController().signal,
          LlmRole.UTILITY_SUMMARIZER,
        );
        const summarizedTitle = getResponseText(response);
        if (summarizedTitle) {
          summary = summarizedTitle
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        }
      } catch (e) {
        debugLogger.warn('Failed to summarize insight title:', e);
      }

      const slug =
        summary
          .replace(/[^a-zA-Z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .toLowerCase() || 'session';

      const filename = `${slug}.json`;
      this.filePath = path.join(insightsDir, filename);

      debugLogger.debug('Insight recording file path:', this.filePath);

      // Initialize with an empty array
      fs.writeFileSync(
        this.filePath,
        JSON.stringify(this.records, null, 2),
        'utf-8',
      );
    } catch (error) {
      debugLogger.error('Failed to initialize InsightRecordingService:', error);
    }
  }

  /**
   * Records a tool call insight to the session file.
   *
   * @param userPrompt The current user prompt.
   * @param toolName The name of the invoked tool.
   * @param what What the AI understood about the problem.
   * @param why Why the AI made this choice.
   * @param how How the AI is going to use the tool.
   * @param contextUsed The current context or active directories.
   */
  recordToolCall(
    userPrompt: string,
    toolName: string,
    what: string,
    why: string,
    how: string,
    contextUsed: string,
  ): void {
    if (!this.filePath) {
      debugLogger.warn(
        'Cannot record tool call: InsightRecordingService not initialized',
      );
      return;
    }

    debugLogger.debug('Recording tool call insight:', toolName);

    const record: InsightRecord = {
      user_prompt: userPrompt,
      tool_name: toolName,
      what: what || '',
      why: why || '',
      how: how || '',
      context_used: contextUsed || '',
    };

    this.records.push(record);

    try {
      fs.writeFileSync(
        this.filePath,
        JSON.stringify(this.records, null, 2),
        'utf-8',
      );
    } catch (error) {
      debugLogger.error('Failed to write insight record:', error);
    }
  }
}
