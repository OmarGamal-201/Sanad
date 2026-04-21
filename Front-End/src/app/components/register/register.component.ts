import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name = '';
  email = '';
  phone = '';
  password = '';
  role: 'client' | 'provider' = 'client';
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  photoPreviewUrl: string | ArrayBuffer | null = null;
  address = {
  governrate: '',
  city: '',
  street: ''
};

  constructor(private http: HttpClient, private router: Router) {}

  selectRole(role: 'client' | 'provider'): void {
    this.role = role;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.previewUrl = reader.result as string;
      reader.readAsDataURL(this.selectedFile);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onPhotoSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    // ضيف اللوجيك بتاع رفع الصورة للـ Firebase أو الـ Server هنا
    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreviewUrl = reader.result;
    };
    reader.readAsDataURL(file);
  }
}

  onSubmit(): void {
    if (!this.name || !this.email || !this.phone || !this.password) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const body = {
      name: this.name,
      email: this.email,
      phone: this.phone,
      password: this.password,
      role: this.role,
    };

    this.http.post<any>('http://localhost:5000/api/auth/register', body).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
