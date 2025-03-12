import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class BrowserFingerprintInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get screen properties
    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    const colorDepth = window.screen.colorDepth;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Clone the request and add fingerprint headers
    const modifiedRequest = request.clone({
      setHeaders: {
        'X-Screen-Resolution': screenResolution,
        'X-Color-Depth': `${colorDepth}`,
        'X-Timezone': timezone
      }
    });

    return next.handle(modifiedRequest);
  }
} 