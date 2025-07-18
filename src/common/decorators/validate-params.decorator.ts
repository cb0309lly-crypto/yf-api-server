import { SetMetadata } from '@nestjs/common';

export const VALIDATE_PARAMS_KEY = 'validateParams';
export const ValidateParams = (...params: string[]) => SetMetadata(VALIDATE_PARAMS_KEY, params); 