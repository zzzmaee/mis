import { DOCUMENT } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

@Injectable({ providedIn: "root" })
export class JitsiService {
  private scriptLoadingPromise?: Promise<void>;
  private readonly JITSI_SCRIPT_SRC =
    "https://jitsi-meet.yurtech.kz/external_api.js";

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  loadApi(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve();
    }

    if (window.JitsiMeetExternalAPI) {
      return Promise.resolve();
    }

    if (!this.scriptLoadingPromise) {
      this.scriptLoadingPromise = new Promise<void>((resolve, reject) => {
        const script = this.document.createElement("script");
        script.src = this.JITSI_SCRIPT_SRC;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error("Failed to load Jitsi external API script"));
        this.document.body.appendChild(script);
      });
    }

    return this.scriptLoadingPromise;
  }
}

