import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DinamicasAdmin } from './dinamicas-admin';

describe('DinamicasAdmin', () => {
  let component: DinamicasAdmin;
  let fixture: ComponentFixture<DinamicasAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DinamicasAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DinamicasAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
