import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-preloader',
  templateUrl: './preloader.component.html',
  styleUrls: ['./preloader.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule] // ✅ Add IonicModule here
})
export class PreloaderComponent  implements OnInit {

  
  //typing effect
  appNameText: string = 'ActionUnitManager v0';
  displayAppNameText: string = '';
  currentIndex: number = 0;
  intervalId: any;
   currentTime: string = '';


  constructor() { }

  ngOnInit() {


    // Auto-hide after 3 seconds or when app is ready
    setTimeout(() => {
      this.hidePreloader();
    }, 3500);

    // this.updateTime();
    // setInterval(() => this.updateTime(), 1000); // Update every second
    // this.startTyping();

  }


  updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.currentTime = `${hours}:${minutes}`;
  }


  startTyping() {
    this.intervalId = setInterval(() => {
      if (this.currentIndex < this.appNameText.length) {
        this.displayAppNameText += this.appNameText[this.currentIndex];
        this.currentIndex++;
      } else {
        clearInterval(this.intervalId); // Stop when complete
      }
    }, 200); // Speed: 150ms per letter, you can adjust this
  }


   hidePreloader() {
    const preloader = document.querySelector('app-preloader');
    if (preloader) {
      (preloader as HTMLElement).style.display = 'none';
    }
  }

}
