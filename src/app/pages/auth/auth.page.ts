import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { supabase } from 'src/app/supabase.client';

@Component({
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage {
  email = '';
  password = '';
  username = '';
  error = '';

  constructor(private router: Router) {}

  async login() {
    const { error } = await supabase.auth.signInWithPassword({
      email: this.email,
      password: this.password,
    });
    if (error) this.error = error.message;
    else this.router.navigate(['/news']);
  }

  async register() {
    const { data, error } = await supabase.auth.signUp({
      email: this.email,
      password: this.password,
    });

    if (error) {
      this.error = error.message;
    } else {
      const userId = data.user?.id;
      if (userId) {
        await supabase.from('profiles').insert({
          id: userId,
          username: this.username,
          photo_url: '',
        });
      }
      alert('Registro exitoso. Verifica tu email.');
    }
  }
}
