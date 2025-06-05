import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButton, 
  IonTextarea, 
  IonLoading 
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { supabase } from 'src/app/supabase.client'; 

// Import Firestore functions
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-character-details',
  templateUrl: './character-details.page.html',
  styleUrls: ['./character-details.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonTextarea,
    IonLoading,
    CommonModule,
    FormsModule,
  ],
})
export class CharacterDetailsPage implements OnInit {

  character: any = null;
  comment: string = '';
  loading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private firestore: Firestore
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCharacter(id);
    }
  }

  loadCharacter(id: string) {
    this.loading = true;
    this.http.get(`https://rickandmortyapi.com/api/character/${id}`).subscribe({
      next: (res) => {
        this.character = res;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el personaje.';
        this.loading = false;
      }
    });
  }

  async saveCharacterWithComment() {
    if (!this.character) return;

    const characterData = {
      id: this.character.id,
      name: this.character.name,
      status: this.character.status,
      gender: this.character.gender,
      image: this.character.image,
    };

    try {
      const { error: charError } = await supabase.from('characters').insert([characterData]);
      if (charError) {
        alert('Error guardando personaje en Supabase: ' + charError.message);
        return;
      }

      await this.saveCharacterFirestore(characterData);

      alert('Personaje guardado exitosamente');
      this.comment = '';
    } catch (error) {
      alert('Error guardando personaje: ' + error);
    }
  }

  async saveCharacterFirestore(characterData: any): Promise<void> {

    try {
      await addDoc(collection(this.firestore, 'characters'), characterData);
      console.log('Personaje guardado en Firestore');
    } catch (error) {
      console.error('Error guardando en Firestore: ', error);
    }
  }

  async goToAPI() {
    this.router.navigate(['/api']);
  }
}
