import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import params from 'src/tools/params';

@Injectable()
export class LanguageInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const acceptLanguage = request.headers['accept-language'];
    let lang: number; 

    if (acceptLanguage) {
      lang = acceptLanguage.split(',')[0].split('-')[0].toLowerCase() === params.languages.EN.name ? params.languages.EN.code : params.languages.ES.code; 
    }
    request.lang = lang;
    return next.handle();
  }
}