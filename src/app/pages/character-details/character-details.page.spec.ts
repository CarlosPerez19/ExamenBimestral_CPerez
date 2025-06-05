import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CharacterDetailsPage } from './character-details.page';

describe('CharacterDetailsPage', () => {
  let component: CharacterDetailsPage;
  let fixture: ComponentFixture<CharacterDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CharacterDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
