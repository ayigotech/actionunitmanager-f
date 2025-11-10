import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreloaderComponent } from './components/preloader/preloader.component';
import { Router, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { AuthService } from './services/auth';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';


// Manually import icons if needed
import { addIcons } from 'ionicons';
import { 
  school, checkmarkCircle, cash, checkmarkDone, wallet, alertCircle,
  mailOutline, personAdd, personCircle, swapHorizontal, removeCircle, calendarOutline, 
  people,logOutOutline,lockClosedOutline,calendar, call, chatbubble,documentTextOutline,
  peopleOutline,documentText, book, peopleCircle,document,bookOutline,remove, callOutline, home, settings, notifications, person, add,
  arrowBack,createOutline, trashOutline, 
  personOutline, locationOutline,
  checkmark,
  trendingDown,
  trendingUp,
  download,
  businessOutline,
  navigateOutline,
  giftOutline,
  lockClosed,
  mailOpenOutline,
  personCircleOutline,
  phonePortraitOutline,
  timer,
  warning, close,
  link,
  rocketOutline,
  warningOutline,
  refresh,
  create,
  personRemove,
  cashOutline,
  pricetagOutline,
  toggleOutline,
  trash,
  libraryOutline,
  ellipsisVertical,
  constructOutline,
  shieldCheckmark,
  closeCircle,
  card,
  gift,
  time,
  analytics,
  location,
  chatbubbles,
  heartCircle,
  heart,
  searchOutline,
  chevronDownCircleOutline,
  folderOutline,
  documentAttach,
  briefcaseOutline,
  chevronForwardOutline,
  
} from 'ionicons/icons';


@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: 'app.component.html',
  imports: [
    IonApp, 
    IonRouterOutlet, 
    CommonModule, 
    PreloaderComponent,
    FormsModule
  ]
})

export class AppComponent {
  isLoading: boolean = true;

  showDebugOverlay = true;
  currentUrl = '';
  showPreloader = true;
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private platform: Platform
  ) {

       this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.url;
        console.log('📍 Current route:', this.currentUrl);
      }
    }
  );

 
    // Register all icons we're using in the app
    addIcons({
      school, 'checkmark-circle': checkmarkCircle, cash, 'checkmark-done': checkmarkDone, wallet,
      'alert-circle': alertCircle,  'mail-outline': mailOutline,checkmark, 'library-outline': libraryOutline,
       'log-out-outline': logOutOutline, 'lock-closed-outline': lockClosedOutline, 'people-outline': peopleOutline,
      'call-outline': callOutline,home,settings,notifications,calendar,person,add,people,'document-text': documentText,
    book,'people-circle': peopleCircle,'arrow-back': arrowBack, 'create-outline': createOutline, 'trash-outline': trashOutline,
    'person-outline': personOutline, call, chatbubble,document, 'location-outline': locationOutline, 'person-add': personAdd,
  'person-circle': personCircle,'document-text-outline': documentTextOutline, 'swap-horizontal': swapHorizontal,
  'remove-circle': removeCircle, 'trending-down':trendingDown, 'trending-up': trendingUp,
    "chevron-forward-outline":chevronForwardOutline, "briefcase-outline":briefcaseOutline,

  'calendar-outline': calendarOutline,  'book-outline': bookOutline, remove,download,timer,warning,
  'business-outline': businessOutline, trash, 'ellipsis-vertical':ellipsisVertical,'construct-outline':constructOutline,
    'navigate-outline': navigateOutline, 'rocket-outline':rocketOutline, 'warning-outline':warningOutline,
    'person-circle-outline': personCircleOutline, 'shield-checkmark':shieldCheckmark, 'search-outline':searchOutline,
    'mail-open-outline': mailOpenOutline,create,refresh, 'person-remove':personRemove,heart,"chevron-down-circle-outline":chevronDownCircleOutline,
    'phone-portrait-outline': phonePortraitOutline, 'toggle-outline':toggleOutline,chatbubbles, 'heart-circle':heartCircle,
    'lock-closed': lockClosed,link, 'cash-outline': cashOutline, 'pricetag-outline':pricetagOutline, 'folder-outline':folderOutline,
    'gift-outline': giftOutline,close, 'close-circle': closeCircle, card, gift, time, analytics,location,"document-attach":documentAttach,
    });
  }

  
 ngOnInit() {
  // Check if user is already logged in

  this.initializeApp();

  const user = this.authService.getCurrentUser();
  if (user) {
    this.isLoading = false;
    // Call the redirect method
    this.redirectUser(user);
  } else {
    setTimeout(() => {
      this.isLoading = false;
    }, 3500);
  }
}

private redirectUser(user: any) {
  const routes: { [key: string]: string } = {
    superintendent: '/superintendent',
    teacher: '/teacher',
    member: user.is_officer ? '/officers-insight' : '/member-dashboard'
  };
  
  const route = routes[user.role] || '/';
  this.router.navigate([route]);
}


 hideOverlay() {
    this.showDebugOverlay = false;
  }


   initializeApp() {
    this.platform.ready().then(() => {
      // Hide preloader after 3 seconds or when platform is ready
      setTimeout(() => {
        this.showPreloader = false;
      }, 3500);
    });
  }

}



