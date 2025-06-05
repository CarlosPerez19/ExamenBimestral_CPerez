import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
} from '@ionic/angular/standalone';

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { supabase } from 'src/app/supabase.client';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.page.html',
  styleUrls: ['./camera.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
  ],
})
export class CameraPage implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {}

  dataURLtoBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  }

  async takePhoto() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `foto_${timestamp}.jpg`;

    const dataUrl = image.dataUrl!;
    const blob = this.dataURLtoBlob(dataUrl);

    const { error } = await supabase.storage.from('archivos').upload(fileName, blob, {
      contentType: 'image/jpeg',
      upsert: false,
    });

    if (error) {
      console.error('Error al subir la imagen:', error.message);
      return;
    }

    const { data } = supabase.storage.from('archivos').getPublicUrl(fileName);
    const imageUrl = data.publicUrl;

    this.router.navigate(['/news'], {
      queryParams: { imageUrl }
    });
  }
}
