/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Box, Text } from 'ink';
import { theme } from '../semantic-colors.js';
import { RadioButtonSelect } from './shared/RadioButtonSelect.js';
import { useKeypress } from '../hooks/useKeypress.js';
import { keyMatchers, Command } from '../keyMatchers.js';
import { useSessionStats } from '../contexts/SessionContext.js';
import { useConfig } from '../contexts/ConfigContext.js';
import { tokenLimit } from '@google/gemini-cli-core';

interface TaskPlanDialogProps {
  header?: string;
  toolName?: string;
  what: string;
  why: string;
  how: string;
  onApprove: () => void;
  onCancel: () => void;
  width: number;
}

export const TaskPlanDialog: React.FC<TaskPlanDialogProps> = ({
  header = 'Execution Plan Proposed:',
  toolName,
  what,
  why,
  how,
  onApprove,
  onCancel,
  width,
}) => {
  useKeypress(
    (key) => {
      if (keyMatchers[Command.ESCAPE](key)) {
        onCancel();
        return true;
      }
      return false;
    },
    { isActive: true, priority: true },
  );

  const options = useMemo(
    () => [
      { label: 'Approve strategy', value: 'approve' as const, key: 'approve' },
      {
        label: 'No, suggest changes (esc)',
        value: 'cancel' as const,
        key: 'cancel',
      },
    ],
    [],
  );

  const handleSelect = (value: 'approve' | 'cancel') => {
    if (value === 'approve') {
      onApprove();
    } else {
      onCancel();
    }
  };

  const config = useConfig();
  const { stats } = useSessionStats();
  const currentModel = config.getModel();
  const limit = tokenLimit(currentModel);

  const totalInputTokens = Object.values(stats.metrics.models).reduce(
    (acc, m) => acc + m.tokens.input,
    0,
  );

  const usagePercentage =
    limit > 0 ? ((totalInputTokens / limit) * 100).toFixed(1) : '0.0';

  return (
    <Box flexDirection="column" width={width} padding={1}>
      <Box marginBottom={1}>
        <Text bold color={theme.text.primary}>
          {header}
        </Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text color={theme.text.secondary} bold>
          What?
        </Text>
        <Box paddingLeft={2}>
          <Text color={theme.text.primary}>{what}</Text>
        </Box>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text color={theme.text.secondary} bold>
          Why?
        </Text>
        <Box paddingLeft={2}>
          <Text color={theme.text.primary}>{why}</Text>
        </Box>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text color={theme.text.secondary} bold>
          How?
        </Text>
        <Box paddingLeft={2}>
          <Text color={theme.text.primary}>{how}</Text>
        </Box>
      </Box>

      <Box marginTop={1} justifyContent="space-between" alignItems="flex-end">
        <RadioButtonSelect items={options} onSelect={handleSelect} isFocused />
        <Box flexDirection="column" alignItems="flex-end">
          <Box>
            <Text color={theme.text.secondary}>
              Context used:{' '}
              <Text color={theme.status.warning}>{usagePercentage}%</Text>
            </Text>
          </Box>
          {toolName && (
            <Box>
              <Text color={theme.text.secondary}>
                Tool used:{' '}
                <Text color={theme.text.accent} bold>
                  {toolName}
                </Text>
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
