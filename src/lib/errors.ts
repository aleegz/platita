type UserFacingError = Error & {
  userMessage: string;
};

export function createUserFacingError(message: string): UserFacingError {
  const error = new Error(message) as UserFacingError;

  error.name = 'UserFacingError';
  error.userMessage = message;

  return error;
}

export function getUserFacingMessage(
  error: unknown,
  fallbackMessage: string
): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'userMessage' in error &&
    typeof error.userMessage === 'string' &&
    error.userMessage.trim().length > 0
  ) {
    return error.userMessage;
  }

  return fallbackMessage;
}
