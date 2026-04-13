import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true; // Si no se definen roles, permitir acceso
    }

    const { user } = context.switchToHttp().getRequest(); // Extrae el usuario del token JWT
    if (!user.roles || !requiredRoles.some(role => user.roles.includes(role))) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }
}
