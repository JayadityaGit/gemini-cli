/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BaseDeclarativeTool,
  BaseToolInvocation,
  type ToolResult,
  Kind,
  type ToolPresentPlanConfirmationDetails,
  ToolConfirmationOutcome,
  type ToolConfirmationPayload,
} from './tools.js';
import type { MessageBus } from '../confirmation-bus/message-bus.js';
import {
  PRESENT_PLAN_TOOL_NAME,
  PRESENT_PLAN_DISPLAY_NAME,
} from './tool-names.js';
import { PRESENT_PLAN_DEFINITION } from './definitions/coreTools.js';
import { resolveToolDeclaration } from './definitions/resolver.js';

export interface PresentPlanParams {
  what: string;
  why: string;
  how: string;
}

export class PresentPlanTool extends BaseDeclarativeTool<
  PresentPlanParams,
  ToolResult
> {
  constructor(messageBus: MessageBus) {
    super(
      PRESENT_PLAN_TOOL_NAME,
      PRESENT_PLAN_DISPLAY_NAME,
      PRESENT_PLAN_DEFINITION.base.description!,
      Kind.Communicate,
      PRESENT_PLAN_DEFINITION.base.parametersJsonSchema,
      messageBus,
    );
  }

  protected createInvocation(
    params: PresentPlanParams,
    messageBus: MessageBus,
    toolName: string,
    toolDisplayName: string,
  ): PresentPlanInvocation {
    return new PresentPlanInvocation(
      params,
      messageBus,
      toolName,
      toolDisplayName,
    );
  }

  override getSchema(modelId?: string) {
    return resolveToolDeclaration(PRESENT_PLAN_DEFINITION, modelId);
  }
}

export class PresentPlanInvocation extends BaseToolInvocation<
  PresentPlanParams,
  ToolResult
> {
  private confirmationOutcome: ToolConfirmationOutcome | null = null;
  private approvalFeedback: string | null = null;

  override async shouldConfirmExecute(
    _abortSignal: AbortSignal,
  ): Promise<ToolPresentPlanConfirmationDetails | false> {
    return {
      type: 'present_plan',
      title: 'Execution Plan',
      what: this.params.what,
      why: this.params.why,
      how: this.params.how,
      onConfirm: async (
        outcome: ToolConfirmationOutcome,
        payload?: ToolConfirmationPayload,
      ) => {
        this.confirmationOutcome = outcome;
        if (
          payload &&
          'approved' in payload &&
          !payload.approved &&
          'feedback' in payload &&
          payload.feedback
        ) {
          this.approvalFeedback = payload.feedback;
        }
      },
    };
  }

  getDescription(): string {
    return `Presenting execution plan`;
  }

  async execute(_signal: AbortSignal): Promise<ToolResult> {
    if (this.confirmationOutcome === ToolConfirmationOutcome.Cancel) {
      return {
        llmContent: 'User rejected the plan. Please ask for clarification or try a different approach.',
        returnDisplay: 'Plan rejected',
      };
    }

    if (this.approvalFeedback) {
      return {
        llmContent: `User rejected the plan with feedback: \${this.approvalFeedback}`,
        returnDisplay: 'Plan rejected with feedback',
      };
    }

    return {
      llmContent: 'Plan approved by user. You may proceed with execution.',
      returnDisplay: 'Plan approved',
    };
  }
}
