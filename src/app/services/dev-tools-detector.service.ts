import { Injectable, NgZone } from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class DevToolsDetectorService {
  private threshold = 160; // Minimum unusual viewport change
  private devToolsOpened = false;

  constructor(private zone: NgZone) {}

  detectDevTools(callback: (isOpen: boolean) => void) {
    // Monitor viewport size changes
    window.addEventListener('resize', () => {
      this.zone.run(() => {
        const isDevTools = 
          window.outerWidth - window.innerWidth > this.threshold || 
          window.outerHeight - window.innerHeight > this.threshold;

        if (isDevTools !== this.devToolsOpened) {
          this.devToolsOpened = isDevTools;
          callback(this.devToolsOpened);
        }
      });
    });

    const element = new Image();
    Object.defineProperty(element, 'id', {
      get: () => {
        this.zone.run(() => {
          this.devToolsOpened = true;
          callback(this.devToolsOpened);
        });
      },
    });
    console.log(element);

    setInterval(() => {
      const start = performance.now();
      debugger;
      const duration = performance.now() - start;
      if (duration > 100 && !this.devToolsOpened) {
        this.zone.run(() => {
          this.devToolsOpened = true;
          callback(this.devToolsOpened);
        });
      }
    }, 1000);
  }
}
