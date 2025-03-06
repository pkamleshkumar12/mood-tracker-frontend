import { HttpInterceptorFn } from '@angular/common/http';

export const cookieInterceptor: HttpInterceptorFn = (req, next) => {
  // Clone the request to add the withCredentials option
  const modifiedReq = req.clone({
    withCredentials: true
  });
  
  return next(modifiedReq);
}; 