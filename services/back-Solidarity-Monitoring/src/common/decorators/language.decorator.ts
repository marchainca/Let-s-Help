import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import params from 'src/tools/params';

export const Language = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.lang || params.languages.ES.code; // valor por defecto si no se encuentra el idioma
  },
);