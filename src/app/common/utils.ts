import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class Utils {
    getYoutubeIdFromUrl(url) {
        if (url.includes('youtube.com')) {
          return url.split('=')[1].split('&')[0];
        } else if (url.includes('youtu.be')) {
          return url.split('?')[0].split(".")[1].split('/')[1];
        } else {
          return null;
        }
      }

      get16_9RatioHeight(width: number) {
        return (9 * width) / 16;
      }

      get4_3RatioHeight(width: number) {
        return (3 * width) / 4;
      }
}