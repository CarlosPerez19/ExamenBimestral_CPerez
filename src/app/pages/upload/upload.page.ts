import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel
} from '@ionic/angular/standalone';
import { supabase } from 'src/app/supabase.client';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.page.html',
  styleUrls: ['./upload.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    CommonModule,
    FormsModule
  ]
})
export class UploadPage {
  selectedFile: File | null = null;

  constructor(private router: Router) {}

  goToHome() {
    this.router.navigate(['/news']);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    } else {
      this.selectedFile = null;
    }
  }

  async uploadFile() {
    if (!this.selectedFile) {
      alert('Selecciona un archivo primero');
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;

    if (!userId) {
      alert('No estás autenticado');
      return;
    }

    const fileExt = this.selectedFile.name.split('.').pop();
    const filePath = `${userId}/profile.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, this.selectedFile, {
        upsert: true,
      });

    if (uploadError) {
      alert('Error al subir imagen');
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const photoUrl = data.publicUrl;

    await supabase.from('profiles').update({ photo_url: photoUrl }).eq('id', userId);
    alert('Foto de perfil actualizada');
  }
}
