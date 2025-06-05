import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon } from '@ionic/angular/standalone';
import { supabase } from 'src/app/supabase.client';
import { Router } from '@angular/router';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-gps',
  templateUrl: './gps.page.html',
  styleUrls: ['./gps.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, CommonModule, FormsModule]
})
export class GpsPage implements OnInit {

  latitude: number | null = null;
  longitude: number | null = null;
  mapUrl: string | null = null;
  userId: string | null = null;

  
  constructor(private router: Router, private firestore: Firestore) {}

  async ngOnInit(): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    this.userId = session?.user?.id ?? null;
    this.getCurrentLocation();
  }

  getCurrentLocation(): void {
    if (!navigator.geolocation) {
      console.error('Geolocalización no está soportada.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.generateMapUrl();

        await this.saveUrlToSupabase();
        await this.saveToFirestore();
        this.router.navigate(['/news'], {
          queryParams: {
            lat: this.latitude,
            lng: this.longitude,
            mapUrl: this.mapUrl
          }
        });
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }

  generateMapUrl(): void {
    if (this.latitude !== null && this.longitude !== null) {
      this.mapUrl = `https://www.google.com/maps/search/?api=1&query=${this.latitude},${this.longitude}`;
    }
  }

  async saveUrlToSupabase(): Promise<void> {
    if (this.mapUrl && this.latitude !== null && this.longitude !== null) {
      const { error } = await supabase.from('ubicaciones').insert([{
        url: this.mapUrl,
        nombre: `Ubicación de ${this.userId}`,
        latitude: this.latitude,
        longitude: this.longitude
      }]);
      if (error) {
        console.error('Error guardando ubicación en Supabase: ', error);
      }
    }
  } 

  async saveToFirestore(): Promise<void> {
    if (this.mapUrl && this.latitude !== null && this.longitude !== null) {
      const locationData = {
        userId: this.userId,
        url: this.mapUrl,
        latitude: this.latitude,
        longitude: this.longitude,
        timestamp: new Date()
      };

      try {
        await addDoc(collection(this.firestore, 'ubicaciones'), locationData);
        console.log('Ubicación guardada en Firestore');
      } catch (error) {
        console.error('Error guardando en Firestore: ', error);
      }
    }
  }

  goToHome() {
    this.router.navigate(['/news']);
  }
}
