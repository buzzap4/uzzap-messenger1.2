import { ERROR_MESSAGES } from './constants';

export type ApiError = {
  code: string;
  message: string;
};

export function handleError(error: unknown): ApiError {
  if (error instanceof Error) {
    return {
      code: 'ERROR',
      message: error.message
    };
  }
  
  if (typeof error === 'string') {
    return {
      code: 'ERROR',
      message: error
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: ERROR_MESSAGES.GENERIC
  };
}

export function getErrorMessage(error: unknown): string {
  const { message } = handleError(error);
  return message;
}
