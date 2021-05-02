import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

import { Utils } from 'src/app/common/utils';

@Component({
  selector: 'app-two-three',
  templateUrl: './two-three.component.html',
  styleUrls: ['./two-three.component.css']
})
export class TwoThreeComponent implements OnInit {

  videos: string[] = new Array(5).fill(null);
  videosSavedBol: boolean = false;
  videoToAdd: string[] = new Array(5).fill(null);
  deleteVideosBool: boolean = false;
  videoProperties = {
    two: {
      width: '',
      height: ''
    },
    three: {
      width: '',
      height: ''
    }
  }

  constructor(private utils: Utils) {
  }

  ngOnInit(): void {
    this.loadVideosFromLocalStorage();
  }

  addVideo(index) {
    if (this.videoToAdd && this.videoToAdd[index].trim().length > 0) {
      var videoId = this.utils.getYoutubeIdFromUrl(this.videoToAdd[index]);
      if (videoId) {
        this.videos[index] = videoId;
        this.videoToAdd[index] = '';
      } else {
        alert("Insira um url válido do Youtube");
      }
    } else {
      alert("Insira um vídeo");
    }
  }

  removeVideo(index) {
    this.videos[index] = null;
    if(this.videos.every(video => video === null)){
      this.deleteVideosBool = false;
    }
  }

  removeAllVideos() {
    this.videos.fill(null);
    this.deleteVideosBool = false;
  }

  saveVideosToLocalStorage() {
    localStorage.setItem('twoThreeVideos', JSON.stringify(this.videos));
    this.videosSavedBol = true;
  }

  deleteVideosFromLocalStorage() {
    localStorage.removeItem('twoThreeVideos');
    this.videosSavedBol = false;
  }

  loadVideosFromLocalStorage() {
    const videosString = localStorage.getItem('twoThreeVideos');
    if (videosString?.trim().length > 0) {
      this.videos = JSON.parse(videosString);
      this.videosSavedBol = true;
    }
  }

  hasVideos(): boolean {
    return this.videos.some(video => video != null);
  }
}
