import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DinamicasUser } from './dinamicas-user';

describe('DinamicasUser', () => {
  let component: DinamicasUser;
  let fixture: ComponentFixture<DinamicasUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DinamicasUser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DinamicasUser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
