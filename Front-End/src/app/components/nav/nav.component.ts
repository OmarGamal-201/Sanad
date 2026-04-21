import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  constructor(private router: Router) { }

    isMobileMenuOpen = false;

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  navigateToHome() {
    this.router.navigate(['/home']);
  }
  // دالة للتوجيه لصفحة التسجيل
  navigateToRegister() {
    this.router.navigate(['/register']);
  }


  // دالة للتوجيه لصفحة الشرح أو الخدمات
  navigateToHowItWorks() {
    this.router.navigate(['/about']); // عدلها حسب الراوت عندك
  }
}
