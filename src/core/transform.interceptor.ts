import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE } from './customize';

export interface Response<T> {
  statusCode: number;
  message?: string;
  Item: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((Item) => {
        const responseMessage = this.reflector.get<string>(
          RESPONSE_MESSAGE,
          context.getHandler(),
        );
        return {
          statusCode: context.switchToHttp().getResponse().statusCode,
          message: responseMessage || '',
          Item,
        };
      }),
    );
  }
}
