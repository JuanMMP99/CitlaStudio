import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitasUser } from './citas-user';

describe('CitasUser', () => {
  let component: CitasUser;
  let fixture: ComponentFixture<CitasUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitasUser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CitasUser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
