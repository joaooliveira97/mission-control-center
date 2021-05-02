import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

import { Utils } from 'src/app/common/utils';

@Component({
  selector: 'app-free-grid',
  templateUrl: './free-grid.component.html',
  styleUrls: ['./free-grid.component.css']
})
export class FreeGridComponent implements OnInit, AfterViewInit {

  videoProperties = {
    width: '100%',
    height: '100%'
  }
  videos: string[] = [];

  videoToAdd: string;

  deleteVideosBool: boolean = false;

  videosSavedBol: boolean = false;

  constructor(private utils: Utils) { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.loadVideosFromLocalStorage();
  }

  addVideo() {
    if (this.videoToAdd && this.videoToAdd.trim().length > 0) {
      var videoId = this.utils.getYoutubeIdFromUrl(this.videoToAdd);
      if (videoId) {
        this.videos = [...this.videos, videoId];
        this.setVideosSize();
        this.videoToAdd = "";
      } else {
        alert("Insira um url válido do Youtube");
      }
    } else {
      alert("Insira um vídeo");
    }
  }

  removeVideo(index) {
    this.videos.splice(index, 1);
    if (this.videos.length == 0) {
      this.deleteVideosBool = false;
    } else {
      this.setVideosSize();
    }
  }

  removeAllVideos() {
    this.videos = [];
    this.deleteVideosBool = false;
  }

  saveVideosToLocalStorage() {
    localStorage.setItem('freeGridVideos', JSON.stringify(this.videos));
    this.videosSavedBol = true;
  }

  deleteVideosFromLocalStorage() {
    localStorage.removeItem('freeGridVideos');
    this.videosSavedBol = false;
  }

  loadVideosFromLocalStorage() {
    const videosString = localStorage.getItem('freeGridVideos');
    if (videosString?.trim().length > 0) {
      this.videos = JSON.parse(videosString);
      this.setVideosSize();
      this.videosSavedBol = true;
    }
  }

  setVideosSize(event?) {
    let videoProperties = {
      width: '100%',
      height: '100%'
    }
    videoProperties.width = `${Math.floor(100 / Math.ceil(Math.sqrt(this.videos.length)))}%`;
    videoProperties.height = `${Math.floor(100 / Math.ceil(Math.sqrt(this.videos.length)))}%`;
    this.videoProperties = { ...videoProperties };
  }

  get16_9RatioHeight(width: number) {
    return (9 * width) / 16;
  }

}
