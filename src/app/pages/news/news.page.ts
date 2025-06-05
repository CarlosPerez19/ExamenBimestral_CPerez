import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { supabase } from 'src/app/supabase.client';

// Firestore imports
import { Firestore, collection, onSnapshot, query, orderBy } from '@angular/fire/firestore';

@Component({
  selector: 'app-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, CommonModule, FormsModule]
})
export class NewsPage implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('postsContainer') postsContainer!: ElementRef;

  title = '';
  content = '';
  imageUrl: string | null = null;
  latitude: number | null = null;
  longitude: number | null = null;
  locationUrl: string | null = null;

  userId: string | null = null;
  news: any[] = [];
  userProfiles: Record<string, { username: string; photo_url: string }> = {};
  channel: any = null;

  characterImages: any[] = [];

  constructor(private router: Router, private cd: ChangeDetectorRef, private route: ActivatedRoute, private firestore: Firestore) {}

  async ngOnInit() {
    const { data: { session } } = await supabase.auth.getSession();
    this.userId = session?.user?.id ?? null;

    this.route.queryParams.subscribe(params => {
      if (params['imageUrl']) {
        this.imageUrl = params['imageUrl'];
      }
      if (params['lat']) {
        this.latitude = +params['lat'];
      }
      if (params['lng']) {
        this.longitude = +params['lng'];
      }
      if (params['mapUrl']) {
        this.locationUrl = params['mapUrl'];
      }
    });

    await this.loadProfiles();
    await this.loadNews();
    this.listenForNewPosts();
    this.loadCharacterImages();
  }

  async loadProfiles() {
    const { data, error } = await supabase.from('profiles').select('id, username, photo_url');
    if (!error && data) {
      const profilesMap: Record<string, { username: string; photo_url: string }> = {};
      data.forEach((p) => {
        profilesMap[p.id] = { username: p.username, photo_url: p.photo_url };
      });
      this.userProfiles = profilesMap;
    }
  }

  async loadNews() {
    const { data, error } = await supabase
      .from('news_posts')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && data) {
      this.news = data;
      this.cd.detectChanges();
    }
  }

  listenForNewPosts() {
    this.channel = supabase
      .channel('news_posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'news_posts' },
        async (payload) => {
          if (!this.news.some(n => n.id === payload.new['id'])) {
            this.news.push(payload.new);
            this.cd.detectChanges();
            this.scrollToBottom();
          }
        }
      )
      .subscribe();
  }

  async publishNews() {
    if (!this.title.trim() || !this.content.trim() || !this.userId) return;

    const { data, error } = await supabase.from('news_posts').insert([{
      user_id: this.userId,
      title: this.title.trim(),
      content: this.content.trim(),
      image_url: this.imageUrl,
      location_url: this.locationUrl
    }]).select();

    if (!error && data?.length) {
      this.news = [...this.news, data[0]];
      this.title = '';
      this.content = '';
      this.imageUrl = null;
      this.latitude = null;
      this.longitude = null;
      this.locationUrl = null;
      this.cd.detectChanges();
      this.scrollToBottom();
    } else if (error) {
      alert('Error publicando noticia: ' + error.message);
    }
  }

  scrollToBottom() {
    try {
      this.postsContainer.nativeElement.scrollTop = this.postsContainer.nativeElement.scrollHeight;
    } catch {}
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ngOnDestroy() {
    if (this.channel) supabase.removeChannel(this.channel);
  }

  isImagePost(post: any): boolean {
    return !!post.image_url;
  }

  hasLocation(post: any): boolean {
    return !!post.location_url;
  }

  async logout() {
    await supabase.auth.signOut();
    this.router.navigate(['/auth']);
  }

  goToCamera() {
    this.router.navigate(['/camera']);
  }

  goToGPS() {
    this.router.navigate(['/gps']);
  }

  goToUpload() {
    this.router.navigate(['/upload']);
  }

  goToAPI() {
    this.router.navigate(['/api']);
  }

  loadCharacterImages() {
    const characterImagesCollection = collection(this.firestore, 'characters'); 
    const q = query(characterImagesCollection, orderBy('id', 'asc'));

    onSnapshot(q, (snapshot) => {
      this.characterImages = snapshot.docs.map(doc => doc.data());
      this.cd.detectChanges();
    });
  }
}
