// Enum definitions based on Prisma schema

export enum TestSection {
  LISTENING = 'listening',
  READING = 'reading',
  WRITING = 'writing',
  SPEAKING = 'speaking',
}

export enum TestQuarter {
  Q1 = 'q1',
  Q2 = 'q2',
  Q3 = 'q3',
  Q4 = 'q4',
}

export enum Status {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  SUBMITTED = 'submitted',
  COMPLETED = 'completed',
  TIMEOUT = 'timeout',
  CANCELLED = 'cancelled',
}

// Type definitions for TypeScript usage
export type TestSectionType = `${TestSection}`;
export type TestQuarterType = `${TestQuarter}`;
export type StatusType = `${Status}`;

// Arrays for validation and iteration
export const TEST_SECTIONS = Object.values(TestSection);
export const TEST_QUARTERS = Object.values(TestQuarter);
export const STATUSES = Object.values(Status);

// IELTS specific constants
export const IELTS_BAND_SCORE_MIN = 0.0;
export const IELTS_BAND_SCORE_MAX = 9.0;
export const IELTS_BAND_SCORE_STEP = 0.5;

export const IELTS_WRITING_TASKS = [1, 2] as const;
export const IELTS_SPEAKING_PARTS = [1, 2, 3] as const;

// Writing criteria
export const WRITING_CRITERIA = [
  'task_achievement',
  'coherence_cohesion',
  'lexical_resource',
  'grammar_accuracy',
] as const;

// Speaking criteria
export const SPEAKING_CRITERIA = [
  'fluency_coherence',
  'lexical_resource',
  'grammar_accuracy',
  'pronunciation',
] as const;

// Submission types
export const SUBMISSION_TYPES = ['manual', 'auto_timeout'] as const;

export type SubmissionType = (typeof SUBMISSION_TYPES)[number];
