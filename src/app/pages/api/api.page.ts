import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonSpinner,
  IonList,
  IonItem,
  IonThumbnail,
  IonLabel,
  IonSearchbar
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-api',
  templateUrl: './api.page.html',
  styleUrls: ['./api.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonSpinner,
    IonList,
    IonItem,
    IonThumbnail,
    IonLabel,
    IonSearchbar,
    CommonModule,
    FormsModule
  ]
})
export class ApiPage implements OnInit {

  searchTerm = '';
  foundCharacters: any[] = [];
  errorMessage = '';
  loading = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {}

  searchCharacter() {
    const name = this.searchTerm.trim();
    if (!name) {
      this.foundCharacters = [];
      this.errorMessage = '';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.foundCharacters = [];

    this.http.get<any>(`https://rickandmortyapi.com/api/character/?name=${encodeURIComponent(name)}`)
      .subscribe({
        next: (res) => {
          this.foundCharacters = res.results || [];
          this.loading = false;
        },
        error: (err) => {
          this.foundCharacters = [];
          this.loading = false;
          if (err.status === 404) {
            this.errorMessage = 'No se encontraron personajes.';
          } else {
            this.errorMessage = 'Error buscando personajes.';
          }
        }
      });
  }

  goToDetails(character: any) {
    this.router.navigate(['/character', character.id]);
  }

  goToChat() {
    this.router.navigate(['/news']);
  }
}
